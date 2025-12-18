import { ActivityFeed } from "./ActivityFeed";
import { UpcomingEvents } from "./UpcomingEvents";
import { getUserChannelPosts } from "@/features/posts/server";
import { getUserChannels } from "@/features/channels/server";
import { CreatePostDialog } from "@/features/posts/CreatePostDialog";
import { pool } from "@/db";

async function MainContent() {
  const [posts, channels] = await Promise.all([
    getUserChannelPosts(),
    getUserChannels(),
  ]);

  // Get campus stats
  const statsQuery = await pool.query(`
    SELECT 
      (SELECT COUNT(DISTINCT user_id) FROM channel_members) as active_students,
      (SELECT COUNT(*) FROM events WHERE DATE(event_date AT TIME ZONE 'UTC') = CURRENT_DATE AND is_deleted = FALSE) as todays_events,
      (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '24 hours' AND is_deleted = FALSE) as new_posts,
      (SELECT COUNT(*) FROM swap_requests WHERE status = 'active') as active_swaps
  `);
  const stats = statsQuery.rows[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity Feed - Takes up 2 columns on large screens */}
      <div className="lg:col-span-2 space-y-4">
        {/* Create Post Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <CreatePostDialog channels={channels} />
        </div>
        
        <ActivityFeed initialPosts={posts} />
      </div>

      {/* Sidebar - Events and other widgets */}
      <div className="space-y-6">
        <UpcomingEvents />

        {/* Campus Stats */}
        <div className="campus-card p-4">
          <h3 className="font-semibold mb-3">Campus Pulse</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Active Students
              </span>
              <span className="font-medium">{stats.active_students || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Today&apos;s Events
              </span>
              <span className="font-medium">{stats.todays_events || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Posts (24h)</span>
              <span className="font-medium">{stats.new_posts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Course Swaps
              </span>
              <span className="font-medium text-accent">{stats.active_swaps || 0} Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainContent;
