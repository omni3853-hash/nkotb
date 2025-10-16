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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  User,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Shield,
  CreditCard,
  Activity,
  MoreVertical,
  Save,
  X,
  Upload,
  Camera,
  Lock,
  Unlock,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Star,
  Clock,
  Building,
  Globe,
  Settings,
  UserPlus,
  UserMinus,
  Wallet,
  History,
  Filter,
  Download,
  RefreshCw,
  MessageSquare,
  Bell,
} from "lucide-react";

// User interface
interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  location: string;
  joinDate: string;
  lastActive: string;
  membership: "Basic" | "Premium" | "VIP";
  status: "Active" | "Suspended" | "Banned" | "Pending";
  balance: number;
  totalSpent: number;
  totalBookings: number;
  totalEvents: number;
  rating: number;
  reviews: number;
  bio: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transaction interface
interface Transaction {
  id: string;
  userId: number;
  type: "deposit" | "withdrawal" | "booking" | "refund" | "admin_adjustment";
  amount: number;
  description: string;
  date: string;
  time: string;
  status: "completed" | "pending" | "failed";
  reference: string;
  balance: number;
}

// Sample users data
const initialUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "/placeholder-user.jpg",
    location: "Los Angeles, CA",
    joinDate: "2024-01-15",
    lastActive: "2024-01-20",
    membership: "Premium",
    status: "Active",
    balance: 10250.0,
    totalSpent: 87500.0,
    totalBookings: 24,
    totalEvents: 8,
    rating: 4.8,
    reviews: 156,
    bio: "Passionate about exclusive experiences and celebrity encounters.",
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true,
    },
    isVerified: true,
    isAdmin: false,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 234-5678",
    avatar: null,
    location: "New York, NY",
    joinDate: "2024-01-10",
    lastActive: "2024-01-19",
    membership: "VIP",
    status: "Active",
    balance: 25000.0,
    totalSpent: 150000.0,
    totalBookings: 45,
    totalEvents: 12,
    rating: 4.9,
    reviews: 89,
    bio: "Event organizer and celebrity booking enthusiast.",
    notifications: {
      email: true,
      push: true,
      sms: true,
      marketing: true,
    },
    isVerified: true,
    isAdmin: false,
    createdAt: "2024-01-10T08:15:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike.chen@example.com",
    phone: "+1 (555) 345-6789",
    avatar: null,
    location: "San Francisco, CA",
    joinDate: "2024-01-05",
    lastActive: "2024-01-18",
    membership: "Basic",
    status: "Active",
    balance: 1500.0,
    totalSpent: 12000.0,
    totalBookings: 8,
    totalEvents: 3,
    rating: 4.5,
    reviews: 23,
    bio: "New to the platform, exploring celebrity booking options.",
    notifications: {
      email: true,
      push: false,
      sms: false,
      marketing: false,
    },
    isVerified: false,
    isAdmin: false,
    createdAt: "2024-01-05T14:20:00Z",
    updatedAt: "2024-01-18T11:30:00Z",
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    phone: "+1 (555) 456-7890",
    avatar: null,
    location: "Chicago, IL",
    joinDate: "2024-01-12",
    lastActive: "2024-01-17",
    membership: "Premium",
    status: "Suspended",
    balance: 5000.0,
    totalSpent: 35000.0,
    totalBookings: 15,
    totalEvents: 6,
    rating: 4.2,
    reviews: 67,
    bio: "Corporate event planner with focus on celebrity appearances.",
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: true,
    },
    isVerified: true,
    isAdmin: false,
    createdAt: "2024-01-12T09:45:00Z",
    updatedAt: "2024-01-17T13:15:00Z",
  },
  {
    id: 5,
    name: "David Brown",
    email: "david.brown@example.com",
    phone: "+1 (555) 567-8901",
    avatar: null,
    location: "Miami, FL",
    joinDate: "2024-01-08",
    lastActive: "2024-01-16",
    membership: "Basic",
    status: "Banned",
    balance: 0.0,
    totalSpent: 5000.0,
    totalBookings: 3,
    totalEvents: 1,
    rating: 2.1,
    reviews: 12,
    bio: "Former user with account issues.",
    notifications: {
      email: false,
      push: false,
      sms: false,
      marketing: false,
    },
    isVerified: false,
    isAdmin: false,
    createdAt: "2024-01-08T16:30:00Z",
    updatedAt: "2024-01-16T10:20:00Z",
  },
];

// Sample transactions data
const initialTransactions: Transaction[] = [
  {
    id: "TXN-001",
    userId: 1,
    type: "deposit",
    amount: 5000.0,
    description: "Account Deposit - Bank Transfer",
    date: "2024-01-15",
    time: "14:30",
    status: "completed",
    reference: "BT-2024-001",
    balance: 15000.0,
  },
  {
    id: "TXN-002",
    userId: 1,
    type: "booking",
    amount: -2500.0,
    description: "Keanu Reeves - Private Event Booking",
    date: "2024-01-14",
    time: "09:15",
    status: "completed",
    reference: "CB-2024-001",
    balance: 12500.0,
  },
  {
    id: "TXN-003",
    userId: 2,
    type: "deposit",
    amount: 10000.0,
    description: "Account Deposit - Credit Card",
    date: "2024-01-13",
    time: "16:45",
    status: "completed",
    reference: "CC-2024-002",
    balance: 25000.0,
  },
  {
    id: "TXN-004",
    userId: 2,
    type: "admin_adjustment",
    amount: 5000.0,
    description: "Admin Balance Adjustment - Bonus",
    date: "2024-01-12",
    time: "11:20",
    status: "completed",
    reference: "ADJ-2024-001",
    balance: 30000.0,
  },
];

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [userForm, setUserForm] = useState<Partial<User>>({});
  const [transactionForm, setTransactionForm] = useState<Partial<Transaction>>(
    {}
  );
  const [balanceForm, setBalanceForm] = useState({ amount: 0, reason: "" });

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;
      const matchesMembership =
        membershipFilter === "all" || user.membership === membershipFilter;

      return matchesSearch && matchesStatus && matchesMembership;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "balance":
          aValue = a.balance;
          bValue = b.balance;
          break;
        case "joinDate":
          aValue = new Date(a.joinDate).getTime();
          bValue = new Date(b.joinDate).getTime();
          break;
        case "totalSpent":
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get user transactions
  const getUserTransactions = (userId: number) => {
    return transactions.filter((t) => t.userId === userId);
  };

  // Handle user operations
  const handleCreateUser = () => {
    setEditingUser(null);
    setUserForm({});
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      // Update existing user
      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? ({ ...u, ...userForm } as User) : u
        )
      );
    } else {
      // Create new user
      const newUser: User = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        name: userForm.name || "",
        email: userForm.email || "",
        phone: userForm.phone || "",
        avatar: userForm.avatar || null,
        location: userForm.location || "",
        joinDate: new Date().toISOString().split("T")[0],
        lastActive: new Date().toISOString().split("T")[0],
        membership: userForm.membership || "Basic",
        status: userForm.status || "Active",
        balance: userForm.balance || 0,
        totalSpent: userForm.totalSpent || 0,
        totalBookings: userForm.totalBookings || 0,
        totalEvents: userForm.totalEvents || 0,
        rating: userForm.rating || 0,
        reviews: userForm.reviews || 0,
        bio: userForm.bio || "",
        notifications: userForm.notifications || {
          email: true,
          push: true,
          sms: false,
          marketing: false,
        },
        isVerified: userForm.isVerified || false,
        isAdmin: userForm.isAdmin || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
    }
    setIsUserModalOpen(false);
    setUserForm({});
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const handleToggleUserStatus = (
    userId: number,
    newStatus: User["status"]
  ) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  // Handle transaction operations
  const handleAddTransaction = (user: User) => {
    setSelectedUser(user);
    setTransactionForm({
      userId: user.id,
      type: "deposit",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].slice(0, 5),
      status: "completed",
      reference: `TXN-${Date.now()}`,
    });
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = () => {
    const newTransaction: Transaction = {
      id: `TXN-${Date.now()}`,
      userId: transactionForm.userId || 0,
      type: transactionForm.type || "deposit",
      amount: transactionForm.amount || 0,
      description: transactionForm.description || "",
      date: transactionForm.date || new Date().toISOString().split("T")[0],
      time:
        transactionForm.time ||
        new Date().toTimeString().split(" ")[0].slice(0, 5),
      status: transactionForm.status || "completed",
      reference: transactionForm.reference || `TXN-${Date.now()}`,
      balance: 0, // Will be calculated
    };

    // Update user balance
    const user = users.find((u) => u.id === newTransaction.userId);
    if (user) {
      const newBalance = user.balance + newTransaction.amount;
      setUsers(
        users.map((u) =>
          u.id === newTransaction.userId ? { ...u, balance: newBalance } : u
        )
      );
      newTransaction.balance = newBalance;
    }

    setTransactions([...transactions, newTransaction]);
    setIsTransactionModalOpen(false);
    setTransactionForm({});
    setSelectedUser(null);
  };

  // Handle balance adjustment
  const handleAdjustBalance = (user: User) => {
    setSelectedUser(user);
    setBalanceForm({ amount: 0, reason: "" });
    setIsBalanceModalOpen(true);
  };

  const handleSaveBalanceAdjustment = () => {
    if (selectedUser) {
      const newBalance = selectedUser.balance + balanceForm.amount;
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, balance: newBalance } : u
        )
      );

      // Add transaction record
      const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        userId: selectedUser.id,
        type: "admin_adjustment",
        amount: balanceForm.amount,
        description: `Admin Balance Adjustment - ${balanceForm.reason}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().split(" ")[0].slice(0, 5),
        status: "completed",
        reference: `ADJ-${Date.now()}`,
        balance: newBalance,
      };

      setTransactions([...transactions, newTransaction]);
    }
    setIsBalanceModalOpen(false);
    setBalanceForm({ amount: 0, reason: "" });
    setSelectedUser(null);
  };

  // Helper functions
  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Suspended
          </Badge>
        );
      case "Banned":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Banned
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMembershipBadge = (membership: User["membership"]) => {
    switch (membership) {
      case "VIP":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            VIP
          </Badge>
        );
      case "Premium":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            Premium
          </Badge>
        );
      case "Basic":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Basic
          </Badge>
        );
      default:
        return <Badge variant="secondary">{membership}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Manage Users"
              subtitle="Comprehensive user management with full CRUD operations"
              actionButton={{
                text: "Add User",
                icon: <Plus className="size-4" />,
                onClick: handleCreateUser,
              }}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Users className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    +{Math.floor(users.length * 0.1)}%
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  TOTAL USERS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {users.length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {Math.round(
                      (users.filter((u) => u.status === "Active").length /
                        users.length) *
                        100
                    )}
                    %
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  ACTIVE USERS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {users.filter((u) => u.status === "Active").length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <DollarSign className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    +12%
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  TOTAL REVENUE
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(
                    users.reduce((sum, u) => sum + u.totalSpent, 0)
                  )}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Star className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {Math.round(
                      (users.filter(
                        (u) =>
                          u.membership === "Premium" || u.membership === "VIP"
                      ).length /
                        users.length) *
                        100
                    )}
                    %
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  PREMIUM USERS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {
                    users.filter(
                      (u) =>
                        u.membership === "Premium" || u.membership === "VIP"
                    ).length
                  }
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
                  Filter users by status, membership, and search terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-50 focus:border-emerald-500"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Banned">Banned</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={membershipFilter}
                    onValueChange={setMembershipFilter}
                  >
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Membership" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Memberships</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="VIP">VIP</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="balance">Balance</SelectItem>
                      <SelectItem value="joinDate">Join Date</SelectItem>
                      <SelectItem value="totalSpent">Total Spent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <div className="border-2 border-zinc-200 rounded-2xl overflow-hidden">
              <div className="bg-white p-6 border-b border-zinc-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-emerald-900 font-semibold text-lg">
                      Users
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {filteredUsers.length} users found
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700"
                  >
                    {sortOrder === "asc" ? (
                      <TrendingUp className="w-4 h-4 mr-2" />
                    ) : (
                      <TrendingUp className="w-4 h-4 mr-2 rotate-180" />
                    )}
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zinc-50">
                    <TableRow>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                        User
                      </TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                        Contact
                      </TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                        Membership
                      </TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                        Status
                      </TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                        Balance
                      </TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                        Total Spent
                      </TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                        Join Date
                      </TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-zinc-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatar || ""} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-900">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-zinc-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-zinc-500">
                                {user.totalBookings} bookings •{" "}
                                {user.totalEvents} events
                              </div>
                              {user.isVerified && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-100 text-blue-600 border-blue-200 text-xs mt-1"
                                >
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-zinc-900">
                              {user.email}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {user.phone}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {user.location}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getMembershipBadge(user.membership)}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="font-medium text-zinc-900">
                            {formatCurrency(user.balance)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-zinc-900">
                            {formatCurrency(user.totalSpent)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-zinc-900">
                            {formatDate(user.joinDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAddTransaction(user)}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Add Transaction
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAdjustBalance(user)}
                              >
                                <Wallet className="w-4 h-4 mr-2" />
                                Adjust Balance
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleToggleUserStatus(
                                    user.id,
                                    user.status === "Active"
                                      ? "Suspended"
                                      : "Active"
                                  )
                                }
                              >
                                {user.status === "Active" ? (
                                  <Ban className="w-4 h-4 mr-2" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                {user.status === "Active"
                                  ? "Suspend"
                                  : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-zinc-500 mb-2">No users found</div>
                  <div className="text-sm text-zinc-400">
                    Try adjusting your filters or search terms
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Modal */}
        <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
          <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      {editingUser ? "Edit User" : "Create New User"}
                    </DialogTitle>
                    <DialogDescription className="text-emerald-100 mt-1">
                      {editingUser
                        ? "Update user information and settings"
                        : "Add a new user to the system with complete profile setup"}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="personal" className="h-full flex flex-col">
                  <div className="px-6 py-4 border-b bg-zinc-50">
                    <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
                      <TabsTrigger
                        value="personal"
                        className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 font-medium"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Personal Info
                      </TabsTrigger>
                      <TabsTrigger
                        value="account"
                        className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 font-medium"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Account
                      </TabsTrigger>
                      <TabsTrigger
                        value="notifications"
                        className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 font-medium"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </TabsTrigger>
                      <TabsTrigger
                        value="permissions"
                        className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 font-medium"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Permissions
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <TabsContent value="personal" className="space-y-6 mt-0">
                      {/* Profile Section */}
                      <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-emerald-900">
                            <User className="w-5 h-5" />
                            Profile Information
                          </CardTitle>
                          <CardDescription>
                            Basic personal details and contact information
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label
                                htmlFor="name"
                                className="text-sm font-semibold text-emerald-900 flex items-center gap-2"
                              >
                                <User className="w-4 h-4" />
                                Full Name
                              </Label>
                              <Input
                                id="name"
                                value={userForm.name || ""}
                                onChange={(e) =>
                                  setUserForm({
                                    ...userForm,
                                    name: e.target.value,
                                  })
                                }
                                className="h-11 bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                placeholder="Enter full name"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label
                                htmlFor="email"
                                className="text-sm font-semibold text-emerald-900 flex items-center gap-2"
                              >
                                <Mail className="w-4 h-4" />
                                Email Address
                              </Label>
                              <Input
                                id="email"
                                type="email"
                                value={userForm.email || ""}
                                onChange={(e) =>
                                  setUserForm({
                                    ...userForm,
                                    email: e.target.value,
                                  })
                                }
                                className="h-11 bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                placeholder="Enter email address"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label
                                htmlFor="phone"
                                className="text-sm font-semibold text-emerald-900 flex items-center gap-2"
                              >
                                <Phone className="w-4 h-4" />
                                Phone Number
                              </Label>
                              <Input
                                id="phone"
                                value={userForm.phone || ""}
                                onChange={(e) =>
                                  setUserForm({
                                    ...userForm,
                                    phone: e.target.value,
                                  })
                                }
                                className="h-11 bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                placeholder="Enter phone number"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label
                                htmlFor="location"
                                className="text-sm font-semibold text-emerald-900 flex items-center gap-2"
                              >
                                <MapPin className="w-4 h-4" />
                                Location
                              </Label>
                              <Input
                                id="location"
                                value={userForm.location || ""}
                                onChange={(e) =>
                                  setUserForm({
                                    ...userForm,
                                    location: e.target.value,
                                  })
                                }
                                className="h-11 bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                placeholder="Enter location"
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Label
                              htmlFor="bio"
                              className="text-sm font-semibold text-emerald-900 flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Bio
                            </Label>
                            <Textarea
                              id="bio"
                              value={userForm.bio || ""}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  bio: e.target.value,
                                })
                              }
                              className="min-h-[100px] bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all resize-none"
                              placeholder="Tell us about this user..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="account" className="space-y-6 mt-0">
                      {/* Account Settings */}
                      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-blue-900">
                            <CreditCard className="w-5 h-5" />
                            Account Settings
                          </CardTitle>
                          <CardDescription>
                            Membership level, status, and financial information
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label
                                htmlFor="membership"
                                className="text-sm font-semibold text-blue-900 flex items-center gap-2"
                              >
                                <Star className="w-4 h-4" />
                                Membership Level
                              </Label>
                              <Select
                                value={userForm.membership || "Basic"}
                                onValueChange={(value) =>
                                  setUserForm({
                                    ...userForm,
                                    membership: value as User["membership"],
                                  })
                                }
                              >
                                <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Basic">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                      Basic
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Premium">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                      Premium
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="VIP">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                      VIP
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-3">
                              <Label
                                htmlFor="status"
                                className="text-sm font-semibold text-blue-900 flex items-center gap-2"
                              >
                                <Activity className="w-4 h-4" />
                                Account Status
                              </Label>
                              <Select
                                value={userForm.status || "Active"}
                                onValueChange={(value) =>
                                  setUserForm({
                                    ...userForm,
                                    status: value as User["status"],
                                  })
                                }
                              >
                                <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Active">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                      Active
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Suspended">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                      Suspended
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Banned">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                      Banned
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Pending">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                      Pending
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Financial Information */}
                          <div className="bg-gradient-to-r from-emerald-50 to-zinc-50 p-4 rounded-lg border border-emerald-200">
                            <h4 className="font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Financial Information
                            </h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <Label
                                  htmlFor="balance"
                                  className="text-sm font-semibold text-emerald-900"
                                >
                                  Account Balance
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                  <Input
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    value={userForm.balance || 0}
                                    onChange={(e) =>
                                      setUserForm({
                                        ...userForm,
                                        balance:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="h-11 pl-10 bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label
                                  htmlFor="totalSpent"
                                  className="text-sm font-semibold text-emerald-900"
                                >
                                  Total Spent
                                </Label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                  <Input
                                    id="totalSpent"
                                    type="number"
                                    step="0.01"
                                    value={userForm.totalSpent || 0}
                                    onChange={(e) =>
                                      setUserForm({
                                        ...userForm,
                                        totalSpent:
                                          parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="h-11 pl-10 bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                                    placeholder="0.00"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="notifications"
                      className="space-y-6 mt-0"
                    >
                      {/* Notification Settings */}
                      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-purple-900">
                            <Bell className="w-5 h-5" />
                            Notification Preferences
                          </CardTitle>
                          <CardDescription>
                            Configure how the user receives notifications and
                            updates
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 gap-4">
                            {[
                              {
                                key: "email",
                                label: "Email Notifications",
                                description:
                                  "Receive updates and alerts via email",
                                icon: Mail,
                              },
                              {
                                key: "push",
                                label: "Push Notifications",
                                description:
                                  "Receive push notifications on mobile devices",
                                icon: Bell,
                              },
                              {
                                key: "sms",
                                label: "SMS Notifications",
                                description: "Receive text message updates",
                                icon: Phone,
                              },
                              {
                                key: "marketing",
                                label: "Marketing Emails",
                                description:
                                  "Receive promotional content and offers",
                                icon: Star,
                              },
                            ].map((notification) => (
                              <div
                                key={notification.key}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border border-zinc-200 hover:border-purple-300 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-purple-100 rounded-lg">
                                    <notification.icon className="w-4 h-4 text-purple-600" />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold text-purple-900">
                                      {notification.label}
                                    </Label>
                                    <p className="text-xs text-zinc-600">
                                      {notification.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      userForm.notifications?.[
                                        notification.key as keyof typeof userForm.notifications
                                      ] || false
                                    }
                                    onChange={(e) =>
                                      setUserForm({
                                        ...userForm,
                                        notifications: {
                                          ...userForm.notifications,
                                          [notification.key]: e.target.checked,
                                        },
                                      })
                                    }
                                    className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="permissions" className="space-y-6 mt-0">
                      {/* Permission Settings */}
                      <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-orange-900">
                            <Shield className="w-5 h-5" />
                            User Permissions
                          </CardTitle>
                          <CardDescription>
                            Manage user verification status and administrative
                            privileges
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 gap-4">
                            {[
                              {
                                key: "isVerified",
                                label: "Verified User",
                                description:
                                  "User has completed identity verification process",
                                icon: CheckCircle2,
                                color: "green",
                              },
                              {
                                key: "isAdmin",
                                label: "Administrator",
                                description:
                                  "User has administrative privileges and access",
                                icon: Shield,
                                color: "orange",
                              },
                            ].map((permission) => (
                              <div
                                key={permission.key}
                                className="flex items-center justify-between p-4 bg-white rounded-lg border border-zinc-200 hover:border-orange-300 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 bg-${permission.color}-100 rounded-lg`}
                                  >
                                    <permission.icon
                                      className={`w-4 h-4 text-${permission.color}-600`}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm font-semibold text-orange-900">
                                      {permission.label}
                                    </Label>
                                    <p className="text-xs text-zinc-600">
                                      {permission.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={
                                      userForm[
                                        permission.key as keyof typeof userForm
                                      ] || false
                                    }
                                    onChange={(e) =>
                                      setUserForm({
                                        ...userForm,
                                        [permission.key]: e.target.checked,
                                      })
                                    }
                                    className={`w-5 h-5 text-${permission.color}-600 border-${permission.color}-300 rounded focus:ring-${permission.color}-500 focus:ring-2`}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Footer */}
              <div className="border-t bg-zinc-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-600">
                    {editingUser
                      ? "Updating user information"
                      : "Creating new user account"}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsUserModalOpen(false)}
                      className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveUser}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white px-6"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingUser ? "Update User" : "Create User"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Transaction Modal */}
        <Dialog
          open={isTransactionModalOpen}
          onOpenChange={setIsTransactionModalOpen}
        >
          <DialogContent className="w-[90vw] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-emerald-900">
                Add Transaction
              </DialogTitle>
              <DialogDescription>
                Add a new transaction for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-emerald-900">
                    Transaction Type
                  </Label>
                  <Select
                    value={transactionForm.type || "deposit"}
                    onValueChange={(value) =>
                      setTransactionForm({
                        ...transactionForm,
                        type: value as Transaction["type"],
                      })
                    }
                  >
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                      <SelectItem value="admin_adjustment">
                        Admin Adjustment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-emerald-900">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={transactionForm.amount || 0}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-zinc-50 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-emerald-900">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={transactionForm.date || ""}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        date: e.target.value,
                      })
                    }
                    className="bg-zinc-50 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-emerald-900">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={transactionForm.time || ""}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        time: e.target.value,
                      })
                    }
                    className="bg-zinc-50 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-emerald-900">
                  Description
                </Label>
                <Input
                  id="description"
                  value={transactionForm.description || ""}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-zinc-50 focus:border-emerald-500"
                  placeholder="Transaction description..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-emerald-900">
                  Status
                </Label>
                <Select
                  value={transactionForm.status || "completed"}
                  onValueChange={(value) =>
                    setTransactionForm({
                      ...transactionForm,
                      status: value as Transaction["status"],
                    })
                  }
                >
                  <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsTransactionModalOpen(false)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveTransaction}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Balance Adjustment Modal */}
        <Dialog open={isBalanceModalOpen} onOpenChange={setIsBalanceModalOpen}>
          <DialogContent className="w-[90vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-emerald-900">
                Adjust Balance
              </DialogTitle>
              <DialogDescription>
                Adjust the balance for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-emerald-900">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={balanceForm.amount}
                  onChange={(e) =>
                    setBalanceForm({
                      ...balanceForm,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="bg-zinc-50 focus:border-emerald-500"
                  placeholder="Enter amount (positive to add, negative to subtract)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-emerald-900">
                  Reason
                </Label>
                <Input
                  id="reason"
                  value={balanceForm.reason}
                  onChange={(e) =>
                    setBalanceForm({ ...balanceForm, reason: e.target.value })
                  }
                  className="bg-zinc-50 focus:border-emerald-500"
                  placeholder="Reason for adjustment..."
                />
              </div>
              <div className="bg-zinc-50 p-3 rounded-lg">
                <div className="text-sm text-zinc-600">Current Balance:</div>
                <div className="text-lg font-semibold text-emerald-900">
                  {formatCurrency(selectedUser?.balance || 0)}
                </div>
                <div className="text-sm text-zinc-600">New Balance:</div>
                <div className="text-lg font-semibold text-emerald-900">
                  {formatCurrency(
                    (selectedUser?.balance || 0) + balanceForm.amount
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsBalanceModalOpen(false)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveBalanceAdjustment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Adjust Balance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
