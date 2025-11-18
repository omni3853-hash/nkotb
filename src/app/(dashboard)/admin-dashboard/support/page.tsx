"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
    useForm,
    type SubmitHandler,
    type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
    MessageCircle,
    AlertTriangle,
    CheckCircle2,
    Clock4,
    User,
    Mail,
    Phone,
    Filter,
    RefreshCw,
    Download,
    MoreVertical,
    ArrowRight,
    ShieldQuestion,
    CircleDot,
    MessageSquareReply,
    Share2,
} from "lucide-react";

import { toast } from "sonner";

import {
    SupportStatus,
    SupportPriority,
} from "@/lib/enums/support.enums";

import {
    AdminSupportApi,
    type SupportTicket,
} from "@/api/support.api";

import {
    AdminReplySupportTicketSchema,
    AdminReplySupportTicketFormData,
    AdminUpdateSupportStatusSchema,
    AdminUpdateSupportStatusFormData,
} from "@/utils/schemas/schemas";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const statusOptions: SupportStatus[] = [
    SupportStatus.OPEN,
    SupportStatus.IN_PROGRESS,
    SupportStatus.RESOLVED,
    SupportStatus.CLOSED,
];

const priorityOptions: SupportPriority[] = [
    SupportPriority.LOW,
    SupportPriority.NORMAL,
    SupportPriority.HIGH,
    SupportPriority.URGENT,
];

type ReplyFormValues = z.infer<typeof AdminReplySupportTicketSchema>;
const replyResolver = zodResolver(
    AdminReplySupportTicketSchema
) as Resolver<ReplyFormValues>;

// ------------------- Helper: Status / Priority styles -------------------

function getStatusStyles(status: string) {
    switch (status) {
        case SupportStatus.OPEN:
            return {
                className:
                    "bg-blue-100 text-blue-800 border-blue-200",
                icon: <CircleDot className="h-3 w-3" />,
                label: "Open",
            };
        case SupportStatus.IN_PROGRESS:
            return {
                className:
                    "bg-amber-100 text-amber-800 border-amber-200",
                icon: <Clock4 className="h-3 w-3" />,
                label: "In Progress",
            };
        case SupportStatus.RESOLVED:
            return {
                className:
                    "bg-green-100 text-green-800 border-green-200",
                icon: <CheckCircle2 className="h-3 w-3" />,
                label: "Resolved",
            };
        case SupportStatus.CLOSED:
            return {
                className:
                    "bg-zinc-100 text-zinc-800 border-zinc-200",
                icon: <ShieldQuestion className="h-3 w-3" />,
                label: "Closed",
            };
        default:
            return {
                className:
                    "bg-zinc-100 text-zinc-800 border-zinc-200",
                icon: <CircleDot className="h-3 w-3" />,
                label: status,
            };
    }
}

function getPriorityStyles(priority: string) {
    switch (priority) {
        case SupportPriority.LOW:
            return {
                className:
                    "bg-zinc-100 text-zinc-800 border-zinc-200",
                label: "Low",
            };
        case SupportPriority.NORMAL:
            return {
                className:
                    "bg-blue-100 text-blue-800 border-blue-200",
                label: "Normal",
            };
        case SupportPriority.HIGH:
            return {
                className:
                    "bg-amber-100 text-amber-800 border-amber-200",
                label: "High",
            };
        case SupportPriority.URGENT:
            return {
                className:
                    "bg-red-100 text-red-800 border-red-200",
                label: "Urgent",
            };
        default:
            return {
                className:
                    "bg-zinc-100 text-zinc-800 border-zinc-200",
                label: priority,
            };
    }
}

// ------------------- Stats Cards -------------------

function SupportStatsCards({ tickets }: { tickets: SupportTicket[] }) {
    const total = tickets.length;
    const openCount = tickets.filter(
        (t) => t.status === SupportStatus.OPEN
    ).length;
    const inProgressCount = tickets.filter(
        (t) => t.status === SupportStatus.IN_PROGRESS
    ).length;
    const unresolved =
        openCount + inProgressCount;
    const resolvedCount = tickets.filter(
        (t) =>
            t.status === SupportStatus.RESOLVED ||
            t.status === SupportStatus.CLOSED
    ).length;

    const urgentCount = tickets.filter(
        (t) => t.priority === SupportPriority.URGENT
    ).length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-indigo-200 rounded-2xl p-4 bg-white hover:border-indigo-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-indigo-50 border-2 border-indigo-900 flex items-center justify-center">
                        <MessageCircle className="size-5 text-indigo-900" />
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-900 border-2 border-indigo-900 font-mono text-xs">
                        {total}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                    TOTAL TICKETS
                </p>
                <p className="text-2xl font-bold text-indigo-900">
                    {total}
                </p>
            </Card>

            <Card className="border-2 border-amber-200 rounded-2xl p-4 bg-white hover:border-amber-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-amber-50 border-2 border-amber-900 flex items-center justify-center">
                        <Clock4 className="size-5 text-amber-900" />
                    </div>
                    <Badge className="bg-amber-50 text-amber-900 border-2 border-amber-900 font-mono text-xs">
                        {unresolved}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                    UNRESOLVED
                </p>
                <p className="text-2xl font-bold text-amber-900">
                    {unresolved}
                </p>
            </Card>

            <Card className="border-2 border-green-200 rounded-2xl p-4 bg-white hover:border-green-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-green-50 border-2 border-green-900 flex items-center justify-center">
                        <CheckCircle2 className="size-5 text-green-900" />
                    </div>
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900 font-mono text-xs">
                        {resolvedCount}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                    RESOLVED / CLOSED
                </p>
                <p className="text-2xl font-bold text-green-900">
                    {resolvedCount}
                </p>
            </Card>

            <Card className="border-2 border-red-200 rounded-2xl p-4 bg-white hover:border-red-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-red-50 border-2 border-red-900 flex items-center justify-center">
                        <AlertTriangle className="size-5 text-red-900" />
                    </div>
                    <Badge className="bg-red-50 text-red-900 border-2 border-red-900 font-mono text-xs">
                        {urgentCount}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                    URGENT
                </p>
                <p className="text-2xl font-bold text-red-900">
                    {urgentCount}
                </p>
            </Card>
        </div>
    );
}

// ------------------- Filters -------------------

function SupportFilters({
    email,
    onEmailChange,
    status,
    onStatusChange,
    priority,
    onPriorityChange,
    limit,
    onLimitChange,
    onClearFilters,
}: {
    email: string;
    onEmailChange: (value: string) => void;
    status: string | undefined;
    onStatusChange: (value: string | undefined) => void;
    priority: string | undefined;
    onPriorityChange: (value: string | undefined) => void;
    limit: number;
    onLimitChange: (value: number) => void;
    onClearFilters: () => void;
}) {
    return (
        <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <CardTitle className="text-indigo-900 flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters & Search
                        </CardTitle>
                        <CardDescription>
                            Filter support messages by status, priority, and
                            contact email
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative sm:col-span-2">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search by contact email..."
                            value={email}
                            onChange={(e) => onEmailChange(e.target.value)}
                            className="pl-10 bg-zinc-50 focus:border-indigo-500 w-full"
                        />
                    </div>

                    <Select
                        value={status || "all"}
                        onValueChange={(v) =>
                            onStatusChange(
                                v === "all" ? undefined : (v as string)
                            )
                        }
                    >
                        <SelectTrigger className="bg-zinc-50 focus:border-indigo-500 w-full">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {statusOptions.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {getStatusStyles(s).label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={priority || "all"}
                        onValueChange={(v) =>
                            onPriorityChange(
                                v === "all" ? undefined : (v as string)
                            )
                        }
                    >
                        <SelectTrigger className="bg-zinc-50 focus:border-indigo-500 w-full">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All Priority
                            </SelectItem>
                            {priorityOptions.map((p) => (
                                <SelectItem key={p} value={p}>
                                    {getPriorityStyles(p).label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={limit.toString()}
                        onValueChange={(v) => onLimitChange(Number(v))}
                    >
                        <SelectTrigger className="bg-zinc-50 focus:border-indigo-500 w-full">
                            <SelectValue placeholder="Per page" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">
                                10 per page
                            </SelectItem>
                            <SelectItem value="20">
                                20 per page
                            </SelectItem>
                            <SelectItem value="50">
                                50 per page
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="bg-zinc-50 focus:border-indigo-500"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Clear Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ------------------- Ticket Details Modal -------------------

function SupportTicketDetailsModal({
    open,
    onOpenChange,
    ticket,
    onChangeStatus,
    onReply,
    statusUpdating,
    replying,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    ticket: SupportTicket | null;
    onChangeStatus: (status: SupportStatus) => void;
    onReply: (data: AdminReplySupportTicketFormData) => void;
    statusUpdating: boolean;
    replying: boolean;
}) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ReplyFormValues>({
        resolver: replyResolver,
        defaultValues: {
            body: "",
        },
        mode: "onChange",
    });

    if (!ticket) return null;

    const statusMeta = getStatusStyles(ticket.status);
    const priorityMeta = getPriorityStyles(ticket.priority);

    const conversation = [
        {
            _id: "initial",
            from: "CUSTOMER" as const,
            body: ticket.message,
            createdAt: ticket.createdAt,
            isInitial: true,
        },
        ...ticket.replies.map((r) => ({
            _id: r._id,
            from: r.from,
            body: r.body,
            createdAt: r.createdAt,
            isInitial: false,
        })),
    ];

    const submitReply: SubmitHandler<ReplyFormValues> = (data) =>
        onReply({ body: data.body });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <MessageCircle className="size-5" />
                        Support Ticket
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Summary */}
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-[10px]"
                                    >
                                        #{ticket._id.slice(-8).toUpperCase()}
                                    </Badge>
                                    {ticket.isGuest ? (
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-zinc-400 text-zinc-700"
                                        >
                                            Guest / Offline
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-green-700 text-green-800"
                                        >
                                            Registered User
                                        </Badge>
                                    )}
                                </div>

                                <h3 className="text-xl font-semibold mt-1">
                                    {ticket.subject}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-zinc-500">
                                            Status
                                        </p>
                                        <Select
                                            disabled={statusUpdating}
                                            value={ticket.status}
                                            onValueChange={(v) =>
                                                onChangeStatus(
                                                    v as SupportStatus
                                                )
                                            }
                                        >
                                            <SelectTrigger className="h-8 w-fit min-w-[140px] text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statusOptions.map((s) => {
                                                    const meta =
                                                        getStatusStyles(s);
                                                    return (
                                                        <SelectItem
                                                            key={s}
                                                            value={s}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {meta.icon}
                                                                <span>
                                                                    {
                                                                        meta.label
                                                                    }
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                        <Badge
                                            className={`text-xs mt-1 flex items-center gap-1 border ${statusMeta.className}`}
                                        >
                                            {statusMeta.icon}
                                            {statusMeta.label}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-zinc-500">
                                            Priority
                                        </p>
                                        <Badge
                                            className={`text-xs border ${priorityMeta.className}`}
                                        >
                                            {priorityMeta.label}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-zinc-500">
                                            Last Activity
                                        </p>
                                        <p className="text-sm text-zinc-700">
                                            {ticket.lastRepliedAt
                                                ? new Date(
                                                    ticket.lastRepliedAt
                                                ).toLocaleString()
                                                : new Date(
                                                    ticket.createdAt
                                                ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="w-full md:w-64 rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
                                <p className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-2">
                                    <User className="h-3 w-3" />
                                    Contact
                                </p>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">
                                        {ticket.contact.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-zinc-700">
                                        <Mail className="h-3 w-3" />
                                        <a
                                            href={`mailto:${ticket.contact.email}`}
                                            className="hover:underline break-all"
                                        >
                                            {ticket.contact.email}
                                        </a>
                                    </div>
                                    {ticket.contact.phone && (
                                        <div className="flex items-center gap-2 text-sm text-zinc-700">
                                            <Phone className="h-3 w-3" />
                                            <a
                                                href={`tel:${ticket.contact.phone}`}
                                                className="hover:underline"
                                            >
                                                {ticket.contact.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Conversation */}
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-4">
                            <MessageCircle className="h-4 w-4 text-indigo-900" />
                            <h4 className="font-semibold">
                                Conversation
                            </h4>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                            {conversation.map((msg) => {
                                const isAdmin = msg.from === "ADMIN";
                                const created = new Date(
                                    msg.createdAt
                                ).toLocaleString();
                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex gap-3 ${isAdmin
                                                ? "flex-row-reverse"
                                                : "flex-row"
                                            }`}
                                    >
                                        <div className="flex flex-col items-center mt-1">
                                            <div
                                                className={`size-8 rounded-full flex items-center justify-center text-xs font-semibold ${isAdmin
                                                        ? "bg-indigo-600 text-white"
                                                        : "bg-zinc-200 text-zinc-800"
                                                    }`}
                                            >
                                                {isAdmin ? "A" : "C"}
                                            </div>
                                            <span className="mt-1 text-[10px] text-zinc-500">
                                                {isAdmin
                                                    ? "Admin"
                                                    : msg.isInitial
                                                        ? "Customer"
                                                        : "Customer"}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <div
                                                className={`inline-block rounded-2xl px-3 py-2 text-sm shadow-sm ${isAdmin
                                                        ? "bg-indigo-50 border border-indigo-100"
                                                        : "bg-zinc-50 border border-zinc-100"
                                                    }`}
                                            >
                                                <p className="whitespace-pre-wrap">
                                                    {msg.body}
                                                </p>
                                            </div>
                                            <div
                                                className={`mt-1 text-[10px] text-zinc-500 ${isAdmin
                                                        ? "text-right"
                                                        : "text-left"
                                                    }`}
                                            >
                                                {created}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Reply form */}
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquareReply className="h-4 w-4 text-indigo-900" />
                            <h4 className="font-semibold">
                                Send Admin Reply
                            </h4>
                        </div>
                        <form
                            onSubmit={handleSubmit(submitReply)}
                            className="space-y-3"
                        >
                            <div className="space-y-1">
                                <Label htmlFor="reply_body">
                                    Message *
                                </Label>
                                <Textarea
                                    id="reply_body"
                                    {...register("body")}
                                    placeholder="Write your reply to the customer..."
                                    className="min-h-[120px]"
                                />
                                {errors.body && (
                                    <p className="text-xs text-red-600">
                                        {errors.body.message}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="submit"
                                    isLoading={replying}
                                >
                                    <MessageSquareReply className="h-4 w-4 mr-2" />
                                    Send Reply
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ------------------- Confirm State -------------------

type ConfirmState = {
    open: boolean;
    tone?: "danger" | "default";
    title: React.ReactNode;
    onYes?: () => Promise<void> | void;
    confirming?: boolean;
};

// ------------------- Main Page -------------------

export default function ManageSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [status, setStatus] = useState<string | undefined>();
    const [priority, setPriority] = useState<string | undefined>();
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState<SupportTicket | null>(null);

    const [confirm, setConfirm] = useState<ConfirmState>({
        open: false,
        title: <></>,
        tone: "default",
        confirming: false,
    });

    const [statusUpdatingId, setStatusUpdatingId] =
        useState<string | null>(null);
    const [replyingId, setReplyingId] = useState<string | null>(null);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const res: Paginated<SupportTicket> =
                await AdminSupportApi.list({
                    status,
                    priority,
                    email: email || undefined,
                    page,
                    limit,
                });
            setTickets(res.items);
            setTotal(res.total);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load support messages"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, status, priority, email]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const openDetails = (ticket: SupportTicket) => {
        setSelected(ticket);
        setDetailsOpen(true);
    };

    const handleChangeStatus = (
        ticket: SupportTicket,
        newStatus: SupportStatus
    ) => {
        if (ticket.status === newStatus) return;

        const tone: "danger" | "default" =
            newStatus === SupportStatus.CLOSED
                ? "danger"
                : "default";

        setConfirm({
            open: true,
            tone,
            title: (
                <>
                    Change status of{" "}
                    <span className="font-semibold">
                        {ticket.subject}
                    </span>{" "}
                    to{" "}
                    <span className="uppercase">
                        {getStatusStyles(newStatus).label}
                    </span>
                    ?
                </>
            ),
            onYes: async () => {
                try {
                    setStatusUpdatingId(ticket._id);
                    const payload: AdminUpdateSupportStatusFormData =
                        AdminUpdateSupportStatusSchema.parse({
                            status: newStatus,
                        });
                    const updated =
                        await AdminSupportApi.updateStatus(
                            ticket._id,
                            payload
                        );
                    setTickets((prev) =>
                        prev.map((t) =>
                            t._id === updated._id ? updated : t
                        )
                    );
                    setSelected((prev) =>
                        prev && prev._id === updated._id
                            ? updated
                            : prev
                    );
                    toast.success("Ticket status updated");
                } catch (err: any) {
                    toast.error(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Status update failed"
                    );
                } finally {
                    setStatusUpdatingId(null);
                    setConfirm((c) => ({
                        ...c,
                        open: false,
                        onYes: undefined,
                    }));
                }
            },
        });
    };

    const handleReply = (
        ticket: SupportTicket,
        data: AdminReplySupportTicketFormData
    ) => {
        setConfirm({
            open: true,
            title: (
                <>
                    Send this reply to{" "}
                    <span className="font-semibold">
                        {ticket.contact.name}
                    </span>{" "}
                    ({ticket.contact.email})?
                </>
            ),
            onYes: async () => {
                try {
                    setReplyingId(ticket._id);
                    const payload =
                        AdminReplySupportTicketSchema.parse(
                            data
                        );
                    const updated =
                        await AdminSupportApi.reply(
                            ticket._id,
                            payload
                        );
                    setTickets((prev) =>
                        prev.map((t) =>
                            t._id === updated._id ? updated : t
                        )
                    );
                    setSelected((prev) =>
                        prev && prev._id === updated._id
                            ? updated
                            : prev
                    );
                    toast.success("Reply sent to customer");
                } catch (err: any) {
                    toast.error(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Reply failed"
                    );
                } finally {
                    setReplyingId(null);
                    setConfirm((c) => ({
                        ...c,
                        open: false,
                        onYes: undefined,
                    }));
                }
            },
        });
    };

    const shareTicket = async (ticket: SupportTicket) => {
        const summary = `Ticket #${ticket._id.slice(
            -8
        ).toUpperCase()} - ${ticket.subject}`;
        const url = typeof window !== "undefined"
            ? window.location.href
            : "";

        const shareData = {
            title: summary,
            text: `${summary}\nFrom: ${ticket.contact.email}`,
            url,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(
                    `${summary}\n${url}`
                );
                toast.success("Ticket summary copied");
            }
        } catch {
            // user cancelled / not supported – ignore
        }
    };

    const clearFilters = () => {
        setEmail("");
        setStatus(undefined);
        setPriority(undefined);
        setPage(1);
    };

    const getStatusBadge = (status: string) => {
        const meta = getStatusStyles(status);
        return (
            <Badge
                className={`text-xs flex items-center gap-1 border ${meta.className}`}
            >
                {meta.icon}
                {meta.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const meta = getPriorityStyles(priority);
        return (
            <Badge
                className={`text-xs border ${meta.className}`}
            >
                {meta.label}
            </Badge>
        );
    };

    return (
        <SidebarProvider>
            <AdminSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
                    <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
                        <DynamicPageHeader
                            title="Manage Support Messages"
                            subtitle="Review, prioritize, and respond to customer support requests"
                            actionButton={undefined}
                        />

                        <SupportStatsCards tickets={tickets} />

                        <SupportFilters
                            email={email}
                            onEmailChange={(value) => {
                                setPage(1);
                                setEmail(value);
                            }}
                            status={status}
                            onStatusChange={(value) => {
                                setPage(1);
                                setStatus(value);
                            }}
                            priority={priority}
                            onPriorityChange={(value) => {
                                setPage(1);
                                setPriority(value);
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
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-indigo-900 flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4" />
                                            Support Messages
                                        </CardTitle>
                                        <CardDescription>
                                            {tickets.length} tickets
                                            found
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
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Ticket
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Contact
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Status
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Priority
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Created
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Last Activity
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={7}
                                                        className="text-center py-8"
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                            Loading
                                                            tickets...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                tickets.map((t) => (
                                                    <TableRow
                                                        key={t._id}
                                                        className="hover:bg-zinc-50"
                                                    >
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1 max-w-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className="font-mono text-[10px]">
                                                                        #
                                                                        {t._id
                                                                            .slice(
                                                                                -8
                                                                            )
                                                                            .toUpperCase()}
                                                                    </Badge>
                                                                    {t.isGuest ? (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] border-zinc-400 text-zinc-700"
                                                                        >
                                                                            Guest
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="text-[10px] border-green-700 text-green-800"
                                                                        >
                                                                            User
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="font-semibold line-clamp-1">
                                                                    {
                                                                        t.subject
                                                                    }
                                                                </p>
                                                                <p className="text-xs text-muted-foreground line-clamp-1">
                                                                    {
                                                                        t.message
                                                                    }
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col gap-1 max-w-xs">
                                                                <div className="flex items-center gap-1 text-sm">
                                                                    <User className="h-3 w-3 text-zinc-500" />
                                                                    <span>
                                                                        {
                                                                            t
                                                                                .contact
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-zinc-600">
                                                                    <Mail className="h-3 w-3" />
                                                                    <span className="truncate">
                                                                        {
                                                                            t
                                                                                .contact
                                                                                .email
                                                                        }
                                                                    </span>
                                                                </div>
                                                                {t.contact
                                                                    .phone && (
                                                                        <div className="flex items-center gap-1 text-xs text-zinc-600">
                                                                            <Phone className="h-3 w-3" />
                                                                            <span>
                                                                                {
                                                                                    t
                                                                                        .contact
                                                                                        .phone
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(
                                                                t.status
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {getPriorityBadge(
                                                                t.priority
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {new Date(
                                                                    t.createdAt
                                                                ).toLocaleDateString()}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                {t.lastRepliedAt
                                                                    ? new Date(
                                                                        t.lastRepliedAt
                                                                    ).toLocaleString()
                                                                    : new Date(
                                                                        t.createdAt
                                                                    ).toLocaleString()}
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
                                                                        onClick={() =>
                                                                            openDetails(
                                                                                t
                                                                            )
                                                                        }
                                                                    >
                                                                        <MessageCircle className="w-4 h-4 mr-2" />
                                                                        View
                                                                        Thread
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleChangeStatus(
                                                                                t,
                                                                                SupportStatus.IN_PROGRESS
                                                                            )
                                                                        }
                                                                    >
                                                                        <Clock4 className="w-4 h-4 mr-2" />
                                                                        Mark as
                                                                        In
                                                                        Progress
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleChangeStatus(
                                                                                t,
                                                                                SupportStatus.RESOLVED
                                                                            )
                                                                        }
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                        Mark as
                                                                        Resolved
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleChangeStatus(
                                                                                t,
                                                                                SupportStatus.CLOSED
                                                                            )
                                                                        }
                                                                        className="text-red-600"
                                                                    >
                                                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                                                        Close
                                                                        Ticket
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            shareTicket(
                                                                                t
                                                                            )
                                                                        }
                                                                    >
                                                                        <Share2 className="w-4 h-4 mr-2" />
                                                                        Share
                                                                        Summary
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

                                {!loading && tickets.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-zinc-500 mb-2">
                                            No support messages found
                                        </div>
                                        <div className="text-sm text-zinc-400">
                                            Try adjusting your filters or
                                            email search
                                        </div>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-zinc-500">
                                            Page {page} of {totalPages} •{" "}
                                            {total} total tickets
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setPage((p) => p - 1)
                                                }
                                                disabled={page <= 1}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setPage((p) => p + 1)
                                                }
                                                disabled={
                                                    page >= totalPages
                                                }
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

            {/* Details / Reply Modal */}
            <SupportTicketDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                ticket={selected}
                onChangeStatus={(newStatus) => {
                    if (!selected) return;
                    handleChangeStatus(selected, newStatus);
                }}
                onReply={(data) => {
                    if (!selected) return;
                    handleReply(selected, data);
                }}
                statusUpdating={
                    !!selected &&
                    statusUpdatingId === selected._id
                }
                replying={
                    !!selected && replyingId === selected._id
                }
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirm.open}
                onOpenChange={(v) =>
                    setConfirm((c) => ({ ...c, open: v }))
                }
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
