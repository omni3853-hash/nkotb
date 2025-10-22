"use client";

import { useContext, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserIcon as UserGlyph,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { UserContext } from "@/contexts/UserContext";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserNotificationsApi, type NotificationDto } from "@/api/notifications.api";

type SiteHeaderProps = {
  isUser?: boolean;
  title?: string;
};

export function SiteHeader({ isUser = false, title = "Dashboard" }: SiteHeaderProps) {
  const router = useRouter();
  const { user, logout } = useContext(UserContext);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleLogout = async () => {
    try {
      setConfirming(true);
      logout();
      router.replace("/auth");
    } finally {
      setConfirming(false);
      setConfirmOpen(false);
    }
  };

  const display = useMemo(() => {
    const fullName = `${user?.firstName ?? "John"} ${user?.lastName ?? "Doe"}`.replace(/\s+/g, " ").trim();
    const initials = fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    return {
      name: fullName || "John Doe",
      email: user?.email ?? "john.doe@example.com",
      avatar: (user as any)?.profileImage ?? "/placeholder-avatar.jpg",
      initials,
    };
  }, [user]);

  const primaryAction = useMemo(
    () =>
      isUser
        ? { label: "Profile" as const, href: "/user-dashboard/profile", Icon: UserGlyph }
        : { label: "Settings" as const, href: "/admin-dashboard/settings", Icon: Cog6ToothIcon },
    [isUser]
  );

  return (
    <>
      <header className="sticky top-0 z-50 mx-6 rounded-xl py-8 mt-4 text-zinc-100 bg-emerald-900 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear" role="banner">
        <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
          <div className="flex items-center gap-1 lg:gap-2">
            <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <img
              alt="Premier Talent Agency Logo"
              src="/logo-white.png"
              className="h-8 w-auto mr-2"
            />
            <h1 className="text-base font-medium">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Open profile menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={display.avatar} alt={display.name} />
                    <AvatarFallback>
                      <UserGlyph className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={display.avatar} alt={display.name} />
                      <AvatarFallback>{display.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{display.name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{display.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    router.push(primaryAction.href);
                  }}
                >
                  <primaryAction.Icon className="mr-2 h-4 w-4" />
                  <span>{primaryAction.label}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700"
                  onSelect={(e) => {
                    e.preventDefault();
                    setConfirmOpen(true);
                  }}
                >
                  <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

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

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<{ items: NotificationDto[]; total: number; page: number; limit: number }>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);
  const [marking, setMarking] = useState(false);

  const unreadCount = useMemo(() => data.items.filter((n) => !n.read).length, [data.items]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await UserNotificationsApi.myList({ page: 1, limit: 10 });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let t: any;
    if (open && unreadCount > 0 && !marking) {
      t = setTimeout(async () => {
        try {
          setMarking(true);
          await UserNotificationsApi.markAllRead();
          setData((prev) => ({ ...prev, items: prev.items.map((n) => ({ ...n, read: true })) }));
        } finally {
          setMarking(false);
        }
      }, 450);
    }
    return () => clearTimeout(t);
  }, [open, unreadCount, marking]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="Notifications">
          <Bell className={cn("h-5 w-5", unreadCount ? "text-amber-500" : "text-zinc-200")} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
          <span className="font-medium">Notifications</span>
          <Badge variant="secondary">{unreadCount} new</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[360px] overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-sm text-zinc-500">Loading…</div>
          ) : data.items.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-500">You’re all caught up 🎉</div>
          ) : (
            <ul className="divide-y">
              {data.items.map((n) => (
                <li key={n._id} className="p-3 hover:bg-zinc-50">
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-1 h-2 w-2 rounded-full", n.read ? "bg-zinc-300" : "bg-amber-500")} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{n.title}</p>
                      <p className="line-clamp-2 text-xs text-zinc-600">{n.message}</p>
                      <p className="mt-1 text-[11px] text-zinc-400">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
