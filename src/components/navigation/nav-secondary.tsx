"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  type LucideIcon, 
  ChevronRightIcon,
  SettingsIcon 
} from "lucide-react";

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

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2 flex items-center gap-2">
        <SettingsIcon className="h-3 w-3" />
        Settings & Support
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <MagicCard 
                  className={cn(
                    "p-0 border-0 transition-all duration-200",
                    isActive 
                      ? "bg-gradient-to-r from-slate-500/20 to-slate-600/20" 
                      : "bg-transparent hover:bg-sidebar-accent/30"
                  )}
                  gradientColor="rgba(148, 163, 184, 0.1)"
                >
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full justify-start gap-3 bg-transparent border-0 transition-all duration-200 group",
                      isActive 
                        ? "text-slate-600 font-medium" 
                        : "text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    )}
                  >
                    <Link href={item.url}>
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-slate-500 to-slate-600 rounded-r-full" />
                      )}
                      
                      <div className={cn(
                        "p-1.5 rounded-lg transition-all duration-200",
                        isActive 
                          ? "bg-gradient-to-r from-slate-500 to-slate-600" 
                          : "bg-sidebar-accent/30 group-hover:bg-sidebar-accent/50"
                      )}>
                        <item.icon className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-white" : "text-sidebar-foreground/60"
                        )} />
                      </div>
                      
                      <span className="flex-1">{item.title}</span>
                      
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
