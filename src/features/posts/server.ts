import { pool } from "@/db";
import { getCookieUserId } from "../auth/server";

async function getUserChannelPosts() {
  const userId = await getCookieUserId();
  //   const offset = (page - 1) * pageSize;

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
        COUNT(DISTINCT pl.user_id) as like_count,
        COUNT(DISTINCT cm.id) as comment_count
      FROM posts p
      JOIN channels c ON p.channel_id = c.id
      JOIN users u ON p.user_id = u.id
      JOIN channel_members cmem ON c.id = cmem.channel_id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      LEFT JOIN comments cm ON p.id = cm.post_id AND cm.is_deleted = FALSE
      WHERE cmem.user_id = $1
        AND p.is_deleted = FALSE
        AND c.is_active = TRUE
      GROUP BY p.id, p.channel_id, p.user_id, p.title, p.content, p.created_at, p.updated_at, c.name, u.first_name, u.last_name
      ORDER BY p.created_at DESC
    //   LIMIT $2 OFFSET $3
    `;

  const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM posts p
      JOIN channels c ON p.channel_id = c.id
      JOIN channel_members cmem ON c.id = cmem.channel_id
      WHERE cmem.user_id = $1
        AND p.is_deleted = FALSE
        AND c.is_active = TRUE
    `;

  try {
    // const [postsResult, countResult] = await Promise.all([
    //   pool.query(query, [
    //     userId,
    //     // pageSize, offset
    //   ]),
    //   pool.query(countQuery, [userId]),
    // ]);

    const postsResult = await pool.query(query, [userId]);

    // const total = parseInt(countResult.rows[0].total);
    // const totalPages = Math.ceil(total / pageSize);

    return {
      posts: postsResult.rows,
      //   pagination: {
      //     page,
      //     pageSize,
      //     total,
      //     totalPages,
      //     hasNext: page < totalPages,
      //     hasPrev: page > 1,
      //   },
    };
  } catch (error) {
    console.error("Error fetching user channel posts:", error);
    throw error;
  }
}
