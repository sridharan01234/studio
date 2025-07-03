"use client";

import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Heart,
  Home,
  Puzzle,
  Milestone,
  Camera,
  Sparkles,
  Flower2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/love-letter", label: "AI Love Letter", icon: Sparkles },
  { href: "/photo-album", label: "Photo Album", icon: Camera },
  { href: "/timeline", label: "Timeline", icon: Milestone },
  { href: "/quizzes", label: "Quizzes", icon: Puzzle },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="hidden md:flex bg-card border-r"
    >
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2.5">
          <Heart className="w-8 h-8 text-primary" />
          <span className="font-headline text-2xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            LunaLove
          </span>
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-1 justify-center">
        {menuItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{ children: item.label }}
              className={cn(
                "group-data-[collapsible=icon]:justify-center",
                "aria-[current=page]:bg-primary/20 aria-[current=page]:text-primary-foreground"
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {item.label}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter>
        <div className="flex items-center justify-center gap-2 p-4 text-muted-foreground group-data-[collapsible=icon]:hidden">
            <Flower2 className="h-4 w-4" />
            <span>Made with Love</span>
            <Flower2 className="h-4 w-4" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
