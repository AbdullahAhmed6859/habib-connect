import { pool } from "@/lib/db";
import { getCookieUserId } from "../auth/server";

const getChannelsQuery = `
SELECT 
    c.id,
    c.name,
    c.description,
    c.created_at,
    c.is_active,
    u.first_name as creator_first_name,
    u.last_name as creator_last_name,
    COUNT(DISTINCT cm.user_id) as member_count,
    COUNT(DISTINCT p.id) as post_count
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

type Channel = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  is_active: boolean;
  creator_first_name: string;
  creator_last_name: string;
  member_count: number;
  post_count: number;
};

export async function getUserChannels(): Promise<Channel[]> {
  try {
    const userId = await getCookieUserId();
    const result = await pool.query(getChannelsQuery, [userId]);
    console.log(result.rows[0]);
    return result.rows as Channel[];
  } catch (error) {
    console.error("Error fetching user channels:", error);
    throw error;
  }
}
