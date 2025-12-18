"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, FileText, Plus } from "lucide-react";
import { joinChannel } from "./server";
import { toast } from "sonner";
import { AvailableChannel } from "./types";

interface JoinChannelDialogProps {
  channels: AvailableChannel[];
  trigger?: React.ReactNode;
}

export function JoinChannelDialog({ channels, trigger }: JoinChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [joiningChannelId, setJoiningChannelId] = useState<number | null>(null);
  const router = useRouter();

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoin = async (channelId: number) => {
    setJoiningChannelId(channelId);

    try {
      await joinChannel(channelId);
      toast.success("Joined channel successfully!");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to join channel"
      );
    } finally {
      setJoiningChannelId(null);
    }
  };

  const availableToJoin = filteredChannels.filter((c) => c.can_join);
  const alreadyMember = filteredChannels.filter((c) => c.is_member);
  const restricted = filteredChannels.filter((c) => !c.can_join && !c.is_member);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Join Channels
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-175 max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Discover Channels</DialogTitle>
          <DialogDescription>
            Find and join channels that interest you.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Available to Join */}
          {availableToJoin.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Available Channels
              </h3>
              <div className="space-y-2">
                {availableToJoin.map((channel) => (
                  <Card key={channel.id} className="campus-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1">#{channel.name}</h4>
                          {channel.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {channel.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{channel.member_count} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>{channel.post_count} posts</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoin(channel.id)}
                          disabled={joiningChannelId === channel.id}
                        >
                          {joiningChannelId === channel.id ? "Joining..." : "Join"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Already Joined */}
          {alreadyMember.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Your Channels
              </h3>
              <div className="space-y-2">
                {alreadyMember.map((channel) => (
                  <Card key={channel.id} className="campus-card opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">#{channel.name}</h4>
                            <Badge variant="secondary" className="text-xs">
                              Joined
                            </Badge>
                          </div>
                          {channel.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {channel.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Restricted Channels */}
          {restricted.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Restricted Channels
              </h3>
              <div className="space-y-2">
                {restricted.map((channel) => (
                  <Card key={channel.id} className="campus-card opacity-40">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">#{channel.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              Restricted
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You don&apos;t meet the requirements to join this channel
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {filteredChannels.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No channels found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
