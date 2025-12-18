"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { Post, Comment } from "./types";
import { togglePostLike, getPostComments } from "./server";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CommentSection } from "./CommentSection";

interface PostCardProps {
  post: Post;
  showChannel?: boolean;
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

export function PostCard({ post, showChannel = true }: PostCardProps) {
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [userHasLiked, setUserHasLiked] = useState(post.user_has_liked);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLikeToggle = async () => {
    if (isLiking) return;

    // Optimistic update
    const wasLiked = userHasLiked;
    setUserHasLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));
    setIsLiking(true);

    try {
      await togglePostLike(post.id);
    } catch (error) {
      // Revert on error
      setUserHasLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle like"
      );
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const fetchedComments = await getPostComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        toast.error("Failed to load comments");
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  return (
    <Card className="campus-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(post.first_name, post.last_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm">
                  {post.first_name} {post.last_name}
                </p>
                <Badge
                  variant={roleConfig[post.role].variant}
                  className="h-5 px-2 text-xs"
                >
                  {roleConfig[post.role].label}
                </Badge>
                {post.program_short && (
                  <span className="text-xs text-muted-foreground">
                    • {post.program_short}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {showChannel && (
                  <span className="text-xs text-muted-foreground">
                    in #{post.channel_name}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {showChannel && "• "}
                  {formatTimeAgo(post.created_at)}
                </span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <h3 className="font-medium mb-2">{post.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {post.content}
        </p>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleLikeToggle}
              disabled={isLiking}
            >
              <Heart
                className={`h-4 w-4 mr-1 transition-colors ${
                  userHasLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span className="text-xs">{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={handleToggleComments}
              disabled={loadingComments}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{post.comment_count}</span>
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <CommentSection postId={post.id} initialComments={comments} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

