"use server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { CookieUser, ServerSession } from "./types";
import { getUserById } from "../users/lib";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { PoolClient, DatabaseError } from "pg";

export async function getCookieUserId(): Promise<number | null> {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    console.log("No token found");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as number;
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

type CreateUserData = {
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  major_id: number;
  class_of: number;
  password: string;
};

export async function signupAndSendJWT(data: CreateUserData): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userId = await createUser(client, data);
    await client.query("COMMIT");
    await createAndSendJWT(userId);
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof DatabaseError && error.code === "23505") {
      throw new Error("Email already registered");
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to sign up"
    );
  } finally {
    client.release();
  }
}

async function createUser(
  client: PoolClient,
  data: CreateUserData
): Promise<number> {
  const passwordHash = await hashPassword(data.password);
  const result = await client.query(
    `INSERT INTO users (first_name, last_name, email, role_id, major_id, class_of, password_hash) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [
      data.first_name,
      data.last_name,
      data.email,
      data.role_id,
      data.major_id,
      data.class_of,
      passwordHash,
    ]
  );
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
  const result = await pool.query(
    `SELECT id, password_hash FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email");
  }

  const passwordHash = result.rows[0].password_hash as string;
  const userId = result.rows[0].id as number;

  const isValid = await bcrypt.compare(password, passwordHash);
  if (!isValid) {
    throw new Error("Invalid password");
  }

  return userId;
}

async function createAndSendJWT(userId: number): Promise<void> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const payload = {
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
