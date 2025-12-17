"use server";

import { pool } from "@/db";
import { getCookieUserId } from "../auth/server";
import { AppError } from "@/lib/error";
import { Post } from "./types";

export async function getUserChannelPosts(): Promise<Post[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  const query = `
    SELECT 
      p.id,
      p.channel_id,
      p.user_id,
      p.title,
      p.content,
      p.created_at,
      p.updated_at,
      c.name as channel_name,
      u.first_name,
      u.last_name,
      r.name as role,
      prog.short as program_short,
      sch.short as school_short,
      COUNT(DISTINCT pl.user_id)::int as like_count,
      COUNT(DISTINCT cm.id)::int as comment_count,
      BOOL_OR(pl.user_id = $1) as user_has_liked
    FROM posts p
    JOIN channels c ON p.channel_id = c.id
    JOIN users u ON p.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN programs prog ON u.program_id = prog.id
    LEFT JOIN schools sch ON prog.school_id = sch.id
    JOIN channel_members cmem ON c.id = cmem.channel_id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN comments cm ON p.id = cm.post_id AND cm.is_deleted = FALSE
    WHERE cmem.user_id = $1
      AND p.is_deleted = FALSE
      AND c.is_active = TRUE
    GROUP BY 
      p.id, p.channel_id, p.user_id, p.title, p.content, 
      p.created_at, p.updated_at, c.name, 
      u.first_name, u.last_name, r.name, 
      prog.short, sch.short
    ORDER BY p.created_at DESC
    LIMIT 20
  `;

  try {
    const result = await pool.query(query, [userId]);
    return result.rows as Post[];
  } catch (error) {
    console.error("Error fetching user channel posts:", error);
    throw new AppError("Failed to fetch posts");
  }
}

export async function togglePostLike(postId: number): Promise<boolean> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  try {
    // Check if user has already liked the post
    const checkQuery = `
      SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2
    `;
    const checkResult = await pool.query(checkQuery, [postId, userId]);

    if (checkResult.rows.length > 0) {
      // Unlike
      await pool.query(
        `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
      );
      return false;
    } else {
      // Like
      await pool.query(
        `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`,
        [postId, userId]
      );
      return true;
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw new AppError("Failed to toggle like");
  }
}
