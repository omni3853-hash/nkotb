"use client";

import * as React from "react";
import { useContext, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User as UserIcon,
  Crown,
  Calendar,
  Star,
  CreditCard,
  Wallet,
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

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
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
      logout(); // clear auth (cookies/localStorage/session) via your provider
      router.replace("/auth");
    } finally {
      setConfirming(false);
      setConfirmOpen(false);
    }
  };

  // Derive safe display info from user context
  const appUser = {
    name:
      `${user?.firstName ?? "Guest"} ${user?.lastName ?? "User"}`
        .replace(/\s+/g, " ")
        .trim() || "Guest User",
    email: user?.email ?? "guest@example.com",
    avatar: (user as any)?.profileImage ?? "/avatars/user.jpg",
    balance: typeof (user as any)?.balance === "number" ? (user as any).balance : 0,
  };

  // Optional: swap/extend teams to match your org/tenant design
  const teams = [
    { name: "CelBookings", logo: UserIcon, plan: "Member" },
  ];

  // Route-aware main nav
  const navMain = useMemo(
    () => [
      {
        title: "Overview",
        url: "/user-dashboard",
        icon: LayoutDashboard,
        isActive: pathname === "/user-dashboard",
      },
      {
        title: "Profile",
        url: "/user-dashboard/profile",
        icon: UserIcon,
        isActive: pathname?.startsWith("/user-dashboard/profile"),
      },
      {
        title: "Transactions",
        url: "/user-dashboard/transactions",
        icon: CreditCard,
        isActive: pathname?.startsWith("/user-dashboard/transactions"),
      },
      {
        title: "Membership",
        url: "/user-dashboard/membership",
        icon: Crown,
        isActive: pathname?.startsWith("/user-dashboard/membership"),
      },
      {
        title: "Events",
        url: "/user-dashboard/events",
        icon: Calendar,
        isActive: pathname?.startsWith("/user-dashboard/events"),
      },
      {
        title: "Celebrities",
        url: "/user-dashboard/celebrities",
        icon: Star,
        isActive: pathname?.startsWith("/user-dashboard/celebrities"),
      },
    ],
    [pathname]
  );

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        {/* Body */}
        <SidebarContent>
          {/* Profile Card (expanded only) */}
          {!isCollapsed && (
            <div className="p-4 border-b border-emerald-700/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-emerald-500/30">
                  <AvatarImage src={appUser.avatar} alt={appUser.name} />
                  <AvatarFallback className="bg-emerald-600/20 text-emerald-200">
                    {appUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm truncate">
                    {appUser.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">{appUser.email}</p>
                  <div className="mt-2 flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-medium">
                      ${appUser.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Nav */}
          <NavMain items={navMain as any} isCollapsed={isCollapsed} />

          {/* --- KEEP THIS CTA SECTION EXACTLY IN THE DESIGN AS REQUESTED --- */}
          {!isCollapsed && (
            <div className="p-4">
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
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => router.push("/user-dashboard/membership")}
                >
                  Upgrade Now
                </Button>
              </div>
            </div>
          )}
          {/* --- END CTA SECTION --- */}
        </SidebarContent>

        {/* Footer: mini profile row + confirmed logout (mirrors AdminSidebar) */}
        <SidebarFooter className="gap-2">
          {!isCollapsed && (
            <div className="px-3 py-2 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={appUser.avatar} alt={appUser.name} />
                <AvatarFallback>
                  {appUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{appUser.name}</p>
                <p className="text-[10px] text-zinc-400 truncate">{appUser.email}</p>
              </div>
            </div>
          )}

          {!isCollapsed && <Separator className="mx-3 opacity-40" />}

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

      {/* Logout confirmation dialog */}
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
