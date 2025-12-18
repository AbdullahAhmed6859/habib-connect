import { Card, CardContent } from "@/components/ui/card";
import { Post } from "@/features/posts/types";
import { PostCard } from "@/features/posts/PostCard";

interface ActivityFeedProps {
  initialPosts: Post[];
}

export function ActivityFeed({ initialPosts }: ActivityFeedProps) {
  if (initialPosts.length === 0) {
    return (
      <Card className="campus-card">
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No posts yet. Join some channels to see activity!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {initialPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
