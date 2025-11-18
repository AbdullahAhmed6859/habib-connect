import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getCookieUserId } from "@/features/auth/server";
import { AppSidebar } from "@/features/layout/AppSidebar";
import { DashboardHeader } from "@/features/layout/DashboardHeader";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = await getCookieUserId();
  if (!userId) {
    redirect("/login");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-gradient-subtle">
        <DashboardHeader />
        <div className="container mx-auto px-10 py-6 space-y-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
