"use client";
import { useAuth } from "@/features/auth/components";

export function HeroSection() {
  const { clientSession } = useAuth();

  if (clientSession.status === "loading") return <div>Loading...</div>;
  if (clientSession.status === "unauthenticated")
    return <div>Unauthenticated</div>;

  const user = clientSession.user;
  const getGreeting = () => {
    if (!user) return "Welcome!";

    const firstName = user.first_name;
    if (user.role === "student") {
      return `Welcome back, ${firstName}!`;
    } else if (user.role === "faculty") {
      return `Welcome back, Professor ${user.last_name}!`;
    } else {
      return `Welcome back, ${firstName}!`;
    }
  };

  const getRoleDescription = () => {
    if (!user) return "Stay connected with your campus community";

    if (user.role === "student") {
      const student = user;
      return `${student.school_short} - ${student.program_short} | Batch ${student.class_of}`;
    } else if (user.role === "faculty") {
      const faculty = user;
      return `Faculty - ${faculty.school_short} | ${faculty.program_short} Program`;
    } else {
      return "Staff - Habib University";
    }
  };

  return (
    <section className="relative campus-hero rounded-xl p-8 overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2 text-white">
          {getGreeting()}
        </h1>
        <p className="text-lg text-white/90 mb-6">{getRoleDescription()}</p>
      </div>
    </section>
  );
}
