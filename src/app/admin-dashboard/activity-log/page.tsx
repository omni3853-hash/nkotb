"use client";

import { useState, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  Download,
  Eye,
  RefreshCw,
  User,
  DollarSign,
  Calendar,
  Star,
  Shield,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  Database,
  Server,
  Zap,
  Users,
  CreditCard,
  FileText,
  Mail,
  Bell,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Filter,
} from "lucide-react";

interface ActivityLogEntry {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  type:
    | "user"
    | "transaction"
    | "system"
    | "security"
    | "event"
    | "celebrity"
    | "admin";
  category: string;
  action: string;
  description: string;
  user?: string;
  admin?: string;
  amount?: number;
  status: "success" | "warning" | "error" | "info";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

const activityTypes = {
  user: {
    icon: User,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  transaction: {
    icon: DollarSign,
    color: "text-emerald-900",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  system: {
    icon: Server,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  security: {
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  event: {
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  celebrity: {
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  admin: {
    icon: Settings,
    color: "text-zinc-600",
    bgColor: "bg-zinc-50",
    borderColor: "border-zinc-200",
  },
};

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-900",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  error: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  info: {
    icon: Clock,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
};

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<
    ActivityLogEntry[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityLogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate sample activity data
  useEffect(() => {
    const generateActivities = (): ActivityLogEntry[] => {
      const sampleActivities: ActivityLogEntry[] = [
        // Recent activities
        {
          id: "ACT-001",
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          type: "user",
          category: "Registration",
          action: "New user registered",
          description:
            "Sarah Johnson created a new account with email sarah.johnson@email.com",
          user: "Sarah Johnson",
          status: "success",
          ipAddress: "192.168.1.100",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        {
          id: "ACT-002",
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 5 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(),
          type: "transaction",
          category: "Payment",
          action: "High-value booking completed",
          description:
            "Celebrity booking payment of $15,000 processed successfully",
          user: "Mike Wilson",
          amount: 15000,
          status: "success",
          ipAddress: "192.168.1.101",
        },
        {
          id: "ACT-003",
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 10 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 10 * 60 * 1000).toLocaleTimeString(),
          type: "system",
          category: "Maintenance",
          action: "Database optimization completed",
          description:
            "Automated database maintenance and optimization completed successfully",
          admin: "System",
          status: "success",
        },
        {
          id: "ACT-004",
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 15 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 15 * 60 * 1000).toLocaleTimeString(),
          type: "security",
          category: "Authentication",
          action: "Failed login attempt",
          description:
            "Multiple failed login attempts detected from IP 203.0.113.42",
          status: "warning",
          ipAddress: "203.0.113.42",
        },
        {
          id: "ACT-005",
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 20 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 20 * 60 * 1000).toLocaleTimeString(),
          type: "event",
          category: "Event Management",
          action: "New event created",
          description: "Summer Music Festival 2025 event created and published",
          user: "Event Manager",
          status: "success",
        },
        {
          id: "ACT-006",
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 25 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 25 * 60 * 1000).toLocaleTimeString(),
          type: "celebrity",
          category: "Profile Management",
          action: "Celebrity profile updated",
          description: "Tom Holland's profile information and rates updated",
          admin: "Admin User",
          status: "success",
        },
        {
          id: "ACT-007",
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 30 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString(),
          type: "admin",
          category: "User Management",
          action: "User account suspended",
          description:
            "User account john.doe@email.com suspended for policy violation",
          admin: "Admin User",
          user: "John Doe",
          status: "warning",
        },
        {
          id: "ACT-008",
          timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 35 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 35 * 60 * 1000).toLocaleTimeString(),
          type: "transaction",
          category: "Refund",
          action: "Refund processed",
          description: "Refund of $500 processed for cancelled event booking",
          user: "Emily Brown",
          amount: 500,
          status: "success",
        },
        {
          id: "ACT-009",
          timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 40 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 40 * 60 * 1000).toLocaleTimeString(),
          type: "system",
          category: "Performance",
          action: "High server load detected",
          description:
            "Server load exceeded 80% threshold, auto-scaling initiated",
          status: "warning",
        },
        {
          id: "ACT-010",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 45 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 45 * 60 * 1000).toLocaleTimeString(),
          type: "security",
          category: "Access Control",
          action: "Admin login successful",
          description: "Admin user successfully logged in from secure location",
          admin: "Admin User",
          status: "success",
          ipAddress: "192.168.1.50",
        },
        // Historical activities
        {
          id: "ACT-011",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "user",
          category: "Profile Update",
          action: "User profile updated",
          description: "User updated their profile information and preferences",
          user: "David Lee",
          status: "success",
        },
        {
          id: "ACT-012",
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "transaction",
          category: "Deposit",
          action: "Deposit received",
          description: "User deposited $1,000 into their account",
          user: "Lisa Anderson",
          amount: 1000,
          status: "success",
        },
        {
          id: "ACT-013",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "event",
          category: "Event Management",
          action: "Event cancelled",
          description:
            "Corporate networking event cancelled due to venue issues",
          user: "Event Manager",
          status: "warning",
        },
        {
          id: "ACT-014",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "celebrity",
          category: "Booking",
          action: "Celebrity booking confirmed",
          description: "Zendaya booking confirmed for private event",
          user: "Sophie White",
          amount: 25000,
          status: "success",
        },
        {
          id: "ACT-015",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "system",
          category: "Backup",
          action: "Automated backup completed",
          description: "Daily automated backup completed successfully",
          status: "success",
        },
        {
          id: "ACT-016",
          timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 7 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 7 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "admin",
          category: "Settings",
          action: "System settings updated",
          description: "Platform settings and configuration updated",
          admin: "Admin User",
          status: "success",
        },
        {
          id: "ACT-017",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 8 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "security",
          category: "Password Reset",
          action: "Password reset requested",
          description: "User requested password reset for their account",
          user: "Chris Taylor",
          status: "info",
        },
        {
          id: "ACT-018",
          timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 9 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 9 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "transaction",
          category: "Withdrawal",
          action: "Withdrawal processed",
          description:
            "User withdrawal of $2,500 processed and sent to bank account",
          user: "Anna Martinez",
          amount: 2500,
          status: "success",
        },
        {
          id: "ACT-019",
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 10 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 10 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "user",
          category: "Verification",
          action: "User verification completed",
          description: "User identity verification completed successfully",
          user: "Tom Harris",
          status: "success",
        },
        {
          id: "ACT-020",
          timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
          date: new Date(Date.now() - 11 * 60 * 60 * 1000).toLocaleDateString(),
          time: new Date(Date.now() - 11 * 60 * 60 * 1000).toLocaleTimeString(),
          type: "system",
          category: "Error",
          action: "Payment gateway error",
          description: "Temporary payment gateway connectivity issue resolved",
          status: "error",
        },
      ];

      return sampleActivities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    };

    setIsLoading(true);
    setTimeout(() => {
      const generatedActivities = generateActivities();
      setActivities(generatedActivities);
      setFilteredActivities(generatedActivities);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter activities based on search and filters
  useEffect(() => {
    let filtered = activities;

    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (activity.user &&
            activity.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (activity.admin &&
            activity.admin.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((activity) => activity.type === typeFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (activity) => activity.status === statusFilter
      );
    }

    setFilteredActivities(filtered);
  }, [activities, searchTerm, typeFilter, statusFilter]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const exportActivities = () => {
    const csvContent = [
      [
        "ID",
        "Date",
        "Time",
        "Type",
        "Category",
        "Action",
        "Description",
        "User",
        "Admin",
        "Amount",
        "Status",
        "IP Address",
      ],
      ...filteredActivities.map((activity) => [
        activity.id,
        activity.date,
        activity.time,
        activity.type,
        activity.category,
        activity.action,
        activity.description,
        activity.user || "",
        activity.admin || "",
        activity.amount || "",
        activity.status,
        activity.ipAddress || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActivityIcon = (type: string) => {
    const config = activityTypes[type as keyof typeof activityTypes];
    return config ? config.icon : Activity;
  };

  const getActivityColor = (type: string) => {
    const config = activityTypes[type as keyof typeof activityTypes];
    return config ? config.color : "text-zinc-600";
  };

  const getActivityBgColor = (type: string) => {
    const config = activityTypes[type as keyof typeof activityTypes];
    return config ? config.bgColor : "bg-zinc-50";
  };

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.color : "text-zinc-600";
  };

  const getStatusBgColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? config.bgColor : "bg-zinc-50";
  };

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Activity Log"
              subtitle="Monitor all platform activities, user actions, and system events"
              actionButton={{
                text: "Export CSV",
                icon: <Download className="size-4" />,
                onClick: exportActivities,
              }}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Activity className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    +{Math.floor(activities.length * 0.15)}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  TOTAL ACTIVITIES
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {activities.length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {Math.round(
                      (activities.filter((a) => a.status === "success").length /
                        activities.length) *
                        100
                    )}
                    %
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  SUCCESSFUL ACTIONS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {activities.filter((a) => a.status === "success").length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <AlertTriangle className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {Math.round(
                      (activities.filter((a) => a.status === "warning").length /
                        activities.length) *
                        100
                    )}
                    %
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">WARNINGS</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {activities.filter((a) => a.status === "warning").length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <XCircle className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {Math.round(
                      (activities.filter((a) => a.status === "error").length /
                        activities.length) *
                        100
                    )}
                    %
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  SYSTEM ERRORS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {activities.filter((a) => a.status === "error").length}
                </p>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">
                  Filters & Search
                </CardTitle>
                <CardDescription>
                  Filter activities by type, status, and search terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-50 focus:border-emerald-500"
                    />
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="transaction">Transaction</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="celebrity">Celebrity</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="bg-zinc-50 focus:border-emerald-500"
                  >
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${
                        isLoading ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Table */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">Activity Log</CardTitle>
                <CardDescription>
                  Real-time monitoring of all platform activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border-0 bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-100 hover:bg-transparent">
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Activity
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Type
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          User
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Amount
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Status
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Date & Time
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell
                            colSpan={7}
                            className="text-center py-12 border-0"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="size-4 animate-spin text-gray-400" />
                              <span className="text-sm text-gray-500">
                                Loading activities...
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredActivities.length === 0 ? (
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell
                            colSpan={7}
                            className="text-center py-12 border-0"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <Activity className="size-8 text-gray-300" />
                              <span className="text-sm text-gray-500">
                                No activities found
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredActivities.map((activity) => {
                          const ActivityIcon = getActivityIcon(activity.type);
                          const StatusIcon = getStatusIcon(activity.status);

                          return (
                            <TableRow
                              key={activity.id}
                              className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200"
                            >
                              <TableCell className="py-4">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`size-8 rounded-md ${getActivityBgColor(
                                      activity.type
                                    )} flex items-center justify-center shrink-0`}
                                  >
                                    <ActivityIcon
                                      className={`size-4 ${getActivityColor(
                                        activity.type
                                      )}`}
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 text-sm">
                                      {activity.action}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                      {activity.description}
                                    </p>
                                    <Badge
                                      className={`mt-2 text-xs ${getActivityBgColor(
                                        activity.type
                                      )} ${getActivityColor(
                                        activity.type
                                      )} border-0`}
                                    >
                                      {activity.category}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge
                                  className={`text-xs ${getActivityBgColor(
                                    activity.type
                                  )} ${getActivityColor(
                                    activity.type
                                  )} border-0`}
                                >
                                  {activity.type.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="text-sm">
                                  {activity.user && (
                                    <div className="flex items-center gap-1">
                                      <User className="size-3 text-gray-400" />
                                      <span className="text-gray-900">
                                        {activity.user}
                                      </span>
                                    </div>
                                  )}
                                  {activity.admin && (
                                    <div className="flex items-center gap-1">
                                      <Settings className="size-3 text-gray-400" />
                                      <span className="text-gray-900">
                                        {activity.admin}
                                      </span>
                                    </div>
                                  )}
                                  {!activity.user && !activity.admin && (
                                    <span className="text-gray-400 text-xs">
                                      System
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                {activity.amount && (
                                  <span className="text-sm font-semibold text-emerald-900">
                                    ${activity.amount.toLocaleString()}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge
                                  className={`text-xs ${getStatusBgColor(
                                    activity.status
                                  )} ${getStatusColor(
                                    activity.status
                                  )} border-0`}
                                >
                                  <StatusIcon className="size-3 mr-1" />
                                  {activity.status.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4 text-sm">
                                <div>
                                  <div className="text-gray-900">
                                    {activity.date}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {activity.time}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedActivity(activity)
                                      }
                                      className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900"
                                    >
                                      <Eye className="size-3 mr-1" />
                                      View
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-hidden">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <ActivityIcon
                                          className={`size-5 ${getActivityColor(
                                            activity.type
                                          )}`}
                                        />
                                        Activity Details
                                      </DialogTitle>
                                      <DialogDescription>
                                        Detailed information about this activity
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">
                                            Activity ID
                                          </label>
                                          <p className=" text-sm">
                                            {activity.id}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">
                                            Type
                                          </label>
                                          <p className="text-sm">
                                            {activity.type}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">
                                            Category
                                          </label>
                                          <p className="text-sm">
                                            {activity.category}
                                          </p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">
                                            Status
                                          </label>
                                          <Badge
                                            className={`text-xs ${getStatusBgColor(
                                              activity.status
                                            )} ${getStatusColor(
                                              activity.status
                                            )} border-2 border-zinc-200`}
                                          >
                                            <StatusIcon className="size-3 mr-1" />
                                            {activity.status.toUpperCase()}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-zinc-600">
                                          Action
                                        </label>
                                        <p className="text-sm font-medium">
                                          {activity.action}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-zinc-600">
                                          Description
                                        </label>
                                        <p className="text-sm">
                                          {activity.description}
                                        </p>
                                      </div>
                                      {activity.amount && (
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">
                                            Amount
                                          </label>
                                          <p className=" text-sm font-bold text-emerald-900">
                                            ${activity.amount.toLocaleString()}
                                          </p>
                                        </div>
                                      )}
                                      {activity.ipAddress && (
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">
                                            IP Address
                                          </label>
                                          <p className=" text-sm">
                                            {activity.ipAddress}
                                          </p>
                                        </div>
                                      )}
                                      {activity.userAgent && (
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">
                                            User Agent
                                          </label>
                                          <p className="text-xs  bg-zinc-100 p-2 rounded">
                                            {activity.userAgent}
                                          </p>
                                        </div>
                                      )}
                                      <div>
                                        <label className="text-sm font-medium text-zinc-600">
                                          Timestamp
                                        </label>
                                        <p className=" text-sm">
                                          {activity.timestamp}
                                        </p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
