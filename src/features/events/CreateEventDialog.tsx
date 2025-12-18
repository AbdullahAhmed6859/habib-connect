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
import { FileUpload } from "@/components/ui/file-upload";
import { Plus } from "lucide-react";
import { createEvent } from "./server";
import { toast } from "sonner";
import { CreateEventData } from "./types";

interface CreateEventDialogProps {
  onEventCreated: () => void;
}

export function CreateEventDialog({ onEventCreated }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    end_date: "",
    end_time: "",
    location: "",
    is_all_day: false,
    max_attendees: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement file upload to storage service (e.g., S3, Cloudinary)
      // For now, we'll just show a message about files
      if (files.length > 0) {
        toast.info(`${files.length} file(s) attached (upload pending)`);
      }

      const eventDate = new Date(`${formData.event_date}T${formData.event_time || "00:00"}`);
      const endDate = formData.end_date
        ? new Date(`${formData.end_date}T${formData.end_time || "23:59"}`)
        : undefined;

      const eventData: CreateEventData = {
        title: formData.title,
        description: formData.description || undefined,
        event_date: eventDate,
        end_date: endDate,
        location: formData.location || undefined,
        is_all_day: formData.is_all_day,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      };

      await createEvent(eventData);
      toast.success("Event created successfully!");
      setOpen(false);
      setFiles([]);
      setFormData({
        title: "",
        description: "",
        event_date: "",
        event_time: "",
        end_date: "",
        end_time: "",
        location: "",
        is_all_day: false,
        max_attendees: "",
      });
      onEventCreated();
    } catch {
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create a new event for students to discover and subscribe to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Career Fair 2025"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event details and agenda..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_date">Start Date *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="event_time">Start Time</Label>
              <Input
                id="event_time"
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                disabled={formData.is_all_day}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                disabled={formData.is_all_day}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_all_day"
              checked={formData.is_all_day}
              onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="is_all_day" className="cursor-pointer">
              All-day event
            </Label>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Student Center, Room 301"
            />
          </div>

          <div>
            <Label htmlFor="max_attendees">Max Attendees (Optional)</Label>
            <Input
              id="max_attendees"
              type="number"
              min="1"
              value={formData.max_attendees}
              onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div>
            <Label>Attachments (Optional)</Label>
            <FileUpload
              onFilesChange={setFiles}
              maxFiles={5}
              maxSizeMB={10}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Event"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
