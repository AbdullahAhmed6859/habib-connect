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
import { createSemester } from "./server";
import { toast } from "sonner";
import { CreateSemesterData } from "./types";

interface CreateSemesterDialogProps {
  onSemesterCreated: () => void;
}

export function CreateSemesterDialog({
  onSemesterCreated,
}: CreateSemesterDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year: new Date().getFullYear(),
    season: "Fall" as "Fall" | "Spring" | "Summer",
    is_current: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const semesterData: CreateSemesterData = {
        name: formData.name,
        year: formData.year,
        season: formData.season,
        is_current: formData.is_current,
      };

      await createSemester(semesterData);
      toast.success("Semester created successfully!");
      setOpen(false);
      setFormData({
        name: "",
        year: new Date().getFullYear(),
        season: "Fall",
        is_current: false,
      });
      onSemesterCreated();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create semester"
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
          Add Semester
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Semester</DialogTitle>
          <DialogDescription>
            Add a new semester to track your courses and GPA.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Semester Name</Label>
            <Input
              id="name"
              placeholder="e.g., Fall 2024"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="2000"
                max="2100"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="season">Season</Label>
              <Select
                value={formData.season}
                onValueChange={(value: "Fall" | "Spring" | "Summer") =>
                  setFormData({ ...formData, season: value })
                }
              >
                <SelectTrigger id="season">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) =>
                setFormData({ ...formData, is_current: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is_current" className="cursor-pointer">
              Set as current semester
            </Label>
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
              {loading ? "Creating..." : "Create Semester"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
