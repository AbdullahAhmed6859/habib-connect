export type Post = {
  id: number;
  channel_id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  channel_name: string;
  first_name: string;
  last_name: string;
  role: "student" | "faculty" | "staff";
  program_short: string | null;
  school_short: string | null;
  like_count: number;
  comment_count: number;
  user_has_liked: boolean;
};

