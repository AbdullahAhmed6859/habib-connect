"use server";

import { pool } from "@/db";
import { getCookieUserId } from "@/features/auth/server";
import { Event, CreateEventData } from "./types";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/features/notifications/server";

export async function getEvents(month?: number, year?: number): Promise<Event[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  let query = `
    SELECT 
      e.id,
      e.title,
      e.description,
      e.event_date AT TIME ZONE 'UTC' as event_date,
      e.end_date AT TIME ZONE 'UTC' as end_date,
      e.location,
      e.created_by,
      e.channel_id,
      e.is_all_day,
      e.max_attendees,
      e.created_at AT TIME ZONE 'UTC' as created_at,
      u.first_name || ' ' || u.last_name as creator_name,
      c.name as channel_name,
      COUNT(DISTINCT es.user_id)::int as attendee_count,
      BOOL_OR(es.user_id = $1) as user_is_subscribed
    FROM events e
    JOIN users u ON e.created_by = u.id
    LEFT JOIN channels c ON e.channel_id = c.id
    LEFT JOIN event_subscriptions es ON e.id = es.event_id
    WHERE e.is_deleted = FALSE
  `;

  const params: (number | string)[] = [userId];

  if (month !== undefined && year !== undefined) {
    query += ` AND EXTRACT(MONTH FROM e.event_date) = $2 AND EXTRACT(YEAR FROM e.event_date) = $3`;
    params.push(month, year);
  }

  query += `
    GROUP BY e.id, u.first_name, u.last_name, c.name
    ORDER BY e.event_date ASC
  `;

  try {
    const result = await pool.query(query, params);
    return result.rows as Event[];
  } catch (error) {
    console.error("Error fetching events:", error);
    throw new Error("Failed to fetch events");
  }
}

export async function createEvent(data: CreateEventData): Promise<number> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const insertQuery = `
    INSERT INTO events (
      title, description, event_date, end_date, location, 
      created_by, channel_id, is_all_day, max_attendees
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;

  try {
    const result = await pool.query(insertQuery, [
      data.title,
      data.description || null,
      data.event_date,
      data.end_date || null,
      data.location || null,
      userId,
      data.channel_id || null,
      data.is_all_day,
      data.max_attendees || null,
    ]);

    revalidatePath("/calendar");
    revalidatePath("/");

    return result.rows[0].id;
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
}

export async function subscribeToEvent(eventId: number): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if event exists and has capacity
  const eventQuery = `
    SELECT 
      e.max_attendees,
      e.created_by,
      COUNT(es.user_id)::int as current_attendees
    FROM events e
    LEFT JOIN event_subscriptions es ON e.id = es.event_id
    WHERE e.id = $1 AND e.is_deleted = FALSE
    GROUP BY e.id, e.max_attendees, e.created_by
  `;

  const eventResult = await pool.query(eventQuery, [eventId]);
  
  if (eventResult.rows.length === 0) {
    throw new Error("Event not found");
  }

  const { max_attendees, current_attendees, created_by } = eventResult.rows[0];

  if (max_attendees && current_attendees >= max_attendees) {
    throw new Error("Event is full");
  }

  try {
    await pool.query(
      `INSERT INTO event_subscriptions (event_id, user_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [eventId, userId]
    );

    // Notify event creator
    await createNotification(
      created_by,
      userId,
      'event_subscribe',
      'subscribed to your event',
      undefined,
      undefined,
      undefined
    );

    revalidatePath("/calendar");
    revalidatePath("/");
  } catch (error) {
    console.error("Error subscribing to event:", error);
    throw new Error("Failed to subscribe to event");
  }
}

export async function unsubscribeFromEvent(eventId: number): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await pool.query(
      `DELETE FROM event_subscriptions WHERE event_id = $1 AND user_id = $2`,
      [eventId, userId]
    );

    revalidatePath("/calendar");
    revalidatePath("/");
  } catch (error) {
    console.error("Error unsubscribing from event:", error);
    throw new Error("Failed to unsubscribe from event");
  }
}

export async function deleteEvent(eventId: number): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify user is the creator or an admin
  const eventQuery = `
    SELECT e.created_by, u.role_id
    FROM events e
    JOIN users u ON u.id = $1
    WHERE e.id = $2
  `;

  const result = await pool.query(eventQuery, [userId, eventId]);

  if (result.rows.length === 0) {
    throw new Error("Event not found");
  }

  const { created_by, role_id } = result.rows[0];

  if (created_by !== userId && role_id !== 3) {
    throw new Error("Unauthorized to delete this event");
  }

  try {
    await pool.query(
      `UPDATE events SET is_deleted = TRUE WHERE id = $1`,
      [eventId]
    );

    revalidatePath("/calendar");
    revalidatePath("/");
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
  }
}
