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
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Users,
  TrendingUp,
  Wallet,
  CreditCard,
  Smartphone,
  MoreVertical,
  Save,
  X,
  Check,
  AlertTriangle,
  Filter,
  RefreshCw,
  Download,
  Mail,
  Phone,
  MapPin,
  Activity,
  Shield,
  Zap,
  Star,
  Building,
  Globe,
  Settings,
  UserPlus,
  UserMinus,
  History,
  MessageSquare,
  Bell,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";

// Interfaces
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

interface Deposit {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  method: "crypto" | "mobile";
  cryptoType?: "BTC" | "ETH" | "USDT" | "USDC";
  mobileApp?: "Cash App" | "Zelle" | "Venmo" | "PayPal" | "Skrill";
  transactionHash?: string;
  paymentHandle?: string;
  status: "pending" | "completed" | "failed";
  depositType: "user_request" | "admin_created";
  createdAt: string;
  updatedAt: string;
  processedBy?: string;
  processedDate?: string;
  notes?: string;
  userBalance?: number;
}

// Sample users data (from manage-users)
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

// Sample deposits data
const initialDeposits: Deposit[] = [
  {
    id: "DEP-001",
    userId: 1,
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    amount: 500,
    method: "crypto",
    cryptoType: "BTC",
    transactionHash: "0x742d35...f0bEb",
    status: "completed",
    depositType: "user_request",
    createdAt: "2024-01-20T10:30:00Z",
    updatedAt: "2024-01-20T10:35:00Z",
    processedBy: "Admin User",
    processedDate: "2024-01-20T10:35:00Z",
    notes: "Bitcoin deposit confirmed on blockchain",
    userBalance: 10250.0,
  },
  {
    id: "DEP-002",
    userId: 2,
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@example.com",
    amount: 1000,
    method: "mobile",
    mobileApp: "Cash App",
    paymentHandle: "$EventBooker",
    status: "pending",
    depositType: "user_request",
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z",
    notes: "Awaiting confirmation from Cash App",
    userBalance: 25000.0,
  },
  {
    id: "DEP-003",
    userId: 3,
    userName: "Mike Chen",
    userEmail: "mike.chen@example.com",
    amount: 250,
    method: "crypto",
    cryptoType: "ETH",
    transactionHash: "0x8e23ee...d052",
    status: "completed",
    depositType: "admin_created",
    createdAt: "2024-01-19T14:20:00Z",
    updatedAt: "2024-01-19T14:25:00Z",
    processedBy: "Admin User",
    processedDate: "2024-01-19T14:25:00Z",
    notes: "Manual deposit for promotional bonus",
    userBalance: 1500.0,
  },
  {
    id: "DEP-004",
    userId: 1,
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    amount: 750,
    method: "mobile",
    mobileApp: "Zelle",
    paymentHandle: "payments@eventbooker.com",
    status: "failed",
    depositType: "user_request",
    createdAt: "2024-01-19T11:45:00Z",
    updatedAt: "2024-01-19T12:00:00Z",
    processedBy: "Admin User",
    processedDate: "2024-01-19T12:00:00Z",
    notes: "Payment failed - insufficient funds",
    userBalance: 10250.0,
  },
  {
    id: "DEP-005",
    userId: 4,
    userName: "Emma Wilson",
    userEmail: "emma.wilson@example.com",
    amount: 2000,
    method: "crypto",
    cryptoType: "USDT",
    transactionHash: "TYDzsY...MiAtW6",
    status: "completed",
    depositType: "user_request",
    createdAt: "2024-01-18T16:30:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    processedBy: "Admin User",
    processedDate: "2024-01-18T16:45:00Z",
    notes: "USDT deposit on Tron network",
    userBalance: 5000.0,
  },
  {
    id: "DEP-006",
    userId: 2,
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@example.com",
    amount: 500,
    method: "mobile",
    mobileApp: "Venmo",
    paymentHandle: "@EventBooker-Official",
    status: "pending",
    depositType: "user_request",
    createdAt: "2024-01-18T13:20:00Z",
    updatedAt: "2024-01-18T13:20:00Z",
    notes: "Venmo payment pending verification",
    userBalance: 25000.0,
  },
  {
    id: "DEP-007",
    userId: 3,
    userName: "Mike Chen",
    userEmail: "mike.chen@example.com",
    amount: 100,
    method: "crypto",
    cryptoType: "USDC",
    transactionHash: "0x8e23ee...d052",
    status: "completed",
    depositType: "user_request",
    createdAt: "2024-01-17T10:15:00Z",
    updatedAt: "2024-01-17T10:30:00Z",
    processedBy: "Admin User",
    processedDate: "2024-01-17T10:30:00Z",
    notes: "USDC deposit on Ethereum network",
    userBalance: 1500.0,
  },
  {
    id: "DEP-008",
    userId: 1,
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    amount: 1500,
    method: "mobile",
    mobileApp: "PayPal",
    paymentHandle: "payments@eventbooker.com",
    status: "completed",
    depositType: "admin_created",
    createdAt: "2024-01-16T15:45:00Z",
    updatedAt: "2024-01-16T15:50:00Z",
    processedBy: "Admin User",
    processedDate: "2024-01-16T15:50:00Z",
    notes: "Manual deposit for VIP upgrade bonus",
    userBalance: 10250.0,
  },
  {
    id: "DEP-009",
    userId: 4,
    userName: "Emma Wilson",
    userEmail: "emma.wilson@example.com",
    amount: 300,
    method: "crypto",
    cryptoType: "BTC",
    transactionHash: "bc1qxy...0wlh",
    status: "failed",
    depositType: "user_request",
    createdAt: "2024-01-15T12:30:00Z",
    updatedAt: "2024-01-15T12:45:00Z",
    processedBy: "Admin User",
    processedDate: "2024-01-15T12:45:00Z",
    notes: "Transaction timeout - insufficient network fees",
    userBalance: 5000.0,
  },
  {
    id: "DEP-010",
    userId: 2,
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@example.com",
    amount: 800,
    method: "mobile",
    mobileApp: "Skrill",
    paymentHandle: "payments@eventbooker.com",
    status: "completed",
    depositType: "user_request",
    createdAt: "2024-01-14T09:20:00Z",
    updatedAt: "2024-01-14T09:35:00Z",
    processedBy: "Admin User",
    processedDate: "2024-01-14T09:35:00Z",
    notes: "Skrill payment processed successfully",
    userBalance: 25000.0,
  },
];

export default function ManageDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [viewingDeposit, setViewingDeposit] = useState<Deposit | null>(null);

  // Form states
  const [depositForm, setDepositForm] = useState<Partial<Deposit>>({});

  // Filter deposits
  const filteredDeposits = deposits.filter((deposit) => {
    const matchesSearch =
      deposit.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deposit.transactionHash &&
        deposit.transactionHash
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || deposit.status === statusFilter;
    const matchesType =
      typeFilter === "all" || deposit.depositType === typeFilter;
    const matchesMethod =
      methodFilter === "all" || deposit.method === methodFilter;

    return matchesSearch && matchesStatus && matchesType && matchesMethod;
  });

  // Helper functions
  const getStatusBadge = (status: Deposit["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: Deposit["depositType"]) => {
    switch (type) {
      case "user_request":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <User className="w-3 h-3 mr-1" />
            User Request
          </Badge>
        );
      case "admin_created":
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Shield className="w-3 h-3 mr-1" />
            Admin Created
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getMethodBadge = (deposit: Deposit) => {
    if (deposit.method === "crypto") {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Wallet className="w-3 h-3 mr-1" />
          {deposit.cryptoType}
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Smartphone className="w-3 h-3 mr-1" />
          {deposit.mobileApp}
        </Badge>
      );
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // CRUD Operations
  const handleCreateDeposit = () => {
    setEditingDeposit(null);
    setDepositForm({
      method: "crypto",
      status: "pending",
      depositType: "admin_created",
      amount: 0,
    });
    setIsCreateModalOpen(true);
  };

  const handleEditDeposit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setDepositForm(deposit);
    setIsEditModalOpen(true);
  };

  const handleViewDeposit = (deposit: Deposit) => {
    setViewingDeposit(deposit);
    setIsViewModalOpen(true);
  };

  const handleSaveDeposit = () => {
    if (editingDeposit) {
      // Update existing deposit
      const updatedDeposit: Deposit = {
        ...editingDeposit,
        ...depositForm,
        updatedAt: new Date().toISOString(),
        processedBy: "Admin User",
        processedDate: new Date().toISOString(),
      } as Deposit;

      // Update user balance if status changed
      if (editingDeposit.status !== depositForm.status) {
        const user = users.find((u) => u.id === updatedDeposit.userId);
        if (user) {
          let balanceChange = 0;
          if (
            editingDeposit.status === "completed" &&
            depositForm.status === "failed"
          ) {
            balanceChange = -updatedDeposit.amount; // Reversal
          } else if (
            editingDeposit.status !== "completed" &&
            depositForm.status === "completed"
          ) {
            balanceChange = updatedDeposit.amount; // Add funds
          }

          if (balanceChange !== 0) {
            setUsers(
              users.map((u) =>
                u.id === updatedDeposit.userId
                  ? { ...u, balance: u.balance + balanceChange }
                  : u
              )
            );
          }
        }
      }

      setDeposits(
        deposits.map((d) => (d.id === editingDeposit.id ? updatedDeposit : d))
      );
    } else {
      // Create new deposit
      const newDeposit: Deposit = {
        id: `DEP-${String(deposits.length + 1).padStart(3, "0")}`,
        userId: depositForm.userId || 0,
        userName: depositForm.userName || "",
        userEmail: depositForm.userEmail || "",
        amount: depositForm.amount || 0,
        method: depositForm.method || "crypto",
        cryptoType: depositForm.cryptoType,
        mobileApp: depositForm.mobileApp,
        transactionHash: depositForm.transactionHash,
        paymentHandle: depositForm.paymentHandle,
        status: depositForm.status || "pending",
        depositType: "admin_created",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        processedBy: "Admin User",
        processedDate: new Date().toISOString(),
        notes: depositForm.notes,
      };

      // Update user balance if status is completed
      if (newDeposit.status === "completed") {
        const user = users.find((u) => u.id === newDeposit.userId);
        if (user) {
          setUsers(
            users.map((u) =>
              u.id === newDeposit.userId
                ? { ...u, balance: u.balance + newDeposit.amount }
                : u
            )
          );
        }
      }

      setDeposits([...deposits, newDeposit]);
    }

    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setDepositForm({});
    setEditingDeposit(null);
  };

  const handleDeleteDeposit = (depositId: string) => {
    const deposit = deposits.find((d) => d.id === depositId);
    if (deposit && deposit.status === "completed") {
      // Reverse balance change
      const user = users.find((u) => u.id === deposit.userId);
      if (user) {
        setUsers(
          users.map((u) =>
            u.id === deposit.userId
              ? { ...u, balance: u.balance - deposit.amount }
              : u
          )
        );
      }
    }
    setDeposits(deposits.filter((d) => d.id !== depositId));
  };

  const handleStatusChange = (
    depositId: string,
    newStatus: Deposit["status"]
  ) => {
    const deposit = deposits.find((d) => d.id === depositId);
    if (!deposit) return;

    const updatedDeposit: Deposit = {
      ...deposit,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      processedBy: "Admin User",
      processedDate: new Date().toISOString(),
    };

    // Handle balance changes
    const user = users.find((u) => u.id === deposit.userId);
    if (user) {
      let balanceChange = 0;
      if (deposit.status === "completed" && newStatus === "failed") {
        balanceChange = -deposit.amount; // Reversal
      } else if (deposit.status !== "completed" && newStatus === "completed") {
        balanceChange = deposit.amount; // Add funds
      }

      if (balanceChange !== 0) {
        setUsers(
          users.map((u) =>
            u.id === deposit.userId
              ? { ...u, balance: u.balance + balanceChange }
              : u
          )
        );
      }
    }

    setDeposits(deposits.map((d) => (d.id === depositId ? updatedDeposit : d)));
  };

  // Calculate stats
  const totalDeposits = deposits.length;
  const totalAmount = deposits.reduce((sum, d) => sum + d.amount, 0);
  const pendingDeposits = deposits.filter((d) => d.status === "pending").length;
  const completedToday = deposits.filter(
    (d) =>
      d.status === "completed" &&
      new Date(d.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const completedTodayAmount = deposits
    .filter(
      (d) =>
        d.status === "completed" &&
        new Date(d.createdAt).toDateString() === new Date().toDateString()
    )
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Manage Deposits"
              subtitle="Comprehensive deposit management with full CRUD operations"
              actionButton={{
                text: "Create Deposit",
                icon: <Plus className="size-4" />,
                onClick: handleCreateDeposit,
              }}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <DollarSign className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {totalDeposits}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  TOTAL DEPOSITS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {totalDeposits}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Clock className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {Math.round((pendingDeposits / totalDeposits) * 100)}%
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  PENDING REQUESTS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {pendingDeposits}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {completedToday}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  COMPLETED TODAY
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {completedToday}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <TrendingUp className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {formatCurrency(totalAmount)}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  TOTAL VOLUME
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(totalAmount)}
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
                  Filter deposits by status, type, method, and search terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search deposits..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="user_request">
                        User Requests
                      </SelectItem>
                      <SelectItem value="admin_created">
                        Admin Created
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setMethodFilter("all");
                    }}
                    className="bg-zinc-50 focus:border-emerald-500"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Deposits Table */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-900">Deposits</CardTitle>
                    <CardDescription>
                      {filteredDeposits.length} deposits found
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-50">
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          User Info
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Amount
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Method
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Type
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Status
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Date
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeposits.map((deposit) => (
                        <TableRow key={deposit.id} className="hover:bg-zinc-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={deposit.userName} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-900">
                                  {getInitials(deposit.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-zinc-900">
                                  {deposit.userName}
                                </div>
                                <div className="text-sm text-zinc-500">
                                  {deposit.userEmail}
                                </div>
                                <div className="text-sm text-zinc-500">
                                  {deposit.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-zinc-900">
                              {formatCurrency(deposit.amount)}
                            </div>
                          </TableCell>
                          <TableCell>{getMethodBadge(deposit)}</TableCell>
                          <TableCell>
                            {getTypeBadge(deposit.depositType)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(deposit.status)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-zinc-900">
                              {formatDate(deposit.createdAt)}
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
                                  onClick={() => handleViewDeposit(deposit)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {deposit.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(
                                        deposit.id,
                                        "completed"
                                      )
                                    }
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                )}
                                {deposit.status === "pending" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(deposit.id, "failed")
                                    }
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Mark as Failed
                                  </DropdownMenuItem>
                                )}
                                {deposit.status === "completed" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(deposit.id, "failed")
                                    }
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Mark as Failed
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleEditDeposit(deposit)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Deposit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteDeposit(deposit.id)
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Deposit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredDeposits.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-zinc-500 mb-2">No deposits found</div>
                    <div className="text-sm text-zinc-400">
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create/Edit Deposit Modal */}
        <Dialog
          open={isCreateModalOpen || isEditModalOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsCreateModalOpen(false);
              setIsEditModalOpen(false);
              setDepositForm({});
              setEditingDeposit(null);
            }
          }}
        >
          <DialogContent className="w-[90vw] max-w-4xl h-[90vh] overflow-hidden p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      {editingDeposit ? "Edit Deposit" : "Create New Deposit"}
                    </DialogTitle>
                    <DialogDescription className="text-emerald-100 mt-1">
                      {editingDeposit
                        ? "Update deposit information and settings"
                        : "Add a new deposit to the system"}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <Tabs
                  defaultValue="deposit-info"
                  className="h-full flex flex-col"
                >
                  <div className="px-6 py-4 border-b bg-zinc-50">
                    <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
                      <TabsTrigger
                        value="deposit-info"
                        className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 font-medium"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Deposit Information
                      </TabsTrigger>
                      <TabsTrigger
                        value="additional-details"
                        className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 font-medium"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Additional Details
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <TabsContent
                      value="deposit-info"
                      className="space-y-6 mt-0"
                    >
                      {/* User Selection */}
                      <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-emerald-900">
                            <User className="w-5 h-5" />
                            User Information
                          </CardTitle>
                          <CardDescription>
                            Select the user for this deposit
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-3">
                            <Label
                              htmlFor="user"
                              className="text-sm font-semibold text-emerald-900 flex items-center gap-2"
                            >
                              <Users className="w-4 h-4" />
                              Select User
                            </Label>
                            <Select
                              value={depositForm.userId?.toString() || ""}
                              onValueChange={(value) => {
                                const user = users.find(
                                  (u) => u.id === parseInt(value)
                                );
                                if (user) {
                                  setDepositForm({
                                    ...depositForm,
                                    userId: user.id,
                                    userName: user.name,
                                    userEmail: user.email,
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20">
                                <SelectValue placeholder="Select a user" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem
                                    key={user.id}
                                    value={user.id.toString()}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={user.avatar || ""} />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs">
                                          {getInitials(user.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-medium">
                                          {user.name}
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                          {user.email}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {depositForm.userId && (
                            <div className="bg-zinc-50 p-4 rounded-lg">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <Label className="text-xs text-zinc-600">
                                    User ID
                                  </Label>
                                  <p className="font-medium text-zinc-900">
                                    {depositForm.userId}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-zinc-600">
                                    Email
                                  </Label>
                                  <p className="font-medium text-zinc-900">
                                    {depositForm.userEmail}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-zinc-600">
                                    Current Balance
                                  </Label>
                                  <p className="font-medium text-zinc-900">
                                    {formatCurrency(
                                      users.find(
                                        (u) => u.id === depositForm.userId
                                      )?.balance || 0
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-xs text-zinc-600">
                                    Membership
                                  </Label>
                                  <p className="font-medium text-zinc-900">
                                    {
                                      users.find(
                                        (u) => u.id === depositForm.userId
                                      )?.membership
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Deposit Details */}
                      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-blue-900">
                            <DollarSign className="w-5 h-5" />
                            Deposit Details
                          </CardTitle>
                          <CardDescription>
                            Enter deposit amount and payment method
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label
                                htmlFor="amount"
                                className="text-sm font-semibold text-blue-900 flex items-center gap-2"
                              >
                                <DollarSign className="w-4 h-4" />
                                Amount (USD)
                              </Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={depositForm.amount || 0}
                                onChange={(e) =>
                                  setDepositForm({
                                    ...depositForm,
                                    amount: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="h-11 bg-white border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
                                placeholder="0.00"
                              />
                            </div>
                            <div className="space-y-3">
                              <Label
                                htmlFor="status"
                                className="text-sm font-semibold text-blue-900 flex items-center gap-2"
                              >
                                <Activity className="w-4 h-4" />
                                Status
                              </Label>
                              <Select
                                value={depositForm.status || "pending"}
                                onValueChange={(value) =>
                                  setDepositForm({
                                    ...depositForm,
                                    status: value as Deposit["status"],
                                  })
                                }
                              >
                                <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-yellow-600" />
                                      Pending
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                                      Completed
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="failed">
                                    <div className="flex items-center gap-2">
                                      <XCircle className="w-4 h-4 text-red-600" />
                                      Failed
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label
                              htmlFor="method"
                              className="text-sm font-semibold text-blue-900 flex items-center gap-2"
                            >
                              <CreditCard className="w-4 h-4" />
                              Payment Method
                            </Label>
                            <Select
                              value={depositForm.method || "crypto"}
                              onValueChange={(value) =>
                                setDepositForm({
                                  ...depositForm,
                                  method: value as Deposit["method"],
                                  cryptoType:
                                    value === "crypto"
                                      ? depositForm.cryptoType
                                      : undefined,
                                  mobileApp:
                                    value === "mobile"
                                      ? depositForm.mobileApp
                                      : undefined,
                                })
                              }
                            >
                              <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="crypto">
                                  <div className="flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Cryptocurrency
                                  </div>
                                </SelectItem>
                                <SelectItem value="mobile">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4" />
                                    Mobile Money
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {depositForm.method === "crypto" && (
                            <div className="space-y-3">
                              <Label
                                htmlFor="cryptoType"
                                className="text-sm font-semibold text-blue-900 flex items-center gap-2"
                              >
                                <Wallet className="w-4 h-4" />
                                Cryptocurrency Type
                              </Label>
                              <Select
                                value={depositForm.cryptoType || ""}
                                onValueChange={(value) =>
                                  setDepositForm({
                                    ...depositForm,
                                    cryptoType: value as Deposit["cryptoType"],
                                  })
                                }
                              >
                                <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20">
                                  <SelectValue placeholder="Select cryptocurrency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="BTC">
                                    Bitcoin (BTC)
                                  </SelectItem>
                                  <SelectItem value="ETH">
                                    Ethereum (ETH)
                                  </SelectItem>
                                  <SelectItem value="USDT">
                                    Tether (USDT)
                                  </SelectItem>
                                  <SelectItem value="USDC">
                                    USD Coin (USDC)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {depositForm.method === "mobile" && (
                            <div className="space-y-3">
                              <Label
                                htmlFor="mobileApp"
                                className="text-sm font-semibold text-blue-900 flex items-center gap-2"
                              >
                                <Smartphone className="w-4 h-4" />
                                Mobile App
                              </Label>
                              <Select
                                value={depositForm.mobileApp || ""}
                                onValueChange={(value) =>
                                  setDepositForm({
                                    ...depositForm,
                                    mobileApp: value as Deposit["mobileApp"],
                                  })
                                }
                              >
                                <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20">
                                  <SelectValue placeholder="Select mobile app" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cash App">
                                    Cash App
                                  </SelectItem>
                                  <SelectItem value="Zelle">Zelle</SelectItem>
                                  <SelectItem value="Venmo">Venmo</SelectItem>
                                  <SelectItem value="PayPal">PayPal</SelectItem>
                                  <SelectItem value="Skrill">Skrill</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          <div className="space-y-3">
                            <Label
                              htmlFor="transactionHash"
                              className="text-sm font-semibold text-blue-900 flex items-center gap-2"
                            >
                              <Copy className="w-4 h-4" />
                              Transaction Hash / Reference
                            </Label>
                            <Input
                              id="transactionHash"
                              value={depositForm.transactionHash || ""}
                              onChange={(e) =>
                                setDepositForm({
                                  ...depositForm,
                                  transactionHash: e.target.value,
                                })
                              }
                              className="h-11 bg-white border-zinc-200 focus:border-blue-500 focus:ring-blue-500/20"
                              placeholder="Enter transaction hash or reference"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent
                      value="additional-details"
                      className="space-y-6 mt-0"
                    >
                      {/* Admin Notes */}
                      <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-purple-900">
                            <MessageSquare className="w-5 h-5" />
                            Admin Notes
                          </CardTitle>
                          <CardDescription>
                            Add notes or comments about this deposit
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-3">
                            <Label
                              htmlFor="notes"
                              className="text-sm font-semibold text-purple-900 flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Notes
                            </Label>
                            <Textarea
                              id="notes"
                              value={depositForm.notes || ""}
                              onChange={(e) =>
                                setDepositForm({
                                  ...depositForm,
                                  notes: e.target.value,
                                })
                              }
                              className="min-h-[120px] bg-white border-zinc-200 focus:border-purple-500 focus:ring-purple-500/20 resize-none"
                              placeholder="Enter any notes or comments about this deposit..."
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Processing Information */}
                      <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-orange-900">
                            <Settings className="w-5 h-5" />
                            Processing Information
                          </CardTitle>
                          <CardDescription>
                            Automatic processing details
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-orange-900">
                                Created By
                              </Label>
                              <div className="p-3 bg-zinc-50 rounded-lg">
                                <p className="text-sm font-medium text-zinc-900">
                                  Admin User
                                </p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-semibold text-orange-900">
                                Created Date
                              </Label>
                              <div className="p-3 bg-zinc-50 rounded-lg">
                                <p className="text-sm font-medium text-zinc-900">
                                  {new Date().toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {editingDeposit && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label className="text-sm font-semibold text-orange-900">
                                  Last Updated
                                </Label>
                                <div className="p-3 bg-zinc-50 rounded-lg">
                                  <p className="text-sm font-medium text-zinc-900">
                                    {formatDate(editingDeposit.updatedAt)}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-sm font-semibold text-orange-900">
                                  Processed By
                                </Label>
                                <div className="p-3 bg-zinc-50 rounded-lg">
                                  <p className="text-sm font-medium text-zinc-900">
                                    {editingDeposit.processedBy || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
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
                    {editingDeposit
                      ? "Updating deposit information"
                      : "Creating new deposit"}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        setIsEditModalOpen(false);
                        setDepositForm({});
                        setEditingDeposit(null);
                      }}
                      className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveDeposit}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white px-6"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingDeposit ? "Update Deposit" : "Create Deposit"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Deposit Details Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="w-[90vw] max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-emerald-900">
                Deposit Details
              </DialogTitle>
              <DialogDescription>
                Deposit ID: {viewingDeposit?.id}
              </DialogDescription>
            </DialogHeader>
            {viewingDeposit && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={viewingDeposit.userName} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-900">
                            {getInitials(viewingDeposit.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-zinc-900">
                            {viewingDeposit.userName}
                          </div>
                          <div className="text-sm text-zinc-500">
                            {viewingDeposit.userEmail}
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Current Balance
                        </Label>
                        <p className="text-lg font-bold text-emerald-900">
                          {formatCurrency(viewingDeposit.userBalance || 0)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Deposit Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Amount
                        </Label>
                        <p className="text-2xl font-bold text-emerald-900">
                          {formatCurrency(viewingDeposit.amount)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Payment Method
                        </Label>
                        <div className="mt-1">
                          {getMethodBadge(viewingDeposit)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Type
                        </Label>
                        <div className="mt-1">
                          {getTypeBadge(viewingDeposit.depositType)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Status
                        </Label>
                        <div className="mt-1">
                          {getStatusBadge(viewingDeposit.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Transaction Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Transaction Hash / Reference
                        </Label>
                        <p className="text-sm text-zinc-900 font-mono">
                          {viewingDeposit.transactionHash || "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Created Date
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {formatDate(viewingDeposit.createdAt)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Last Updated
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {formatDate(viewingDeposit.updatedAt)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Processed By
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {viewingDeposit.processedBy || "N/A"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {viewingDeposit.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Admin Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-zinc-900">
                        {viewingDeposit.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewModalOpen(false)}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              >
                Close
              </Button>
              {viewingDeposit?.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleStatusChange(viewingDeposit.id, "failed");
                      setIsViewModalOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Mark as Failed
                  </Button>
                  <Button
                    onClick={() => {
                      handleStatusChange(viewingDeposit.id, "completed");
                      setIsViewModalOpen(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
