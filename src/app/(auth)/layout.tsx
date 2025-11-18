import { getCookieUserId, getServerSession } from "@/features/auth/server";
import { redirect } from "next/navigation";
import React from "react";

async function AuthLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCookieUserId();
  if (userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/habib-university.jpg)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center p-12">
            <div className="text-white max-w-md">
              <h1 className="text-4xl font-bold mb-4">Welcome Back to HUx</h1>
              <p className="text-lg opacity-90 mb-6">
                Your gateway to the Habib University community. Stay connected
                with everything happening on campus.
              </p>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default AuthLayout;
