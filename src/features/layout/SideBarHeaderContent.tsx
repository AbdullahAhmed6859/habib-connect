"use client";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";

function SideBarHeaderContent() {
  const { state } = useSidebar();

  const collapsed = state === "collapsed";

  return (
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
          <span className="text-primary-foreground font-bold text-sm">HU</span>
        </div>
      )}
    </SidebarHeader>
  );
}

export default SideBarHeaderContent;
