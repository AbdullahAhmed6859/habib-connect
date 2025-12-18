"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { UserProfile } from "./UserProfile";
import { useAuth } from "@/features/auth/components";
import { Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationsDropdown } from "@/features/notifications/NotificationsDropdown";

export function DashboardHeader() {
  const { clientSession } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  if (!clientSession.user) return null;
  const user = clientSession.user;
  console.log(user);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="px-4 h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-secondary p-2 rounded-lg" />

          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search campus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 bg-secondary/50 border-none focus:bg-background"
            />
          </form>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsDropdown />

          <UserProfile />
        </div>
      </div>
    </header>
  );
}
