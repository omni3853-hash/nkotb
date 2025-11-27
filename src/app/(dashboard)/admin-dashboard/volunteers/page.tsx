// src/app/admin-dashboard/rememberbetty/volunteers/page.tsx

"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";

import {
    Users,
    Search,
    Eye,
    RefreshCw,
    Download,
    MoreVertical,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";

import { toast } from "sonner";
import {
    VolunteerStatusEnum,
    AdminUpdateVolunteerStatusSchema,
    type AdminUpdateVolunteerStatusFormData,
} from "@/utils/schemas/schemas";
import { AdminVolunteersApi, Volunteer } from "@/api/volunteer.api";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const updateResolver = zodResolver(
    AdminUpdateVolunteerStatusSchema
) as Resolver<AdminUpdateVolunteerStatusFormData>;

function VolunteerStatsCards({ items }: { items: Volunteer[] }) {
    const total = items.length;
    const active = items.filter((v) => v.status === "ACTIVE").length;
    const pending = items.filter((v) => v.status === "PENDING").length;
    const inactive = items.filter((v) => v.status === "INACTIVE").length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-indigo-200 rounded-2xl p-4 bg-white hover:border-indigo-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-indigo-50 border-2 border-indigo-900 flex items-center justify-center">
                        <Users className="size-5 text-indigo-900" />
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-900 border-2 border-indigo-900 font-mono text-xs">
                        {total}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL VOLUNTEERS</p>
                <p className="text-2xl font-bold text-indigo-900">{total}</p>
            </Card>

            <Card className="border-2 border-green-200 rounded-2xl p-4 bg-white hover:border-green-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-green-50 border-2 border-green-900 flex items-center justify-center">
                        <CheckCircle2 className="size-5 text-green-900" />
                    </div>
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900 font-mono text-xs">
                        {active}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">ACTIVE</p>
                <p className="text-2xl font-bold text-green-900">{active}</p>
            </Card>

            <Card className="border-2 border-amber-200 rounded-2xl p-4 bg-white hover:border-amber-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-amber-50 border-2 border-amber-900 flex items-center justify-center">
                        <Clock className="size-5 text-amber-900" />
                    </div>
                    <Badge className="bg-amber-50 text-amber-900 border-2 border-amber-900 font-mono text-xs">
                        {pending}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">PENDING</p>
                <p className="text-2xl font-bold text-amber-900">{pending}</p>
            </Card>

            <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-zinc-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-zinc-50 border-2 border-zinc-900 flex items-center justify-center">
                        <XCircle className="size-5 text-zinc-900" />
                    </div>
                    <Badge className="bg-zinc-50 text-zinc-900 border-2 border-zinc-900 font-mono text-xs">
                        {inactive}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">INACTIVE</p>
                <p className="text-2xl font-bold text-zinc-900">{inactive}</p>
            </Card>
        </div>
    );
}

function VolunteerDetailsModal({
    open,
    onOpenChange,
    item,
    onUpdate,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    item: Volunteer | null;
    onUpdate: () => void;
}) {
    const [updating, setUpdating] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AdminUpdateVolunteerStatusFormData>({
        resolver: updateResolver,
        defaultValues: {
            status: item?.status as any,
            notes: item?.notes || "",
        },
    });

    React.useEffect(() => {
        if (item) {
            reset({
                status: item.status as any,
                notes: item.notes || "",
            });
        }
    }, [item, reset]);

    const status = watch("status");

    const onSubmit: SubmitHandler<AdminUpdateVolunteerStatusFormData> = async (
        data
    ) => {
        if (!item?._id) return;
        try {
            setUpdating(true);
            await AdminVolunteersApi.updateStatus(item._id, data);
            toast.success("Volunteer status updated");
            onUpdate();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err?.message || "Update failed"
            );
        } finally {
            setUpdating(false);
        }
    };

    if (!item) return null;

    const getStatusBadge = (st: string) => {
        switch (st) {
            case "ACTIVE":
                return (
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900">
                        ACTIVE
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge className="bg-amber-50 text-amber-900 border-2 border-amber-900">
                        PENDING
                    </Badge>
                );
            case "INACTIVE":
                return (
                    <Badge className="bg-zinc-50 text-zinc-900 border-2 border-zinc-900">
                        INACTIVE
                    </Badge>
                );
            default:
                return <Badge variant="outline">{st}</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Eye className="size-5" />
                        Volunteer Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">{item.fullName}</h3>
                                {getStatusBadge(item.status)}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Email</Label>
                                    <p className="font-medium">{item.email}</p>
                                </div>
                                {item.phone && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Phone</Label>
                                        <p className="font-medium">{item.phone}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">Interests</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {item.interests.map((interest, idx) => (
                                        <Badge key={idx} variant="outline">
                                            {interest}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {item.availability && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Availability
                                    </Label>
                                    <p className="text-sm mt-1">{item.availability}</p>
                                </div>
                            )}

                            {item.notes && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Notes</Label>
                                    <p className="text-sm mt-1">{item.notes}</p>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                                Signed up: {new Date(item.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </Card>

                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <h4 className="font-semibold mb-4">Update Status</h4>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(v) =>
                                        setValue("status", v as any, { shouldValidate: true })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VolunteerStatusEnum.options.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.status && (
                                    <p className="text-xs text-red-600">{errors.status.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Admin Notes</Label>
                                <Textarea {...register("notes")} className="min-h-[100px]" />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={updating}>
                                    Update Status
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

type ConfirmState = {
    open: boolean;
    tone?: "danger" | "default";
    title: React.ReactNode;
    onYes?: () => Promise<void> | void;
    confirming?: boolean;
};

export default function ManageVolunteersPage() {
    const [items, setItems] = useState<Volunteer[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState<string | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState<Volunteer | null>(null);

    const [confirm, setConfirm] = useState<ConfirmState>({
        open: false,
        title: <></>,
        tone: "default",
        confirming: false,
    });

    const load = async () => {
        try {
            setLoading(true);
            const res = await AdminVolunteersApi.list({
                page,
                limit,
                status: status === "all" ? undefined : (status as any),
            });
            setItems(res.items);
            setTotal(res.total);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load volunteers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [page, limit, status]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const getStatusBadge = (st: string) => {
        switch (st) {
            case "ACTIVE":
                return (
                    <Badge
                        variant="outline"
                        className="text-xs border-green-700 text-green-800"
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        ACTIVE
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="text-xs border-amber-700 text-amber-800"
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        PENDING
                    </Badge>
                );
            case "INACTIVE":
                return (
                    <Badge
                        variant="outline"
                        className="text-xs border-zinc-700 text-zinc-800"
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        INACTIVE
                    </Badge>
                );
            default:
                return <Badge variant="outline">{st}</Badge>;
        }
    };

    return (
        <SidebarProvider>
            <AdminSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
                    <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
                        <DynamicPageHeader
                            title="Manage Volunteers"
                            subtitle="View and manage Remember Betty volunteers"
                        />

                        <VolunteerStatsCards items={items} />

                        <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                            <CardHeader>
                                <CardTitle className="text-indigo-900">Filters</CardTitle>
                                <CardDescription>Filter volunteers by status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    <Select
                                        value={status || "all"}
                                        onValueChange={(value) => {
                                            setPage(1);
                                            setStatus(value === "all" ? undefined : value);
                                        }}
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            {VolunteerStatusEnum.options.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={limit.toString()}
                                        onValueChange={(v) => {
                                            setPage(1);
                                            setLimit(Number(v));
                                        }}
                                    >
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10 per page</SelectItem>
                                            <SelectItem value="20">20 per page</SelectItem>
                                            <SelectItem value="50">50 per page</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-indigo-900">Volunteers</CardTitle>
                                        <CardDescription>
                                            {items.length} volunteers found
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="bg-indigo-800 border-indigo-800 text-white hover:bg-indigo-700"
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
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Name
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Email
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Phone
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Interests
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Status
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Date
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} className="text-center py-8">
                                                        <div className="flex items-center justify-center">
                                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                            Loading volunteers...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                items.map((item) => (
                                                    <TableRow key={item._id} className="hover:bg-zinc-50">
                                                        <TableCell>
                                                            <p className="font-semibold">{item.fullName}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="text-sm">{item.email}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="text-sm">{item.phone || "—"}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.interests.slice(0, 2).map((interest, idx) => (
                                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                                        {interest}
                                                                    </Badge>
                                                                ))}
                                                                {item.interests.length > 2 && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        +{item.interests.length - 2}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                        <TableCell className="text-xs">
                                                            {new Date(item.createdAt).toLocaleDateString()}
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
                                                                        onClick={() => {
                                                                            setSelected(item);
                                                                            setDetailsOpen(true);
                                                                        }}
                                                                    >
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                        View Details
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

                                {!loading && items.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-zinc-500 mb-2">No volunteers found</div>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-zinc-500">
                                            Page {page} of {totalPages} • {total} total volunteers
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(page - 1)}
                                                disabled={page <= 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage(page + 1)}
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
            </SidebarInset>

            <VolunteerDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                item={selected}
                onUpdate={load}
            />

            <ConfirmDialog
                open={confirm.open}
                onOpenChange={(v) => setConfirm((c) => ({ ...c, open: v }))}
                title={confirm.title || "Are you sure?"}
                tone={confirm.tone || "default"}
                confirming={confirm.confirming}
                onConfirm={async () => {
                    if (!confirm.onYes) return;
                    setConfirm((c) => ({ ...c, confirming: true }));
                    await confirm.onYes();
                    setConfirm((c) => ({
                        ...c,
                        confirming: false,
                        open: false,
                        onYes: undefined,
                    }));
                }}
            />
        </SidebarProvider>
    );
}