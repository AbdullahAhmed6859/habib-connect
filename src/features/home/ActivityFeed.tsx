import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Pin,
  Calendar,
  Users
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "post" | "event" | "announcement";
  author: {
    name: string;
    role: "student" | "faculty" | "admin";
    avatar?: string;
    department?: string;
  };
  content: string;
  timestamp: string;
  channel: string;
  likes: number;
  comments: number;
  pinned?: boolean;
  eventDate?: string;
  attendees?: number;
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    type: "announcement",
    author: {
      name: "Dr. Sarah Ahmed",
      role: "faculty",
      department: "Computer Science"
    },
    content: "Reminder: Final project submissions are due this Friday, December 15th at 11:59 PM. Please submit through the course portal.",
    timestamp: "2 hours ago",
    channel: "Computer Science",
    likes: 12,
    comments: 3,
    pinned: true
  },
  {
    id: "2",
    type: "event",
    author: {
      name: "Student Council",
      role: "admin",
      department: "Administration"
    },
    content: "Join us for the Annual Cultural Festival! Experience diverse traditions, food, and performances from our international student community.",
    timestamp: "4 hours ago",
    channel: "Events & Activities",
    likes: 45,
    comments: 18,
    eventDate: "Dec 20, 2024",
    attendees: 156
  },
  {
    id: "3",
    type: "post",
    author: {
      name: "Fatima Ali",
      role: "student",
      department: "Business Administration"
    },
    content: "Looking for study group partners for Microeconomics final! Anyone interested in meeting at the library this weekend?",
    timestamp: "6 hours ago",
    channel: "Study Groups",
    likes: 8,
    comments: 12
  },
  {
    id: "4",
    type: "post",
    author: {
      name: "Hassan Malik",
      role: "student",
      department: "Engineering"
    },
    content: "Great guest lecture today by industry professionals! Really inspired to pursue machine learning after graduation.",
    timestamp: "1 day ago",
    channel: "General",
    likes: 23,
    comments: 7
  }
];

const typeConfig = {
  post: { color: "bg-blue-50 text-blue-700", label: "Post" },
  event: { color: "bg-green-50 text-green-700", label: "Event" },
  announcement: { color: "bg-amber-50 text-amber-700", label: "Announcement" }
};

const roleConfig = {
  student: { variant: "secondary" as const, label: "Student" },
  faculty: { variant: "default" as const, label: "Faculty" },
  admin: { variant: "destructive" as const, label: "Admin" }
};

export function ActivityFeed() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        <Button variant="outline" size="sm">View All</Button>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <Card key={activity.id} className="campus-card relative">
            {activity.pinned && (
              <div className="absolute top-3 right-3">
                <Pin className="h-4 w-4 text-primary" fill="currentColor" />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activity.author.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {activity.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{activity.author.name}</p>
                      <Badge variant={roleConfig[activity.author.role].variant} className="h-5 px-2 text-xs">
                        {roleConfig[activity.author.role].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        in #{activity.channel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig[activity.type].color}`}>
                        {typeConfig[activity.type].label}
                      </span>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm leading-relaxed mb-4">{activity.content}</p>

              {activity.type === "event" && (
                <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium">{activity.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{activity.attendees} attending</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="text-xs">{activity.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs">{activity.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Share className="h-4 w-4" />
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