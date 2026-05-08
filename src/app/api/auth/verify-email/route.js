import { NextResponse } from "next/server";
import { verifyUserEmail } from "@/services/auth.service";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code } = body;
    const { user, token } = await verifyUserEmail({ email, code });

    const response = NextResponse.json(
      { message: "Email verified successfully.", user },
      { status: 200 }
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Email verification failed." },
      { status: error.status || 500 }
    );
  }
}
