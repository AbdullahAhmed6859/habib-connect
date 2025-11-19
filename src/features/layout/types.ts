import { Hash, LucideIcon } from "lucide-react";

export type NavigationItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
};

export type ChannelItem = {
  title: string;
  id: number;
  members: number;
};
