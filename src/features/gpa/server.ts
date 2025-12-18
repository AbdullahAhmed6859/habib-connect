"use server";

import { pool } from "@/db";
import { getCookieUserId } from "@/features/auth/server";
import { revalidatePath } from "next/cache";
import {
  Semester,
  Course,
  CreateSemesterData,
  CreateCourseData,
  SemesterWithGPA,
  GPASummary,
} from "./types";

// Helper function to get grade points for a grade
function getGradePoints(grade: string): number | null {
  const gradeMap: Record<string, number | null> = {
    "A+": 4.00,
    "A": 4.00,
    "A-": 3.67,
    "B+": 3.33,
    "B": 3.00,
    "B-": 2.67,
    "C+": 2.33,
    "C": 2.00,
    "C-": 1.67,
    "F": 0.00,
    "IP": null, // In Progress - doesn't count towards GPA
  };
  return gradeMap[grade] ?? 0;
}

// Helper function to calculate GPA for a semester
function calculateSemesterGPA(courses: Course[]): {
  gpa: number;
  totalCredits: number;
  earnedCredits: number;
} {
  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  courses.forEach((course) => {
    const gradePoints = getGradePoints(course.grade);
    const creditHours = Number(course.credit_hours); // Convert to number in case it's a string
    
    // Only count courses with actual grades (not IP)
    if (gradePoints !== null) {
      totalPoints += gradePoints * creditHours;
      earnedCredits += creditHours;
    }
    
    // All courses count towards total registered credits
    totalCredits += creditHours;
    
    // All courses count towards total credits
    totalCredits += creditHours;
  });

  const gpa = earnedCredits > 0 ? totalPoints / earnedCredits : 0;

  return {
    gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
    totalCredits,
    earnedCredits, // Only courses with grades
  };
}

// Get all semesters for current user
export async function getSemesters(): Promise<Semester[]> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await pool.query(
      `
      SELECT * FROM semesters
      WHERE user_id = $1
      ORDER BY year DESC, 
        CASE season 
          WHEN 'Fall' THEN 3
          WHEN 'Summer' THEN 2
          WHEN 'Spring' THEN 1
        END DESC
      `,
      [userId]
    );

    return result.rows as Semester[];
  } catch (error) {
    console.error("Error fetching semesters:", error);
    throw new Error("Failed to fetch semesters");
  }
}

// Get semester with courses and GPA
export async function getSemesterWithGPA(
  semesterId: number
): Promise<SemesterWithGPA> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get semester
    const semesterResult = await pool.query(
      "SELECT * FROM semesters WHERE id = $1 AND user_id = $2",
      [semesterId, userId]
    );

    if (semesterResult.rows.length === 0) {
      throw new Error("Semester not found");
    }

    const semester = semesterResult.rows[0] as Semester;

    // Get courses
    const coursesResult = await pool.query(
      "SELECT * FROM courses WHERE semester_id = $1 AND user_id = $2 ORDER BY course_code",
      [semesterId, userId]
    );

    const courses = coursesResult.rows.map(row => ({
      ...row,
      credit_hours: Number(row.credit_hours),
      grade_points: row.grade_points ? Number(row.grade_points) : null
    })) as Course[];
    const { gpa, totalCredits, earnedCredits } = calculateSemesterGPA(courses);

    return {
      ...semester,
      courses,
      gpa,
      total_credits: totalCredits,
      earned_credits: earnedCredits,
    };
  } catch (error) {
    console.error("Error fetching semester with GPA:", error);
    throw new Error("Failed to fetch semester details");
  }
}

// Get complete GPA summary (CGPA + all semesters)
export async function getGPASummary(): Promise<GPASummary> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const semesters = await getSemesters();

    const semestersWithGPA: SemesterWithGPA[] = await Promise.all(
      semesters.map((semester) => getSemesterWithGPA(semester.id))
    );

    // Calculate CGPA by summing all course grade points directly from database
    // Use grade_points from database (calculated by trigger) instead of recalculating
    let totalPoints = 0;
    let totalCredits = 0;
    let earnedCredits = 0;

    semestersWithGPA.forEach((semester) => {
      totalCredits += semester.total_credits;
      
      // Sum grade points from courses using database-calculated grade_points
      semester.courses.forEach((course) => {
        const creditHours = Number(course.credit_hours);
        
        // Use grade_points from database (null for IP grades)
        if (course.grade_points !== null) {
          totalPoints += Number(course.grade_points) * creditHours;
          earnedCredits += creditHours;
        }
      });
    });

    const cgpa = earnedCredits > 0 ? totalPoints / earnedCredits : 0;

    return {
      cgpa: Math.round(cgpa * 100) / 100,
      total_credits: totalCredits,
      earned_credits: earnedCredits,
      semesters: semestersWithGPA,
    };
  } catch (error) {
    console.error("Error fetching GPA summary:", error);
    throw new Error("Failed to fetch GPA summary");
  }
}

// Create a new semester
export async function createSemester(
  data: CreateSemesterData
): Promise<Semester> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // If this semester is current, unset all other current semesters
    if (data.is_current) {
      await pool.query("UPDATE semesters SET is_current = FALSE WHERE user_id = $1", [
        userId,
      ]);
    }

    const result = await pool.query(
      `
      INSERT INTO semesters (user_id, name, year, season, is_current)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [userId, data.name, data.year, data.season, data.is_current || false]
    );

    revalidatePath("/gpa");
    return result.rows[0] as Semester;
  } catch (error) {
    console.error("Error creating semester:", error);
    throw new Error("Failed to create semester");
  }
}

// Add a course to a semester
export async function createCourse(data: CreateCourseData): Promise<Course> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify user owns the semester
    const semesterCheck = await pool.query(
      "SELECT id FROM semesters WHERE id = $1 AND user_id = $2",
      [data.semester_id, userId]
    );

    if (semesterCheck.rows.length === 0) {
      throw new Error("Semester not found");
    }

    const result = await pool.query(
      `
      INSERT INTO courses (semester_id, user_id, course_code, course_name, credit_hours, grade)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        data.semester_id,
        userId,
        data.course_code,
        data.course_name,
        data.credit_hours,
        data.grade,
      ]
    );

    revalidatePath("/gpa");
    return result.rows[0] as Course;
  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error("Failed to create course");
  }
}

// Update a course
export async function updateCourse(
  courseId: number,
  data: Partial<CreateCourseData>
): Promise<Course> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (data.course_code !== undefined) {
      fields.push(`course_code = $${paramIndex++}`);
      values.push(data.course_code);
    }
    if (data.course_name !== undefined) {
      fields.push(`course_name = $${paramIndex++}`);
      values.push(data.course_name);
    }
    if (data.credit_hours !== undefined) {
      fields.push(`credit_hours = $${paramIndex++}`);
      values.push(data.credit_hours);
    }
    if (data.grade !== undefined) {
      fields.push(`grade = $${paramIndex++}`);
      values.push(data.grade);
    }

    fields.push(`updated_at = NOW()`);

    values.push(courseId, userId);

    const result = await pool.query(
      `
      UPDATE courses
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
      `,
      values
    );

    if (result.rows.length === 0) {
      throw new Error("Course not found");
    }

    revalidatePath("/gpa");
    return result.rows[0] as Course;
  } catch (error) {
    console.error("Error updating course:", error);
    throw new Error("Failed to update course");
  }
}

// Delete a course
export async function deleteCourse(courseId: number): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await pool.query(
      "DELETE FROM courses WHERE id = $1 AND user_id = $2",
      [courseId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error("Course not found");
    }

    revalidatePath("/gpa");
  } catch (error) {
    console.error("Error deleting course:", error);
    throw new Error("Failed to delete course");
  }
}

// Delete a semester (and all its courses)
export async function deleteSemester(semesterId: number): Promise<void> {
  const userId = await getCookieUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await pool.query(
      "DELETE FROM semesters WHERE id = $1 AND user_id = $2",
      [semesterId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error("Semester not found");
    }

    revalidatePath("/gpa");
  } catch (error) {
    console.error("Error deleting semester:", error);
    throw new Error("Failed to delete semester");
  }
}
