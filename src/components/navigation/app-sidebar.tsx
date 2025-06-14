"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CalendarIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  PartyPopperIcon,
  SearchIcon,
  SettingsIcon,
  TicketIcon,
  UsersIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { NavDocuments } from "./nav-document";
import { MagicCard } from "~/components/ui/magic-card";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

// Define types for navigation data
interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface DocumentItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface AdminNavigationData {
  navMain: NavItem[];
  navSecondary: NavItem[];
}

interface OrganizerNavigationData {
  navMain: NavItem[];
  navSecondary: NavItem[];
  documents: DocumentItem[];
}

// Function to generate admin navigation data
const getAdminNavigationData = (): AdminNavigationData => ({
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: PartyPopperIcon,
    },
    {
      title: "Organizers",
      url: "/admin/organizers",
      icon: UsersIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: SettingsIcon,
    },
  ],
});

// Function to generate organizer navigation data with organizerId
const getOrganizerNavigationData = (
  organizerId: string,
): OrganizerNavigationData => ({
  navMain: [
    {
      title: "Dashboard",
      url: `/organizer/${organizerId}`,
      icon: LayoutDashboardIcon,
    },
    {
      title: "Events",
      url: `/organizer/${organizerId}/events`,
      icon: CalendarIcon,
    },
    {
      title: "Tickets",
      url: `/organizer/${organizerId}/tickets`,
      icon: TicketIcon,
    },
    {
      title: "Orders",
      url: `/organizer/${organizerId}/orders`,
      icon: ListIcon,
    },
    {
      title: "Analytics",
      url: `/organizer/${organizerId}/analytics`,
      icon: BarChartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: `/organizer/${organizerId}/settings`,
      icon: SettingsIcon,
    },
    // {
    //   title: "Get Help",
    //   url: "#",
    //   icon: HelpCircleIcon,
    // },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: SearchIcon,
    // },
  ],
  documents: [
    // {
    //   name: "Sales Reports",
    //   url: `/organizer/${organizerId}/reports/sales`,
    //   icon: DatabaseIcon,
    // },
    // {
    //   name: "Attendee Lists",
    //   url: `/organizer/${organizerId}/reports/attendees`,
    //   icon: ClipboardListIcon,
    // },
    // {
    //   name: "Inventory",
    //   url: `/organizer/${organizerId}/inventory`,
    //   icon: FileIcon,
    // },
  ],
});

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role: "admin" | "organizer";
  organizerId?: string;
}

export function AppSidebar({
  role,
  organizerId = "",
  ...props
}: AppSidebarProps) {
  const { data: session } = useSession();

  // Use user data from session if available
  const userData = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "user@example.com",
    avatar: session?.user?.image ?? "/avatars/default.jpg",
  };

  // Generate navigation data based on role
  const navData =
    role === "admin"
      ? getAdminNavigationData()
      : getOrganizerNavigationData(organizerId);

  // Type guard to check if navData has documents property
  const hasDocuments = (
    data: AdminNavigationData | OrganizerNavigationData,
  ): data is OrganizerNavigationData => {
    return "documents" in data;
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-sidebar-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <MagicCard 
              className="p-0 border-0 bg-transparent"
              gradientColor="rgba(59, 130, 246, 0.1)"
            >
              <SidebarMenuButton
                asChild                className={
                  role === "admin"
                    ? "data-[slot=sidebar-menu-button]:h-auto data-[slot=sidebar-menu-button]:min-h-[6rem] data-[slot=sidebar-menu-button]:!p-8 hover:bg-sidebar-accent/50 transition-all duration-200"
                    : "data-[slot=sidebar-menu-button]:h-auto data-[slot=sidebar-menu-button]:min-h-[5.5rem] data-[slot=sidebar-menu-button]:!p-6 hover:bg-sidebar-accent/50 transition-all duration-200"
                }
              >
                {role === "admin" ? (                  <a
                    href="/admin/dashboard"
                    className="flex items-center justify-center w-full"
                  >
                    <div className="relative w-full flex justify-center">
                      <img 
                        src="/desain_logo.png" 
                        alt="VBTix Logo" 
                        className="h-32 w-auto object-contain max-w-full scale-110"
                      />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse" />
                    </div>
                  </a>
                ) : (
                  <a href={`/organizer/${organizerId}`} className="flex items-center justify-center w-full">                    <div className="relative w-full flex justify-center">
                      <img 
                        src="/desain_logo.png" 
                        alt="VBTix Logo" 
                        className="h-28 w-auto object-contain max-w-full scale-110"
                      />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-green-400 rounded-full animate-pulse" />
                    </div>
                  </a>
                )}
              </SidebarMenuButton>
            </MagicCard>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>      <SidebarContent className="px-2 py-4">        <div className="space-y-2">
          <NavMain items={navData.navMain} />
          
        </div>
        <div className="mt-auto pt-6">
          <NavSecondary items={navData.navSecondary} className="mt-auto" />
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/50 p-2">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
