"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users
} from "lucide-react";
import { getEvents, subscribeToEvent, unsubscribeFromEvent } from "@/features/events/server";
import { Event } from "@/features/events/types";
import { toast } from "sonner";
import Link from "next/link";

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const allEvents = await getEvents();
      // Filter to only show future events and take first 4
      const now = new Date();
      const upcomingEvents = allEvents
        .filter(event => new Date(event.event_date) >= now)
        .slice(0, 4);
      setEvents(upcomingEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscription = async (event: Event) => {
    try {
      if (event.user_is_subscribed) {
        await unsubscribeFromEvent(event.id);
        toast.success("Unsubscribed from event");
      } else {
        await subscribeToEvent(event.id);
        toast.success("Subscribed to event!");
      }
      loadEvents();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update subscription");
    }
  };

  const formatEventDate = (date: string | Date): string => {
    const d = new Date(date);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (d.toDateString() === now.toDateString()) {
      return "Today";
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  const formatEventTime = (date: string | Date, isAllDay: boolean): string => {
    if (isAllDay) return "All day";
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  return (
    <Card className="campus-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
          <Link href="/calendar">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No upcoming events
          </div>
        ) : (
          events.map((event) => {
            const isFull = event.max_attendees && event.attendee_count >= event.max_attendees;
            
            return (
              <div key={event.id} className="p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/50 transition-smooth">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      {event.user_is_subscribed && (
                        <Badge variant="outline" className="text-xs">
                          Attending
                        </Badge>
                      )}
                      {isFull && (
                        <Badge variant="destructive" className="text-xs">
                          Full
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">by {event.creator_name}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatEventDate(event.event_date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatEventTime(event.event_date, event.is_all_day)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>
                      {event.attendee_count} attending
                      {event.max_attendees && ` / ${event.max_attendees}`}
                    </span>
                  </div>
                  
                  <Button 
                    variant={event.user_is_subscribed ? "secondary" : "default"} 
                    size="sm" 
                    className="h-7 px-3 text-xs"
                    onClick={() => handleToggleSubscription(event)}
                    disabled={Boolean(isFull) && !event.user_is_subscribed}
                  >
                    {event.user_is_subscribed ? "Unsubscribe" : "Subscribe"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}