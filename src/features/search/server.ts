"use server";

import { pool } from "@/db";
import { getCookieUserId } from "@/features/auth/server";

export interface SearchResult {
  type: "post" | "channel" | "user";
  id: number;
  title: string;
  description: string;
  avatarUrl?: string;
  channelName?: string;
  createdAt?: Date;
}

export async function searchCampus(query: string): Promise<SearchResult[]> {
  const userId = await getCookieUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const searchTerm = `%${query}%`;
  const results: SearchResult[] = [];

  try {
    // Search Posts
    const postsQuery = `
      SELECT 
        p.post_id as id,
        p.title,
        p.content as description,
        c.name as channel_name,
        p.created_at
      FROM posts p
      JOIN channels c ON p.channel_id = c.channel_id
      JOIN channel_members cm ON c.channel_id = cm.channel_id
      WHERE cm.user_id = $1
        AND (p.title ILIKE $2 OR p.content ILIKE $2)
      ORDER BY p.created_at DESC
      LIMIT 10
    `;
    const postsResult = await pool.query(postsQuery, [userId, searchTerm]);
    
    postsResult.rows.forEach((row) => {
      results.push({
        type: "post",
        id: row.id,
        title: row.title,
        description: row.description.substring(0, 100) + (row.description.length > 100 ? "..." : ""),
        channelName: row.channel_name,
        createdAt: row.created_at,
      });
    });

    // Search Channels
    const channelsQuery = `
      SELECT 
        c.channel_id as id,
        c.name as title,
        c.description,
        c.created_at
      FROM channels c
      WHERE c.name ILIKE $1 OR c.description ILIKE $1
      ORDER BY c.created_at DESC
      LIMIT 10
    `;
    const channelsResult = await pool.query(channelsQuery, [searchTerm]);
    
    channelsResult.rows.forEach((row) => {
      results.push({
        type: "channel",
        id: row.id,
        title: row.title,
        description: row.description || "No description",
        createdAt: row.created_at,
      });
    });

    // Search Users
    const usersQuery = `
      SELECT 
        u.user_id as id,
        u.name as title,
        CONCAT(r.role_name, ' - ', p.program_name) as description,
        u.profile_picture_url as avatar_url
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN programs p ON u.program_id = p.program_id
      WHERE u.name ILIKE $1 OR u.email ILIKE $1
      ORDER BY u.name
      LIMIT 10
    `;
    const usersResult = await pool.query(usersQuery, [searchTerm]);
    
    usersResult.rows.forEach((row) => {
      results.push({
        type: "user",
        id: row.id,
        title: row.title,
        description: row.description || "User",
        avatarUrl: row.avatar_url,
      });
    });

    return results;
  } catch (error) {
    console.error("Search error:", error);
    throw new Error("Failed to search campus");
  }
}
