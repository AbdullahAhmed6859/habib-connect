export interface Semester {
  id: number;
  user_id: number;
  name: string;
  year: number;
  season: "Fall" | "Spring" | "Summer";
  is_current: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: number;
  semester_id: number;
  user_id: number;
  course_code: string;
  course_name: string;
  credit_hours: number;
  grade: Grade;
  grade_points: number | null;
  created_at: Date;
  updated_at: Date;
}

export type Grade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "F"
  | "IP";

export interface SemesterGPA {
  id: number;
  semester_id: number;
  user_id: number;
  total_credits: number;
  earned_credits: number;
  gpa: number;
  calculated_at: Date;
}

export interface SemesterWithGPA extends Semester {
  courses: Course[];
  total_credits: number;
  earned_credits: number;
  gpa: number;
}

export interface CreateSemesterData {
  name: string;
  year: number;
  season: "Fall" | "Spring" | "Summer";
  is_current?: boolean;
}

export interface CreateCourseData {
  semester_id: number;
  course_code: string;
  course_name: string;
  credit_hours: number;
  grade: Grade;
}

export interface GPASummary {
  cgpa: number; // Cumulative GPA
  total_credits: number;
  earned_credits: number;
  semesters: SemesterWithGPA[];
}
