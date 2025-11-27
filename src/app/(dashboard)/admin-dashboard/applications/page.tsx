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
    FileText,
    Search,
    Eye,
    RefreshCw,
    Download,
    MoreVertical,
    CheckCircle2,
    Clock,
    XCircle,
    DollarSign,
    Calendar,
} from "lucide-react";

import { toast } from "sonner";

import {
    ApplicationStatusEnum,
    AdminReviewApplicationSchema,
    type AdminReviewApplicationFormData,
} from "@/utils/schemas/schemas";
import { AdminAssistanceApplicationsApi, AssistanceApplication, AssistanceApplicationsApi } from "@/api/application.api";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const reviewResolver = zodResolver(
    AdminReviewApplicationSchema
) as Resolver<AdminReviewApplicationFormData>;

function ApplicationStatsCards({ items }: { items: AssistanceApplication[] }) {
    const total = items.length;
    const approved = items.filter((a) => a.status === "APPROVED").length;
    const pending = items.filter((a) => a.status === "PENDING").length;
    const rejected = items.filter((a) => a.status === "REJECTED").length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-indigo-200 rounded-2xl p-4 bg-white hover:border-indigo-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-indigo-50 border-2 border-indigo-900 flex items-center justify-center">
                        <FileText className="size-5 text-indigo-900" />
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-900 border-2 border-indigo-900 font-mono text-xs">
                        {total}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL APPLICATIONS</p>
                <p className="text-2xl font-bold text-indigo-900">{total}</p>
            </Card>

            <Card className="border-2 border-green-200 rounded-2xl p-4 bg-white hover:border-green-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-green-50 border-2 border-green-900 flex items-center justify-center">
                        <CheckCircle2 className="size-5 text-green-900" />
                    </div>
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900 font-mono text-xs">
                        {approved}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">APPROVED</p>
                <p className="text-2xl font-bold text-green-900">{approved}</p>
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
                <p className="text-xs font-mono text-zinc-600 mb-1">PENDING REVIEW</p>
                <p className="text-2xl font-bold text-amber-900">{pending}</p>
            </Card>

            <Card className="border-2 border-red-200 rounded-2xl p-4 bg-white hover:border-red-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-red-50 border-2 border-red-900 flex items-center justify-center">
                        <XCircle className="size-5 text-red-900" />
                    </div>
                    <Badge className="bg-red-50 text-red-900 border-2 border-red-900 font-mono text-xs">
                        {rejected}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">REJECTED</p>
                <p className="text-2xl font-bold text-red-900">{rejected}</p>
            </Card>
        </div>
    );
}

function ApplicationDetailsModal({
    open,
    onOpenChange,
    item,
    onUpdate,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    item: AssistanceApplication | null;
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
    } = useForm<AdminReviewApplicationFormData>({
        resolver: reviewResolver,
        defaultValues: {
            status: item?.status as any,
            grantAmount: item?.grantAmount,
            reviewNotes: item?.reviewNotes || "",
        },
    });

    React.useEffect(() => {
        if (item) {
            reset({
                status: item.status as any,
                grantAmount: item.grantAmount,
                reviewNotes: item.reviewNotes || "",
            });
        }
    }, [item, reset]);

    const status = watch("status");

    const onSubmit: SubmitHandler<AdminReviewApplicationFormData> = async (data) => {
        if (!item?._id) return;
        try {
            setUpdating(true);
            await AdminAssistanceApplicationsApi.review(item._id, data);
            toast.success("Application review saved");
            onUpdate();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err?.message || "Failed to update application"
            );
        } finally {
            setUpdating(false);
        }
    };

    if (!item) return null;

    const getStatusBadge = (st: string) => {
        switch (st) {
            case "APPROVED":
                return (
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900">
                        APPROVED
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge className="bg-amber-50 text-amber-900 border-2 border-amber-900">
                        PENDING
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge className="bg-red-50 text-red-900 border-2 border-red-900">
                        REJECTED
                    </Badge>
                );
            default:
                return <Badge variant="outline">{st}</Badge>;
        }
    };

    const getDocumentLinks = () => {
        const links: { label: string; url: string }[] = [];
        const docs = item.documents;

        if (!docs) return links;

        if (typeof docs === "string") {
            links.push({ label: "Supporting Document", url: docs });
            return links;
        }

        if (typeof docs === "object") {
            const mapping: Record<string, string> = {
                applicationPdfUrl: "Application Form (PDF)",
                diagnosisLetterUrl: "Diagnosis Letter",
                personalStatementUrl: "Personal Statement",
            };

            Object.entries(docs).forEach(([key, value]) => {
                if (typeof value !== "string") return;
                const label = mapping[key] || key;
                links.push({ label, url: value });
            });
        }

        return links;
    };

    const documentLinks = getDocumentLinks();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Eye className="size-5" />
                        Assistance Application Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Applicant & Medical details */}
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        {item.applicantName}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Submitted:{" "}
                                        {new Date(item.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    {getStatusBadge(item.status)}
                                    {item.submissionMonth && (
                                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-full">
                                            <Calendar className="w-3 h-3" />
                                            Submission month: {item.submissionMonth}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Email</Label>
                                    <p className="font-medium">{item.applicantEmail}</p>
                                </div>
                                {item.applicantPhone && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Phone</Label>
                                        <p className="font-medium">{item.applicantPhone}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-xs text-muted-foreground">Mailing Address</Label>
                                    <p className="font-medium whitespace-pre-line">
                                        {item.mailingAddress}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Birth Date</Label>
                                    <p className="font-medium">
                                        {new Date(item.birthDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Last 4 of SSN</Label>
                                    <p className="font-medium">***-{item.ssnLast4}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Diagnosis Date</Label>
                                    <p className="font-medium">
                                        {new Date(item.diagnosisDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground">
                                    Diagnosis Description
                                </Label>
                                <p className="text-sm mt-1 whitespace-pre-line">
                                    {item.diagnosisDescription}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Monthly Household Income
                                    </Label>
                                    <p className="font-medium inline-flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" />
                                        {item.monthlyIncome.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Employment Status
                                    </Label>
                                    <p className="font-medium">
                                        {item.isEmployed ? "Employed" : "Not employed"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">
                                        Active Treatment
                                    </Label>
                                    <p className="font-medium">
                                        {item.inActiveTreatment ? "Yes" : "No"}
                                    </p>
                                </div>
                            </div>

                            {(item.socialWorkerName || item.socialWorkerFacility) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    {item.socialWorkerName && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">
                                                Social Worker Name
                                            </Label>
                                            <p className="font-medium">
                                                {item.socialWorkerName}
                                            </p>
                                        </div>
                                    )}
                                    {item.socialWorkerFacility && (
                                        <div>
                                            <Label className="text-xs text-muted-foreground">
                                                Social Worker Facility
                                            </Label>
                                            <p className="font-medium">
                                                {item.socialWorkerFacility}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {documentLinks.length > 0 && (
                                <div>
                                    <Label className="text-xs text-muted-foreground mb-2 block">
                                        Supporting Documents
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {documentLinks.map((doc, idx) => (
                                            <Button
                                                key={idx}
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    {doc.label}
                                                </a>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(item.grantAmount || item.reviewNotes || item.reviewedAt) && (
                                <div className="mt-4 border-t pt-4 space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Existing Review
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        {item.grantAmount && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block">
                                                    Grant Amount
                                                </span>
                                                <span className="font-medium inline-flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    {item.grantAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {item.reviewedAt && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block">
                                                    Reviewed At
                                                </span>
                                                <span className="font-medium">
                                                    {new Date(
                                                        item.reviewedAt
                                                    ).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {item.reviewedBy && (
                                            <div>
                                                <span className="text-xs text-muted-foreground block">
                                                    Reviewed By
                                                </span>
                                                <span className="font-medium">
                                                    {typeof item.reviewedBy === "string"
                                                        ? item.reviewedBy
                                                        : item.reviewedBy?.name || "Admin"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {item.reviewNotes && (
                                        <div>
                                            <span className="text-xs text-muted-foreground block mb-1">
                                                Review Notes
                                            </span>
                                            <p className="text-sm whitespace-pre-line">
                                                {item.reviewNotes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="text-xs text-muted-foreground mt-2">
                                Last updated: {new Date(item.updatedAt).toLocaleString()}
                            </div>
                        </div>
                    </Card>

                    {/* Review / update form */}
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Review & Decision
                        </h4>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                        value={status}
                                        onValueChange={(v) =>
                                            setValue("status", v as any, {
                                                shouldValidate: true,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ApplicationStatusEnum.options.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-xs text-red-600">
                                            {errors.status.message}
                                        </p>
                                    )}
                                </div>

                                {status === "APPROVED" && (
                                    <div className="space-y-2">
                                        <Label>Grant Amount (USD)</Label>
                                        <Input
                                            type="number"
                                            step="50"
                                            min={500}
                                            max={1000}
                                            {...register("grantAmount", {
                                                valueAsNumber: true,
                                            })}
                                        />
                                        {errors.grantAmount && (
                                            <p className="text-xs text-red-600">
                                                {errors.grantAmount.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Allowed range: 500 – 1000 USD.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Review Notes</Label>
                                <Textarea
                                    {...register("reviewNotes")}
                                    className="min-h-[120px]"
                                    placeholder="Add context for your decision, any follow-up steps, or special considerations..."
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Close
                                </Button>
                                <Button type="submit" isLoading={updating}>
                                    Save Review
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

export default function ManageApplicationsPage() {
    const [items, setItems] = useState<AssistanceApplication[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [submissionMonth, setSubmissionMonth] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState<AssistanceApplication | null>(null);

    const [confirm, setConfirm] = useState<ConfirmState>({
        open: false,
        title: <></>,
        tone: "default",
        confirming: false,
    });

    const load = async () => {
        try {
            setLoading(true);
            const res: Paginated<AssistanceApplication> =
                await AssistanceApplicationsApi.list({
                    page,
                    limit,
                    status: status === "all" ? undefined : (status as any),
                    submissionMonth: submissionMonth || undefined,
                });
            setItems(res.items);
            setTotal(res.total);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load applications"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, status, submissionMonth]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const getStatusBadge = (st: string) => {
        switch (st) {
            case "APPROVED":
                return (
                    <Badge
                        variant="outline"
                        className="text-xs border-green-700 text-green-800"
                    >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        APPROVED
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
            case "REJECTED":
                return (
                    <Badge
                        variant="outline"
                        className="text-xs border-red-700 text-red-800"
                    >
                        <XCircle className="h-3 w-3 mr-1" />
                        REJECTED
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
                            title="Manage Assistance Applications"
                            subtitle="Review and manage Remember Betty financial assistance applications"
                        />

                        <ApplicationStatsCards items={items} />

                        {/* Filters */}
                        <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                            <CardHeader>
                                <CardTitle className="text-indigo-900">
                                    Filters
                                </CardTitle>
                                <CardDescription>
                                    Filter applications by status and submission month
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Status
                                        </Label>
                                        <Select
                                            value={status || "all"}
                                            onValueChange={(value) => {
                                                setPage(1);
                                                setStatus(
                                                    value === "all" ? undefined : value
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="w-[200px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">
                                                    All Status
                                                </SelectItem>
                                                {ApplicationStatusEnum.options.map((s) => (
                                                    <SelectItem key={s} value={s}>
                                                        {s}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Submission Month (YYYY-MM)
                                        </Label>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                                            <Input
                                                className="pl-8 w-[180px]"
                                                placeholder="2025-11"
                                                value={submissionMonth}
                                                onChange={(e) => {
                                                    setPage(1);
                                                    setSubmissionMonth(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label className="text-xs text-muted-foreground">
                                            Items per page
                                        </Label>
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
                                    </div>

                                    <div className="flex gap-2 sm:ml-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setPage(1);
                                                setStatus(undefined);
                                                setSubmissionMonth("");
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={load}
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Refresh
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Table */}
                        <Card className="bg-white">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-indigo-900">
                                            Applications
                                        </CardTitle>
                                        <CardDescription>
                                            {items.length} applications found
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
                                                    Applicant
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Email
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Phone
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Diagnosis
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Monthly Income
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Status
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Submitted
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8">
                                                        <div className="flex items-center justify-center">
                                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                            Loading applications...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                items.map((item) => (
                                                    <TableRow
                                                        key={item._id}
                                                        className="hover:bg-zinc-50"
                                                    >
                                                        <TableCell>
                                                            <p className="font-semibold">
                                                                {item.applicantName}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="text-sm">
                                                                {item.applicantEmail}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="text-sm">
                                                                {item.applicantPhone || "—"}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell className="max-w-[220px]">
                                                            <p className="text-xs line-clamp-2">
                                                                {item.diagnosisDescription}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="text-sm inline-flex items-center gap-1">
                                                                <DollarSign className="w-3 h-3" />
                                                                {item.monthlyIncome.toLocaleString()}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getStatusBadge(item.status)}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {new Date(
                                                                item.createdAt
                                                            ).toLocaleDateString()}
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
                                                                        View & Review
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
                                        <div className="text-zinc-500 mb-2">
                                            No applications found
                                        </div>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-zinc-500">
                                            Page {page} of {totalPages} • {total} total
                                            applications
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

            <ApplicationDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                item={selected}
                onUpdate={load}
            />

            <ConfirmDialog
                open={confirm.open}
                onOpenChange={(v) =>
                    setConfirm((c) => ({
                        ...c,
                        open: v,
                    }))
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
