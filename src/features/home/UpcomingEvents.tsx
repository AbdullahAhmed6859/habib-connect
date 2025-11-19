import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Plus
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  type: "academic" | "social" | "sports" | "cultural";
  isAttending: boolean;
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Machine Learning Workshop",
    date: "Tomorrow",
    time: "2:00 PM",
    location: "CS Lab 201",
    organizer: "CS Department",
    attendees: 45,
    type: "academic",
    isAttending: true
  },
  {
    id: "2",
    title: "Cultural Festival 2024",
    date: "Dec 20",
    time: "6:00 PM",
    location: "Main Auditorium",
    organizer: "Student Council",
    attendees: 156,
    type: "cultural",
    isAttending: false
  },
  {
    id: "3",
    title: "Basketball Tournament",
    date: "Dec 22",
    time: "4:00 PM",
    location: "Sports Complex",
    organizer: "Sports Society",
    attendees: 89,
    type: "sports",
    isAttending: true
  },
  {
    id: "4",
    title: "Career Fair 2025",
    date: "Jan 15",
    time: "10:00 AM",
    location: "Exhibition Hall",
    organizer: "Career Services",
    attendees: 234,
    type: "academic",
    isAttending: false
  }
];

const typeConfig = {
  academic: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Academic" },
  social: { color: "bg-green-50 text-green-700 border-green-200", label: "Social" },
  sports: { color: "bg-orange-50 text-orange-700 border-orange-200", label: "Sports" },
  cultural: { color: "bg-purple-50 text-purple-700 border-purple-200", label: "Cultural" }
};

export function UpcomingEvents() {
  return (
    <Card className="campus-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockEvents.map((event) => (
          <div key={event.id} className="p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-smooth">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <Badge 
                    variant="outline" 
                    className={`text-xs border ${typeConfig[event.type].color}`}
                  >
                    {typeConfig[event.type].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">by {event.organizer}</p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{event.attendees} attending</span>
              </div>
              
              <Button 
                variant={event.isAttending ? "secondary" : "default"} 
                size="sm" 
                className="h-7 px-3 text-xs"
              >
                {event.isAttending ? (
                  <>
                    <Badge variant="outline" className="w-2 h-2 p-0 mr-2 bg-green-500 border-green-500" />
                    Attending
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3 mr-1" />
                    Join
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
        
        <Button variant="ghost" size="sm" className="w-full">
          View All Events
        </Button>
      </CardContent>
    </Card>
  );
}