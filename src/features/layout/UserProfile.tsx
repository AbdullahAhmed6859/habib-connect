"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User as UserIcon,
  Settings,
  LogOut,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../auth/components";
import { useRouter } from "next/navigation";
const roleConfig = {
  student: {
    label: "Student",
    icon: GraduationCap,
    variant: "secondary" as const,
  },
  faculty: {
    label: "Faculty",
    icon: UserIcon,
    variant: "default" as const,
  },
  staff: {
    label: "Staff",
    icon: Briefcase,
    variant: "outline" as const,
  },
};

export function UserProfile() {
  const { clientSession, logout } = useAuth();
  const router = useRouter();
  if (!clientSession.user) return null;
  const user = clientSession.user;

  const roleInfo = roleConfig[user.role];
  const RoleIcon = roleInfo.icon;
  const userName = `${user.first_name} ${user.last_name}`;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getDepartmentInfo = () => {
    if (user.role === "student") {
      return `${user.school_short} - ${user.program_short}`;
    } else if (user.role === "faculty") {
      return `${user.school_short} - ${user.program_short}`;
    } else {
      return "Staff - Habib University";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-smooth">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user.acronym}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left hidden sm:block">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={roleInfo.variant} className="h-4 px-1.5 text-xs">
                <RoleIcon className="h-3 w-3 mr-1" />
                {roleInfo.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {getDepartmentInfo()}
              </span>
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {getDepartmentInfo()}
            </p>
            {user.role === "student" && (
              <p className="text-xs text-muted-foreground">
                Class of {user.class_of}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile/edit")}>
          <UserIcon className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
