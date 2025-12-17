import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Post } from "@/features/posts/types";
import { PostCard } from "@/features/posts/PostCard";

interface ActivityFeedProps {
  initialPosts: Post[];
}

export function ActivityFeed({ initialPosts }: ActivityFeedProps) {
  if (initialPosts.length === 0) {
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
        {initialPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
