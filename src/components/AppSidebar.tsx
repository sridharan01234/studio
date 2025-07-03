
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
import type { InstanceData } from "@/types/instance";

export default function AppSidebar({ instance }: { instance: InstanceData }) {
  const pathname = usePathname();

  const menuItems = [
    { href: `/${instance.id}`, label: "Home", icon: Home },
    { href: `/${instance.id}/love-letter`, label: "AI Love Letter", icon: Sparkles },
    { href: `/${instance.id}/photo-album`, label: "Photo Album", icon: Camera },
    { href: `/${instance.id}/timeline`, label: "Timeline", icon: Milestone },
    { href: `/${instance.id}/quizzes`, label: "Quizzes", icon: Puzzle },
  ];

  const getDisplayName = () => {
    if (instance.creatorName && instance.partnerName) {
      return `${instance.creatorName.charAt(0).toUpperCase()} & ${instance.partnerName.charAt(0).toUpperCase()}`
    }
    return "LunaLove"
  }

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      className="hidden md:flex bg-card border-r"
    >
      <SidebarHeader>
        <Link href={`/${instance.id}`} className="flex items-center gap-2.5">
          <Heart className="w-8 h-8 text-primary" />
          <span className="font-headline text-2xl font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            {getDisplayName()}
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
