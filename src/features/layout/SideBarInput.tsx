"use client";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import React from "react";

function SideBarInput() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    !collapsed && (
      <div className="px-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search channels..."
            className="pl-9 h-9 bg-secondary/50 border-none"
          />
        </div>
      </div>
    )
  );
}

export default SideBarInput;
