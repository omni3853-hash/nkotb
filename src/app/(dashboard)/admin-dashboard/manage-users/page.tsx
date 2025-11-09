"use client";

import { useEffect, useMemo, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Users, Search, Download, RefreshCw, Edit, Trash2, MoreVertical, Save, X,
  Mail, Phone, MapPin, Globe, Calendar, User as UserIcon, Shield, CreditCard, Activity,
} from "lucide-react";
import type { IUser } from "@/lib/models/user.model";
import { Role, UserStatus } from "@/lib/enums/role.enum";
import { toast } from "sonner";
import { UsersApi } from "@/api/users.api";
import { ConfirmDialog } from "@/components/confirm-dialog";

type UserRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  profileImage: string | null;
  bio: string;
  address: {
    street: string; city: string; state: string; country: string; zipCode: string; timezone: string;
  };
  role: Role;
  membership?: string;
  emailVerified: boolean;
  lastLogin?: string;
  loginAttempts: number;
  totalEvents: number;
  totalBookings: number;
  totalSpent: number;
  balance: number;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

type Query = {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | "all";
  status?: UserStatus | "all";
  emailVerified?: "all" | "true" | "false";
};

function nameOf(u: UserRow) {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();
}
function initialsOf(u: UserRow) {
  const n = nameOf(u) || u.email;
  return n.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
}
function addressLine(a: UserRow["address"]) {
  const parts = [a?.street, a?.city, a?.state, a?.country].filter(Boolean);
  return parts.join(", ");
}

/** Normalize any incoming date string to YYYY-MM-DD for <input type="date"> without TZ shifts */
function toDateInputValue(s?: string): string {
  if (!s) return "";
  const plain = /^\d{4}-\d{2}-\d{2}$/;
  if (plain.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export default function ManageUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "true" | "false">("all");
  const [sortBy, setSortBy] = useState<"createdAt" | "totalSpent" | "balance" | "lastLogin" | "name">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [editing, setEditing] = useState<UserRow | null>(null);
  const [form, setForm] = useState<Partial<UserRow>>({});
  const [openModal, setOpenModal] = useState(false);

  // confirmations
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editConfirmOpen, setEditConfirmOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  async function load() {
    try {
      setIsLoading(true);
      const query: Query = { page, limit };
      if (debouncedSearch) query.search = debouncedSearch;
      if (roleFilter !== "all") query.role = roleFilter;
      if (statusFilter !== "all") query.status = statusFilter;
      if (verifiedFilter !== "all") query.emailVerified = verifiedFilter;

      const res = await UsersApi.adminList({
        page: query.page,
        limit: query.limit,
        search: query.search,
        role: query.role as string | undefined,
        status: query.status as string | undefined,
        emailVerified: query.emailVerified as string | undefined,
      });

      const items: UserRow[] = (res.items ?? []).map((u: IUser) => ({
        _id: String(u._id),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone ?? "",
        dateOfBirth: u.dateOfBirth ?? "",
        profileImage: (u as any).profileImage ?? null,
        bio: u.bio ?? "",
        address: u.address ?? { street: "", city: "", state: "", country: "", zipCode: "", timezone: "" },
        role: u.role as Role,
        membership: u.membership ? String(u.membership) : undefined,
        emailVerified: u.emailVerified ?? false,
        lastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : undefined,
        loginAttempts: u.loginAttempts ?? 0,
        totalEvents: u.totalEvents ?? 0,
        totalBookings: u.totalBookings ?? 0,
        totalSpent: u.totalSpent ?? 0,
        balance: u.balance ?? 0,
        status: u.status as UserStatus,
        createdAt: new Date(u.createdAt).toISOString(),
        updatedAt: new Date(u.updatedAt).toISOString(),
      }));

      setRows(items);
      setTotal(res.total ?? items.length);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load users";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, roleFilter, statusFilter, verifiedFilter]);

  const sorted = useMemo(() => {
    const data = [...rows];
    data.sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name": {
          const an = nameOf(a).toLowerCase(), bn = nameOf(b).toLowerCase();
          return an > bn ? dir : an < bn ? -dir : 0;
        }
        case "totalSpent": return (a.totalSpent - b.totalSpent) * dir;
        case "balance": return (a.balance - b.balance) * dir;
        case "lastLogin": {
          const at = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          const bt = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          return (at - bt) * dir;
        }
        default: {
          const at = new Date(a.createdAt).getTime();
          const bt = new Date(b.createdAt).getTime();
          return (at - bt) * dir;
        }
      }
    });
    return data;
  }, [rows, sortBy, sortOrder]);

  const exportCSV = () => {
    const header = [
      "_id", "firstName", "lastName", "email", "phone", "dateOfBirth", "profileImage", "bio",
      "address.street", "address.city", "address.state", "address.country", "address.zipCode", "address.timezone",
      "role", "membership", "emailVerified", "lastLogin", "loginAttempts",
      "totalEvents", "totalBookings", "totalSpent", "balance", "status", "createdAt", "updatedAt",
    ];
    const body = sorted.map(r => [
      r._id, r.firstName, r.lastName, r.email, r.phone, r.dateOfBirth ?? "", r.profileImage ?? "", (r.bio ?? "").replace(/\n/g, " "),
      r.address?.street ?? "", r.address?.city ?? "", r.address?.state ?? "", r.address?.country ?? "", r.address?.zipCode ?? "", r.address?.timezone ?? "",
      r.role ?? "", r.membership ?? "", String(!!r.emailVerified), r.lastLogin ?? "", String(r.loginAttempts),
      String(r.totalEvents), String(r.totalBookings), String(r.totalSpent), String(r.balance), r.status, r.createdAt, r.updatedAt,
    ]);
    const csv = [header, ...body].map(row => row.map(v => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openEdit = (u: UserRow) => {
    setEditing(u);
    setForm(u);
    setOpenModal(true);
  };

  /** Start edit save flow: open confirm */
  const beginSave = () => setEditConfirmOpen(true);

  /** Confirmed edit -> call API */
  const confirmSave = async () => {
    if (!editing) return;
    try {
      setEditLoading(true);
      // dateOfBirth remains a STRING; <input type="date"> gives "YYYY-MM-DD"
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth || "", // string
        profileImage: form.profileImage ?? null,
        bio: form.bio,
        role: form.role,
        address: form.address ? {
          street: form.address.street,
          city: form.address.city,
          state: form.address.state,
          country: form.address.country,
          zipCode: form.address.zipCode,
          timezone: form.address.timezone,
        } : undefined,
        status: form.status,
        emailVerified: form.emailVerified,
        balance: form.balance,
        membership: form.membership,
        // readonly stats still sent as part of payload (server may ignore/validate)
        loginAttempts: form.loginAttempts,
        totalEvents: form.totalEvents,
        totalBookings: form.totalBookings,
        totalSpent: form.totalSpent,
        lastLogin: form.lastLogin,
      };
      await UsersApi.update(editing._id, payload);
      toast.success("User updated");
      setEditConfirmOpen(false);
      setOpenModal(false);
      setEditing(null);
      setForm({});
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to update user";
      toast.error(msg);
    } finally {
      setEditLoading(false);
    }
  };

  /** Open delete confirmation */
  const askDelete = (u: UserRow) => {
    setDeleteTarget(u);
    setDeleteOpen(true);
  };

  /** Confirm delete (soft-suspend) */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await UsersApi.remove(deleteTarget._id);
      toast.success("User deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete user";
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const activePct = rows.length ? Math.round((rows.filter(r => r.status === UserStatus.ACTIVE).length / rows.length) * 100) : 0;
  const verifiedPct = rows.length ? Math.round((rows.filter(r => r.emailVerified).length / rows.length) * 100) : 0;
  const totalSpentSum = rows.reduce((s, r) => s + (r.totalSpent || 0), 0);

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Manage Users"
              subtitle="User accounts based strictly on the IUser model"
              actionButton={{ text: "Export CSV", icon: <Download className="size-4" />, onClick: exportCSV }}
            />

            {/* Top stats — 4 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Users className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    page {page}/{totalPages}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL USERS</p>
                <p className="text-2xl font-bold text-emerald-900">{total}</p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Activity className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {activePct}%
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">ACTIVE</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {rows.filter(r => r.status === UserStatus.ACTIVE).length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Shield className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {verifiedPct}%
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">EMAIL VERIFIED</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {rows.filter(r => r.emailVerified).length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <CreditCard className="size-5 text-emerald-900" />
                  </div>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL SPENT (SUM)</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {new Intl.NumberFormat().format(totalSpentSum)}
                </p>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">Filters & Search</CardTitle>
                <CardDescription>Only model-backed fields</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search name/email/phone…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-50 focus:border-emerald-500 w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "all")}>
                    <SelectTrigger className="bg-zinc-50 w-full">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {Object.values(Role).map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus | "all")}>
                    <SelectTrigger className="bg-zinc-50 w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {Object.values(UserStatus).map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={verifiedFilter} onValueChange={(v) => setVerifiedFilter(v as any)}>
                    <SelectTrigger className="bg-zinc-50 w-full">
                      <SelectValue placeholder="Verified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Verified</SelectItem>
                      <SelectItem value="false">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="bg-zinc-50 w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created At</SelectItem>
                      <SelectItem value="lastLogin">Last Login</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="totalSpent">Total Spent</SelectItem>
                      <SelectItem value="balance">Balance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
                    <SelectTrigger className="bg-zinc-50">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <div className="border-2 border-zinc-200 rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zinc-50">
                    <TableRow>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">User</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Contact</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Role</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Email Verified</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Totals</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Balance</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Membership (ID)</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Created / Last Login</TableHead>
                      <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-10">
                          <div className="inline-flex items-center gap-2 text-zinc-500">
                            <RefreshCw className="size-4 animate-spin" /> Loading users…
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : sorted.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-10 text-zinc-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sorted.map((u) => (
                        <TableRow key={u._id} className="hover:bg-zinc-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={u.profileImage ?? ""} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-900">
                                  {initialsOf(u)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-zinc-900">{nameOf(u) || u.email}</div>
                                <div className="text-xs text-zinc-500">{u.dateOfBirth ? `DOB: ${u.dateOfBirth}` : ""}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-zinc-900 flex items-center gap-2">
                              <Mail className="w-3 h-3 text-zinc-400" /> {u.email}
                            </div>
                            <div className="text-xs text-zinc-600 flex items-center gap-2 mt-1">
                              <Phone className="w-3 h-3 text-zinc-400" /> {u.phone || "—"}
                            </div>
                            <div className="text-xs text-zinc-600 flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-zinc-400" /> {addressLine(u.address) || "—"}
                            </div>
                            <div className="text-xs text-zinc-600 flex items-center gap-2 mt-1">
                              <Globe className="w-3 h-3 text-zinc-400" /> {u.address?.timezone || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">{u.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              u.status === UserStatus.ACTIVE ? "bg-green-100 text-green-800 border-green-200"
                                : u.status === UserStatus.PENDING ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : u.status === UserStatus.SUSPENDED ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                            }>
                              {u.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {u.emailVerified ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Verified</Badge>
                            ) : (
                              <Badge variant="outline">Unverified</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-zinc-600">
                              Bookings: <span className="font-medium text-zinc-900">{u.totalBookings}</span>
                            </div>
                            <div className="text-xs text-zinc-600">
                              Events: <span className="font-medium text-zinc-900">{u.totalEvents}</span>
                            </div>
                            <div className="text-xs text-zinc-600">
                              Spent: <span className="font-medium text-zinc-900">{new Intl.NumberFormat().format(u.totalSpent)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-zinc-900">{new Intl.NumberFormat().format(u.balance)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-zinc-900">{u.membership || "—"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-zinc-900 flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-zinc-400" /> {new Date(u.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-zinc-600 mt-1">
                              Last login: {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(u)}>
                                  <Edit className="w-4 h-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => askDelete(u)} className="text-red-600">
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between p-4">
                <div className="text-xs text-zinc-500">
                  Showing page <span className="font-medium text-zinc-700">{page}</span> of{" "}
                  <span className="font-medium text-zinc-700">{totalPages}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage(p => Math.max(1, p - 1))}>
                    Prev
                  </Button>
                  <Button variant="outline" disabled={page >= totalPages || isLoading} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                    Next
                  </Button>
                  <Button variant="default" onClick={() => load()} isLoading={isLoading} loadingText="Refreshing…">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EDIT MODAL — styled like ManageEventsPage */}
        <Dialog
          open={openModal}
          onOpenChange={(open) => {
            setOpenModal(open);
            if (!open) {
              setEditing(null);
              setForm({});
            }
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Edit User
              </DialogTitle>
              <DialogDescription>All fields map directly to the IUser model.</DialogDescription>
            </DialogHeader>

            {/* Avatar / Identity card */}
            {editing ? (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <Avatar className="size-12">
                  <AvatarImage src={form.profileImage ?? editing.profileImage ?? ""} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-900">
                    {initialsOf(editing)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-emerald-900 truncate">
                    {nameOf(editing) || editing.email}
                  </p>
                  <p className="text-xs text-emerald-800 truncate">{editing.email}</p>
                </div>
              </div>
            ) : null}

            {/* Section: Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <UserIcon className="h-5 w-5 text-emerald-900" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">Basic Information</h3>
                <Badge variant="outline" className="text-xs">Required</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={form.firstName ?? ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={form.lastName ?? ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  {/* Date picker; value normalized to YYYY-MM-DD; stored/sent as string */}
                  <Input
                    type="date"
                    value={toDateInputValue(form.dateOfBirth)}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Bio</Label>
                  <Textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="min-h-[80px]" />
                </div>
              </div>
            </div>

            {/* Section: Address */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-900" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">Address</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Street</Label>
                  <Input value={form.address?.street ?? ""} onChange={(e) => setForm({ ...form, address: { ...(form.address ?? {}), street: e.target.value } as any })} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={form.address?.city ?? ""} onChange={(e) => setForm({ ...form, address: { ...(form.address ?? {}), city: e.target.value } as any })} />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={form.address?.state ?? ""} onChange={(e) => setForm({ ...form, address: { ...(form.address ?? {}), state: e.target.value } as any })} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={form.address?.country ?? ""} onChange={(e) => setForm({ ...form, address: { ...(form.address ?? {}), country: e.target.value } as any })} />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input value={form.address?.zipCode ?? ""} onChange={(e) => setForm({ ...form, address: { ...(form.address ?? {}), zipCode: e.target.value } as any })} />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input value={form.address?.timezone ?? ""} onChange={(e) => setForm({ ...form, address: { ...(form.address ?? {}), timezone: e.target.value } as any })} />
                </div>
              </div>
            </div>

            {/* Section: Account & Status */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald-900" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">Account & Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-1">
                  <Label>Role</Label>
                  <Select value={(form.role ?? Role.USER) as string} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(Role).map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label>Status</Label>
                  <Select value={(form.status ?? UserStatus.PENDING) as string} onValueChange={(v) => setForm({ ...form, status: v as UserStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(UserStatus).map(s => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label>Email Verified</Label>
                  <Select value={String(!!form.emailVerified)} onValueChange={(v) => setForm({ ...form, emailVerified: v === "true" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section: Stats & Metrics (READ-ONLY/DISABLED as requested) */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-900" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">Stats & Metrics</h3>
                <Badge variant="outline" className="text-xs text-purple-600 border-purple-200">
                  Read-only
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Login Attempts</Label>
                  <Input
                    type="number"
                    value={Number(form.loginAttempts ?? 0)}
                    readOnly
                    disabled
                    aria-readonly
                    className="bg-zinc-50 text-zinc-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Events</Label>
                  <Input
                    type="number"
                    value={Number(form.totalEvents ?? 0)}
                    readOnly
                    disabled
                    aria-readonly
                    className="bg-zinc-50 text-zinc-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Bookings</Label>
                  <Input
                    type="number"
                    value={Number(form.totalBookings ?? 0)}
                    readOnly
                    disabled
                    aria-readonly
                    className="bg-zinc-50 text-zinc-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Spent</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={Number(form.totalSpent ?? 0)}
                    readOnly
                    disabled
                    aria-readonly
                    className="bg-zinc-50 text-zinc-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Balance</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={Number(form.balance ?? 0)}
                    onChange={(e) => setForm({ ...form, balance: Number(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Section: Timestamps */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-900" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">Timestamps</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Created At (read-only)</Label>
                  <Input value={editing?.createdAt ? new Date(editing.createdAt).toISOString() : ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Updated At (read-only)</Label>
                  <Input value={editing?.updatedAt ? new Date(editing.updatedAt).toISOString() : ""} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Last Login (ISO)</Label>
                  <Input value={form.lastLogin ?? ""} onChange={(e) => setForm({ ...form, lastLogin: e.target.value })} placeholder="YYYY-MM-DDTHH:mm:ss.sssZ" />
                </div>
              </div>
            </div>

            {/* Modal footer actions */}
            <DialogFooter className="pt-4">
              <div className="flex justify-end gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={() => { setOpenModal(false); setEditing(null); setForm({}); }}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={beginSave} className="bg-emerald-900 hover:bg-emerald-900/90 text-zinc-100 rounded-xl">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm EDIT */}
        <ConfirmDialog
          open={editConfirmOpen}
          onOpenChange={setEditConfirmOpen}
          title="Confirm Update"
          description="Are you sure you want to save these changes to this user?"
          confirmText="Save Changes"
          confirmVariant="default"
          confirming={editLoading}
          onConfirm={confirmSave}
          icon={<Save className="size-4" />}
        />

        {/* Confirm DELETE */}
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete User"
          description="This will suspend the user account. You can re-activate later by changing status."
          confirmText="Delete User"
          confirmVariant="destructive"
          confirmClassName="bg-red-600 hover:bg-red-700 text-white"
          tone="danger"
          confirming={deleteLoading}
          onConfirm={confirmDelete}
        >
          {deleteTarget ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                <Avatar className="size-12">
                  <AvatarImage src={deleteTarget.profileImage ?? ""} />
                  <AvatarFallback className="bg-rose-100 text-rose-900">
                    {initialsOf(deleteTarget)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-bold text-red-900 truncate">
                    {nameOf(deleteTarget) || deleteTarget.email}
                  </p>
                  <p className="text-sm text-red-700 truncate">{deleteTarget.email}</p>
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-sm text-amber-800">
                Suspending this user prevents login and activity until re-activated.
              </div>
            </div>
          ) : null}
        </ConfirmDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
