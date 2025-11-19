"use server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  CookiePayload,
  EmailRoleChoice,
  FormattedSignUpData,
  ServerSession,
  SignUpFormData,
} from "./types";
import { getUserById } from "../users/lib";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { DatabaseError } from "pg";
import {
  checkEmailAvailabilityQuery,
  createUserQuery,
  getSignUpFormOptionsQuery,
  getUserIdAndPasswordHashByEmailQuery,
} from "./queries";
import { formatSignUpFormOptions } from "./lib";

export async function getCookieUserId(): Promise<number | null> {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    console.log("No token found");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const result = await jwtVerify<CookiePayload>(token, secret);
    return result.payload.userId;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function getServerSession(): Promise<ServerSession> {
  const userId = await getCookieUserId();
  if (!userId)
    return {
      user: null,
      status: "unauthenticated",
    };

  const user = await getUserById(userId);

  if (!user) {
    await deleteTokenCookie();
    return {
      user: null,
      status: "unauthenticated",
    };
  }

  return { user, status: "authenticated" };
}

export async function deleteTokenCookie() {
  (await cookies()).delete("token");
}

export async function loginAndSendJWT(
  email: string,
  password: string
): Promise<boolean> {
  const userId = await authenticateUser(email, password);

  if (userId === null) {
    return false;
  }
  await createAndSendJWT(userId);
  return true;
}

export async function signupAndSendJWT(data: SignUpFormData): Promise<void> {
  console.log(data);
  try {
    const userId = await createUser(data);
    await createAndSendJWT(userId);
  } catch (error) {
    if (error instanceof DatabaseError && error.code === "23505") {
      throw new Error("Email already registered");
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to sign up"
    );
  }
}

async function createUser(data: SignUpFormData): Promise<number> {
  const passwordHash = await hashPassword(data.password);
  const result = await pool.query(createUserQuery, [
    data.first_name,
    data.last_name,
    data.email_prefix,
    data.email_suffix_id,
    data.role_id,
    data.program_id,
    data.class_of,
    passwordHash,
  ]);
  if (result.rows.length === 0) {
    throw new Error("Failed to create user");
  }
  return result.rows[0].id as number;
}

async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
}

async function authenticateUser(
  email: string,
  password: string
): Promise<number> {
  const { id, password_hash } = await getUserIdAndPasswordHashByEmail(email);

  const isValid = await bcrypt.compare(password, password_hash);
  if (!isValid) {
    throw new Error("Invalid password");
  }

  return id;
}

async function createAndSendJWT(userId: number): Promise<void> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const payload: CookiePayload = {
      userId,
    };
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("4y")
      .setIssuedAt()
      .sign(secret);

    (await cookies()).set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365 * 4,
      path: "/",
    });
  } catch (error) {
    console.error("JWT creation failed:", error);
    throw new Error("Failed to create and send JWT");
  }
}

export async function getSignUpFormOptions(): Promise<FormattedSignUpData> {
  try {
    const result = await pool.query(getSignUpFormOptionsQuery);
    const formattedData = formatSignUpFormOptions(
      result.rows as EmailRoleChoice[]
    );
    return formattedData;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get sign up form options");
  }
}

export async function checkEmailAvailability(
  email_prefix: string,
  email_suffix_id: number
): Promise<boolean> {
  try {
    const result = await pool.query(checkEmailAvailabilityQuery, [
      email_prefix,
      email_suffix_id,
    ]);
    if (result.rows[0].count > 0) {
      return false;
    }
    return true;
  } catch (error) {
    throw new Error("Failed to check email availability");
  }
}

async function getUserIdAndPasswordHashByEmail(
  email: string
): Promise<{ id: number; password_hash: string }> {
  try {
    const result = await pool.query(getUserIdAndPasswordHashByEmailQuery, [
      email,
    ]);
    if (result.rows.length === 0) {
      throw new Error("Invalid email");
    }
    return result.rows[0] as { id: number; password_hash: string };
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw new Error("Failed to get user");
    }
    throw new Error("Invalid email");
  }
}
