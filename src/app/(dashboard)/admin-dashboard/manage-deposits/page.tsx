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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  TrendingUp,
  Wallet,
  Smartphone,
  MoreVertical,
  RefreshCw,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// APIs & types
import {
  AdminDepositsApi,
  PaymentSummary,
  PopulatedPaymentMethodLite,
  type DepositDto,
} from "@/api/transaction.api";
import { AdminCreateDepositFormData, AdminCreateDepositSchema, UpdateDepositStatusFormData, UpdateDepositStatusSchema } from "@/utils/schemas/schemas";

// Local helper types if needed
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phone?: string;
  balance?: number;
}

interface DepositQuery {
  page?: number;
  limit?: number;
  status?: "PENDING" | "COMPLETED" | "FAILED";
}

type MaybePM = PaymentSummary["paymentMethod"] | null | undefined;

export function isPopulatedPM(pm: MaybePM): pm is PopulatedPaymentMethodLite {
  return !!pm && typeof pm !== "string";
}

export function getPaymentMethodType(pm?: MaybePM): string | undefined {
  if (!pm) return undefined;
  if (isPopulatedPM(pm)) return pm.type?.toUpperCase();
  return undefined; // id string only
}

export function getPaymentMethodLabel(pm?: MaybePM): string {
  if (!pm) return "Other";
  if (!isPopulatedPM(pm)) return "Other"; // just an id

  const rawType = (pm.type || "").toLowerCase();

  if (rawType === "card") {
    if (pm.brand && pm.last4) return `${pm.brand} •••• ${pm.last4}`;
    if (pm.brand) return pm.brand;
    if (pm.last4) return `Card •••• ${pm.last4}`;
    return "Card";
  }
  if (rawType === "bank_transfer") return "Bank transfer";
  if (rawType === "mobile_payment") return "Mobile payment";
  if (rawType === "crypto") return "Crypto";

  return pm.type || "Other";
}

export default function ManageDepositsPage() {
  const [deposits, setDeposits] = useState<DepositDto[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositDto | null>(null);
  const [processing, setProcessing] = useState(false);

  // Load deposits
  const loadDeposits = async () => {
    try {
      setLoading(true);
      const query: Partial<DepositQuery> = { page, limit };
      if (statusFilter !== "all") {
        query.status = statusFilter as "PENDING" | "COMPLETED" | "FAILED";
      }
      const response = await AdminDepositsApi.list(query);
      setDeposits(response.items || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      toast.error("Failed to load deposits", {
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Load users for dropdown (stubbed)
  const loadUsers = async () => {
    try {
      // If/when you have an AdminUsersApi, populate here:
      // const response = await AdminUsersApi.list({ limit: 100 });
      // setUsers(response.items);
    } catch (error: any) {
      console.error("Failed to load users:", error);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, [page, limit, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter deposits locally for search
  const filteredDeposits = deposits.filter((deposit) => {
    const userName =
      typeof deposit.user === "object"
        ? `${deposit.user.firstName} ${deposit.user.lastName}`.toLowerCase()
        : String(deposit.user).toLowerCase();

    const userEmail = typeof deposit.user === "object" ? deposit.user.email : "";

    return (
      userName.includes(searchTerm.toLowerCase()) ||
      userEmail?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.amount.toString().includes(searchTerm)
    );
  });

  // Helpers
  const getStatusBadge = (status: DepositDto["status"]) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "FAILED":
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

  const getPaymentMethodBadge = (deposit: DepositDto) => {
    const pm = deposit.payment?.paymentMethod;
    const pmType = getPaymentMethodType(pm);
    const label = getPaymentMethodLabel(pm);

    const isCrypto =
      (pmType && pmType.toLowerCase() === "crypto") ||
      (!pmType && typeof pm !== "string" && (pm?.type || "").toLowerCase() === "crypto");

    if (isCrypto) {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <Wallet className="w-3 h-3 mr-1" />
          Crypto
        </Badge>
      );
    }

    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <Smartphone className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getUserName = (deposit: DepositDto) => {
    if (typeof deposit.user === "object") {
      return `${deposit.user.firstName} ${deposit.user.lastName}`;
    }
    return "Unknown User";
  };

  const getUserEmail = (deposit: DepositDto) => {
    if (typeof deposit.user === "object") {
      return deposit.user.email;
    }
    return "Unknown";
  };

  // CRUD
  const handleCreateDeposit = async (data: AdminCreateDepositFormData) => {
    try {
      setProcessing(true);
      await AdminDepositsApi.create(data);
      toast.success("Deposit created successfully");
      setIsCreateModalOpen(false);
      loadDeposits();
    } catch (error: any) {
      toast.error("Failed to create deposit", {
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateStatus = async (data: UpdateDepositStatusFormData) => {
    if (!selectedDeposit) return;
    try {
      setProcessing(true);
      await AdminDepositsApi.updateStatus(selectedDeposit._id, data);
      toast.success("Deposit status updated successfully");
      setIsStatusModalOpen(false);
      setSelectedDeposit(null);
      loadDeposits();
    } catch (error: any) {
      toast.error("Failed to update deposit status", {
        description: error?.response?.data?.message || error.message,
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteDeposit = async (depositId: string) => {
    try {
      await AdminDepositsApi.remove(depositId);
      toast.success("Deposit deleted successfully");
      loadDeposits();
    } catch (error: any) {
      toast.error("Failed to delete deposit", {
        description: error?.response?.data?.message || error.message,
      });
    }
  };

  const handleViewDeposit = (deposit: DepositDto) => {
    setSelectedDeposit(deposit);
    setIsViewModalOpen(true);
  };

  const handleStatusChangeClick = (deposit: DepositDto) => {
    setSelectedDeposit(deposit);
    setIsStatusModalOpen(true);
  };

  // Stats
  const totalDeposits = deposits.length;
  const totalAmount = deposits.reduce((sum, d) => sum + d.amount, 0);
  const pendingDeposits = deposits.filter((d) => d.status === "PENDING").length;
  const pendingPct =
    totalDeposits > 0 ? Math.round((pendingDeposits / totalDeposits) * 100) : 0;

  const completedToday = deposits.filter(
    (d) =>
      d.status === "COMPLETED" &&
      new Date(d.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const totalPages = Math.ceil((total || 0) / (limit || 10));

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
                onClick: () => setIsCreateModalOpen(true),
              }}
            />

            {/* Stats */}
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
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL DEPOSITS</p>
                <p className="text-2xl font-bold text-emerald-900">{totalDeposits}</p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Clock className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {pendingPct}%
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">PENDING REQUESTS</p>
                <p className="text-2xl font-bold text-emerald-900">{pendingDeposits}</p>
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
                <p className="text-xs font-mono text-zinc-600 mb-1">COMPLETED TODAY</p>
                <p className="text-2xl font-bold text-emerald-900">{completedToday}</p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <TrendingUp className="size-5 text-emerald-900" />
                  </div>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL VOLUME</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatCurrency(totalAmount)}
                </p>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">Filters & Search</CardTitle>
                <CardDescription>Filter deposits by status and search terms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={String(limit)}
                    onValueChange={(value) => {
                      setLimit(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue placeholder="Per page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 per page</SelectItem>
                      <SelectItem value="20">20 per page</SelectItem>
                      <SelectItem value="50">50 per page</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setPage(1);
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
                    <CardDescription>{filteredDeposits.length} deposits found</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700"
                    onClick={() => {
                      // TODO: implement export
                    }}
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
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Loading deposits...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDeposits.map((deposit) => (
                          <TableRow key={deposit._id} className="hover:bg-zinc-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-900">
                                    {getInitials(getUserName(deposit))}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-zinc-900">
                                    {getUserName(deposit)}
                                  </div>
                                  <div className="text-sm text-zinc-500">{getUserEmail(deposit)}</div>
                                  <div className="text-sm text-zinc-500">{deposit._id}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-zinc-900">
                                {formatCurrency(deposit.amount)}
                              </div>
                            </TableCell>
                            <TableCell>{getPaymentMethodBadge(deposit)}</TableCell>
                            <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                            <TableCell>
                              <div className="text-sm text-zinc-900">{formatDate(deposit.createdAt)}</div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDeposit(deposit)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>

                                  {deposit.status === "PENDING" && (
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChangeClick(deposit)}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Update Status
                                    </DropdownMenuItem>
                                  )}

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete Deposit
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete
                                          the deposit record.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteDeposit(deposit._id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {!loading && filteredDeposits.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-zinc-500 mb-2">No deposits found</div>
                    <div className="text-sm text-zinc-400">
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-zinc-500">
                      Page {page} of {totalPages} • {total} total deposits
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Deposit Modal */}
        <CreateDepositModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateDeposit}
          loading={processing}
        />

        {/* View Deposit Modal */}
        <ViewDepositModal
          open={isViewModalOpen}
          onOpenChange={setIsViewModalOpen}
          deposit={selectedDeposit}
          onStatusChange={handleStatusChangeClick}
        />

        {/* Update Status Modal */}
        <UpdateStatusModal
          open={isStatusModalOpen}
          onOpenChange={setIsStatusModalOpen}
          deposit={selectedDeposit}
          onSubmit={handleUpdateStatus}
          loading={processing}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

// --- Create Deposit Modal -----------------------------------------------------
function CreateDepositModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdminCreateDepositFormData) => void;
  loading: boolean;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminCreateDepositFormData>({
    resolver: zodResolver(AdminCreateDepositSchema),
    defaultValues: {
      status: "PENDING",
      notes: "",
    },
    mode: "onTouched",
  });

  const handleFormSubmit = (data: AdminCreateDepositFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Deposit</DialogTitle>
          <DialogDescription>
            Create a new deposit for a user. This will add funds to their account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input id="userId" {...register("userId")} placeholder="Enter user ID" />
              {errors.userId && (
                <p className="text-sm text-red-600">{errors.userId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethodId">Payment Method ID (Optional)</Label>
              <Input
                id="paymentMethodId"
                {...register("paymentMethodId")}
                placeholder="Enter payment method ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proofOfPayment">Proof of Payment (Optional)</Label>
              <Input
                id="proofOfPayment"
                {...register("proofOfPayment")}
                placeholder="Enter proof of payment URL or reference"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message as string}</p>
              )}
            </div>

            {/* REQUIRED Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Add admin notes for this deposit (required)..."
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Deposit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- View Deposit Modal -------------------------------------------------------
function ViewDepositModal({
  open,
  onOpenChange,
  deposit,
  onStatusChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: DepositDto | null;
  onStatusChange: (deposit: DepositDto) => void;
}) {
  if (!deposit) return null;

  const getUserName = () => {
    if (typeof deposit.user === "object") {
      return `${deposit.user.firstName} ${deposit.user.lastName}`;
    }
    return "Unknown User";
  };
  const getUserEmail = () => {
    if (typeof deposit.user === "object") {
      return deposit.user.email;
    }
    return "Unknown";
  };
  const getProcessedByName = () => {
    if (deposit.processedBy && typeof deposit.processedBy === "object") {
      return `${deposit.processedBy.firstName} ${deposit.processedBy.lastName}`;
    }
    return (deposit as any).processedBy || "N/A";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Deposit Details</DialogTitle>
          <DialogDescription>Deposit ID: {deposit._id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-emerald-100 text-emerald-900">
                      {getUserName()
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-zinc-900">{getUserName()}</div>
                    <div className="text-sm text-zinc-500">{getUserEmail()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deposit Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-zinc-700">Amount</Label>
                  <p className="text-2xl font-bold text-emerald-900">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(deposit.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-zinc-700">Status</Label>
                  <div className="mt-1">
                    {deposit.status === "PENDING" ? (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    ) : deposit.status === "COMPLETED" ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-zinc-700">Created Date</Label>
                  <p className="text-sm text-zinc-900">
                    {new Date(deposit.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-zinc-700">Last Updated</Label>
                  <p className="text-sm text-zinc-900">
                    {new Date(deposit.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-zinc-700">Processed By</Label>
                  <p className="text-sm text-zinc-900">{getProcessedByName()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-zinc-700">Processed Date</Label>
                  <p className="text-sm text-zinc-900">
                    {deposit.processedAt ? new Date(deposit.processedAt).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {deposit.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-zinc-900 whitespace-pre-wrap">{deposit.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {deposit.status === "PENDING" && (
            <Button
              onClick={() => {
                onStatusChange(deposit);
                onOpenChange(false);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Update Status
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Update Status Modal (reason REQUIRED) -----------------------------------
function UpdateStatusModal({
  open,
  onOpenChange,
  deposit,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: DepositDto | null;
  onSubmit: (data: UpdateDepositStatusFormData) => void;
  loading: boolean;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateDepositStatusFormData>({
    resolver: zodResolver(UpdateDepositStatusSchema),
    defaultValues: {
      status: "COMPLETED",
      reason: "",
    },
    mode: "onTouched",
  });

  const handleFormSubmit = (data: UpdateDepositStatusFormData) => {
    onSubmit(data);
    reset();
  };

  if (!deposit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Deposit Status</DialogTitle>
          <DialogDescription>Update the status for deposit {deposit._id}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-sm text-red-600">{errors.status.message as string}</p>
            )}
          </div>

          {/* REQUIRED Reason (always visible & required for audit trail) */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              {...register("reason")}
              placeholder="Provide a clear reason for this status change (required)..."
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
