"use client";

import * as React from "react";
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  LayoutDashboard,
  User,
  Crown,
  Calendar,
  Star,
  Wallet,
  CreditCard,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
    balance: 1250.75,
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: User,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: CreditCard,
    },
    {
      title: "Membership",
      url: "/membership",
      icon: Crown,
    },
    {
      title: "Events",
      url: "/events",
      icon: Calendar,
    },
    {
      title: "Celebrities",
      url: "/celebrities",
      icon: Star,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Profile Card - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="profile-card p-4 border-b border-emerald-700/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center border-2 border-emerald-500/30">
                  <User className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-emerald-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">
                  {data.user.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Wallet className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">
                    ${data.user.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <NavMain items={data.navMain} isCollapsed={isCollapsed} />
        {/* CTA Section - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="cta-section p-4">
            <div className="bg-emerald-800/30 rounded-lg p-4 border border-emerald-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-600/20 rounded-lg">
                  <Crown className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    Upgrade Membership
                  </h3>
                  <p className="text-white/70 text-xs">
                    Access exclusive events & perks
                  </p>
                </div>
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200">
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
