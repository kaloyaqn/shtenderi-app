import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: { message: "Email and password are required" } },
        { status: 400 }
      );
    }

    // Check if user exists in User table with bcrypt password
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: { message: "Invalid credentials" } },
        { status: 401 }
      );
    }

    // Verify password with bcrypt
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: { message: "Invalid credentials" } },
        { status: 401 }
      );
    }

    // Check if Account exists for this user
    // Better Auth's emailAndPassword uses providerId "credential"
    let account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        providerId: "credential",
      },
    });

    // If no Account exists, create one with the existing password hash
    if (!account) {
      account = await prisma.account.create({
        data: {
          id: `credential_${user.id}`,
          accountId: user.email,
          providerId: "credential",
          userId: user.id,
          password: user.password, // Store the bcrypt hash in Account table
        },
      });
    } else if (!account.password) {
      // Update existing account with password if missing
      await prisma.account.update({
        where: { id: account.id },
        data: { password: user.password },
      });
    }

    // Account is now created/updated, return success
    // The client will now retry with Better Auth's normal flow
    return NextResponse.json({ 
      success: true, 
      message: "Account created, please sign in again" 
    });
  } catch (error) {
    console.error("[LEGACY_SIGN_IN_ERROR]", error);
    return NextResponse.json(
      { error: { message: "Internal server error" } },
      { status: 500 }
    );
  }
}

