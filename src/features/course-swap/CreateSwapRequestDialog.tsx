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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { createSwapRequest } from "./server";
import { toast } from "sonner";
import { CreateSwapRequestData } from "./types";

interface CreateSwapRequestDialogProps {
  onRequestCreated: () => void;
}

export function CreateSwapRequestDialog({
  onRequestCreated,
}: CreateSwapRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    current_section: "",
    desired_section: "",
    instructor_current: "",
    instructor_desired: "",
    semester: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData: CreateSwapRequestData = {
        course_code: formData.course_code,
        course_name: formData.course_name,
        current_section: formData.current_section,
        desired_section: formData.desired_section,
        instructor_current: formData.instructor_current || undefined,
        instructor_desired: formData.instructor_desired || undefined,
        semester: formData.semester,
        notes: formData.notes || undefined,
      };

      await createSwapRequest(requestData);
      toast.success("Swap request created successfully!");
      setOpen(false);
      setFormData({
        course_code: "",
        course_name: "",
        current_section: "",
        desired_section: "",
        instructor_current: "",
        instructor_desired: "",
        semester: "",
        notes: "",
      });
      onRequestCreated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create swap request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Post Swap Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Course Swap Request</DialogTitle>
          <DialogDescription>
            Post a request to find someone to swap course sections with.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course_code">Course Code *</Label>
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
              <Label htmlFor="semester">Semester *</Label>
              <Input
                id="semester"
                placeholder="e.g., Fall 2024"
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="course_name">Course Name *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="current_section">Section I Have *</Label>
              <Input
                id="current_section"
                placeholder="e.g., Section A"
                value={formData.current_section}
                onChange={(e) =>
                  setFormData({ ...formData, current_section: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="desired_section">Section I Want *</Label>
              <Input
                id="desired_section"
                placeholder="e.g., Section B"
                value={formData.desired_section}
                onChange={(e) =>
                  setFormData({ ...formData, desired_section: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="instructor_current">Current Instructor</Label>
              <Input
                id="instructor_current"
                placeholder="e.g., Dr. Khan"
                value={formData.instructor_current}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instructor_current: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="instructor_desired">Desired Instructor</Label>
              <Input
                id="instructor_desired"
                placeholder="e.g., Dr. Ali"
                value={formData.instructor_desired}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    instructor_desired: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information about your swap request..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
            />
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
              {loading ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
