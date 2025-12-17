"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { Post } from "@/features/posts/types";
import { togglePostLike } from "@/features/posts/server";
import { useState, useOptimistic, useTransition } from "react";
import { toast } from "sonner";

interface ActivityFeedProps {
  initialPosts: Post[];
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

export function ActivityFeed({ initialPosts }: ActivityFeedProps) {
  const [posts, setPosts] = useState(initialPosts);

  const handleLikeToggle = async (postId: number) => {
    // Optimistic update
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              user_has_liked: !post.user_has_liked,
              like_count: post.user_has_liked
                ? post.like_count - 1
                : post.like_count + 1,
            }
          : post
      )
    );

    try {
      await togglePostLike(postId);
    } catch (error) {
      // Revert on error
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                user_has_liked: !post.user_has_liked,
                like_count: post.user_has_liked
                  ? post.like_count - 1
                  : post.like_count + 1,
              }
            : post
        )
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to toggle like"
      );
    }
  };

  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <Card className="campus-card">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No posts yet. Join some channels to see activity!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="campus-card">
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
                      <span className="text-xs text-muted-foreground">
                        in #{post.channel_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {formatTimeAgo(post.created_at)}
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
                    onClick={() => handleLikeToggle(post.id)}
                  >
                    <Heart
                      className={`h-4 w-4 mr-1 ${
                        post.user_has_liked
                          ? "fill-red-500 text-red-500"
                          : ""
                      }`}
                    />
                    <span className="text-xs">{post.like_count}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">{post.comment_count}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
