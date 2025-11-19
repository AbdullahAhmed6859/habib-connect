"use client";
import {
  useSidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Settings } from "lucide-react";
import Link from "next/link";
import { useIsActive } from "./useIsActive";

function SideBarSettingsFooter() {
  const { state } = useSidebar();

  const collapsed = state === "collapsed";

  const { getNavCls } = useIsActive();
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href="/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${getNavCls(
                  "/settings"
                )}`}
              >
                <Settings className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>Settings</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default SideBarSettingsFooter;
