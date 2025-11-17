"use client";

import { useAuth } from "@/features/auth/components";

export default function Home() {
  const { clientSession } = useAuth();
  if (clientSession.status === "loading") return <div>Loading...</div>;
  if (clientSession.status === "unauthenticated")
    return <div>Unauthenticated</div>;
  else {
    const user = clientSession.user;
    console.log(user);
    return (
      <div>
        Authenticated as {user.first_name} {user.last_name} ({user.email}){" "}
        {user.role} {user.major} {user.school}{" "}
        {user.role === "student" && user.class_of}
      </div>
    );
  }
}
