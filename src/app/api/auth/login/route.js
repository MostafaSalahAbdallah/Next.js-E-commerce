import { NextResponse } from "next/server";
import { loginUser } from "@/services/auth.service";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user, token } = await loginUser(body);

    const response = NextResponse.json(
      { message: "Login successful.", user },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Login failed." },
      { status: error.status || 500 }
    );
  }
}
