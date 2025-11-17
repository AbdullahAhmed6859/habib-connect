"use server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { CookieUser, ServerSession } from "./types";
import { getUserById } from "../users/lib";
// import { pool } from "@/lib/db";
// import { SignJWT } from "jose";

export async function getCookieUserId(): Promise<number | null> {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;

  if (!token) {
    console.log("No token found");
    return null;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const user = payload.user as CookieUser;

    return user.id;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function getServerSession(): Promise<ServerSession> {
  const cookiesStore = await cookies();
  const userId = await getCookieUserId();
  if (!userId)
    return {
      user: null,
      status: "unauthenticated",
    };

  const user = await getUserById(userId);

  if (!user) {
    cookiesStore.delete("token");
    return {
      user: null,
      status: "unauthenticated",
    };
  }

  return { user, status: "authenticated" };
}

export async function deleteServerSession() {
  const cookiesStore = await cookies();
  cookiesStore.delete("token");
}

// export async function getServerSession(): Promise<ServerSession> {
//   const cookieStore = await cookies();
//   const id = 1;
//   const result = (await pool.query(`SELECT * FROM users WHERE id = $1`, [id]))
//     .rows;
//   console.log(result);

//   const user = {
//     id: 1,
//   };

//   const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
//   const token = await new SignJWT({ user })
//     .setProtectedHeader({ alg: "HS256" })
//     .setExpirationTime("4y")
//     .setIssuedAt()
//     .sign(secret);

//   cookieStore.set("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     maxAge: 60 * 60 * 24 * 365 * 4,
//     path: "/",
//   });

//   return { user, status: "authenticated" };
// }
