import { Post } from "../posts/types";

export type Channel = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  is_active: boolean;
  creator_first_name: string;
  creator_last_name: string;
  member_count: number;
  post_count: number;
};

export type ChannelWithPosts = {
  channel: Channel;
  posts: Post[];
};

export type AvailableChannel = {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
  post_count: number;
  is_member: boolean;
  can_join: boolean;
};

export type CreateChannelData = {
  name: string;
  description: string;
  allowed_roles?: number[];
  allowed_programs?: number[];
};

