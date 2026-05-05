import { NextResponse } from "next/server";
import { registerUser } from "@/services/auth.service";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user, verificationToken } = await registerUser(body);
    const verificationPath = `/api/auth/verify-email?token=${verificationToken}`;
    const payload = {
      message: "Registration successful. Please verify your email before logging in.",
      user,
    };

    if (process.env.NODE_ENV !== "production") {
      payload.verificationUrl = verificationPath;
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Registration failed." },
      { status: error.status || 500 }
    );
  }
}
