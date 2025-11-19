import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import SideBarNavigation from "./SideBarNavigation";
import SidebarChannels from "./SidebarChannels";
import SideBarHeaderContent from "./SideBarHeaderContent";
import SideBarInput from "./SideBarInput";
import SideBarSettingsFooter from "./SideBarSettingsFooter";

export async function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SideBarHeaderContent />

      <SidebarContent className="p-2">
        <SideBarInput />

        <SideBarNavigation />

        <SidebarChannels />

        <SideBarSettingsFooter />
      </SidebarContent>
    </Sidebar>
  );
}
