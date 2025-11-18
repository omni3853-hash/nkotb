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
    ImageIcon,
    VideoIcon,
    PlusIcon,
    Edit,
    Trash2,
    Search,
    Eye,
    Calendar,
    RefreshCw,
    Download,
    MoreVertical,
    Share2,
    Upload,
} from "lucide-react";

import { toast } from "sonner";

import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import { MediaApi, type Media } from "@/api/media.api";
import type { MediaCategory } from "@/lib/dto/media.dto";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

// ---- Zod Schemas ----

const MediaCategoryEnum = z.enum(["image", "video"]);

const MediaFormSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title is too long"),
    category: MediaCategoryEnum,
    mediaUrl: z
        .string()
        .url("A valid URL is required"),
});

type MediaFormValues = z.infer<typeof MediaFormSchema>;

const mediaResolver = zodResolver(MediaFormSchema) as Resolver<MediaFormValues>;

// ---- Stats Cards ----

function MediaStatsCards({ items }: { items: Media[] }) {
    const total = items.length;
    const images = items.filter((m) => m.category === "image").length;
    const videos = items.filter((m) => m.category === "video").length;

    const recentCount = items.filter((m) => {
        const created = new Date(m.createdAt).getTime();
        const now = Date.now();
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
    }).length;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-indigo-200 rounded-2xl p-4 bg-white hover:border-indigo-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-indigo-50 border-2 border-indigo-900 flex items-center justify-center">
                        <ImageIcon className="size-5 text-indigo-900" />
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-900 border-2 border-indigo-900 font-mono text-xs">
                        {total}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL MEDIA</p>
                <p className="text-2xl font-bold text-indigo-900">{total}</p>
            </Card>

            <Card className="border-2 border-green-200 rounded-2xl p-4 bg-white hover:border-green-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-green-50 border-2 border-green-900 flex items-center justify-center">
                        <ImageIcon className="size-5 text-green-900" />
                    </div>
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900 font-mono text-xs">
                        {images}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">IMAGES</p>
                <p className="text-2xl font-bold text-green-900">{images}</p>
            </Card>

            <Card className="border-2 border-amber-200 rounded-2xl p-4 bg-white hover:border-amber-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-amber-50 border-2 border-amber-900 flex items-center justify-center">
                        <VideoIcon className="size-5 text-amber-900" />
                    </div>
                    <Badge className="bg-amber-50 text-amber-900 border-2 border-amber-900 font-mono text-xs">
                        {videos}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">VIDEOS</p>
                <p className="text-2xl font-bold text-amber-900">{videos}</p>
            </Card>

            <Card className="border-2 border-purple-200 rounded-2xl p-4 bg-white hover:border-purple-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-purple-50 border-2 border-purple-900 flex items-center justify-center">
                        <Calendar className="size-5 text-purple-900" />
                    </div>
                    <Badge className="bg-purple-50 text-purple-900 border-2 border-purple-900 font-mono text-xs">
                        {recentCount}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">LAST 7 DAYS</p>
                <p className="text-2xl font-bold text-purple-900">{recentCount}</p>
            </Card>
        </div>
    );
}

// ---- Filters ----

function MediaFilters({
    searchTerm,
    onSearchChange,
    category,
    onCategoryChange,
    limit,
    onLimitChange,
    onClearFilters,
}: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    category: MediaCategory | "all" | undefined;
    onCategoryChange: (value: MediaCategory | "all") => void;
    limit: number;
    onLimitChange: (value: number) => void;
    onClearFilters: () => void;
}) {
    return (
        <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
            <CardHeader>
                <CardTitle className="text-indigo-900">Filters & Search</CardTitle>
                <CardDescription>Filter media by type and title</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative sm:col-span-2 lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search media..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 bg-zinc-50 focus:border-indigo-500 w-full"
                        />
                    </div>

                    <Select
                        value={category || "all"}
                        onValueChange={(v) => onCategoryChange(v as MediaCategory | "all")}
                    >
                        <SelectTrigger className="bg-zinc-50 focus:border-indigo-500 w-full">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="video">Videos</SelectItem>
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
                            <SelectItem value="10">10 per page</SelectItem>
                            <SelectItem value="20">20 per page</SelectItem>
                            <SelectItem value="50">50 per page</SelectItem>
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

// ---- Details Modal ----

function MediaDetailsModal({
    open,
    onOpenChange,
    item,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    item: Media | null;
}) {
    if (!item) return null;

    const isImage = item.category === "image";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Eye className="size-5" />
                        Media Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            <div className="w-full md:w-56 rounded-lg overflow-hidden border-2 border-zinc-200 shrink-0 bg-black/5">
                                {isImage ? (
                                    <img
                                        src={item.mediaUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <video
                                        src={item.mediaUrl}
                                        controls
                                        className="w-full h-full object-cover bg-black"
                                    />
                                )}
                            </div>
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-2xl font-semibold">{item.title}</h3>
                                    <Badge
                                        variant="outline"
                                        className="flex items-center gap-1 text-xs border-indigo-700 text-indigo-800"
                                    >
                                        {isImage ? (
                                            <ImageIcon className="h-3 w-3" />
                                        ) : (
                                            <VideoIcon className="h-3 w-3" />
                                        )}
                                        {item.category}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Created</p>
                                            <p className="text-muted-foreground">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Last Updated</p>
                                            <p className="text-muted-foreground">
                                                {new Date(item.updatedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <Label className="text-xs text-muted-foreground">Media URL</Label>
                                    <div className="mt-1">
                                        <a
                                            href={item.mediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm break-all text-indigo-700 underline underline-offset-2"
                                        >
                                            {item.mediaUrl}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ---- Create Form ----

function CreateMediaForm({
    onSubmit,
    submitting,
    onCancel,
}: {
    onSubmit: (data: MediaFormValues) => void;
    submitting: boolean;
    onCancel: () => void;
}) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MediaFormValues>({
        resolver: mediaResolver,
        defaultValues: {
            title: "",
            category: "image",
            mediaUrl: "",
        },
        mode: "onChange",
    });

    const category = watch("category");
    const mediaUrl = watch("mediaUrl");
    const [uploadProgress, setUploadProgress] = useState(0);

    const isImage = category === "image";

    const doUpload = async (file: File) => {
        try {
            setUploadProgress(0);
            const res = await uploadToCloudinary(file, {
                onProgress: (p: number) => setUploadProgress(p),
            });
            setValue("mediaUrl", res.url as string, {
                shouldValidate: true,
                shouldTouch: true,
            });
            toast.success("Image uploaded successfully");
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Image upload failed"
            );
        } finally {
            setUploadProgress(0);
        }
    };

    const submit: SubmitHandler<MediaFormValues> = (data) =>
        onSubmit(data as MediaFormValues);

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <ImageIcon className="h-5 w-5 text-indigo-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                        Basic Information
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            {...register("title")}
                            placeholder="Enter media title"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-600">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Type *</Label>
                        <Select
                            value={category}
                            onValueChange={(v) =>
                                setValue("category", v as MediaCategory, {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <SelectTrigger id="category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.category && (
                            <p className="text-xs text-red-600">
                                {errors.category.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* Media input: Upload for images, URL for videos */}
                <div className="space-y-3">
                    <Label>Media Source *</Label>

                    {isImage ? (
                        <>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) doUpload(f);
                                    }}
                                />
                                <Button type="button" variant="outline" disabled>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                </Button>
                            </div>
                            {uploadProgress > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Uploading… {uploadProgress}%
                                </p>
                            )}
                            {mediaUrl && (
                                <div className="mt-2 w-32 h-32 rounded-md overflow-hidden border">
                                    <img
                                        src={mediaUrl}
                                        alt="preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Input
                                {...register("mediaUrl")}
                                placeholder="Paste video URL (e.g. mp4, YouTube, Vimeo, CDN, etc.)"
                            />
                            {errors.mediaUrl && (
                                <p className="text-xs text-red-600">
                                    {errors.mediaUrl.message}
                                </p>
                            )}
                            {mediaUrl && (
                                <div className="mt-2 rounded-md overflow-hidden border bg-black">
                                    <video
                                        src={mediaUrl}
                                        controls
                                        className="w-full max-h-48 object-contain bg-black"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {isImage && !mediaUrl && errors.mediaUrl && (
                        <p className="text-xs text-red-600">
                            {errors.mediaUrl.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                    Create Media
                </Button>
            </div>
        </form>
    );
}

// ---- Edit Form ----

function EditMediaForm({
    defaultValues,
    onSubmit,
    submitting,
    onCancel,
}: {
    defaultValues: Media;
    onSubmit: (data: MediaFormValues) => void;
    submitting: boolean;
    onCancel: () => void;
}) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MediaFormValues>({
        resolver: mediaResolver,
        defaultValues: {
            title: defaultValues.title,
            category: defaultValues.category,
            mediaUrl: defaultValues.mediaUrl,
        },
        mode: "onChange",
    });

    const category = watch("category");
    const mediaUrl = watch("mediaUrl");
    const [uploadProgress, setUploadProgress] = useState(0);

    const isImage = category === "image";

    const doUpload = async (file: File) => {
        try {
            setUploadProgress(0);
            const res = await uploadToCloudinary(file, {
                onProgress: (p: number) => setUploadProgress(p),
            });
            setValue("mediaUrl", res.url as string, {
                shouldValidate: true,
                shouldTouch: true,
            });
            toast.success("Image uploaded successfully");
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Image upload failed"
            );
        } finally {
            setUploadProgress(0);
        }
    };

    const submit: SubmitHandler<MediaFormValues> = (data) =>
        onSubmit(data as MediaFormValues);

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <ImageIcon className="h-5 w-5 text-indigo-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                        Basic Information
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title_e">Title</Label>
                        <Input
                            id="title_e"
                            {...register("title")}
                            placeholder="Enter media title"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-600">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category_e">Type</Label>
                        <Select
                            value={category}
                            onValueChange={(v) =>
                                setValue("category", v as MediaCategory, {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <SelectTrigger id="category_e">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.category && (
                            <p className="text-xs text-red-600">
                                {errors.category.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label>Media Source</Label>

                    {isImage ? (
                        <>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) doUpload(f);
                                    }}
                                />
                                <Button type="button" variant="outline" disabled>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload
                                </Button>
                            </div>
                            {uploadProgress > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Uploading… {uploadProgress}%
                                </p>
                            )}
                            {mediaUrl && (
                                <div className="mt-2 w-32 h-32 rounded-md overflow-hidden border">
                                    <img
                                        src={mediaUrl}
                                        alt="preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <Input
                                {...register("mediaUrl")}
                                placeholder="Paste video URL (e.g. mp4, YouTube, Vimeo, CDN, etc.)"
                            />
                            {errors.mediaUrl && (
                                <p className="text-xs text-red-600">
                                    {errors.mediaUrl.message}
                                </p>
                            )}
                            {mediaUrl && (
                                <div className="mt-2 rounded-md overflow-hidden border bg-black">
                                    <video
                                        src={mediaUrl}
                                        controls
                                        className="w-full max-h-48 object-contain bg-black"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {isImage && !mediaUrl && errors.mediaUrl && (
                        <p className="text-xs text-red-600">
                            {errors.mediaUrl.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="url_readonly">Current URL</Label>
                <Textarea
                    id="url_readonly"
                    value={mediaUrl}
                    readOnly
                    className="resize-none text-xs bg-zinc-50"
                />
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

// ---- Confirm State ----

type ConfirmState = {
    open: boolean;
    tone?: "danger" | "default";
    title: React.ReactNode;
    onYes?: () => Promise<void> | void;
    confirming?: boolean;
};

// ---- Main Page ----

export default function ManageMediaPage() {
    const [items, setItems] = useState<Media[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState<MediaCategory | undefined>(
        undefined
    );

    const [loading, setLoading] = useState(false);

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState<Media | null>(null);

    const [confirm, setConfirm] = useState<ConfirmState>({
        open: false,
        title: <></>,
        tone: "default",
        confirming: false,
    });

    const [submittingCreate, setSubmittingCreate] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);

    const loadMedia = async () => {
        try {
            setLoading(true);
            const res: Paginated<Media> = await MediaApi.list({
                page,
                limit,
                search: searchTerm || undefined,
                category: category || undefined,
            } as any);
            setItems(res.items);
            setTotal(res.total);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load media"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMedia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, searchTerm, category]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const handleCreate = (data: MediaFormValues) => {
        setConfirm({
            open: true,
            title: <>Create this media item?</>,
            onYes: async () => {
                try {
                    setSubmittingCreate(true);
                    const created = await MediaApi.create({
                        title: data.title,
                        category: data.category,
                        mediaUrl: data.mediaUrl,
                    });
                    toast.success("Media created successfully");
                    setCreateOpen(false);
                    setPage(1);
                    await loadMedia();
                    setSelected(created);
                    setDetailsOpen(true);
                } catch (err: any) {
                    toast.error(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Create failed"
                    );
                } finally {
                    setSubmittingCreate(false);
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const startEdit = (item: Media) => {
        setSelected(item);
        setEditOpen(true);
    };

    const handleEdit = (data: MediaFormValues) => {
        if (!selected?._id) return;
        setConfirm({
            open: true,
            title: <>Save changes to "{selected.title}"?</>,
            onYes: async () => {
                try {
                    setSubmittingEdit(true);
                    const updated = await MediaApi.update(selected._id, {
                        title: data.title,
                        category: data.category,
                        mediaUrl: data.mediaUrl,
                    });
                    toast.success("Media updated successfully");
                    setEditOpen(false);
                    setItems((prev) =>
                        prev.map((it) => (it._id === updated._id ? updated : it))
                    );
                    setSelected(updated);
                } catch (err: any) {
                    toast.error(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Update failed"
                    );
                } finally {
                    setSubmittingEdit(false);
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const removeMedia = (item: Media) => {
        setConfirm({
            open: true,
            tone: "danger",
            title: <>Delete "{item.title}"? This cannot be undone.</>,
            onYes: async () => {
                try {
                    await MediaApi.remove(item._id);
                    toast.success("Media deleted successfully");
                    await loadMedia();
                } catch (err: any) {
                    toast.error(
                        err?.response?.data?.message ||
                        err?.message ||
                        "Delete failed"
                    );
                } finally {
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const shareMedia = async (item: Media) => {
        const url = item.mediaUrl;
        const shareData = {
            title: item.title,
            text: item.title,
            url,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Media URL copied");
            }
        } catch {
            // user cancelled, ignore
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setCategory(undefined);
        setPage(1);
    };

    const getCategoryBadge = (cat: MediaCategory) => {
        if (cat === "image") {
            return (
                <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-xs border-green-700 text-green-800"
                >
                    <ImageIcon className="h-3 w-3" />
                    Image
                </Badge>
            );
        }
        return (
            <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs border-amber-700 text-amber-800"
            >
                <VideoIcon className="h-3 w-3" />
                Video
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
                            title="Manage Media Library"
                            subtitle="Upload, edit, and manage images and videos"
                            actionButton={{
                                text: "Add Media",
                                icon: <PlusIcon className="size-4" />,
                                onClick: () => setCreateOpen(true),
                            }}
                        />

                        <MediaStatsCards items={items} />

                        <MediaFilters
                            searchTerm={searchTerm}
                            onSearchChange={(value) => {
                                setPage(1);
                                setSearchTerm(value);
                            }}
                            category={category}
                            onCategoryChange={(value) => {
                                setPage(1);
                                setCategory(value === "all" ? undefined : value);
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
                                        <CardTitle className="text-indigo-900">
                                            Media Items
                                        </CardTitle>
                                        <CardDescription>
                                            {items.length} items found
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
                                                    Preview
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Title
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Type
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Created
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Updated
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
                                                        colSpan={6}
                                                        className="text-center py-8"
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                            Loading media...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                items.map((item) => {
                                                    const isImage =
                                                        item.category === "image";
                                                    return (
                                                        <TableRow
                                                            key={item._id}
                                                            className="hover:bg-zinc-50"
                                                        >
                                                            <TableCell>
                                                                <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-zinc-200 bg-black/5 flex items-center justify-center">
                                                                    {isImage ? (
                                                                        <img
                                                                            src={
                                                                                item.mediaUrl ||
                                                                                "/placeholder.svg"
                                                                            }
                                                                            alt={
                                                                                item.title
                                                                            }
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <video
                                                                            src={
                                                                                item.mediaUrl
                                                                            }
                                                                            className="w-full h-full object-cover bg-black"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="max-w-xs">
                                                                    <p className="font-semibold line-clamp-2">
                                                                        {item.title}
                                                                    </p>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {getCategoryBadge(
                                                                    item.category
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm">
                                                                    {new Date(
                                                                        item.createdAt
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="text-sm">
                                                                    {new Date(
                                                                        item.updatedAt
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
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
                                                                                setSelected(
                                                                                    item
                                                                                );
                                                                                setDetailsOpen(
                                                                                    true
                                                                                );
                                                                            }}
                                                                        >
                                                                            <Eye className="w-4 h-4 mr-2" />
                                                                            View
                                                                            Details
                                                                        </DropdownMenuItem>

                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                startEdit(
                                                                                    item
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="w-4 h-4 mr-2" />
                                                                            Edit
                                                                        </DropdownMenuItem>

                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                shareMedia(
                                                                                    item
                                                                                )
                                                                            }
                                                                        >
                                                                            <Share2 className="w-4 h-4 mr-2" />
                                                                            Share
                                                                            Link
                                                                        </DropdownMenuItem>

                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                removeMedia(
                                                                                    item
                                                                                )
                                                                            }
                                                                            className="text-red-600"
                                                                        >
                                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {!loading && items.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-zinc-500 mb-2">
                                            No media found
                                        </div>
                                        <div className="text-sm text-zinc-400">
                                            Try adjusting your search or filters
                                        </div>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-zinc-500">
                                            Page {page} of {totalPages} • {total}{" "}
                                            total items
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

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Create New Media
                        </DialogTitle>
                    </DialogHeader>
                    <CreateMediaForm
                        submitting={submittingCreate}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Edit Media
                        </DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <EditMediaForm
                            defaultValues={selected}
                            submitting={submittingEdit}
                            onSubmit={handleEdit}
                            onCancel={() => setEditOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Details Modal */}
            <MediaDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                item={selected}
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
