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
  Users,
  Settings,
  Shield,
  BarChart3,
  Database,
  UserCheck,
  TrendingUp,
  Eye,
  Plus,
  Activity,
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

// Admin-specific data
const adminData = {
  user: {
    name: "Admin User",
    email: "admin@celbookings.com",
    avatar: "/avatars/admin.jpg",
    balance: 0,
    role: "Administrator",
  },
  teams: [
    {
      name: "CelBookings Admin",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Admin Overview",
      url: "/admin-dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Manage Celebrities",
      url: "/admin-dashboard/manage-celebrities",
      icon: Star,
    },
    {
      title: "User Management",
      url: "/admin-dashboard/manage-users",
      icon: Users,
    },
    {
      title: "Manage Memberships",
      url: "/admin-dashboard/manage-membership",
      icon: Crown,
    },
    {
      title: "Event Management",
      url: "/admin-dashboard/manage-events",
      icon: Calendar,
    },
    {
      title: "Transaction History",
      url: "/admin-dashboard/transactions",
      icon: CreditCard,
    },
    {
      title: "Activity Log",
      url: "/admin-dashboard/activity-log",
      icon: Activity,
    },
    {
      title: "Analytics",
      url: "/admin-dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "System Settings",
      url: "/admin-dashboard/settings",
      icon: Settings,
    },
  ],
  navSecondary: [
    {
      title: "Platform Overview",
      url: "/dashboard",
      icon: Eye,
    },
    {
      title: "Celebrities",
      url: "/celebrities",
      icon: Star,
    },
    {
      title: "Events",
      url: "/events",
      icon: Calendar,
    },
  ],
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={adminData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Admin Profile Card - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="profile-card p-4 border-b border-emerald-700/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center border-2 border-emerald-500/30">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-emerald-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">
                  {adminData.user.name}
                </h3>
                <div className="flex items-center gap-1 mt-1">
                  <Shield className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">
                    {adminData.user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Navigation */}
        <NavMain items={adminData.navMain} isCollapsed={isCollapsed} />

        {/* Quick Access Section - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="quick-access p-4 border-t border-emerald-700/30">
            <div className="mb-3">
              <h3 className="text-white/90 font-semibold text-xs uppercase tracking-wider">
                Quick Access
              </h3>
            </div>
            <div className="space-y-2">
              {adminData.navSecondary.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-800/30 transition-colors text-white/80 hover:text-white"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm">{item.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Admin Stats Section - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="admin-stats p-4">
            <div className="bg-emerald-800/30 rounded-lg p-4 border border-emerald-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-600/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    System Status
                  </h3>
                  <p className="text-white/70 text-xs">
                    All systems operational
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-emerald-400 font-bold">12,847</p>
                  <p className="text-white/60">Users</p>
                </div>
                <div className="text-center">
                  <p className="text-emerald-400 font-bold">8,934</p>
                  <p className="text-white/60">Bookings</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={adminData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
