"use server";
import { pool } from "@/lib/db";
import { User } from "../auth/types";
import { DatabaseError } from "pg";

const getUserByIdQuery = `
SELECT
    u.id,
    u.first_name,
    u.last_name,
    CONCAT(LEFT(u.first_name, 1), LEFT(u.last_name, 1)) AS acronym,
    CONCAT(
        u.email_prefix,
        '@',
        es.name
    ) AS email,
    r.name AS role,
    sch.name AS school,
    sch.short AS school_short,
    p.name AS program,
    p.short AS program_short,
    u.class_of
FROM users u
LEFT JOIN email_suffixes es ON u.email_suffix_id = es.id
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN programs p ON u.program_id = p.id
LEFT JOIN schools sch ON p.school_id = sch.id
WHERE u.id = $1;
`;

export async function getUserById(userId: number): Promise<User | null> {
  try {
    const result = await pool.query(getUserByIdQuery, [userId]);
    return result.rows[0];
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw new Error("Error fetching user by id: ${error.message}");
    }
    throw new Error("Error fetching user by id: ${error.message}");
  }
}
