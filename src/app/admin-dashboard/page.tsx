"use client";

import { useState, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  ActivityIcon,
  PlusIcon,
  Settings,
  Shield,
  AlertTriangle,
  Server,
  Database,
  BarChart3,
  UserCheck,
  Zap,
} from "lucide-react";

export default function AdminOverview() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [activeEvents, setActiveEvents] = useState(0);
  const [celebrityBookings, setCelebrityBookings] = useState(0);
  const [systemHealth, setSystemHealth] = useState(98);
  const [activeSessions, setActiveSessions] = useState(0);

  // Live admin activities for marquee
  const [adminActivities] = useState([
    "New user registration: Sarah Johnson joined the platform",
    "High-value booking: $15,000 celebrity booking completed",
    "System alert: Database performance optimized",
    "User verification: 23 pending accounts approved",
    "Revenue milestone: $3M monthly target achieved",
    "Security scan: All systems secure and up to date",
    "New event created: Summer Music Festival 2025",
    "Celebrity onboarding: Tom Holland profile added",
    "Payment processed: $2,500 deposit from premium user",
    "Platform maintenance: Scheduled update completed",
  ]);

  const [marqueePosition, setMarqueePosition] = useState(0);

  useEffect(() => {
    const animateCounter = (setter: any, target: number, duration: number) => {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(current));
        }
      }, 16);
    };

    animateCounter(setTotalUsers, 12847, 1500);
    animateCounter(setTotalRevenue, 2847392, 1500);
    animateCounter(setTotalBookings, 8934, 1500);
    animateCounter(setActiveEvents, 234, 1500);
    animateCounter(setCelebrityBookings, 1456, 1500);
    animateCounter(setActiveSessions, 1247, 1500);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueePosition((prev) => (prev <= -50 ? 0 : prev - 0.1));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const quickStats = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: Users,
    },
    {
      label: "Platform Revenue",
      value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
      change: "+23.1%",
      trend: "up",
      icon: DollarSign,
    },
    {
      label: "Active Sessions",
      value: activeSessions.toLocaleString(),
      change: "+8.3%",
      trend: "up",
      icon: UserCheck,
    },
    {
      label: "System Health",
      value: `${systemHealth}%`,
      change: "+2.1%",
      trend: "up",
      icon: Server,
    },
  ];

  const platformStats = [
    {
      label: "Total Bookings",
      value: totalBookings.toLocaleString(),
      change: "+8.3%",
      trend: "up",
      icon: Calendar,
      color: "text-purple-900",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-900",
    },
    {
      label: "Active Events",
      value: activeEvents.toLocaleString(),
      change: "+5.7%",
      trend: "up",
      icon: Calendar,
      color: "text-orange-900",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-900",
    },
    {
      label: "Celebrity Bookings",
      value: celebrityBookings.toLocaleString(),
      change: "+18.9%",
      trend: "up",
      icon: Star,
      color: "text-amber-900",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-900",
    },
    {
      label: "Database Queries",
      value: "2.4M",
      change: "+15.2%",
      trend: "up",
      icon: Database,
      color: "text-blue-900",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-900",
    },
  ];

  const recentTransactions = [
    {
      id: "TXN-001",
      user: "John Smith",
      type: "Event Booking",
      amount: 250,
      status: "completed",
      date: "2024-01-15",
      time: "10:30 AM",
    },
    {
      id: "TXN-002",
      user: "Sarah Johnson",
      type: "Celebrity Booking",
      amount: 5000,
      status: "completed",
      date: "2024-01-15",
      time: "09:45 AM",
    },
    {
      id: "TXN-003",
      user: "Mike Wilson",
      type: "Deposit",
      amount: 1000,
      status: "pending",
      date: "2024-01-14",
      time: "11:20 PM",
    },
    {
      id: "TXN-004",
      user: "Emily Brown",
      type: "Event Booking",
      amount: 180,
      status: "completed",
      date: "2024-01-14",
      time: "08:15 PM",
    },
    {
      id: "TXN-005",
      user: "David Lee",
      type: "Withdrawal",
      amount: 2500,
      status: "processing",
      date: "2024-01-14",
      time: "06:30 PM",
    },
    {
      id: "TXN-006",
      user: "Lisa Anderson",
      type: "Celebrity Booking",
      amount: 7500,
      status: "completed",
      date: "2024-01-13",
      time: "03:45 PM",
    },
    {
      id: "TXN-007",
      user: "Tom Harris",
      type: "Deposit",
      amount: 500,
      status: "completed",
      date: "2024-01-13",
      time: "02:20 PM",
    },
    {
      id: "TXN-008",
      user: "Anna Martinez",
      type: "Event Booking",
      amount: 320,
      status: "completed",
      date: "2024-01-13",
      time: "01:10 PM",
    },
    {
      id: "TXN-009",
      user: "Chris Taylor",
      type: "Deposit",
      amount: 750,
      status: "pending",
      date: "2024-01-12",
      time: "10:55 AM",
    },
    {
      id: "TXN-010",
      user: "Sophie White",
      type: "Withdrawal",
      amount: 1200,
      status: "completed",
      date: "2024-01-12",
      time: "09:30 AM",
    },
  ];

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100">
          <div className="@container/main flex flex-1 flex-col gap-2 px-2 sm:px-3">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DynamicPageHeader
                title={
                  <>
                    <span className="text-zinc-500">Admin</span> Dashboard
                  </>
                }
                subtitle="Today is Sunday, 10th October 2025"
                actionButton={{
                  text: "System Settings",
                  icon: <Settings className="size-4" />,
                }}
              />

              {/* Live Activity Marquee */}
              <div className="px-2 sm:px-4 lg:px-6">
                <div className="rounded-xl bg-white p-3 sm:p-4 overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs sm:text-sm text-zinc-600">
                        LIVE ADMIN ACTIVITY
                      </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div
                        className="flex gap-4 sm:gap-6 lg:gap-8 whitespace-nowrap"
                        style={{
                          transform: `translateX(${marqueePosition}%)`,
                          transition: "transform 0.02s linear",
                        }}
                      >
                        {[...adminActivities, ...adminActivities].map(
                          (activity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 sm:gap-2"
                            >
                              <ActivityIcon className="size-3 sm:size-4 text-emerald-900 shrink-0" />
                              <span className="text-xs sm:text-sm text-zinc-900">
                                {activity}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats Cards */}
              <div className="px-2 sm:px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {quickStats.map((stat) => {
                    const Icon = stat.icon;
                    const TrendIcon =
                      stat.trend === "up" ? TrendingUp : TrendingDown;
                    return (
                      <Card
                        key={stat.label}
                        className="border-2 border-zinc-200 rounded-2xl p-4 hover:border-emerald-900 transition-all cursor-pointer bg-white"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                            <Icon className="size-5 text-emerald-900" />
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                            <TrendIcon className="size-3 mr-1" />
                            {stat.change}
                          </Badge>
                        </div>
                        <p className="text-xs font-mono text-zinc-600 mb-1">
                          {stat.label.toUpperCase()}
                        </p>
                        <p className="text-2xl font-bold text-emerald-900">
                          {stat.value}
                        </p>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Platform Overview Cards */}
              <div className="flex flex-col lg:flex-row mt-5 px-2 sm:px-4 lg:px-6 gap-4 lg:gap-3">
                {/* System Status Card */}
                <div className="w-full lg:min-w-lg border rounded-[22px] pb-4 pt-4 px-4 bg-zinc-900 flex flex-col justify-between">
                  <div className="flex gap-x-2 justify-between">
                    <span className="text-emerald-300 h-fit bg-emerald-700/20 border border-emerald-300/20 text-[13px] w-fit rounded-full px-3 py-1">
                      SYSTEM STATUS
                    </span>
                    <Shield className="text-zinc-500 text-5xl" />
                  </div>

                  <div className="px-2 mt-7">
                    <h2 className="text-zinc-300 text-xl sm:text-2xl lg:text-3xl font-bold break-all">
                      ALL SYSTEMS OPERATIONAL
                    </h2>
                  </div>
                  <div className="flex items-center gap-x-4 sm:gap-x-8 lg:gap-x-14 mt-5">
                    <div className="px-2 flex-1">
                      <p className="text-zinc-500 text-xs">UPTIME</p>
                      <h2 className="text-zinc-300 text-lg sm:text-2xl lg:text-3xl font-bold">
                        99.9%
                      </h2>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-zinc-500 text-xs">RESPONSE TIME</p>
                      <h2 className="text-zinc-300 text-lg sm:text-2xl lg:text-3xl font-bold">
                        45ms
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
                    <div className="px-2">
                      <p className="text-zinc-500 text-[13px]">
                        ACTIVE SERVERS
                      </p>
                      <h2 className="text-zinc-100 text-2xl sm:text-3xl lg:text-4xl font-bold">
                        12/12
                      </h2>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-zinc-700/50 to-zinc-800/70 py-3 sm:py-5 px-6 sm:px-8 rounded-full text-zinc-100 text-[13px] flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Zap className="size-4" />
                      <span>Monitor</span>
                    </Button>
                  </div>
                </div>

                {/* Platform Health Card */}
                <div className="w-full border-2 border-emerald-900 rounded-2xl bg-emerald-900 py-4 px-4 sm:px-6 flex flex-col justify-between">
                  <div>
                    <Badge className="bg-emerald-800 text-zinc-100 border-2 border-emerald-700 hover:bg-emerald-800 text-xs mb-4 sm:mb-6">
                      PLATFORM HEALTH
                    </Badge>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100 mb-3 sm:mb-4">
                      Excellent Performance
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-100 mb-4 sm:mb-6">
                      All systems running smoothly with optimal performance
                      metrics and security protocols active.
                    </p>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 text-zinc-100">
                      <CheckCircle2 className="size-3 sm:size-4" />
                      <span className="text-xs sm:text-sm">
                        Database Optimized
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-100">
                      <CheckCircle2 className="size-3 sm:size-4" />
                      <span className="text-xs sm:text-sm">
                        Security Active
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-100">
                      <CheckCircle2 className="size-3 sm:size-4" />
                      <span className="text-xs sm:text-sm">Auto Backup</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="px-2 sm:px-4 lg:px-6">
                <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900">
                        Recent Platform Activity
                      </h2>
                      <p className="text-sm text-zinc-600 mt-1">
                        Latest transactions and system activities
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-2 border-zinc-200 rounded-xl bg-transparent"
                        onClick={() =>
                          (window.location.href =
                            "/admin-dashboard/activity-log")
                        }
                      >
                        <ActivityIcon className="size-4 mr-2" />
                        View Activity Log
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-zinc-200 rounded-xl bg-transparent"
                      >
                        <Eye className="size-4 mr-2" />
                        View All
                      </Button>
                      <Button
                        variant="outline"
                        className="border-2 border-zinc-200 rounded-xl bg-transparent"
                      >
                        <Download className="size-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  <div className="border-2 border-zinc-200 rounded-2xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-zinc-50">
                        <TableRow>
                          <TableHead className="font-mono text-xs">
                            TRANSACTION ID
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            USER
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            TYPE
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            AMOUNT
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            STATUS
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            DATE & TIME
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((transaction) => (
                          <TableRow
                            key={transaction.id}
                            className="hover:bg-zinc-50 transition-colors"
                          >
                            <TableCell className="font-mono text-sm font-bold text-zinc-900">
                              {transaction.id}
                            </TableCell>
                            <TableCell className="font-medium">
                              {transaction.user}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`font-mono text-xs ${
                                  transaction.type === "Event Booking"
                                    ? "bg-purple-50 text-purple-900 border-2 border-purple-900"
                                    : transaction.type === "Celebrity Booking"
                                    ? "bg-amber-50 text-amber-900 border-2 border-amber-900"
                                    : transaction.type === "Deposit"
                                    ? "bg-emerald-50 text-emerald-900 border-2 border-emerald-900"
                                    : "bg-blue-50 text-blue-900 border-2 border-blue-900"
                                }`}
                              >
                                {transaction.type.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm font-bold text-emerald-900">
                              ${transaction.amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`font-mono text-xs ${
                                  transaction.status === "completed"
                                    ? "bg-emerald-50 text-emerald-900 border-2 border-emerald-900"
                                    : transaction.status === "pending"
                                    ? "bg-amber-50 text-amber-900 border-2 border-amber-900"
                                    : "bg-blue-50 text-blue-900 border-2 border-blue-900"
                                }`}
                              >
                                {transaction.status === "completed" && (
                                  <CheckCircle2 className="size-3 mr-1" />
                                )}
                                {transaction.status === "pending" && (
                                  <Clock className="size-3 mr-1" />
                                )}
                                {transaction.status === "processing" && (
                                  <Clock className="size-3 mr-1" />
                                )}
                                {transaction.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {transaction.date} {transaction.time}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
