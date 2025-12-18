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
import { Plus } from "lucide-react";
import { createCourse } from "./server";
import { toast } from "sonner";
import { CreateCourseData, Grade } from "./types";

interface AddCourseDialogProps {
  semesterId: number;
  onCourseAdded: () => void;
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
};

export function AddCourseDialog({
  semesterId,
  onCourseAdded,
}: AddCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    credit_hours: 3,
    grade: "A+" as Grade,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const courseData: CreateCourseData = {
        semester_id: semesterId,
        course_code: formData.course_code,
        course_name: formData.course_name,
        credit_hours: formData.credit_hours,
        grade: formData.grade,
      };

      await createCourse(courseData);
      toast.success("Course added successfully!");
      setOpen(false);
      setFormData({
        course_code: "",
        course_name: "",
        credit_hours: 3,
        grade: "A+",
      });
      onCourseAdded();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add course"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Course</DialogTitle>
          <DialogDescription>
            Add a course to calculate your semester GPA.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="course_code">Course Code</Label>
            <Input
              id="course_code"
              placeholder="e.g., CS 101"
              value={formData.course_code}
              onChange={(e) =>
                setFormData({ ...formData, course_code: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              id="course_name"
              placeholder="e.g., Introduction to Computer Science"
              value={formData.course_name}
              onChange={(e) =>
                setFormData({ ...formData, course_name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="credit_hours">Credit Hours</Label>
            <Input
              id="credit_hours"
              type="number"
              step="0.5"
              min="0.5"
              max="6"
              value={formData.credit_hours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  credit_hours: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="grade">Grade</Label>
            <Select
              value={formData.grade}
              onValueChange={(value: Grade) =>
                setFormData({ ...formData, grade: value })
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
