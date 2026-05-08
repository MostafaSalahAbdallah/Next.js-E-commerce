import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import {
  sendVerificationCodeEmail,
  sendWelcomeEmail,
} from "@/services/email.service";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = "7d";
const REGISTRATION_ROLES = ["customer", "seller"];
const VERIFICATION_CODE_EXPIRES_IN_MS = 1000 * 60 * 30; // 30 minutes

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function createAuthError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function signToken(user) {
  if (!JWT_SECRET) {
    throw createAuthError("JWT_SECRET is required.", 500);
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
  };
}


export function verifyAuthToken(token) {
  if (!JWT_SECRET) {
    throw createAuthError("JWT_SECRET is required.", 500);
  }

  if (!token) {
    throw createAuthError("Authentication required.", 401);
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    throw createAuthError("Invalid or expired token.", 401);
  }
}

export async function registerUser({ email, password, role = "customer" }) {
  const normalizedEmail = email?.trim().toLowerCase();
  const normalizedRole = role?.trim();

  if (!normalizedEmail || !password) {
    throw createAuthError("Email and password are required.");
  }

  if (!validateEmail(normalizedEmail)) {
    throw createAuthError("Please enter a valid email address.");
  }

  if (password.length < 6) {
    throw createAuthError("Password must be at least 6 characters.");
  }

  if (!REGISTRATION_ROLES.includes(normalizedRole)) {
    throw createAuthError("Role must be either customer or seller.");
  }

  await connectDB();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createAuthError("Email is already registered.", 409);
  }

  // Auto-assign admin role for admin email
  const finalRole = normalizedEmail === process.env.ADMIN_EMAIL?.toLowerCase()
    ? "admin"
    : normalizedRole;

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationCode = generateVerificationCode();
  const codeExpiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRES_IN_MS);

  const user = await User.create({
    email: normalizedEmail,
    password: hashedPassword,
    role: finalRole,
    isVerified: false,
    emailVerificationToken: verificationCode,
    emailVerificationTokenExpiresAt: codeExpiresAt,
  });

  await sendVerificationCodeEmail(user, verificationCode);

  return {
    user: sanitizeUser(user),
  };
}

export async function verifyUserEmail({ email, code }) {
  const normalizedEmail = email?.trim().toLowerCase();
  const verificationCode = code?.trim();

  if (!normalizedEmail || !verificationCode) {
    throw createAuthError("Email and verification code are required.");
  }

  await connectDB();

  const user = await User.findOne({
    email: normalizedEmail,
    emailVerificationToken: verificationCode,
    emailVerificationTokenExpiresAt: { $gt: new Date() },
    deletedAt: null,
  }).select("+emailVerificationToken +emailVerificationTokenExpiresAt +password");

  if (!user) {
    throw createAuthError("Invalid email or verification code.", 400);
  }

  user.isVerified = true;
  user.emailVerificationToken = "";
  user.emailVerificationTokenExpiresAt = null;
  await user.save();

  await sendWelcomeEmail(user);

  return {
    user: sanitizeUser(user),
    token: signToken(user),
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw createAuthError("Email and password are required.");
  }

  await connectDB();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password"
  );

  if (!user || user.deletedAt) {
    throw createAuthError("Invalid email or password.", 401);
  }

  if (user.isBlocked) {
    throw createAuthError("Your account has been blocked.", 403);
  }

  if (user.isVerified === false) {
    throw createAuthError("Please verify your email before logging in.", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createAuthError("Invalid email or password.", 401);
  }

  return {
    user: sanitizeUser(user),
    token: signToken(user),
  };
}
