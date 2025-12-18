"use server";

import { pool } from "@/db";
import { getCookieUserId } from "@/features/auth/server";
import { revalidatePath } from "next/cache";
import {
  SwapRequest,
  CreateSwapRequestData,
  SwapRequestWithMatch,
} from "./types";

// Get all active swap requests with optional filters
export async function getSwapRequests(filters?: {
  course_code?: string;
  semester?: string;
  instructor?: string;
}): Promise<SwapRequestWithMatch[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    let query = `
      SELECT 
        sr.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.email_prefix || '@' || es.name as user_email
      FROM swap_requests sr
      JOIN users u ON sr.user_id = u.id
      JOIN email_suffixes es ON u.email_suffix_id = es.id
      WHERE sr.status = 'active'
    `;

    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (filters?.course_code) {
      query += ` AND LOWER(sr.course_code) LIKE LOWER($${paramIndex})`;
      params.push(`%${filters.course_code}%`);
      paramIndex++;
    }

    if (filters?.semester) {
      query += ` AND sr.semester = $${paramIndex}`;
      params.push(filters.semester);
      paramIndex++;
    }

    if (filters?.instructor) {
      query += ` AND (LOWER(sr.instructor_current) LIKE LOWER($${paramIndex}) OR LOWER(sr.instructor_desired) LIKE LOWER($${paramIndex}))`;
      params.push(`%${filters.instructor}%`);
      paramIndex++;
    }

    query += ` ORDER BY sr.created_at DESC`;

    const result = await pool.query(query, params);
    const requests = result.rows as SwapRequestWithMatch[];

    // Find matches for the current user's requests
    const userRequests = requests.filter((r) => r.user_id === userId);

    // Mark matching requests
    return requests.map((request) => {
      // Check if this request matches any of the current user's requests
      // Supports both same-course section swaps AND different-course swaps
      const isMatch = userRequests.some(
        (userReq) =>
          userReq.id !== request.id &&
          userReq.semester === request.semester &&
          // What I have (course + section) matches what they want
          userReq.course_code + " " + userReq.current_section === 
            request.course_code + " " + request.desired_section &&
          // What I want matches what they have
          userReq.course_code + " " + userReq.desired_section === 
            request.course_code + " " + request.current_section
      );

      return {
        ...request,
        is_match: isMatch,
      };
    });
  } catch (error) {
    console.error("Error fetching swap requests:", error);
    throw new Error("Failed to fetch swap requests");
  }
}

// Get current user's swap requests
export async function getMySwapRequests(): Promise<SwapRequest[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await pool.query(
      `
      SELECT sr.*
      FROM swap_requests sr
      WHERE sr.user_id = $1
      ORDER BY sr.created_at DESC
      `,
      [userId]
    );

    return result.rows as SwapRequest[];
  } catch (error) {
    console.error("Error fetching user swap requests:", error);
    throw new Error("Failed to fetch your swap requests");
  }
}

// Create a new swap request
export async function createSwapRequest(
  data: CreateSwapRequestData
): Promise<SwapRequest> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO swap_requests (
        user_id, course_code, course_name, 
        current_section, desired_section,
        instructor_current, instructor_desired,
        semester, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
      `,
      [
        userId,
        data.course_code,
        data.course_name,
        data.current_section,
        data.desired_section,
        data.instructor_current || null,
        data.instructor_desired || null,
        data.semester,
        data.notes || null,
      ]
    );

    revalidatePath("/course-swap");
    return result.rows[0] as SwapRequest;
  } catch (error) {
    console.error("Error creating swap request:", error);
    throw new Error("Failed to create swap request");
  }
}

// Update swap request status
export async function updateSwapRequestStatus(
  requestId: number,
  status: "active" | "completed" | "cancelled"
): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await pool.query(
      `
      UPDATE swap_requests
      SET status = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
      RETURNING id
      `,
      [status, requestId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Swap request not found or unauthorized");
    }

    revalidatePath("/course-swap");
  } catch (error) {
    console.error("Error updating swap request:", error);
    throw new Error("Failed to update swap request");
  }
}

// Delete swap request
export async function deleteSwapRequest(requestId: number): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await pool.query(
      "DELETE FROM swap_requests WHERE id = $1 AND user_id = $2",
      [requestId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error("Swap request not found");
    }

    revalidatePath("/course-swap");
  } catch (error) {
    console.error("Error deleting swap request:", error);
    throw new Error("Failed to delete swap request");
  }
}

// Find potential matches for a specific request
export async function findMatches(requestId: number): Promise<SwapRequest[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get the original request
    const requestResult = await pool.query(
      "SELECT * FROM swap_requests WHERE id = $1 AND user_id = $2",
      [requestId, userId]
    );

    if (requestResult.rows.length === 0) {
      throw new Error("Swap request not found");
    }

    const request = requestResult.rows[0];

    // Find matching requests (opposite swap)
    const matchesResult = await pool.query(
      `
      SELECT 
        sr.*,
        u.first_name || ' ' || u.last_name as user_name,
        u.email_prefix || '@' || es.name as user_email
      FROM swap_requests sr
      JOIN users u ON sr.user_id = u.id
      JOIN email_suffixes es ON u.email_suffix_id = es.id
      WHERE sr.course_code = $1
        AND sr.current_section = $2
        AND sr.desired_section = $3
        AND sr.status = 'active'
        AND sr.user_id != $4
      ORDER BY sr.created_at DESC
      `,
      [
        request.course_code,
        request.desired_section,
        request.current_section,
        userId,
      ]
    );

    return matchesResult.rows as SwapRequest[];
  } catch (error) {
    console.error("Error finding matches:", error);
    throw new Error("Failed to find matches");
  }
}
