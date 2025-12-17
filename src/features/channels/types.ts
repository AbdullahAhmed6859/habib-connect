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

