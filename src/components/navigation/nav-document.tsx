"use client";

import { 
  MoreHorizontalIcon, 
  ShareIcon, 
  ChevronRightIcon,
  FolderIcon,
  type LucideIcon 
} from "lucide-react";

import { MagicCard } from "~/components/ui/magic-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

export function NavDocuments({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2 flex items-center gap-2">
        <FolderIcon className="h-3 w-3" />
        Documents & Reports
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <MagicCard 
              className="p-0 border-0 bg-transparent hover:bg-sidebar-accent/30 transition-all duration-200"
              gradientColor="rgba(34, 197, 94, 0.1)"
            >
              <SidebarMenuButton asChild className="group w-full justify-start gap-3 bg-transparent border-0">
                <a href={item.url}>
                  <div className="p-1.5 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-200">
                    <item.icon className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="flex-1 text-sidebar-foreground/80 group-hover:text-sidebar-foreground">
                    {item.name}
                  </span>
                  <ChevronRightIcon className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </a>
              </SidebarMenuButton>
            </MagicCard>            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-sidebar-accent/50 rounded-lg hover:bg-sidebar-accent/30"
                >
                  <MoreHorizontalIcon className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
                className="w-48 rounded-lg border-sidebar-border/50 bg-sidebar/90 backdrop-blur-sm"
              >
                <DropdownMenuItem className="hover:bg-sidebar-accent/50">
                  <ShareIcon className="mr-2 h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
