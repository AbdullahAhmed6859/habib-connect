"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { updateCourse } from "./server";
import { toast } from "sonner";
import { Course, Grade } from "./types";

interface EditCourseDialogProps {
  course: Course;
  onCourseUpdated: () => void;
}

const GRADES: Grade[] = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "F",
  "IP",
];

const GRADE_LABELS: Record<Grade, string> = {
  "A+": "A+ (4.00)",
  A: "A (4.00)",
  "A-": "A- (3.67)",
  "B+": "B+ (3.33)",
  B: "B (3.00)",
  "B-": "B- (2.67)",
  "C+": "C+ (2.33)",
  C: "C (2.00)",
  "C-": "C- (1.67)",
  F: "F (0.00)",
  IP: "IP (In Progress)",
};

export function EditCourseDialog({
  course,
  onCourseUpdated,
}: EditCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_code: course.course_code,
    course_name: course.course_name,
    credit_hours: Number(course.credit_hours),
    grade: course.grade,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateCourse(course.id, formData);
      toast.success("Course updated successfully!");
      setOpen(false);
      onCourseUpdated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update course"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update the course information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_code">Course Code</Label>
            <Input
              id="course_code"
              value={formData.course_code}
              onChange={(e) =>
                setFormData({ ...formData, course_code: e.target.value })
              }
              placeholder="e.g., CS 101"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              id="course_name"
              value={formData.course_name}
              onChange={(e) =>
                setFormData({ ...formData, course_name: e.target.value })
              }
              placeholder="e.g., Introduction to Computer Science"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credit_hours">Credit Hours</Label>
              <Input
                id="credit_hours"
                type="number"
                step="0.5"
                min="0.5"
                max="6"
                value={formData.credit_hours || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credit_hours: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) =>
                  setFormData({ ...formData, grade: value as Grade })
                }
              >
                <SelectTrigger id="grade">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {GRADE_LABELS[grade]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
