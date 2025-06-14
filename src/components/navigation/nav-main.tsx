"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  MailIcon, 
  ChevronRightIcon,
  type LucideIcon 
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { MagicCard } from "~/components/ui/magic-card";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    badge?: string | number;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2">
        Navigation
      </SidebarGroupLabel>      <SidebarGroupContent className="space-y-1">
        {/* Main Navigation */}
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.title}>
                <MagicCard 
                  className={cn(
                    "p-0 border-0 transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20" 
                      : "bg-transparent hover:bg-sidebar-accent/50"
                  )}
                  gradientColor={isActive ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)"}
                >
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full justify-start gap-3 bg-transparent border-0 transition-all duration-200 group relative",
                      isActive 
                        ? "text-blue-600 font-semibold" 
                        : "text-sidebar-foreground hover:text-sidebar-foreground"
                    )}
                  >
                    <Link href={item.url}>
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                      )}
                      
                      {Icon && (
                        <div className={cn(
                          "p-1.5 rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                            : "bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4 transition-colors",
                            isActive ? "text-white" : "text-sidebar-foreground/70"
                          )} />
                        </div>
                      )}
                      
                      <span className="flex-1">{item.title}</span>
                      
                      {item.badge && (
                        <Badge 
                          variant={isActive ? "default" : "secondary"} 
                          className={cn(
                            "text-xs px-2 py-0.5 font-medium",
                            isActive 
                              ? "bg-white/20 text-blue-700 border-blue-200" 
                              : "bg-sidebar-accent text-sidebar-foreground/70"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                      
                      <ChevronRightIcon className={cn(
                        "h-4 w-4 transition-all duration-200",
                        isActive 
                          ? "opacity-100 translate-x-0" 
                          : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
                      )} />
                    </Link>
                  </SidebarMenuButton>
                </MagicCard>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
