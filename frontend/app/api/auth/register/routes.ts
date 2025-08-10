import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const data = await request.json();
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      password: hashedPassword,
      phoneNumber: data.phone_number,
      gender: data.gender,
      dob: data.dob,
      preferredContact: data.preferred_contact,
      status: "pending",
      role: "patient"
    }
  });

  return NextResponse.json(
    { message: "User created successfully", user },
    { status: 201 }
  );
}