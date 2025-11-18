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
import { PoolClient, DatabaseError } from "pg";
import {
  authenticateUserQuery,
  createUserQuery,
  getSignUpFormOptionsQuery,
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const userId = await createUser(client, data);
    await createAndSendJWT(userId);
    await client.query("COMMIT");
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
  data: SignUpFormData
): Promise<number> {
  const passwordHash = await hashPassword(data.password);
  const result = await client.query(createUserQuery, [
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
  const result = await pool.query(authenticateUserQuery, [email]);

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

// const programs: Programs = {
//   121: "CS",
//   2313: "EE",
//   30804: "CE",
//   1348: "SDP",
//   2232: "CND",
//   3590: "CH",
// };

// const schools: Schools = {
//   1213: {
//     name: "DSSE",
//     programs: [121, 2313, 30804],
//   },
//   211: {
//     name: "AHSS",
//     programs: [1348, 2232, 3590],
//   },
// };

// const options: Options = {
//   1: {
//     email_suffix: "@st.habib.edu.pk",
//     role: { id: 1, name: "student" },
//     schools: [2, 1],
//   },
//   2: {
//     email_suffix: "@sse.habib.edu.pk",
//     role: { id: 2, name: "faculty" },
//     schools: [1],
//   },
//   3: {
//     email_suffix: "@ahss.habib.edu.pk",
//     role: { id: 2, name: "faculty" },
//     schools: [2],
//   },
//   4: {
//     email_suffix: "@habib.edu.pk",
//     role: { id: 3, name: "staff" },
//     schools: [],
//   },
// };
