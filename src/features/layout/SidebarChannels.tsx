import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { ChannelItem } from "./types";
import ChannelItems from "./ChannelItems";
import { getUserChannels } from "../channels/server";

async function SidebarChannels() {
  const channels = await getUserChannels();
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
      <SidebarGroupContent>
        <SidebarMenu>
          <ChannelItems channelItems={channelItems} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default SidebarChannels;
