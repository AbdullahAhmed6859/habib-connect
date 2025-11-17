"use server";
import { pool } from "@/lib/db";
import { User } from "../auth/types";

const getUserQuery = `
SELECT users.id AS id, first_name, last_name, email, roles.name AS role, majors.short AS major, schools.short AS school, class_of
FROM users
LEFT JOIN roles ON users.role_id = roles.id
LEFT JOIN majors ON users.major_id = majors.id
LEFT JOIN schools ON majors.school_id = schools.id
WHERE users.id = $1;
`;

export async function getUserById(userId: number): Promise<User> {
  const result = await pool.query(getUserQuery, [userId]);
  return result.rows[0] as User;
}
