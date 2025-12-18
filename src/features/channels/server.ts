"use server";

import { pool } from "@/db";
import { getCookieUserId } from "../auth/server";
import { AppError } from "@/lib/error";
import { Channel, ChannelWithPosts, CreateChannelData, AvailableChannel } from "./types";
import { Post } from "../posts/types";
import { revalidatePath } from "next/cache";

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

export async function getAvailableChannels(): Promise<AvailableChannel[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  // Get user's role and program for permission checking
  const userQuery = `
    SELECT role_id, program_id FROM users WHERE id = $1
  `;
  const userResult = await pool.query(userQuery, [userId]);
  const user = userResult.rows[0];

  const query = `
    SELECT 
      c.id,
      c.name,
      c.description,
      COUNT(DISTINCT cm.user_id)::int as member_count,
      COUNT(DISTINCT p.id)::int as post_count,
      EXISTS(
        SELECT 1 FROM channel_members 
        WHERE channel_id = c.id AND user_id = $1
      ) as is_member,
      CASE
        -- If channel has role restrictions, check if user's role is allowed
        WHEN EXISTS(SELECT 1 FROM channel_allowed_roles WHERE channel_id = c.id) THEN
          EXISTS(
            SELECT 1 FROM channel_allowed_roles 
            WHERE channel_id = c.id AND role_id = $2
          )
        ELSE TRUE
      END as role_allowed,
      CASE
        -- If channel has program restrictions, check if user's program is allowed
        WHEN EXISTS(SELECT 1 FROM channel_allowed_programs WHERE channel_id = c.id) THEN
          EXISTS(
            SELECT 1 FROM channel_allowed_programs 
            WHERE channel_id = c.id AND program_id = $3
          )
        ELSE TRUE
      END as program_allowed
    FROM channels c
    LEFT JOIN channel_members cm ON c.id = cm.channel_id
    LEFT JOIN posts p ON c.id = p.channel_id AND p.is_deleted = FALSE
    WHERE c.is_active = TRUE
    GROUP BY c.id, c.name, c.description
    ORDER BY c.name ASC
  `;

  try {
    const result = await pool.query(query, [userId, user.role_id, user.program_id]);
    
    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      member_count: row.member_count,
      post_count: row.post_count,
      is_member: row.is_member,
      can_join: !row.is_member && row.role_allowed && row.program_allowed,
    }));
  } catch (error) {
    console.error("Error fetching available channels:", error);
    throw new AppError("Failed to fetch channels");
  }
}

export async function joinChannel(channelId: number): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  // Check if user is already a member
  const memberCheck = `
    SELECT 1 FROM channel_members 
    WHERE channel_id = $1 AND user_id = $2
  `;
  const memberResult = await pool.query(memberCheck, [channelId, userId]);
  
  if (memberResult.rows.length > 0) {
    throw new AppError("You are already a member of this channel");
  }

  // Verify channel exists and user meets requirements
  const userQuery = `SELECT role_id, program_id FROM users WHERE id = $1`;
  const userResult = await pool.query(userQuery, [userId]);
  const user = userResult.rows[0];

  // Check role restrictions
  const roleCheck = `
    SELECT 1 FROM channel_allowed_roles 
    WHERE channel_id = $1
  `;
  const roleCheckResult = await pool.query(roleCheck, [channelId]);
  
  if (roleCheckResult.rows.length > 0) {
    const roleAllowed = await pool.query(
      `SELECT 1 FROM channel_allowed_roles 
       WHERE channel_id = $1 AND role_id = $2`,
      [channelId, user.role_id]
    );
    
    if (roleAllowed.rows.length === 0) {
      throw new AppError("You don't have permission to join this channel");
    }
  }

  // Check program restrictions
  const programCheck = `
    SELECT 1 FROM channel_allowed_programs 
    WHERE channel_id = $1
  `;
  const programCheckResult = await pool.query(programCheck, [channelId]);
  
  if (programCheckResult.rows.length > 0) {
    const programAllowed = await pool.query(
      `SELECT 1 FROM channel_allowed_programs 
       WHERE channel_id = $1 AND program_id = $2`,
      [channelId, user.program_id]
    );
    
    if (programAllowed.rows.length === 0) {
      throw new AppError("You don't have permission to join this channel");
    }
  }

  // Add user to channel
  try {
    await pool.query(
      `INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)`,
      [channelId, userId]
    );

    revalidatePath("/");
  } catch (error) {
    console.error("Error joining channel:", error);
    throw new AppError("Failed to join channel");
  }
}

export async function createChannel(data: CreateChannelData): Promise<number> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new AppError("User not authenticated");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Create channel
    const channelResult = await client.query(
      `INSERT INTO channels (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [data.name, data.description, userId]
    );

    const channelId = channelResult.rows[0].id;

    // Add creator as member
    await client.query(
      `INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)`,
      [channelId, userId]
    );

    // Add role restrictions if specified
    if (data.allowed_roles && data.allowed_roles.length > 0) {
      for (const roleId of data.allowed_roles) {
        await client.query(
          `INSERT INTO channel_allowed_roles (channel_id, role_id) VALUES ($1, $2)`,
          [channelId, roleId]
        );
      }
    }

    // Add program restrictions if specified
    if (data.allowed_programs && data.allowed_programs.length > 0) {
      for (const programId of data.allowed_programs) {
        await client.query(
          `INSERT INTO channel_allowed_programs (channel_id, program_id) VALUES ($1, $2)`,
          [channelId, programId]
        );
      }
    }

    await client.query("COMMIT");
    
    revalidatePath("/");
    
    return channelId;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating channel:", error);
    throw new AppError("Failed to create channel");
  } finally {
    client.release();
  }
}
