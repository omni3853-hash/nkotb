"use client";

import { useState, useEffect, useMemo } from "react";
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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

import { Search, Download, Eye, RefreshCw, Activity, User as UserIcon } from "lucide-react";

import type { IAudit } from "@/lib/models/audit.model";
import type { AuditQueryDto } from "@/lib/dto/audit.dto";
import { toast } from "sonner";
import { AuditsApi } from "@/api/audits.api";

type AuditRow = {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  description: string;
  user: string;
  createdAtISO: string;
  updatedAtISO: string;
  date: string;
  time: string;
};

function formatUser(u: unknown): string {
  if (!u) return "";
  if (typeof u === "string") return u;
  if (typeof u === "object") {
    const anyU = u as Record<string, any>;
    const first = (anyU.firstName ?? "").toString().trim();
    const last = (anyU.lastName ?? "").toString().trim();
    const email = (anyU.email ?? "").toString().trim();
    const name = [first, last].filter(Boolean).join(" ").trim();
    const id = anyU._id ? String(anyU._id) : "";

    if (name && email) return `${name} <${email}>`;
    if (name) return name;
    if (email) return email;
    if (id) return id;
    try {
      return JSON.stringify(anyU);
    } catch {
      return "";
    }
  }
  return String(u);
}

type AnyUserAudit = Omit<IAudit, "user"> & { user?: unknown };

function toAuditRow(a: AnyUserAudit): AuditRow {
  const created = new Date(a.createdAt as any);
  const updated = a.updatedAt ? new Date(a.updatedAt as any) : created;
  return {
    id: String((a as any)._id),
    action: String(a.action ?? ""),
    resource: String(a.resource ?? ""),
    resourceId: a.resourceId ? String(a.resourceId) : undefined,
    description: String((a as any).description ?? ""),
    user: formatUser((a as any).user),
    createdAtISO: created.toISOString(),
    updatedAtISO: updated.toISOString(),
    date: created.toLocaleDateString(),
    time: created.toLocaleTimeString(),
  };
}

export default function ActivityLogPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<AuditRow | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [serverAction, setServerAction] = useState<string | undefined>(undefined);
  const [serverResource, setServerResource] = useState<string | undefined>(undefined);
  const [fromDate, setFromDate] = useState<string | undefined>(undefined);
  const [toDate, setToDate] = useState<string | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  async function load() {
    try {
      setIsLoading(true);
      const query: Partial<AuditQueryDto> = { page, limit };
      if (serverAction) query.action = serverAction;
      if (serverResource) query.resource = serverResource;
      if (fromDate) query.from = new Date(fromDate) as any;
      if (toDate) query.to = new Date(toDate) as any;

      const res = await AuditsApi.adminList(query);
      const mapped: AuditRow[] = (res.items ?? []).map(toAuditRow);
      setRows(mapped);
      setTotal(res.total ?? mapped.length);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.message ||
        err?.message ||
        "Failed to load audits";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, serverAction, serverResource, fromDate, toDate]);

  const filteredRows = useMemo(() => {
    if (!debouncedSearch) return rows;
    const s = debouncedSearch.toLowerCase();
    return rows.filter((r) =>
      r.action.toLowerCase().includes(s) ||
      r.resource.toLowerCase().includes(s) ||
      (r.resourceId ?? "").toLowerCase().includes(s) ||
      r.description.toLowerCase().includes(s) ||
      r.user.toLowerCase().includes(s)
    );
  }, [rows, debouncedSearch]);

  const exportCSV = () => {
    const header = [
      "ID",
      "Action",
      "Resource",
      "Resource ID",
      "Description",
      "User",
      "CreatedAt(ISO)",
      "UpdatedAt(ISO)",
    ];
    const body = filteredRows.map((r) => [
      r.id,
      r.action,
      r.resource,
      r.resourceId ?? "",
      (r.description ?? "").replace(/\n/g, " "),
      r.user ?? "",
      r.createdAtISO,
      r.updatedAtISO,
    ]);
    const csv = [header, ...body]
      .map((row) =>
        row
          .map((cell) => {
            const v = String(cell ?? "");
            return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audits-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetServerFilters = () => {
    setServerAction(undefined);
    setServerResource(undefined);
    setFromDate(undefined);
    setToDate(undefined);
    setPage(1);
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
              subtitle="Audit trail of user and system actions"
              actionButton={{ text: "Export CSV", icon: <Download className="size-4" />, onClick: exportCSV }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Activity className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    page {page}/{totalPages}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL AUDITS (server)</p>
                <p className="text-2xl font-bold text-emerald-900">{total}</p>
              </Card>
            </div>

            <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">Filters & Search</CardTitle>
                <CardDescription>Filter by model fields only</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative sm:col-span-3">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search action/resource/resourceId/description/user…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-50 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                  <Input
                    placeholder="action (server)"
                    value={serverAction ?? ""}
                    onChange={(e) => setServerAction(e.target.value || undefined)}
                    className="bg-zinc-50 focus:border-emerald-500 sm:col-span-2"
                  />
                  <Input
                    placeholder="resource (server)"
                    value={serverResource ?? ""}
                    onChange={(e) => setServerResource(e.target.value || undefined)}
                    className="bg-zinc-50 focus:border-emerald-500 sm:col-span-2"
                  />
                  <div className="flex gap-2 sm:col-span-5">
                    <Input
                      type="date"
                      value={fromDate ?? ""}
                      onChange={(e) => setFromDate(e.target.value || undefined)}
                      className="bg-zinc-50 focus:border-emerald-500"
                    />
                    <Input
                      type="date"
                      value={toDate ?? ""}
                      onChange={(e) => setToDate(e.target.value || undefined)}
                      className="bg-zinc-50 focus:border-emerald-500"
                    />
                    <Button
                      variant="outline"
                      onClick={() => { setPage(1); load(); }}
                      disabled={isLoading}
                      className="bg-zinc-50"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      Apply
                    </Button>
                    <Button variant="ghost" onClick={resetServerFilters}>Clear</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-emerald-900">Activity Log</CardTitle>
                <CardDescription>Showing only fields from the Audit model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border-0 bg-white overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-100 hover:bg-transparent">
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Action
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Resource
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Resource ID
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Description
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          User
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Date &amp; Time (createdAt)
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider py-4">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell colSpan={7} className="text-center py-12 border-0">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="size-4 animate-spin text-gray-400" />
                              <span className="text-sm text-gray-500">Loading audits…</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredRows.length === 0 ? (
                        <TableRow className="border-0 hover:bg-transparent">
                          <TableCell colSpan={7} className="text-center py-12 border-0">
                            <div className="flex flex-col items-center gap-2">
                              <Activity className="size-8 text-gray-300" />
                              <span className="text-sm text-gray-500">No audits found</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((r) => (
                          <TableRow key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200">
                            <TableCell className="py-4">
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm">{r.action}</p>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Badge className="text-xs bg-zinc-50 text-zinc-700 border-0">{r.resource}</Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              <span className="text-xs text-zinc-700">{r.resourceId ?? "—"}</span>
                            </TableCell>
                            <TableCell className="py-4">
                              <p className="text-xs text-gray-600 line-clamp-2">{r.description}</p>
                            </TableCell>
                            <TableCell className="py-4">
                              {r.user ? (
                                <div className="flex items-center gap-1 text-sm text-gray-900">
                                  <UserIcon className="size-3 text-gray-400" />
                                  <span className="truncate max-w-[12rem]">{r.user}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-4 text-sm">
                              <div>
                                <div className="text-gray-900">{r.date}</div>
                                <div className="text-xs text-gray-500">{r.time}</div>
                              </div>
                            </TableCell>
                            <TableCell className="py-4">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedRow(r)}
                                    className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-900"
                                  >
                                    <Eye className="size-3 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                {selectedRow?.id === r.id && (
                                  <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-hidden">
                                    <DialogHeader>
                                      <DialogTitle className="flex items-center gap-2">
                                        <Activity className="size-5 text-emerald-900" />
                                        Audit Details
                                      </DialogTitle>
                                      <DialogDescription>Full record from the Audit model</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">Audit ID</label>
                                          <p className="text-sm">{r.id}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">User</label>
                                          <p className="text-sm">{r.user || "—"}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">Resource</label>
                                          <p className="text-sm">{r.resource}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">Resource ID</label>
                                          <p className="text-sm">{r.resourceId || "—"}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-zinc-600">Action</label>
                                        <p className="text-sm font-medium">{r.action}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-zinc-600">Description</label>
                                        <p className="text-sm">{r.description}</p>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">Created At</label>
                                          <p className="text-sm">{r.createdAtISO}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-zinc-600">Updated At</label>
                                          <p className="text-sm">{r.updatedAtISO}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </DialogContent>
                                )}
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-xs text-zinc-500">
                    Showing page <span className="font-medium text-zinc-700">{page}</span> of{" "}
                    <span className="font-medium text-zinc-700">{totalPages}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1 || isLoading}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages || isLoading}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                    <Button variant="default" onClick={() => load()} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
