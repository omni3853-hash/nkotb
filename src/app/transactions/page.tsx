"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Filter,
  Download,
  MoreVertical,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  MapPin,
  Clock,
  Building,
  User,
  Tag,
} from "lucide-react";
import { useState, useMemo } from "react";

// Mock transaction data
const mockTransactions = [
  // Deposits
  {
    id: "TXN-001",
    type: "deposit",
    amount: 5000.0,
    description: "Account Deposit - Bank Transfer",
    date: "2024-01-15",
    time: "14:30",
    status: "completed",
    category: "Deposit",
    method: "Bank Transfer",
    reference: "BT-2024-001",
    balance: 15000.0,
  },
  {
    id: "TXN-002",
    type: "deposit",
    amount: 2500.0,
    description: "Account Deposit - Credit Card",
    date: "2024-01-14",
    time: "09:15",
    status: "completed",
    category: "Deposit",
    method: "Credit Card",
    reference: "CC-2024-002",
    balance: 10000.0,
  },
  {
    id: "TXN-003",
    type: "deposit",
    amount: 1000.0,
    description: "Account Deposit - PayPal",
    date: "2024-01-13",
    time: "16:45",
    status: "pending",
    category: "Deposit",
    method: "PayPal",
    reference: "PP-2024-003",
    balance: 7500.0,
  },

  // Events Sponsoring
  {
    id: "TXN-004",
    type: "event_sponsoring",
    amount: -15000.0,
    description: "Summer Music Festival 2024 - Platinum Sponsorship",
    date: "2024-01-12",
    time: "11:20",
    status: "completed",
    category: "Event Sponsoring",
    method: "Account Balance",
    reference: "ES-2024-001",
    balance: 6500.0,
    eventDetails: {
      name: "Summer Music Festival 2024",
      location: "Los Angeles, CA",
      date: "2024-07-15",
      tier: "Platinum",
    },
  },
  {
    id: "TXN-005",
    type: "event_sponsoring",
    amount: -8000.0,
    description: "Tech Conference 2024 - Gold Sponsorship",
    date: "2024-01-11",
    time: "20:10",
    status: "completed",
    category: "Event Sponsoring",
    method: "Account Balance",
    reference: "ES-2024-002",
    balance: 14500.0,
    eventDetails: {
      name: "Tech Conference 2024",
      location: "San Francisco, CA",
      date: "2024-06-20",
      tier: "Gold",
    },
  },
  {
    id: "TXN-006",
    type: "event_sponsoring",
    amount: -5000.0,
    description: "Art Gallery Opening - Silver Sponsorship",
    date: "2024-01-10",
    time: "12:00",
    status: "pending",
    category: "Event Sponsoring",
    method: "Account Balance",
    reference: "ES-2024-003",
    balance: 22500.0,
    eventDetails: {
      name: "Art Gallery Opening",
      location: "New York, NY",
      date: "2024-05-10",
      tier: "Silver",
    },
  },

  // Celebrity Booking
  {
    id: "TXN-007",
    type: "celebrity_booking",
    amount: -25000.0,
    description: "Keanu Reeves - Private Event Booking",
    date: "2024-01-09",
    time: "19:30",
    status: "completed",
    category: "Celebrity Booking",
    method: "Account Balance",
    reference: "CB-2024-001",
    balance: 27500.0,
    celebrityDetails: {
      name: "Keanu Reeves",
      category: "Actor",
      eventType: "Private Event",
      duration: "2 hours",
      location: "Los Angeles, CA",
    },
  },
  {
    id: "TXN-008",
    type: "celebrity_booking",
    amount: -18000.0,
    description: "Taylor Swift - Corporate Event",
    date: "2024-01-08",
    time: "15:45",
    status: "completed",
    category: "Celebrity Booking",
    method: "Account Balance",
    reference: "CB-2024-002",
    balance: 52500.0,
    celebrityDetails: {
      name: "Taylor Swift",
      category: "Musician",
      eventType: "Corporate Event",
      duration: "1.5 hours",
      location: "New York, NY",
    },
  },
  {
    id: "TXN-009",
    type: "celebrity_booking",
    amount: -12000.0,
    description: "Elon Musk - Speaking Engagement",
    date: "2024-01-07",
    time: "10:30",
    status: "pending",
    category: "Celebrity Booking",
    method: "Account Balance",
    reference: "CB-2024-003",
    balance: 70500.0,
    celebrityDetails: {
      name: "Elon Musk",
      category: "Entrepreneur",
      eventType: "Speaking Engagement",
      duration: "1 hour",
      location: "Austin, TX",
    },
  },
  {
    id: "TXN-010",
    type: "celebrity_booking",
    amount: -30000.0,
    description: "Leonardo DiCaprio - Charity Gala",
    date: "2024-01-06",
    time: "18:00",
    status: "completed",
    category: "Celebrity Booking",
    method: "Account Balance",
    reference: "CB-2024-004",
    balance: 82500.0,
    celebrityDetails: {
      name: "Leonardo DiCaprio",
      category: "Actor",
      eventType: "Charity Gala",
      duration: "3 hours",
      location: "Beverly Hills, CA",
    },
  },
];

// Helper function for formatting amounts
const formatAmount = (amount: number) => {
  const isPositive = amount > 0;
  return {
    value: `$${Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`,
    isPositive,
  };
};

// Transaction Details Component
function TransactionDetails({ transaction }: { transaction: any }) {
  const amount = formatAmount(transaction.amount);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case "event_sponsoring":
        return <Users className="w-5 h-5 text-blue-600" />;
      case "celebrity_booking":
        return <Star className="w-5 h-5 text-purple-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-600";
      case "event_sponsoring":
        return "bg-blue-100 text-blue-600";
      case "celebrity_booking":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Transaction Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-zinc-50 rounded-lg p-3 sm:p-4 border border-emerald-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${getTypeColor(
                transaction.type
              )} shadow-md`}
            >
              {getTypeIcon(transaction.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-emerald-900 mb-1 truncate">
                {transaction.description}
              </h2>
              <p className="text-zinc-600 text-sm">{transaction.category}</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
            <div
              className={`text-lg sm:text-xl font-bold ${
                amount.isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {amount.isPositive ? "+" : ""}
              {amount.value}
            </div>
            <div className="mt-1">{getStatusBadge(transaction.status)}</div>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-zinc-50 rounded-lg p-3 sm:p-4 border border-zinc-200">
          <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-3 sm:mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Transaction Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Transaction ID</p>
              <p className="font-mono text-sm font-medium text-zinc-900 break-all">
                {transaction.id}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Date & Time</p>
              <p className="text-sm font-medium text-zinc-900">
                {formatDate(transaction.date)} at {transaction.time}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Payment Method</p>
              <p className="text-sm font-medium text-zinc-900">
                {transaction.method}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Reference</p>
              <p className="font-mono text-sm font-medium text-zinc-900 break-all">
                {transaction.reference}
              </p>
            </div>
          </div>
        </div>

        {/* Event/Celebrity Details */}
        {(transaction.eventDetails || transaction.celebrityDetails) && (
          <div className="bg-zinc-50 rounded-lg p-3 sm:p-4 border border-zinc-200">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-3 sm:mb-4 flex items-center gap-2">
              {transaction.eventDetails ? (
                <>
                  <Users className="w-4 h-4" />
                  Event Details
                </>
              ) : (
                <>
                  <Star className="w-4 h-4" />
                  Celebrity Details
                </>
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {transaction.eventDetails && (
                <>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Event Name</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {transaction.eventDetails.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {transaction.eventDetails.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Event Date</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {formatDate(transaction.eventDetails.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">
                      Sponsorship Tier
                    </p>
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-600 border-blue-200 text-xs"
                    >
                      {transaction.eventDetails.tier}
                    </Badge>
                  </div>
                </>
              )}

              {transaction.celebrityDetails && (
                <>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Celebrity Name</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {transaction.celebrityDetails.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Category</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {transaction.celebrityDetails.category}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Event Type</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {transaction.celebrityDetails.eventType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Duration</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {transaction.celebrityDetails.duration}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-zinc-500 mb-1">Location</p>
                    <p className="text-sm font-medium text-zinc-900">
                      {transaction.celebrityDetails.location}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gradient-to-r from-emerald-50 to-zinc-50 rounded-lg p-3 sm:p-4 border border-emerald-100">
        <h3 className="text-base font-semibold text-emerald-900 mb-3">
          Actions
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-2 text-sm w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-4 py-2 text-sm w-full sm:w-auto"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = mockTransactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" || transaction.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });

    // Sort transactions
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "amount":
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "description":
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, typeFilter, statusFilter, dateFilter, sortBy, sortOrder]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-200"
          >
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 border-red-200"
          >
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case "event_sponsoring":
        return <Users className="w-4 h-4 text-blue-600" />;
      case "celebrity_booking":
        return <Star className="w-4 h-4 text-purple-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "bg-green-100 text-green-600";
      case "event_sponsoring":
        return "bg-blue-100 text-blue-600";
      case "celebrity_booking":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const totalDeposits = mockTransactions
    .filter((t) => t.type === "deposit" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalEventSponsoring = mockTransactions
    .filter((t) => t.type === "event_sponsoring" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCelebrityBooking = mockTransactions
    .filter((t) => t.type === "celebrity_booking" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div
          className={`flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3 transition-all duration-300 ${
            isModalOpen ? "blur-sm" : ""
          }`}
        >
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Transactions"
              subtitle="View and manage all your transaction history"
            />

            {/* Filters */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">
                  Filters & Search
                </CardTitle>
                <CardDescription>
                  Filter transactions by type, status, and search terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
                  <div className="relative sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-50 focus:border-emerald-500"
                    />
                  </div>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Transaction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="deposit">Deposits</SelectItem>
                      <SelectItem value="event_sponsoring">
                        Event Sponsoring
                      </SelectItem>
                      <SelectItem value="celebrity_booking">
                        Celebrity Booking
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="description">Description</SelectItem>
                    </SelectContent>
                  </Select>

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
                      <TrendingDown className="w-4 h-4 mr-2" />
                    )}
                    <span className="hidden sm:inline">
                      {sortOrder === "asc" ? "Ascending" : "Descending"}
                    </span>
                    <span className="sm:hidden">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-900">
                      Transaction History
                    </CardTitle>
                    <CardDescription>
                      {filteredTransactions.length} transactions found
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border-l-0 border-r-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-50">
                        <TableHead className="text-emerald-900 font-semibold min-w-[200px]">
                          Transaction
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold hidden sm:table-cell">
                          Type
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold min-w-[100px]">
                          Amount
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold hidden md:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold hidden lg:table-cell min-w-[120px]">
                          Date
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold hidden xl:table-cell">
                          Reference
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold w-[50px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => {
                        const amount = formatAmount(transaction.amount);

                        return (
                          <Dialog
                            key={transaction.id}
                            onOpenChange={setIsModalOpen}
                          >
                            <DialogTrigger asChild>
                              <TableRow className="hover:bg-zinc-50 cursor-pointer">
                                <TableCell>
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <div
                                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${getTypeColor(
                                        transaction.type
                                      )}`}
                                    >
                                      {getTypeIcon(transaction.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-zinc-900 text-sm sm:text-base truncate">
                                        {transaction.description}
                                      </div>
                                      <div className="text-xs sm:text-sm text-zinc-500 truncate">
                                        {transaction.method}
                                      </div>
                                      {/* Mobile: Show type and status inline */}
                                      <div className="flex items-center gap-2 mt-1 sm:hidden">
                                        <Badge
                                          variant="outline"
                                          className={`${getTypeColor(
                                            transaction.type
                                          )} text-xs`}
                                        >
                                          {transaction.category}
                                        </Badge>
                                        {getStatusBadge(transaction.status)}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                  <Badge
                                    variant="outline"
                                    className={getTypeColor(transaction.type)}
                                  >
                                    {transaction.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div
                                    className={`font-semibold text-sm sm:text-base ${
                                      amount.isPositive
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {amount.isPositive ? "+" : ""}
                                    {amount.value}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {getStatusBadge(transaction.status)}
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">
                                  <div>
                                    <div className="font-medium text-zinc-900 text-sm">
                                      {formatDate(transaction.date)}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                      {transaction.time}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden xl:table-cell">
                                  <div className="font-mono text-xs text-zinc-600">
                                    {transaction.reference}
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
                                      <DropdownMenuItem>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Download Receipt
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] max-w-[90vw] sm:w-full sm:max-w-2xl h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl mx-auto my-auto sm:mx-0 sm:my-0 rounded-xl">
                              <DialogHeader className="pb-4">
                                <DialogTitle className="text-emerald-900 text-lg sm:text-xl">
                                  Transaction Details
                                </DialogTitle>
                                <DialogDescription className="text-zinc-600 text-sm">
                                  View detailed information about this
                                  transaction
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-2">
                                <TransactionDetails transaction={transaction} />
                              </div>
                            </DialogContent>
                          </Dialog>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {filteredTransactions.length === 0 && (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-zinc-500 mb-2 text-sm sm:text-base">
                      No transactions found
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-400">
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
