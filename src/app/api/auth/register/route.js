import { NextResponse } from "next/server";
import { registerUser } from "@/services/auth.service";

export async function POST(request) {
  try {
    const body = await request.json();
    const { user } = await registerUser(body);

    return NextResponse.json({
      message: "Registration successful! Check your Gmail for the 4-digit verification code.",
      user
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "Registration failed." },
      { status: error.status || 500 }
    );
  }
}
