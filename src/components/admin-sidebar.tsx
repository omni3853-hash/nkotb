"use client";

import * as React from "react";
import { useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Star,
  Users,
  Crown,
  Calendar,
  CreditCard,
  Activity,
  Settings as SettingsIcon,
  Shield,
  LogOut,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { UserContext } from "@/contexts/UserContext";

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const { user, logout } = useContext(UserContext);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleLogout = async () => {
    try {
      setConfirming(true);
      logout(); // clears cookies/localStorage/session via your provider
      router.replace("/auth");
    } finally {
      setConfirming(false);
      setConfirmOpen(false);
    }
  };

  const navMain = useMemo(
    () => [
      {
        title: "Admin Overview",
        url: "/admin-dashboard",
        icon: LayoutDashboard,
        isActive: pathname === "/admin-dashboard",
      },
      { title: "Manage Celebrities", url: "/admin-dashboard/manage-celebrities", icon: Star },
      { title: "User Management", url: "/admin-dashboard/manage-users", icon: Users },
      { title: "Manage Memberships", url: "/admin-dashboard/manage-membership", icon: Crown },
      { title: "Event Management", url: "/admin-dashboard/manage-events", icon: Calendar },
      { title: "Transaction History", url: "/admin-dashboard/transactions", icon: CreditCard },
      { title: "Activity Log", url: "/admin-dashboard/activity-log", icon: Activity },
      { title: "System Settings", url: "/admin-dashboard/settings", icon: SettingsIcon },
    ],
    [pathname]
  );

  const teams = [{ name: "CelBookings Admin", logo: Shield, plan: "Enterprise" }];

  const adminUser = {
    name: `${user?.firstName ?? "Admin"} ${user?.lastName ?? "User"}`.trim(),
    email: user?.email ?? "admin@celbookings.com",
    avatar: (user as any)?.profileImage ?? "/avatars/admin.jpg",
    balance: 0,
    role: user?.role ?? "Administrator",
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarContent>
          {!isCollapsed && (
            <div className="p-4 border-b border-emerald-700/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600/20 flex items-center justify-center border-2 border-emerald-500/30">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">{adminUser.name}</h3>
                  <p className="text-emerald-400 text-xs">{adminUser.role}</p>
                </div>
              </div>
            </div>
          )}

          <NavMain items={navMain as any} isCollapsed={isCollapsed} />
        </SidebarContent>

        {/* Footer with profile + logout (with confirmation) */}
        <SidebarFooter className="gap-2">
          {/* Mini profile row (shown when expanded) */}
          {!isCollapsed && (
            <div className="px-3 py-2 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={adminUser.avatar} alt={adminUser.name} />
                <AvatarFallback>
                  {adminUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{adminUser.name}</p>
                <p className="text-[10px] text-zinc-400 truncate">{adminUser.email}</p>
              </div>
            </div>
          )}

          {!isCollapsed && <Separator className="mx-3 opacity-40" />}

          {/* Logout button — icon only when collapsed */}
          <div className="px-3 pb-3">
            <Button
              variant={isCollapsed ? "ghost" : "destructive"}
              size={isCollapsed ? "icon" : "sm"}
              className={isCollapsed ? "w-9 h-9" : "w-full justify-center"}
              onClick={() => setConfirmOpen(true)}
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Log out</span>}
            </Button>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Logout confirmation dialog (same behavior as SiteHeader) */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Log out?"
        description="This will end your current session and redirect you to the login page."
        confirmText="Log out"
        cancelText="Stay signed in"
        tone="danger"
        confirming={confirming}
        onConfirm={handleLogout}
      />
    </>
  );
}
