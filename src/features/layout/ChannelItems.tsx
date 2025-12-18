"use client";
import React from "react";
import { ChannelItem } from "./types";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Hash } from "lucide-react";
import Link from "next/link";
import { useIsActive } from "./useIsActive";

type Props = {
  channelItems: ChannelItem[];
};

function ChannelItems({ channelItems }: Props) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { getNavCls } = useIsActive();

  return channelItems.map((item) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <Link
          href={`/channels/${item.id}`}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${getNavCls(
            `/channels/${item.id}`
          )}`}
        >
          <Hash className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-sm">{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {item.members}
              </span>
            </>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
}

export default ChannelItems;
