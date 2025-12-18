"use server";

import { pool } from "@/db";
import { getCookieUserId } from "@/features/auth/server";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  program: string | null;
  class_of: number | null;
}

export interface UpdateProfileData {
  first_name: string;
  last_name: string;
  class_of?: number | null;
}

export interface UserSettings {
  user_id: number;
  email_notifications: boolean;
  theme: "light" | "dark" | "system";
  language: string;
  updated_at: Date;
}

export interface UpdateSettingsData {
  email_notifications?: boolean;
  theme?: "light" | "dark" | "system";
  language?: string;
}

// Get current user's profile
export async function getUserProfile(): Promise<UserProfile> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email_prefix || '@' || es.name as email,
        r.name as role,
        p.name as program,
        u.class_of
      FROM users u
      JOIN email_suffixes es ON u.email_suffix_id = es.id
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN programs p ON u.program_id = p.id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0] as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

// Update user profile
export async function updateUserProfile(
  data: UpdateProfileData
): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await pool.query(
      `
      UPDATE users
      SET first_name = $1, last_name = $2, class_of = $3
      WHERE id = $4
      `,
      [data.first_name, data.last_name, data.class_of || null, userId]
    );

    revalidatePath("/profile");
  } catch (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }
}

// Get user settings (create if doesn't exist)
export async function getUserSettings(): Promise<UserSettings> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Try to get existing settings
    let result = await pool.query(
      "SELECT * FROM user_settings WHERE user_id = $1",
      [userId]
    );

    // If no settings exist, create default ones
    if (result.rows.length === 0) {
      result = await pool.query(
        `
        INSERT INTO user_settings (user_id)
        VALUES ($1)
        RETURNING *
        `,
        [userId]
      );
    }

    return result.rows[0] as UserSettings;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw new Error("Failed to fetch settings");
  }
}

// Update user settings
export async function updateUserSettings(
  data: UpdateSettingsData
): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.email_notifications !== undefined) {
      fields.push(`email_notifications = $${paramIndex++}`);
      values.push(data.email_notifications);
    }
    if (data.theme !== undefined) {
      fields.push(`theme = $${paramIndex++}`);
      values.push(data.theme);
    }
    if (data.language !== undefined) {
      fields.push(`language = $${paramIndex++}`);
      values.push(data.language);
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    await pool.query(
      `
      UPDATE user_settings
      SET ${fields.join(", ")}
      WHERE user_id = $${paramIndex}
      `,
      values
    );

    revalidatePath("/settings");
  } catch (error) {
    console.error("Error updating settings:", error);
    throw new Error("Failed to update settings");
  }
}
