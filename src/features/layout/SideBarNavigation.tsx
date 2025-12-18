"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavigationItem } from "./types";
import { Book, Calendar, Home, Calculator } from "lucide-react";
import { useIsActive } from "./useIsActive";

const navigationItems: NavigationItem[] = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "GPA Calculator", url: "/gpa", icon: Calculator },
  { title: "Course Swap", url: "/course-swap", icon: Book },
];

function SideBarNavigation() {
  const { state } = useSidebar();
  const { getNavCls } = useIsActive();

  const collapsed = state === "collapsed";

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Navigation
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.url}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${getNavCls(
                    item.url
                  )}`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="flex-1">{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default SideBarNavigation;
