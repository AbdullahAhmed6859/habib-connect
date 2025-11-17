"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "./UserProfile";
import { useAuth } from "@/features/auth/components";
import { Bell, Search, Plus } from "lucide-react";

export function DashboardHeader() {
  const { clientSession } = useAuth();

  if (!clientSession.user) return null;
  const user = clientSession.user;
  console.log(user);
  return (
    <header className="px-4 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-secondary p-2 rounded-lg" />

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campus..."
              className="pl-9 w-64 bg-secondary/50 border-none focus:bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          <UserProfile />
        </div>
      </div>
    </header>
  );
}
