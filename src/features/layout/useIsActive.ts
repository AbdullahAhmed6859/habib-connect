import { usePathname } from "next/navigation";

export const useIsActive = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path)
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-secondary/80 text-foreground";

  return { isActive, getNavCls };
};
