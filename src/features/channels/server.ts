"use server";

import { pool } from "@/db";
import { getCookieUserId } from "../auth/server";
import { AppError } from "@/lib/error";
import { Channel, ChannelWithPosts } from "./types";
import { Post } from "../posts/types";

const getChannelsQuery = `
SELECT 
    c.id,
    c.name,
    c.description,
    c.created_at,
    c.is_active,
    u.first_name as creator_first_name,
    u.last_name as creator_last_name,
    COUNT(DISTINCT cm.user_id)::int as member_count,
    COUNT(DISTINCT p.id)::int as post_count
FROM channels c
JOIN channel_members cmem ON c.id = cmem.channel_id
JOIN users u ON c.created_by = u.id
LEFT JOIN channel_members cm ON c.id = cm.channel_id
LEFT JOIN posts p ON c.id = p.channel_id AND p.is_deleted = FALSE
WHERE cmem.user_id = $1
  AND c.is_active = TRUE
GROUP BY c.id, c.name, c.description, c.created_at, c.is_active, u.first_name, u.last_name
ORDER BY c.name ASC;
`;

export async function getUserChannels(): Promise<Channel[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  try {
    const result = await pool.query(getChannelsQuery, [userId]);
    return result.rows as Channel[];
  } catch (error) {
    console.error("Error fetching user channels:", error);
    throw new AppError("Failed to fetch channels");
  }
}

export async function getChannelById(channelId: number): Promise<Channel> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  const query = `
    SELECT 
      c.id,
      c.name,
      c.description,
      c.created_at,
      c.is_active,
      u.first_name as creator_first_name,
      u.last_name as creator_last_name,
      COUNT(DISTINCT cm.user_id)::int as member_count,
      COUNT(DISTINCT p.id)::int as post_count
    FROM channels c
    JOIN channel_members cmem ON c.id = cmem.channel_id AND cmem.user_id = $2
    JOIN users u ON c.created_by = u.id
    LEFT JOIN channel_members cm ON c.id = cm.channel_id
    LEFT JOIN posts p ON c.id = p.channel_id AND p.is_deleted = FALSE
    WHERE c.id = $1
      AND c.is_active = TRUE
    GROUP BY c.id, c.name, c.description, c.created_at, c.is_active, u.first_name, u.last_name
  `;

  try {
    const result = await pool.query(query, [channelId, userId]);

    if (result.rows.length === 0) {
      throw new AppError("Channel not found or you don't have access");
    }

    return result.rows[0] as Channel;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("Error fetching channel:", error);
    throw new AppError("Failed to fetch channel");
  }
}

export async function getChannelPosts(channelId: number): Promise<Post[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  // First verify user has access to this channel
  const accessCheck = `
    SELECT 1 FROM channel_members 
    WHERE channel_id = $1 AND user_id = $2
  `;

  const accessResult = await pool.query(accessCheck, [channelId, userId]);
  if (accessResult.rows.length === 0) {
    throw new AppError("You don't have access to this channel");
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
      BOOL_OR(pl.user_id = $2) as user_has_liked
    FROM posts p
    JOIN channels c ON p.channel_id = c.id
    JOIN users u ON p.user_id = u.id
    JOIN roles r ON u.role_id = r.id
    LEFT JOIN programs prog ON u.program_id = prog.id
    LEFT JOIN schools sch ON prog.school_id = sch.id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN comments cm ON p.id = cm.post_id AND cm.is_deleted = FALSE
    WHERE p.channel_id = $1
      AND p.is_deleted = FALSE
      AND c.is_active = TRUE
    GROUP BY 
      p.id, p.channel_id, p.user_id, p.title, p.content, 
      p.created_at, p.updated_at, c.name, 
      u.first_name, u.last_name, r.name, 
      prog.short, sch.short
    ORDER BY p.created_at DESC
    LIMIT 50
  `;

  try {
    const result = await pool.query(query, [channelId, userId]);
    return result.rows as Post[];
  } catch (error) {
    console.error("Error fetching channel posts:", error);
    throw new AppError("Failed to fetch posts");
  }
}

export async function getChannelWithPosts(channelId: number): Promise<ChannelWithPosts> {
  const [channel, posts] = await Promise.all([
    getChannelById(channelId),
    getChannelPosts(channelId),
  ]);

  return { channel, posts };
}
