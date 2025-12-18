export interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string | Date;
  end_date?: string | Date;
  location?: string;
  created_by: number;
  channel_id?: number;
  channel_name?: string;
  creator_name: string;
  is_all_day: boolean;
  max_attendees?: number;
  attendee_count: number;
  user_is_subscribed: boolean;
  created_at: string | Date;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_date: Date;
  end_date?: Date;
  location?: string;
  channel_id?: number;
  is_all_day: boolean;
  max_attendees?: number;
}
