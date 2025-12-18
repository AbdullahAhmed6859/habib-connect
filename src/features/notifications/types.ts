export interface Notification {
  id: number;
  user_id: number;
  type: 'comment' | 'like' | 'mention' | 'channel_invite' | 'event_subscribe';
  content: string;
  related_post_id?: number;
  related_comment_id?: number;
  related_channel_id?: number;
  actor_name: string;
  is_read: boolean;
  created_at: string | Date;
}
