"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SemesterWithGPA } from "./types";
import { AddCourseDialog } from "./AddCourseDialog";
import { EditCourseDialog } from "./EditCourseDialog";
import { deleteCourse, deleteSemester } from "./server";
import { toast } from "sonner";

interface SemesterCardProps {
  semester: SemesterWithGPA;
  onUpdate: () => void;
}

export function SemesterCard({ semester, onUpdate }: SemesterCardProps) {
  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      await deleteCourse(courseId);
      toast.success("Course deleted successfully");
      onUpdate();
    } catch {
      toast.error("Failed to delete course");
    }
  };

  const handleDeleteSemester = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this semester? This will delete all courses in it."
      )
    ) {
      return;
    }

    try {
      await deleteSemester(semester.id);
      toast.success("Semester deleted successfully");
      onUpdate();
    } catch {
      toast.error("Failed to delete semester");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">
            {semester.name}
            {semester.is_current && (
              <span className="ml-2 text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                Current
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {semester.season} {semester.year}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{semester.gpa.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              {semester.earned_credits} / {semester.total_credits} credits
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteSemester}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {semester.courses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No courses added yet
          </p>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-muted-foreground border-b pb-2">
              <div className="col-span-3">Code</div>
              <div className="col-span-4">Course Name</div>
              <div className="col-span-1 text-center">Credits</div>
              <div className="col-span-2 text-center">Grade</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {semester.courses.map((course) => (
              <div
                key={course.id}
                className="grid grid-cols-12 gap-2 text-sm items-center py-2 hover:bg-secondary/50 rounded px-2"
              >
                <div className="col-span-3 font-medium">{course.course_code}</div>
                <div className="col-span-4">{course.course_name}</div>
                <div className="col-span-1 text-center">
                  {course.credit_hours}
                </div>
                <div className="col-span-2 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      course.grade_points !== null && course.grade_points >= 3.5
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : course.grade_points !== null &&
                          course.grade_points >= 2.5
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : course.grade_points !== null
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {course.grade}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1">
                  <EditCourseDialog course={course} onCourseUpdated={onUpdate} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCourse(course.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddCourseDialog semesterId={semester.id} onCourseAdded={onUpdate} />
    </Card>
  );
}
