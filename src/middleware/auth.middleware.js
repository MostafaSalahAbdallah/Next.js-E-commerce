import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAuthToken } from "@/services/auth.service";

function createAuthMiddlewareError(message, status = 401) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = verifyAuthToken(token);

  await connectDB();

  const user = await User.findById(payload.id);

  if (!user || user.deletedAt) {
    throw createAuthMiddlewareError("Authentication required.", 401);
  }

  if (user.isBlocked) {
    throw createAuthMiddlewareError("Your account has been blocked.", 403);
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

export async function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw createAuthMiddlewareError("You are not allowed to access this resource.", 403);
  }

  return user;
}
