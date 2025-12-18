"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowRightLeft, User } from "lucide-react";
import { SwapRequestWithMatch } from "./types";
import { deleteSwapRequest, updateSwapRequestStatus } from "./server";
import { toast } from "sonner";

interface SwapRequestCardProps {
  request: SwapRequestWithMatch;
  onUpdate: () => void;
  currentUserId?: number;
  showActions?: boolean;
}

export function SwapRequestCard({
  request,
  onUpdate,
  currentUserId,
  showActions = false,
}: SwapRequestCardProps) {
  const isOwnRequest = request.user_id === currentUserId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this swap request?")) {
      return;
    }

    try {
      await deleteSwapRequest(request.id);
      toast.success("Swap request deleted successfully");
      onUpdate();
    } catch {
      toast.error("Failed to delete swap request");
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await updateSwapRequestStatus(request.id, "completed");
      toast.success("Swap request marked as completed");
      onUpdate();
    } catch {
      toast.error("Failed to update swap request");
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">
              {request.course_code} - {request.course_name}
            </h3>
            {request.is_match && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Perfect Match!
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {request.semester}
          </p>
        </div>
        {showActions && isOwnRequest && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkCompleted}
              className="text-green-600 hover:text-green-700"
            >
              Mark Completed
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 bg-secondary/50 rounded p-3">
          <p className="text-xs text-muted-foreground mb-1">I Have</p>
          <p className="font-medium">{request.current_section}</p>
          {request.instructor_current && (
            <p className="text-sm text-muted-foreground">
              {request.instructor_current}
            </p>
          )}
        </div>

        <ArrowRightLeft className="h-5 w-5 text-muted-foreground shrink-0" />

        <div className="flex-1 bg-primary/10 rounded p-3">
          <p className="text-xs text-muted-foreground mb-1">I Want</p>
          <p className="font-medium">{request.desired_section}</p>
          {request.instructor_desired && (
            <p className="text-sm text-muted-foreground">
              {request.instructor_desired}
            </p>
          )}
        </div>
      </div>

      {request.notes && (
        <div className="bg-secondary/30 rounded p-3 mb-4">
          <p className="text-sm">{request.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>
            {isOwnRequest ? "You" : request.user_name || "Anonymous"}
          </span>
        </div>
        <span>{new Date(request.created_at).toLocaleDateString()}</span>
      </div>
    </Card>
  );
}
