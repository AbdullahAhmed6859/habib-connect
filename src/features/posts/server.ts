"use server";

import { pool } from "@/db";
import { getCookieUserId } from "../auth/server";
import { AppError } from "@/lib/error";
import { Post, Comment, CreatePostData, CreateCommentData } from "./types";
import { revalidatePath } from "next/cache";

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

export async function getPostComments(postId: number): Promise<Comment[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  const query = `
    SELECT 
      c.id,
      c.post_id,
      c.user_id,
      c.content,
      c.created_at,
      u.first_name,
      u.last_name,
      r.name as role,
      prog.short as program_short
    FROM comments c
    JOIN users u ON c.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN programs prog ON u.program_id = prog.id
    WHERE c.post_id = $1
      AND c.is_deleted = FALSE
    ORDER BY c.created_at ASC
  `;

  try {
    const result = await pool.query(query, [postId]);
    return result.rows as Comment[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw new AppError("Failed to fetch comments");
  }
}

export async function createComment(data: CreateCommentData): Promise<Comment> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  // Verify user has access to the post's channel
  const accessQuery = `
    SELECT 1 FROM posts p
    JOIN channels c ON p.channel_id = c.id
    JOIN channel_members cm ON c.id = cm.channel_id
    WHERE p.id = $1 AND cm.user_id = $2 AND p.is_deleted = FALSE
  `;

  const accessResult = await pool.query(accessQuery, [data.post_id, userId]);
  if (accessResult.rows.length === 0) {
    throw new AppError("Post not found or you don't have access");
  }

  const insertQuery = `
    INSERT INTO comments (post_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING id, post_id, user_id, content, created_at
  `;

  try {
    const result = await pool.query(insertQuery, [
      data.post_id,
      userId,
      data.content,
    ]);

    // Fetch the complete comment with user info
    const comment = await pool.query(
      `
      SELECT 
        c.id,
        c.post_id,
        c.user_id,
        c.content,
        c.created_at,
        u.first_name,
        u.last_name,
        r.name as role,
        prog.short as program_short
      FROM comments c
      JOIN users u ON c.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN programs prog ON u.program_id = prog.id
      WHERE c.id = $1
    `,
      [result.rows[0].id]
    );

    revalidatePath("/");
    revalidatePath(`/channels/${data.post_id}`);

    return comment.rows[0] as Comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new AppError("Failed to create comment");
  }
}

export async function createPost(data: CreatePostData): Promise<number> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  // Verify user is a member of the channel
  const memberQuery = `
    SELECT 1 FROM channel_members 
    WHERE channel_id = $1 AND user_id = $2
  `;

  const memberResult = await pool.query(memberQuery, [data.channel_id, userId]);
  if (memberResult.rows.length === 0) {
    throw new AppError("You are not a member of this channel");
  }

  const insertQuery = `
    INSERT INTO posts (channel_id, user_id, title, content)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  try {
    const result = await pool.query(insertQuery, [
      data.channel_id,
      userId,
      data.title,
      data.content,
    ]);

    revalidatePath("/");
    revalidatePath(`/channels/${data.channel_id}`);

    return result.rows[0].id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new AppError("Failed to create post");
  }
}
