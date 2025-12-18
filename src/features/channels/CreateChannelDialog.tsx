"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { createChannel } from "./server";
import { toast } from "sonner";

interface CreateChannelDialogProps {
  trigger?: React.ReactNode;
}

const channelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(50, "Name too long")
    .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens allowed"),
  description: z.string().max(500, "Description too long").optional(),
});

type ChannelFormData = z.infer<typeof channelSchema>;

// Static data for roles and programs (matches your database)
const ROLES = [
  { id: 1, name: "Students" },
  { id: 2, name: "Faculty" },
  { id: 3, name: "Staff" },
];

const PROGRAMS = [
  { id: 1, name: "Social Development and Policy (SDP)", school: "AHSS" },
  { id: 2, name: "Computer Engineering (CE)", school: "DSSE" },
  { id: 3, name: "Computer Science (CS)", school: "DSSE" },
  { id: 4, name: "Electrical Engineering (EE)", school: "DSSE" },
  { id: 5, name: "Comparative Humanities (CH)", school: "AHSS" },
  { id: 6, name: "Communication and Design (CND)", school: "AHSS" },
];

export function CreateChannelDialog({ trigger }: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChannelFormData>({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: ChannelFormData) => {
    try {
      await createChannel({
        name: data.name,
        description: data.description || "",
        allowed_roles: selectedRoles.length > 0 ? selectedRoles : undefined,
        allowed_programs: selectedPrograms.length > 0 ? selectedPrograms : undefined,
      });

      toast.success("Channel created successfully!");
      setOpen(false);
      reset();
      setSelectedRoles([]);
      setSelectedPrograms([]);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create channel"
      );
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const toggleProgram = (programId: number) => {
    setSelectedPrograms((prev) =>
      prev.includes(programId)
        ? prev.filter((id) => id !== programId)
        : [...prev, programId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Channel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a Channel</DialogTitle>
          <DialogDescription>
            Create a new channel for discussions, announcements, or collaboration.
            Leave restrictions empty to make it open to everyone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Channel Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., CS Study Group"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="What is this channel about?"
              className="min-h-25 resize-none"
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Access Restrictions (Optional)</Label>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Allowed Roles</p>
              <div className="space-y-2 pl-4">
                {ROLES.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={`role-${role.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {role.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Allowed Programs</p>
              <div className="space-y-2 pl-4">
                {PROGRAMS.map((program) => (
                  <div key={program.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`program-${program.id}`}
                      checked={selectedPrograms.includes(program.id)}
                      onCheckedChange={() => toggleProgram(program.id)}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={`program-${program.id}`}
                      className="text-sm cursor-pointer"
                    >
                      {program.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Note: If no restrictions are selected, the channel will be open to all users.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
                setSelectedRoles([]);
                setSelectedPrograms([]);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Channel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
