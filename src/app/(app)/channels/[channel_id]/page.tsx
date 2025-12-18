import { notFound } from "next/navigation";
import { getChannelWithPosts, getUserChannels } from "@/features/channels/server";
import { PostCard } from "@/features/posts/PostCard";
import { CreatePostDialog } from "@/features/posts/CreatePostDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ChannelPageProps {
  params: Promise<{ channel_id: string }>;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { channel_id } = await params;
  const channelId = parseInt(channel_id);

  if (isNaN(channelId)) {
    notFound();
  }

  let data;
  let allChannels;
  try {
    [data, allChannels] = await Promise.all([
      getChannelWithPosts(channelId),
      getUserChannels(),
    ]);
  } catch {
    notFound();
  }

  const { channel, posts } = data;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Home
      </Link>

      {/* Channel Header */}
      <Card className="campus-card">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">#{channel.name}</h1>
                <Badge variant="secondary">Active</Badge>
              </div>

              {channel.description && (
                <p className="text-muted-foreground max-w-2xl">
                  {channel.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{channel.member_count} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{channel.post_count} posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDate(channel.created_at)}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Created by {channel.creator_first_name} {channel.creator_last_name}
              </p>
            </div>

            <div className="flex gap-2">
              <CreatePostDialog channels={allChannels} defaultChannelId={channelId} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Posts</h2>

        {posts.length === 0 ? (
          <Card className="campus-card">
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No posts in this channel yet. Be the first to post!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} showChannel={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

