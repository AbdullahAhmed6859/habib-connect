import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ChannelItem } from "./types";
import ChannelItems from "./ChannelItems";
import { getUserChannels, getAvailableChannels } from "../channels/server";
import { CreateChannelDialog } from "../channels/CreateChannelDialog";
import { JoinChannelDialog } from "../channels/JoinChannelDialog";
import { Plus, Hash } from "lucide-react";

async function SidebarChannels() {
  const [channels, availableChannels] = await Promise.all([
    getUserChannels(),
    getAvailableChannels(),
  ]);

  const channelItems: ChannelItem[] = channels.map((channel) => ({
    title: channel.name,
    id: channel.id,
    members: channel.member_count ?? 0,
  }));

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Channels
      </SidebarGroupLabel>
      
      {/* Channel Management Buttons */}
      <div className="px-2 pb-2 flex gap-1">
        <JoinChannelDialog
          channels={availableChannels}
          trigger={
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8 text-xs gap-1"
              title="Join Channels"
            >
              <Hash className="h-3 w-3" />
              Join
            </Button>
          }
        />
        <CreateChannelDialog
          trigger={
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8 text-xs gap-1"
              title="Create Channel"
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
          }
        />
      </div>

      <SidebarGroupContent>
        <SidebarMenu>
          <ChannelItems channelItems={channelItems} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default SidebarChannels;
