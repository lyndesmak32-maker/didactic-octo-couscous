import {
  Calendar,
  Goal,
  Heart,
  Home,
  Users,
  FileText,
  Search,
  Settings,
  ShoppingCart,
  Bell,
  Globe,
  Sparkles,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
  { id: "ai", label: "AI Assistant", icon: Sparkles, path: "/ai" },
  { id: "calendar", label: "Calendar", icon: Calendar, path: "/calendar" },
  { id: "finances", label: "Finances", icon: Wallet, path: "/finances" },
  { id: "health", label: "Health", icon: Heart, path: "/health" },
  { id: "goals", label: "Goals", icon: Goal, path: "/goals" },
  { id: "shopping", label: "Shopping", icon: ShoppingCart, path: "/shopping" },
  { id: "documents", label: "Documents", icon: FileText, path: "/documents" },
  { id: "travel", label: "Travel", icon: Globe, path: "/travel" },
  { id: "family", label: "Family Hub", icon: Users, path: "/family" },
  { id: "reminders", label: "Reminders", icon: Bell, path: "/reminders" },
  { id: "search", label: "Smart Search", icon: Search, path: "/search" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];
