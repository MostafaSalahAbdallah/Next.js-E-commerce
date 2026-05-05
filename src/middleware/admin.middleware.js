import { cookies } from "next/headers";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyAuthToken } from "@/services/auth.service";

function createAdminError(message, status = 403) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const payload = verifyAuthToken(token);

  await connectDB();

  const user = await User.findById(payload.id);

  if (!user || user.deletedAt) {
    throw createAdminError("Authentication required.", 401);
  }

  if (user.isBlocked) {
    throw createAdminError("Your account has been blocked.", 403);
  }

  if (user.role !== "admin") {
    throw createAdminError("Admin access required.", 403);
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}
