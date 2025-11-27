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
    DollarSign,
    Search,
    Eye,
    RefreshCw,
    Download,
    MoreVertical,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    Heart,
} from "lucide-react";

import { toast } from "sonner";
import {
    DonationStatusEnum,
    DonationFrequencyEnum,
    AdminUpdateDonationStatusSchema,
    type AdminUpdateDonationStatusFormData,
} from "@/utils/schemas/schemas";
import { AdminDonationsApi, Donation, DonationsApi } from "@/api/donation.api";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const updateResolver = zodResolver(
    AdminUpdateDonationStatusSchema
) as Resolver<AdminUpdateDonationStatusFormData>;

function DonationStatsCards({ items }: { items: Donation[] }) {
    const total = items.length;
    const completed = items.filter((d) => d.status === "COMPLETED").length;
    const pending = items.filter((d) => d.status === "PENDING").length;
    const totalAmount = items
        .filter((d) => d.status === "COMPLETED")
        .reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-pink-200 rounded-2xl p-4 bg-white hover:border-pink-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-pink-50 border-2 border-pink-900 flex items-center justify-center">
                        <Heart className="size-5 text-pink-900" />
                    </div>
                    <Badge className="bg-pink-50 text-pink-900 border-2 border-pink-900 font-mono text-xs">
                        {total}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL DONATIONS</p>
                <p className="text-2xl font-bold text-pink-900">{total}</p>
            </Card>

            <Card className="border-2 border-green-200 rounded-2xl p-4 bg-white hover:border-green-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-green-50 border-2 border-green-900 flex items-center justify-center">
                        <CheckCircle2 className="size-5 text-green-900" />
                    </div>
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900 font-mono text-xs">
                        {completed}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">COMPLETED</p>
                <p className="text-2xl font-bold text-green-900">{completed}</p>
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

            <Card className="border-2 border-purple-200 rounded-2xl p-4 bg-white hover:border-purple-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-purple-50 border-2 border-purple-900 flex items-center justify-center">
                        <TrendingUp className="size-5 text-purple-900" />
                    </div>
                    <Badge className="bg-purple-50 text-purple-900 border-2 border-purple-900 font-mono text-xs">
                        ${(totalAmount / 1000).toFixed(0)}K
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL RAISED</p>
                <p className="text-2xl font-bold text-purple-900">
                    ${totalAmount.toLocaleString()}
                </p>
            </Card>
        </div>
    );
}

function DonationFilters({
    searchTerm,
    onSearchChange,
    status,
    onStatusChange,
    limit,
    onLimitChange,
    onClearFilters,
}: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    status: string | undefined;
    onStatusChange: (value: string) => void;
    limit: number;
    onLimitChange: (value: number) => void;
    onClearFilters: () => void;
}) {
    return (
        <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
            <CardHeader>
                <CardTitle className="text-pink-900">Filters & Search</CardTitle>
                <CardDescription>Filter donations by status and donor</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative sm:col-span-2 lg:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search by donor email..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 bg-zinc-50 focus:border-pink-500 w-full"
                        />
                    </div>

                    <Select value={status || "all"} onValueChange={onStatusChange}>
                        <SelectTrigger className="bg-zinc-50 focus:border-pink-500 w-full">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {DonationStatusEnum.options.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={limit.toString()}
                        onValueChange={(v) => onLimitChange(Number(v))}
                    >
                        <SelectTrigger className="bg-zinc-50 focus:border-pink-500 w-full">
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
                        onClick={onClearFilters}
                        className="bg-zinc-50 focus:border-pink-500"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function DonationDetailsModal({
    open,
    onOpenChange,
    item,
    onUpdate,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    item: Donation | null;
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
    } = useForm<AdminUpdateDonationStatusFormData>({
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

    const onSubmit: SubmitHandler<AdminUpdateDonationStatusFormData> = async (
        data
    ) => {
        if (!item?._id) return;
        try {
            setUpdating(true);
            await AdminDonationsApi.updateStatus(item._id, data);
            toast.success("Donation status updated");
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
            case "COMPLETED":
                return (
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900">
                        COMPLETED
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge className="bg-amber-50 text-amber-900 border-2 border-amber-900">
                        PENDING
                    </Badge>
                );
            case "FAILED":
                return (
                    <Badge className="bg-red-50 text-red-900 border-2 border-red-900">
                        FAILED
                    </Badge>
                );
            case "REFUNDED":
                return (
                    <Badge className="bg-blue-50 text-blue-900 border-2 border-blue-900">
                        REFUNDED
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
                        Donation Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold">${item.amount.toLocaleString()}</h3>
                                {getStatusBadge(item.status)}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Donor Name
                                    </Label>
                                    <p className="font-medium">{item.donorName}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Email
                                    </Label>
                                    <p className="font-medium">{item.donorEmail}</p>
                                </div>
                                {item.donorPhone && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">
                                            Phone
                                        </Label>
                                        <p className="font-medium">{item.donorPhone}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Frequency
                                    </Label>
                                    <p className="font-medium">{item.frequency}</p>
                                </div>
                            </div>

                            {item.dedicatedTo && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Dedicated To
                                    </Label>
                                    <p className="font-medium">{item.dedicatedTo}</p>
                                </div>
                            )}

                            {item.isAnonymous && (
                                <Badge variant="outline" className="w-fit">
                                    Anonymous Donation
                                </Badge>
                            )}

                            {item.payment?.proofOfPayment && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Proof of Payment
                                    </Label>
                                    <p className="text-sm break-all">{item.payment.proofOfPayment}</p>
                                </div>
                            )}

                            {item.notes && (
                                <div>
                                    <Label className="text-xs text-muted-foreground">Notes</Label>
                                    <p className="text-sm">{item.notes}</p>
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground">
                                Created: {new Date(item.createdAt).toLocaleString()}
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
                                        {DonationStatusEnum.options.map((s) => (
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

export default function ManageDonationsPage() {
    const [items, setItems] = useState<Donation[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<string | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState<Donation | null>(null);

    const [confirm, setConfirm] = useState<ConfirmState>({
        open: false,
        title: <></>,
        tone: "default",
        confirming: false,
    });

    const load = async () => {
        try {
            setLoading(true);
            const res = await DonationsApi.list({
                page,
                limit,
                donorEmail: searchTerm || undefined,
                status: status === "all" ? undefined : (status as any),
            });
            setItems(res.items);
            setTotal(res.total);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load donations"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [page, limit, searchTerm, status]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const clearFilters = () => {
        setSearchTerm("");
        setStatus(undefined);
        setPage(1);
    };

    const getStatusBadge = (st: string) => {
        switch (st) {
            case "COMPLETED":
                return (
                    <Badge
                        variant="outline"
                        className="text-xs border-green-700 text-green-800"
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        COMPLETED
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
            case "FAILED":
                return (
                    <Badge
                        variant="outline"
                        className="text-xs border-red-700 text-red-800"
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        FAILED
                    </Badge>
                );
            case "REFUNDED":
                return (
                    <Badge
                        variant="outline"
                        className="text-xs border-blue-700 text-blue-800"
                    >
                        REFUNDED
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
                            title="Manage Donations"
                            subtitle="View and manage Remember Betty donations"
                        />

                        <DonationStatsCards items={items} />

                        <DonationFilters
                            searchTerm={searchTerm}
                            onSearchChange={(value) => {
                                setPage(1);
                                setSearchTerm(value);
                            }}
                            status={status}
                            onStatusChange={(value) => {
                                setPage(1);
                                setStatus(value === "all" ? undefined : value);
                            }}
                            limit={limit}
                            onLimitChange={(value) => {
                                setPage(1);
                                setLimit(value);
                            }}
                            onClearFilters={clearFilters}
                        />

                        <Card className="bg-white">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-pink-900">Donations</CardTitle>
                                        <CardDescription>{items.length} donations found</CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="bg-pink-800 border-pink-800 text-white hover:bg-pink-700"
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
                                                <TableHead className="text-pink-900 font-semibold text-xs sm:text-sm">
                                                    Donor
                                                </TableHead>
                                                <TableHead className="text-pink-900 font-semibold text-xs sm:text-sm">
                                                    Amount
                                                </TableHead>
                                                <TableHead className="text-pink-900 font-semibold text-xs sm:text-sm">
                                                    Frequency
                                                </TableHead>
                                                <TableHead className="text-pink-900 font-semibold text-xs sm:text-sm">
                                                    Status
                                                </TableHead>
                                                <TableHead className="text-pink-900 font-semibold text-xs sm:text-sm">
                                                    Date
                                                </TableHead>
                                                <TableHead className="text-pink-900 font-semibold text-xs sm:text-sm">
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
                                                            Loading donations...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                items.map((item) => (
                                                    <TableRow key={item._id} className="hover:bg-zinc-50">
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-semibold">{item.donorName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.donorEmail}
                                                                </p>
                                                                {item.isAnonymous && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] mt-1"
                                                                    >
                                                                        Anonymous
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                                <span className="font-mono font-semibold">
                                                                    ${item.amount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.frequency}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                        <TableCell className="text-xs">
                                                            {new Date(item.createdAt).toLocaleString()}
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
                                        <div className="text-zinc-500 mb-2">No donations found</div>
                                        <div className="text-sm text-zinc-400">
                                            Try adjusting your filters
                                        </div>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-zinc-500">
                                            Page {page} of {totalPages} • {total} total donations
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

            <DonationDetailsModal
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