import { ActivityFeed } from "./ActivityFeed";
import { UpcomingEvents } from "./UpcomingEvents";
import { getUserChannelPosts } from "@/features/posts/server";

async function MainContent() {
  const posts = await getUserChannelPosts();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Activity Feed - Takes up 2 columns on large screens */}
      <div className="lg:col-span-2">
        <ActivityFeed initialPosts={posts} />
      </div>

      {/* Sidebar - Events and other widgets */}
      <div className="space-y-6">
        <UpcomingEvents />

        {/* Quick Actions Card */}
        <div className="campus-card p-4">
          <h3 className="font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-2 rounded-lg hover:bg-secondary/80 transition-smooth text-sm">
              📝 Post Announcement
            </button>
            <button className="w-full text-left p-2 rounded-lg hover:bg-secondary/80 transition-smooth text-sm">
              📅 Schedule Event
            </button>
            <button className="w-full text-left p-2 rounded-lg hover:bg-secondary/80 transition-smooth text-sm">
              🔄 Request Course Swap
            </button>
            <button className="w-full text-left p-2 rounded-lg hover:bg-secondary/80 transition-smooth text-sm">
              👥 Create Study Group
            </button>
          </div>
        </div>

        {/* Campus Stats */}
        <div className="campus-card p-4">
          <h3 className="font-semibold mb-3">Campus Pulse</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Active Students
              </span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Today&apos;s Events
              </span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Posts</span>
              <span className="font-medium">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Course Swaps
              </span>
              <span className="font-medium text-accent">15 Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainContent;
