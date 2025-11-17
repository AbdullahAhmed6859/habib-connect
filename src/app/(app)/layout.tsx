import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/layout/AppSidebar";
import { DashboardHeader } from "@/features/layout/DashboardHeader";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const session = await getServerSession();
  // if (session.status === "unauthenticated") {

  // }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="min-h-screen bg-gradient-subtle">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-6 space-y-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
