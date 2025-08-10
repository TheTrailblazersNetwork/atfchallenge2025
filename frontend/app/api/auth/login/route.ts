import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Check password
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // Check approval status
  if (user.status !== "approved") {
    return NextResponse.json(
      { error: "Account pending approval" },
      { status: 403 }
    );
  }

  // Return user data (excluding password)
  const { password: _, ...userData } = user;
  return NextResponse.json({ user: userData });
}