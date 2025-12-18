"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "./types";
import { createComment } from "./server";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: number;
  initialComments: Comment[];
}

const roleConfig = {
  student: { variant: "secondary" as const, label: "Student" },
  faculty: { variant: "default" as const, label: "Faculty" },
  staff: { variant: "outline" as const, label: "Staff" },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
}

export function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const comment = await createComment({
        post_id: postId,
        content: newComment.trim(),
      });

      setComments((prev) => [...prev, comment]);
      setNewComment("");
      toast.success("Comment posted");
      setShowComments(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to post comment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-15 resize-none bg-secondary/30 border-secondary"
          disabled={isSubmitting}
        />
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Comment"}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showComments ? "Hide" : "View"} {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </button>

          {showComments && (
            <div className="space-y-3 pl-2 border-l-2 border-secondary">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-xs">
                      {getInitials(comment.first_name, comment.last_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-sm">
                          {comment.first_name} {comment.last_name}
                        </p>
                        <Badge
                          variant={roleConfig[comment.role].variant}
                          className="h-4 px-1.5 text-xs"
                        >
                          {roleConfig[comment.role].label}
                        </Badge>
                        {comment.program_short && (
                          <span className="text-xs text-muted-foreground">
                            • {comment.program_short}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <span className="text-xs text-muted-foreground pl-3">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
