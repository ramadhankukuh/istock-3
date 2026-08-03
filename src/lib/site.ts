import type { LucideIcon } from "lucide-react";
import {
  House,
  Compass,
  LineChart,
  Briefcase,
  Wrench,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/chart", label: "Chart", icon: LineChart },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
];
