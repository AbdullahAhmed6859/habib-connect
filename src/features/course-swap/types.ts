export interface SwapRequest {
  id: number;
  user_id: number;
  course_code: string;
  course_name: string;
  current_section: string;
  desired_section: string;
  instructor_current: string | null;
  instructor_desired: string | null;
  semester: string;
  notes: string | null;
  status: "active" | "completed" | "cancelled";
  created_at: Date;
  updated_at: Date;
  // Joined fields
  user_name?: string;
  user_email?: string;
}

export interface CreateSwapRequestData {
  course_code: string;
  course_name: string;
  current_section: string;
  desired_section: string;
  instructor_current?: string;
  instructor_desired?: string;
  semester: string;
  notes?: string;
}

export interface SwapMatch {
  id: number;
  request_id_1: number;
  request_id_2: number;
  matched_at: Date;
  status: "pending" | "accepted" | "declined";
}

export interface SwapRequestWithMatch extends SwapRequest {
  is_match: boolean;
  match_user_name?: string;
}
