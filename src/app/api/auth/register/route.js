import { NextResponse } from "next/server";
import { registerUser } from "@/services/auth.service";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user, emailSent } = await registerUser(body);

    const message = emailSent
      ? "Registration successful! Check your Gmail for the 4-digit verification code."
      : "Registration successful! However, we couldn't send the verification email. Please contact support or try again later.";

    return NextResponse.json({
      message,
      user,
      emailSent,
      verificationCode: process.env.NODE_ENV === 'development' ? user.emailVerificationToken : undefined, // Show code in development
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Registration failed." },
      { status: error.status || 500 }
    );
  }
}
