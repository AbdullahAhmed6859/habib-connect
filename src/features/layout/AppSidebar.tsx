"use client";
import {
  Home,
  Calendar,
  Book,
  Settings,
  Bell,
  Search,
  Hash,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Course Swap", url: "/course-swap", icon: Book },
  { title: "Notifications", url: "/notifications", icon: Bell, badge: "3" },
];

const channelItems = [
  { title: "General", url: "/channels/general", icon: Hash, members: 245 },
  { title: "Computer Science", url: "/channels/cs", icon: Hash, members: 89 },
  {
    title: "Student Council",
    url: "/channels/council",
    icon: Hash,
    members: 12,
  },
  {
    title: "Events & Activities",
    url: "/channels/events",
    icon: Hash,
    members: 156,
  },
  { title: "Study Groups", url: "/channels/study", icon: Hash, members: 67 },
];

import Link from "next/link";
import { usePathname } from "next/navigation";
export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();

  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path)
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-secondary/80 text-foreground";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                HU
              </span>
            </div>
            <div>
              <h2 className="font-semibold text-sm">Campus Connect</h2>
              <p className="text-xs text-muted-foreground">Habib University</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">
              HU
            </span>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        {!collapsed && (
          <div className="px-2 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                className="pl-9 h-9 bg-secondary/50 border-none"
              />
            </div>
          </div>
        )}

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
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && (
                        <span className="flex-1">{item.title}</span>
                      )}
                      {!collapsed && item.badge && (
                        <Badge variant="secondary" className="h-5 px-2 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Channels
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {channelItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${getNavCls(
                        item.url
                      )}`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
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
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
      </SidebarContent>
    </Sidebar>
  );
}
