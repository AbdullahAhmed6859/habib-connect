"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trash2 } from "lucide-react";
import { Event } from "./types";
import { subscribeToEvent, unsubscribeFromEvent, deleteEvent } from "./server";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/components";

interface EventCardProps {
  event: Event;
  onUpdate: () => void;
}

function formatEventDate(date: string | Date, isAllDay: boolean): string {
  const d = new Date(date);
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (isAllDay) {
    return dateStr;
  }

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${dateStr} at ${timeStr}`;
}

export function EventCard({ event, onUpdate }: EventCardProps) {
  const { clientSession } = useAuth();
  const [loading, setLoading] = useState(false);

  const isCreator = clientSession.user?.id === event.created_by;
  const canDelete = isCreator || clientSession.user?.role === "staff";

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      if (event.user_is_subscribed) {
        await unsubscribeFromEvent(event.id);
        toast.success("Unsubscribed from event");
      } else {
        await subscribeToEvent(event.id);
        toast.success("Subscribed to event!");
      }
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setLoading(true);
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted");
      onUpdate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  const isFull = event.max_attendees && event.attendee_count >= event.max_attendees;
  const isPast = new Date(event.event_date) < new Date();

  return (
    <Card className={`${isPast ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-1">{event.title}</h3>
            <p className="text-sm text-muted-foreground">
              Organized by {event.creator_name}
              {event.channel_name && ` • ${event.channel_name}`}
            </p>
          </div>
          <div className="flex gap-2">
            {isPast && <Badge variant="secondary">Past</Badge>}
            {isFull && <Badge variant="destructive">Full</Badge>}
            {event.user_is_subscribed && <Badge>Subscribed</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatEventDate(event.event_date, event.is_all_day)}</span>
          </div>

          {event.end_date && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Until {formatEventDate(event.end_date, event.is_all_day)}</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.attendee_count} attendee{event.attendee_count !== 1 ? "s" : ""}
              {event.max_attendees && ` / ${event.max_attendees}`}
            </span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {!isPast && (
            <Button
              onClick={handleSubscribe}
              disabled={loading || (Boolean(isFull) && !event.user_is_subscribed)}
              variant={event.user_is_subscribed ? "outline" : "default"}
              size="sm"
            >
              {event.user_is_subscribed ? "Unsubscribe" : "Subscribe"}
            </Button>
          )}
          {canDelete && (
            <Button
              onClick={handleDelete}
              disabled={loading}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
