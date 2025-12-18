"use server";

import { pool } from "@/db";
import { getCookieUserId } from "@/features/auth/server";
import { Notification } from "./types";
import { revalidatePath } from "next/cache";

export async function getNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const query = `
    SELECT 
      n.id,
      n.user_id,
      n.type,
      n.content,
      n.related_post_id,
      n.related_comment_id,
      n.related_channel_id,
      n.is_read,
      n.created_at AT TIME ZONE 'UTC' as created_at,
      u.first_name || ' ' || u.last_name as actor_name
    FROM notifications n
    LEFT JOIN users u ON n.actor_id = u.id
    WHERE n.user_id = $1
    ORDER BY n.created_at DESC
    LIMIT 50
  `;

  try {
    const result = await pool.query(query, [userId]);
    const notifications = result.rows as Notification[];
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return { notifications, unreadCount };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1 AND user_id = $2
  `;

  try {
    await pool.query(query, [notificationId, userId]);
    revalidatePath("/");
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = $1 AND is_read = FALSE
  `;

  try {
    await pool.query(query, [userId]);
    revalidatePath("/");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Failed to mark all notifications as read");
  }
}

export async function createNotification(
  userId: number,
  actorId: number,
  type: string,
  content: string,
  relatedPostId?: number,
  relatedCommentId?: number,
  relatedChannelId?: number
): Promise<void> {
  // Don't notify users about their own actions
  if (userId === actorId) return;

  const query = `
    INSERT INTO notifications (user_id, actor_id, type, content, related_post_id, related_comment_id, related_channel_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `;

  try {
    await pool.query(query, [
      userId,
      actorId,
      type,
      content,
      relatedPostId || null,
      relatedCommentId || null,
      relatedChannelId || null,
    ]);
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw - notifications are non-critical
  }
}
