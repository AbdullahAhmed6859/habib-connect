import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "@/features/auth/server";
import { AuthProvider } from "@/features/auth/components/AuthContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Habib Connect",
  description: "A platform to connect Habib University students and faculty.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body>
        <Toaster />
        <AuthProvider serverSession={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
