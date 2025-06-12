"use client";

import * as React from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  BarChartIcon,
  CameraIcon,
  FileCodeIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  PartyPopperIcon,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { NavMain } from "~/components/dashboard/admin/nav-main";
import { NavSecondary } from "~/components/dashboard/admin/nav-secondary";
import { NavUser } from "~/components/dashboard/admin/nav-user";
import { useAdminSidebarStats } from "~/lib/api/hooks/admin-sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },  navMain: [
    {
      title: "Event Approval",
      url: "/admin/approval",
      icon: CheckCircle2,
      badge: "pending", // Will be replaced with actual count
    },
    {
      title: "Event Management",
      url: "/admin/events",
      icon: PartyPopperIcon,
    },
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Organizers",
      url: "/admin/organizers",
      icon: UsersIcon,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { pendingEventsCount, isLoading } = useAdminSidebarStats();

  // Gunakan data user dari session jika tersedia
  const userData = {
    name: session?.user?.name || "Guest",
    email: session?.user?.email || "guest@example.com",
    avatar: session?.user?.image || "/avatars/default.jpg",
  };

  // Update navigation data with pending count
  const navigationData = {
    ...data,
    navMain: data.navMain.map(item => {
      if (item.title === "Event Approval") {
        return {
          ...item,
          badge: isLoading ? "..." : pendingEventsCount > 0 ? pendingEventsCount : undefined,
        };
      }
      return item;
    }),
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:h-auto data-[slot=sidebar-menu-button]:min-h-[3.5rem] data-[slot=sidebar-menu-button]:!p-0 data-[slot=sidebar-menu-button]:pl-0"
            >
              <a
                href="/admin/dashboard"
                className="ml-0 flex items-center gap-0 pl-0"
              >
                <div className="ml-0 flex items-center pl-0">
                  <div className="relative ml-0">
                    <Image
                      src="/desain_logo.png"
                      alt="VBTix Logo"
                      width={96}
                      height={96}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <span className="-ml-1 flex h-10 items-center text-xl font-semibold text-white">
                    ADMIN
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationData.navMain} />
        <NavSecondary items={navigationData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
