"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    useForm,
    type SubmitHandler,
    type Resolver,
} from "react-hook-form";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
    PlusIcon,
    Edit,
    Trash2,
    Search,
    Eye,
    Share2,
    ToggleLeft,
    ToggleRight,
    Upload,
    X,
    Tag as TagIcon,
    Star,
    TrendingUp,
    Calendar,
    RefreshCw,
    Download,
    MoreVertical,
    Users,
    Archive,
    EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import { BlogPostStatusEnum, CreateBlogPostFormData, CreateBlogPostSchema, UpdateBlogPostFormData, UpdateBlogPostSchema } from "@/utils/schemas/schemas";
import { AdminBlogPostsApi, BlogPost } from "@/api/posts.api";
import { AdminEventsApi, Event } from "@/api/events.api";
import { AdminCelebritiesApi, Celebrity } from "@/api/celebrities.api";

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const categories = [
    "Entertainment",
    "Music",
    "Sports",
    "Technology",
    "Lifestyle",
    "Business",
    "Art",
    "Food",
    "Travel",
    "Health",
];

const statusOptions = BlogPostStatusEnum.options;

type CreateValues = z.output<typeof CreateBlogPostSchema>;
type UpdateValues = z.output<typeof UpdateBlogPostSchema>;

const createResolver = zodResolver(CreateBlogPostSchema) as Resolver<CreateValues>;
const updateResolver = zodResolver(UpdateBlogPostSchema) as Resolver<UpdateValues>;

function ChipsInput({
    label,
    values,
    onChange,
    placeholder,
    icon,
}: {
    label: string;
    values: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
    icon?: React.ReactNode;
}) {
    const [draft, setDraft] = useState("");

    const add = () => {
        const v = draft.trim();
        if (!v) return;
        if (values.includes(v)) return;
        onChange([...values, v]);
        setDraft("");
    };

    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2">
                {icon} {label}
            </Label>
            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            add();
                        }
                    }}
                    placeholder={placeholder}
                />
                <Button type="button" variant="outline" onClick={add}>
                    Add
                </Button>
            </div>
            {!!values.length && (
                <div className="flex flex-wrap gap-2">
                    {values.map((t) => (
                        <Badge key={t} variant="secondary" className="flex items-center gap-1">
                            {t}
                            <button
                                type="button"
                                className="ml-1 hover:text-red-600"
                                onClick={() => onChange(values.filter((x) => x !== t))}
                                aria-label={`Remove ${t}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}

function BlogPostStatsCards({ posts }: { posts: BlogPost[] }) {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.status === "published").length;
    const featuredPosts = posts.filter(p => p.isFeatured).length;
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-2 border-indigo-200 rounded-2xl p-4 bg-white hover:border-indigo-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-indigo-50 border-2 border-indigo-900 flex items-center justify-center">
                        <FileText className="size-5 text-indigo-900" />
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-900 border-2 border-indigo-900 font-mono text-xs">
                        {totalPosts}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                    TOTAL POSTS
                </p>
                <p className="text-2xl font-bold text-indigo-900">
                    {totalPosts}
                </p>
            </Card>

            <Card className="border-2 border-green-200 rounded-2xl p-4 bg-white hover:border-green-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-green-50 border-2 border-green-900 flex items-center justify-center">
                        <Eye className="size-5 text-green-900" />
                    </div>
                    <Badge className="bg-green-50 text-green-900 border-2 border-green-900 font-mono text-xs">
                        {Math.round((publishedPosts / totalPosts) * 100)}%
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                    PUBLISHED
                </p>
                <p className="text-2xl font-bold text-green-900">
                    {publishedPosts}
                </p>
            </Card>

            <Card className="border-2 border-amber-200 rounded-2xl p-4 bg-white hover:border-amber-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-amber-50 border-2 border-amber-900 flex items-center justify-center">
                        <Star className="size-5 text-amber-900" />
                    </div>
                    <Badge className="bg-amber-50 text-amber-900 border-2 border-amber-900 font-mono text-xs">
                        {featuredPosts}
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                    FEATURED
                </p>
                <p className="text-2xl font-bold text-amber-900">
                    {featuredPosts}
                </p>
            </Card>

            <Card className="border-2 border-purple-200 rounded-2xl p-4 bg-white hover:border-purple-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                    <div className="size-10 rounded-xl bg-purple-50 border-2 border-purple-900 flex items-center justify-center">
                        <TrendingUp className="size-5 text-purple-900" />
                    </div>
                    <Badge className="bg-purple-50 text-purple-900 border-2 border-purple-900 font-mono text-xs">
                        {(totalViews / 1000).toFixed(0)}K
                    </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                    TOTAL VIEWS
                </p>
                <p className="text-2xl font-bold text-purple-900">
                    {totalViews.toLocaleString()}
                </p>
            </Card>
        </div>
    );
}

function BlogPostFilters({
    searchTerm,
    onSearchChange,
    category,
    onCategoryChange,
    status,
    onStatusChange,
    onlyActive,
    onOnlyActiveChange,
    limit,
    onLimitChange,
    onClearFilters,
}: {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    category: string | undefined;
    onCategoryChange: (value: string) => void;
    status: string | undefined;
    onStatusChange: (value: string) => void;
    onlyActive: boolean;
    onOnlyActiveChange: (value: boolean) => void;
    limit: number;
    onLimitChange: (value: number) => void;
    onClearFilters: () => void;
}) {
    return (
        <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
            <CardHeader>
                <CardTitle className="text-indigo-900">
                    Filters & Search
                </CardTitle>
                <CardDescription>
                    Filter blog posts by category, status, and search terms
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative sm:col-span-2 lg:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search posts..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 bg-zinc-50 focus:border-indigo-500 w-full"
                        />
                    </div>

                    <Select value={category || "all"} onValueChange={onCategoryChange}>
                        <SelectTrigger className="bg-zinc-50 focus:border-indigo-500 w-full">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={status || "all"} onValueChange={onStatusChange}>
                        <SelectTrigger className="bg-zinc-50 focus:border-indigo-500 w-full">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select
                        value={onlyActive ? "active" : "all"}
                        onValueChange={(v) => onOnlyActiveChange(v === "active")}
                    >
                        <SelectTrigger className="bg-zinc-50 focus:border-indigo-500 w-full">
                            <SelectValue placeholder="Active" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Only Active</SelectItem>
                            <SelectItem value="all">All Posts</SelectItem>
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

function AdminBlogPostDetailsModal({
    open,
    onOpenChange,
    post,
    events,
    celebrities,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    post: BlogPost | null;
    events: Event[];
    celebrities: Celebrity[];
}) {
    if (!post) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published": return "bg-green-100 text-green-800 border-green-200";
            case "draft": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "archived": return "bg-zinc-100 text-zinc-800 border-zinc-200";
            default: return "bg-zinc-100 text-zinc-800 border-zinc-200";
        }
    };

    const getRelatedEvents = () => {
        return events.filter(event => post.relatedEvents.includes(event._id));
    };

    const getRelatedCelebrities = () => {
        return celebrities.filter(celebrity => post.relatedCelebrities.includes(celebrity._id));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Eye className="size-5" />
                        Blog Post Details
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <div className="flex items-start gap-6">
                            {post.thumbnail && (
                                <div className="size-32 rounded-lg overflow-hidden border-2 border-zinc-200 shrink-0">
                                    <img
                                        src={post.thumbnail}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <h3 className="text-2xl font-bold">{post.title}</h3>
                                    <Badge className={`text-xs ${getStatusColor(post.status)}`}>
                                        {post.status}
                                    </Badge>
                                    {post.isFeatured && (
                                        <Badge variant="outline" className="text-xs border-amber-700 text-amber-800">
                                            Featured
                                        </Badge>
                                    )}
                                    {post.isActive ? (
                                        <Badge variant="outline" className="text-xs border-green-700 text-green-800">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-xs border-zinc-400 text-zinc-700">
                                            Inactive
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Category:</span>
                                        <Badge variant="outline" className="text-xs">
                                            {post.category}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Views:</span>
                                        <span>{post.views?.toLocaleString?.() || 0}</span>
                                    </div>
                                </div>

                                {post.excerpt && (
                                    <div className="bg-zinc-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-sm mb-2">Excerpt</h4>
                                        <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <h4 className="font-semibold mb-4">Content Preview</h4>
                        <div className="prose max-w-none bg-zinc-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <TagIcon className="h-4 w-4" />
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                                {post.tags.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No tags</p>
                                )}
                            </div>
                        </Card>

                        <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Related Content
                            </h4>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-medium">Related Celebrities:</span>
                                    <div className="mt-2 space-y-2">
                                        {getRelatedCelebrities().map(celebrity => (
                                            <Badge key={celebrity._id} variant="outline" className="text-xs mr-2 mb-2">
                                                {celebrity.name}
                                            </Badge>
                                        ))}
                                        {getRelatedCelebrities().length === 0 && (
                                            <p className="text-muted-foreground">None</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium">Related Events:</span>
                                    <div className="mt-2 space-y-2">
                                        {getRelatedEvents().map(event => (
                                            <Badge key={event._id} variant="outline" className="text-xs mr-2 mb-2">
                                                {event.title}
                                            </Badge>
                                        ))}
                                        {getRelatedEvents().length === 0 && (
                                            <p className="text-muted-foreground">None</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                        <h4 className="font-semibold mb-4">Timeline</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Created</p>
                                    <p className="text-muted-foreground">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Last Updated</p>
                                    <p className="text-muted-foreground">
                                        {new Date(post.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {post.publishedAt && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Published</p>
                                        <p className="text-muted-foreground">
                                            {new Date(post.publishedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function CreateBlogPostForm({
    onSubmit,
    submitting,
    onCancel,
    events,
    celebrities,
}: {
    onSubmit: (data: CreateBlogPostFormData) => void;
    submitting: boolean;
    onCancel: () => void;
    events: Event[];
    celebrities: Celebrity[];
}) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateValues>({
        resolver: createResolver,
        defaultValues: {
            title: "",
            category: "",
            tags: [],
            thumbnail: null,
            coverImage: null,
            excerpt: "",
            content: "",
            relatedCelebrities: [],
            relatedEvents: [],
            status: "draft",
            isFeatured: false,
            isActive: true,
        },
        mode: "onChange",
    });

    const thumbnailUrl = watch("thumbnail");
    const coverUrl = watch("coverImage");
    const tagValues = watch("tags");
    const statusValue = watch("status");
    const categoryValue = watch("category");
    const featured = watch("isFeatured");
    const active = watch("isActive");
    const relatedCelebritiesValue = watch("relatedCelebrities");
    const relatedEventsValue = watch("relatedEvents");

    const [thumbProgress, setThumbProgress] = useState(0);
    const [coverProgress, setCoverProgress] = useState(0);
    const [newCelebrity, setNewCelebrity] = useState("");
    const [newEvent, setNewEvent] = useState("");

    const doUpload = async (file: File, target: "thumbnail" | "coverImage") => {
        try {
            const setPct = target === "thumbnail" ? setThumbProgress : setCoverProgress;
            setPct(0);
            const res = await uploadToCloudinary(file, { onProgress: (p) => setPct(p) });
            setValue(target, res.url as any, { shouldValidate: true, shouldTouch: true });
            toast.success("Image uploaded");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Upload failed");
        } finally {
            setThumbProgress(0);
            setCoverProgress(0);
        }
    };

    const addCelebrity = (celebrityId: string) => {
        if (!celebrityId || relatedCelebritiesValue.includes(celebrityId)) return;
        setValue("relatedCelebrities", [...relatedCelebritiesValue, celebrityId], { shouldValidate: true });
        setNewCelebrity("");
    };

    const removeCelebrity = (celebrityId: string) => {
        setValue("relatedCelebrities", relatedCelebritiesValue.filter(id => id !== celebrityId), { shouldValidate: true });
    };

    const addEvent = (eventId: string) => {
        if (!eventId || relatedEventsValue.includes(eventId)) return;
        setValue("relatedEvents", [...relatedEventsValue, eventId], { shouldValidate: true });
        setNewEvent("");
    };

    const removeEvent = (eventId: string) => {
        setValue("relatedEvents", relatedEventsValue.filter(id => id !== eventId), { shouldValidate: true });
    };

    const getSelectedCelebrity = (id: string) => {
        return celebrities.find(c => c._id === id);
    };

    const getSelectedEvent = (id: string) => {
        return events.find(e => e._id === id);
    };

    const submit: SubmitHandler<CreateValues> = (data) => onSubmit(data as CreateBlogPostFormData);

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-8">
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <FileText className="h-5 w-5 text-indigo-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Post Title *</Label>
                        <Input id="title" {...register("title")} placeholder="Enter post title" />
                        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                            value={categoryValue || ""}
                            onValueChange={(v) => setValue("category", v, { shouldValidate: true })}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={statusValue}
                            onValueChange={(v) => setValue("status", v as any, { shouldValidate: true })}
                        >
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-xs text-red-600">{errors.status.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Featured</Label>
                        <div className="flex items-center h-10 px-3 border rounded-md">
                            <Checkbox
                                checked={featured}
                                onCheckedChange={(v) => setValue("isFeatured", !!v, { shouldValidate: true })}
                                id="featured"
                            />
                            <Label htmlFor="featured" className="ml-2 text-sm text-muted-foreground">
                                Mark as featured
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Active</Label>
                        <div className="flex items-center h-10 px-3 border rounded-md">
                            <Checkbox
                                checked={active}
                                onCheckedChange={(v) => setValue("isActive", !!v, { shouldValidate: true })}
                                id="active"
                            />
                            <Label htmlFor="active" className="ml-2 text-sm text-muted-foreground">
                                Make post active
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Thumbnail Image</Label>
                        <div className="flex items-center gap-3">
                            <Input type="file" accept="image/*" onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) doUpload(f, "thumbnail");
                            }} />
                            <Button type="button" variant="outline" disabled>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                        {!!thumbnailUrl && (
                            <div className="mt-2 size-24 rounded-md overflow-hidden border">
                                <img src={thumbnailUrl ?? undefined} alt="thumbnail" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {thumbProgress > 0 && <p className="text-xs text-muted-foreground">Uploading… {thumbProgress}%</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div className="flex items-center gap-3">
                            <Input type="file" accept="image/*" onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) doUpload(f, "coverImage");
                            }} />
                            <Button type="button" variant="outline" disabled>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                        {!!coverUrl && (
                            <div className="mt-2 size-24 rounded-md overflow-hidden border">
                                <img src={coverUrl ?? undefined} alt="cover" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {coverProgress > 0 && <p className="text-xs text-muted-foreground">Uploading… {coverProgress}%</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                        id="excerpt"
                        {...register("excerpt")}
                        placeholder="Brief description of the post"
                        className="min-h-[80px]"
                    />
                    {errors.excerpt && <p className="text-xs text-red-600">{errors.excerpt.message}</p>}
                </div>

                <ChipsInput
                    label="Tags"
                    values={tagValues}
                    onChange={(next) => setValue("tags", next, { shouldValidate: true })}
                    placeholder="Type a tag and press Enter"
                    icon={<TagIcon className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Content</h3>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Post Content *</Label>
                    <Textarea
                        id="content"
                        {...register("content")}
                        placeholder="Write your blog post content here..."
                        className="min-h-[300px] font-mono text-sm"
                    />
                    {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <Users className="h-5 w-5 text-purple-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Related Content</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label>Related Celebrities</Label>
                        <Select value={newCelebrity} onValueChange={addCelebrity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a celebrity" />
                            </SelectTrigger>
                            <SelectContent>
                                {celebrities
                                    .filter(celebrity => !relatedCelebritiesValue.includes(celebrity._id))
                                    .map((celebrity) => (
                                        <SelectItem key={celebrity._id} value={celebrity._id}>
                                            {celebrity.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {relatedCelebritiesValue.map(celebrityId => {
                                const celebrity = getSelectedCelebrity(celebrityId);
                                return celebrity ? (
                                    <Badge key={celebrityId} variant="secondary" className="flex items-center gap-1">
                                        {celebrity.name}
                                        <button
                                            type="button"
                                            className="ml-1 hover:text-red-600"
                                            onClick={() => removeCelebrity(celebrityId)}
                                            aria-label={`Remove ${celebrity.name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Related Events</Label>
                        <Select value={newEvent} onValueChange={addEvent}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events
                                    .filter(event => !relatedEventsValue.includes(event._id))
                                    .map((event) => (
                                        <SelectItem key={event._id} value={event._id}>
                                            {event.title}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {relatedEventsValue.map(eventId => {
                                const event = getSelectedEvent(eventId);
                                return event ? (
                                    <Badge key={eventId} variant="secondary" className="flex items-center gap-1">
                                        {event.title}
                                        <button
                                            type="button"
                                            className="ml-1 hover:text-red-600"
                                            onClick={() => removeEvent(eventId)}
                                            aria-label={`Remove ${event.title}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" isLoading={submitting}>
                    Create Post
                </Button>
            </div>
        </form>
    );
}

function EditBlogPostForm({
    defaultValues,
    onSubmit,
    submitting,
    onCancel,
    events,
    celebrities,
}: {
    defaultValues: Partial<UpdateBlogPostFormData>;
    onSubmit: (data: UpdateBlogPostFormData) => void;
    submitting: boolean;
    onCancel: () => void;
    events: Event[];
    celebrities: Celebrity[];
}) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<UpdateValues>({
        resolver: updateResolver,
        defaultValues: {
            ...defaultValues,
        } as UpdateValues,
        mode: "onChange",
    });

    const thumbnailUrl = watch("thumbnail");
    const coverUrl = watch("coverImage");
    const tagValues = (watch("tags") as string[] | undefined) ?? [];
    const statusValue = watch("status") as string | undefined;
    const categoryValue = watch("category") as string | undefined;
    const featured = !!watch("isFeatured");
    const active = !!watch("isActive");
    const relatedCelebritiesValue = (watch("relatedCelebrities") as string[] | undefined) ?? [];
    const relatedEventsValue = (watch("relatedEvents") as string[] | undefined) ?? [];

    const [thumbProgress, setThumbProgress] = useState(0);
    const [coverProgress, setCoverProgress] = useState(0);
    const [newCelebrity, setNewCelebrity] = useState("");
    const [newEvent, setNewEvent] = useState("");

    const doUpload = async (file: File, target: "thumbnail" | "coverImage") => {
        try {
            const setPct = target === "thumbnail" ? setThumbProgress : setCoverProgress;
            setPct(0);
            const res = await uploadToCloudinary(file, { onProgress: (p) => setPct(p) });
            setValue(target, res.url as any, { shouldValidate: true, shouldTouch: true });
            toast.success("Image uploaded");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Upload failed");
        } finally {
            setThumbProgress(0);
            setCoverProgress(0);
        }
    };

    const addCelebrity = (celebrityId: string) => {
        if (!celebrityId || relatedCelebritiesValue.includes(celebrityId)) return;
        setValue("relatedCelebrities", [...relatedCelebritiesValue, celebrityId], { shouldValidate: true });
        setNewCelebrity("");
    };

    const removeCelebrity = (celebrityId: string) => {
        setValue("relatedCelebrities", relatedCelebritiesValue.filter(id => id !== celebrityId), { shouldValidate: true });
    };

    const addEvent = (eventId: string) => {
        if (!eventId || relatedEventsValue.includes(eventId)) return;
        setValue("relatedEvents", [...relatedEventsValue, eventId], { shouldValidate: true });
        setNewEvent("");
    };

    const removeEvent = (eventId: string) => {
        setValue("relatedEvents", relatedEventsValue.filter(id => id !== eventId), { shouldValidate: true });
    };

    const getSelectedCelebrity = (id: string) => {
        return celebrities.find(c => c._id === id);
    };

    const getSelectedEvent = (id: string) => {
        return events.find(e => e._id === id);
    };

    const submit: SubmitHandler<UpdateValues> = (data) => onSubmit(data as UpdateBlogPostFormData);

    return (
        <form onSubmit={handleSubmit(submit)} className="space-y-8">
            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <FileText className="h-5 w-5 text-indigo-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Post Title</Label>
                        <Input id="title" {...register("title")} placeholder="Enter post title" />
                        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={categoryValue || ""}
                            onValueChange={(v) => setValue("category", v, { shouldValidate: true })}
                        >
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={statusValue || ""}
                            onValueChange={(v) => setValue("status", v as any, { shouldValidate: true })}
                        >
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-xs text-red-600">{errors.status.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Featured</Label>
                        <div className="flex items-center h-10 px-3 border rounded-md">
                            <Checkbox
                                checked={featured}
                                onCheckedChange={(v) => setValue("isFeatured", !!v, { shouldValidate: true })}
                                id="featured_e"
                            />
                            <Label htmlFor="featured_e" className="ml-2 text-sm text-muted-foreground">
                                Mark as featured
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Active</Label>
                        <div className="flex items-center h-10 px-3 border rounded-md">
                            <Checkbox
                                checked={active}
                                onCheckedChange={(v) => setValue("isActive", !!v, { shouldValidate: true })}
                                id="active_e"
                            />
                            <Label htmlFor="active_e" className="ml-2 text-sm text-muted-foreground">
                                Make post active
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Thumbnail Image</Label>
                        <div className="flex items-center gap-3">
                            <Input type="file" accept="image/*" onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) doUpload(f, "thumbnail");
                            }} />
                            <Button type="button" variant="outline" disabled>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                        {!!thumbnailUrl && (
                            <div className="mt-2 size-24 rounded-md overflow-hidden border">
                                <img src={thumbnailUrl ?? undefined} alt="thumbnail" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {thumbProgress > 0 && <p className="text-xs text-muted-foreground">Uploading… {thumbProgress}%</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div className="flex items-center gap-3">
                            <Input type="file" accept="image/*" onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) doUpload(f, "coverImage");
                            }} />
                            <Button type="button" variant="outline" disabled>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                            </Button>
                        </div>
                        {!!coverUrl && (
                            <div className="mt-2 size-24 rounded-md overflow-hidden border">
                                <img src={coverUrl ?? undefined} alt="cover" className="w-full h-full object-cover" />
                            </div>
                        )}
                        {coverProgress > 0 && <p className="text-xs text-muted-foreground">Uploading… {coverProgress}%</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                        id="excerpt"
                        {...register("excerpt")}
                        placeholder="Brief description of the post"
                        className="min-h-[80px]"
                    />
                    {errors.excerpt && <p className="text-xs text-red-600">{errors.excerpt.message}</p>}
                </div>

                <ChipsInput
                    label="Tags"
                    values={tagValues}
                    onChange={(next) => setValue("tags", next, { shouldValidate: true })}
                    placeholder="Type a tag and press Enter"
                    icon={<TagIcon className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Content</h3>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content">Post Content</Label>
                    <Textarea
                        id="content"
                        {...register("content")}
                        placeholder="Write your blog post content here..."
                        className="min-h-[300px] font-mono text-sm"
                    />
                    {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <Users className="h-5 w-5 text-purple-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">Related Content</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label>Related Celebrities</Label>
                        <Select value={newCelebrity} onValueChange={addCelebrity}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a celebrity" />
                            </SelectTrigger>
                            <SelectContent>
                                {celebrities
                                    .filter(celebrity => !relatedCelebritiesValue.includes(celebrity._id))
                                    .map((celebrity) => (
                                        <SelectItem key={celebrity._id} value={celebrity._id}>
                                            {celebrity.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {relatedCelebritiesValue.map(celebrityId => {
                                const celebrity = getSelectedCelebrity(celebrityId);
                                return celebrity ? (
                                    <Badge key={celebrityId} variant="secondary" className="flex items-center gap-1">
                                        {celebrity.name}
                                        <button
                                            type="button"
                                            className="ml-1 hover:text-red-600"
                                            onClick={() => removeCelebrity(celebrityId)}
                                            aria-label={`Remove ${celebrity.name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Related Events</Label>
                        <Select value={newEvent} onValueChange={addEvent}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events
                                    .filter(event => !relatedEventsValue.includes(event._id))
                                    .map((event) => (
                                        <SelectItem key={event._id} value={event._id}>
                                            {event.title}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {relatedEventsValue.map(eventId => {
                                const event = getSelectedEvent(eventId);
                                return event ? (
                                    <Badge key={eventId} variant="secondary" className="flex items-center gap-1">
                                        {event.title}
                                        <button
                                            type="button"
                                            className="ml-1 hover:text-red-600"
                                            onClick={() => removeEvent(eventId)}
                                            aria-label={`Remove ${event.title}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
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

type ConfirmState = {
    open: boolean;
    tone?: "danger" | "default";
    title: React.ReactNode;
    onYes?: () => Promise<void> | void;
    confirming?: boolean;
};

export default function ManageBlogPostsPage() {
    const [items, setItems] = useState<BlogPost[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [onlyActive, setOnlyActive] = useState(true);

    const [events, setEvents] = useState<Event[]>([]);
    const [celebrities, setCelebrities] = useState<Celebrity[]>([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);

    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selected, setSelected] = useState<BlogPost | null>(null);

    const [confirm, setConfirm] = useState<ConfirmState>({
        open: false,
        title: <></>,
        tone: "default",
        confirming: false,
    });

    const loadBlogPosts = async () => {
        try {
            setLoading(true);
            const res = await AdminBlogPostsApi.list({
                page,
                limit,
                search: searchTerm || undefined,
                category: category || undefined,
                status: status as any,
                onlyActive,
            });
            setItems(res.items);
            setTotal(res.total);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to load blog posts");
        } finally {
            setLoading(false);
        }
    };

    const loadAllEvents = async () => {
    let allEvents: Event[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        const res = await AdminEventsApi.list({ 
            limit: 100, 
            page, 
            onlyActive: true 
        });
        allEvents = [...allEvents, ...res.items];
        hasMore = res.items.length === 100; 
        page++;
    }
    
    return allEvents;
};

const loadRelatedData = async () => {
    try {
        setLoadingData(true);
        const [eventsRes, celebritiesRes] = await Promise.all([
            loadAllEvents(),
            AdminCelebritiesApi.list({ limit: 100 }) 
        ]);
        setEvents(eventsRes);
        setCelebrities(celebritiesRes.items);
    } catch (err: any) {
        console.log("Failed to load related data", err);
        toast.error("Failed to load related data");
    } finally {
        setLoadingData(false);
    }
};

    useEffect(() => {
        loadBlogPosts();
        loadRelatedData();
    }, [page, limit, searchTerm, category, status, onlyActive]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const [submittingCreate, setSubmittingCreate] = useState(false);
    const handleCreate = (data: CreateBlogPostFormData) => {
        setConfirm({
            open: true,
            title: <>Create this blog post?</>,
            onYes: async () => {
                try {
                    setSubmittingCreate(true);
                    const created = await AdminBlogPostsApi.create(data);
                    toast.success("Blog post created successfully");
                    setCreateOpen(false);
                    setPage(1);
                    await loadBlogPosts();
                    setSelected(created);
                    setDetailsOpen(true);
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || err?.message || "Create failed");
                } finally {
                    setSubmittingCreate(false);
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const [submittingEdit, setSubmittingEdit] = useState(false);
    const startEdit = (post: BlogPost) => {
        setSelected(post);
        setEditOpen(true);
    };

    const handleEdit = (data: UpdateBlogPostFormData) => {
        if (!selected?._id) return;
        setConfirm({
            open: true,
            title: <>Save changes to "{selected.title}"?</>,
            onYes: async () => {
                try {
                    setSubmittingEdit(true);
                    const updated = await AdminBlogPostsApi.update(selected._id, data);
                    toast.success("Blog post updated successfully");
                    setEditOpen(false);
                    setItems((prev) => prev.map((it) => (it._id === updated._id ? updated : it)));
                    setSelected(updated);
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || err?.message || "Update failed");
                } finally {
                    setSubmittingEdit(false);
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const removePost = (post: BlogPost) => {
        setConfirm({
            open: true,
            tone: "danger",
            title: <>Delete "{post.title}"? This cannot be undone.</>,
            onYes: async () => {
                try {
                    await AdminBlogPostsApi.remove(post._id);
                    toast.success("Blog post deleted successfully");
                    await loadBlogPosts();
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || err?.message || "Delete failed");
                } finally {
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const requestToggleActive = (post: BlogPost) => {
        const willActivate = !post.isActive;
        setConfirm({
            open: true,
            tone: willActivate ? "default" : "danger",
            title: willActivate
                ? <>Activate "{post.title}"?</>
                : <>Deactivate "{post.title}"? Users will no longer see it in listings.</>,
            onYes: async () => {
                try {
                    const updated = await AdminBlogPostsApi.update(post._id, { isActive: willActivate } as UpdateBlogPostFormData);
                    setItems((prev) => prev.map((x) => (x._id === post._id ? updated : x)));
                    toast.success(willActivate ? "Blog post activated" : "Blog post deactivated");
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || err?.message || "Toggle failed");
                } finally {
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const updatePostStatus = (post: BlogPost, newStatus: z.infer<typeof BlogPostStatusEnum>) => {
        setConfirm({
            open: true,
            tone: newStatus === "archived" ? "danger" : "default",
            title: <>Change "{post.title}" status to {newStatus}?</>,
            onYes: async () => {
                try {
                    const updated = await AdminBlogPostsApi.update(post._id, { status: newStatus } as UpdateBlogPostFormData);
                    setItems((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
                    toast.success(`Blog post status updated to ${newStatus}`);
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || err?.message || "Status update failed");
                } finally {
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const toggleFeatured = (post: BlogPost) => {
        const willFeature = !post.isFeatured;
        setConfirm({
            open: true,
            title: willFeature
                ? <>Feature "{post.title}" on the homepage?</>
                : <>Remove "{post.title}" from featured posts?</>,
            onYes: async () => {
                try {
                    const updated = await AdminBlogPostsApi.update(post._id, { isFeatured: willFeature } as UpdateBlogPostFormData);
                    setItems((prev) => prev.map((p) => (p._id === post._id ? updated : p)));
                    toast.success(willFeature ? "Blog post featured" : "Blog post unfeatured");
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || err?.message || "Feature toggle failed");
                } finally {
                    setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
                }
            },
        });
    };

    const sharePost = async (post: BlogPost) => {
        const url = typeof window !== "undefined" ? `${location.origin}/blog/${post.slug}` : post.slug;
        const shareData = { title: post.title, text: post.excerpt || post.title, url };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Blog post link copied");
            }
        } catch {
            // no-op
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setCategory(undefined);
        setStatus(undefined);
        setOnlyActive(true);
        setPage(1);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "published": return "bg-green-100 text-green-800 border-green-200";
            case "draft": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "archived": return "bg-zinc-100 text-zinc-800 border-zinc-200";
            default: return "bg-zinc-100 text-zinc-800 border-zinc-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "published": return <Eye className="h-3 w-3" />;
            case "draft": return <EyeOff className="h-3 w-3" />;
            case "archived": return <Archive className="h-3 w-3" />;
            default: return <FileText className="h-3 w-3" />;
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
                            title="Manage Blog Posts"
                            subtitle="Create, edit, and manage all blog content"
                            actionButton={{
                                text: "Create Post",
                                icon: <PlusIcon className="size-4" />,
                                onClick: () => setCreateOpen(true),
                            }}
                        />

                        <BlogPostStatsCards posts={items} />

                        <BlogPostFilters
                            searchTerm={searchTerm}
                            onSearchChange={(value) => { setPage(1); setSearchTerm(value); }}
                            category={category}
                            onCategoryChange={(value) => { setPage(1); setCategory(value === "all" ? undefined : value); }}
                            status={status}
                            onStatusChange={(value) => { setPage(1); setStatus(value === "all" ? undefined : value); }}
                            onlyActive={onlyActive}
                            onOnlyActiveChange={(value) => { setPage(1); setOnlyActive(value); }}
                            limit={limit}
                            onLimitChange={(value) => { setPage(1); setLimit(value); }}
                            onClearFilters={clearFilters}
                        />

                        <Card className="bg-white">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-indigo-900">Blog Posts</CardTitle>
                                        <CardDescription>
                                            {items.length} posts found
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
                                                    Post
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Category
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Status
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Views
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
                                                    Created
                                                </TableHead>
                                                <TableHead className="text-indigo-900 font-semibold text-xs sm:text-sm">
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
                                                            Loading posts...
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : items.map((post) => (
                                                <TableRow key={post._id} className="hover:bg-zinc-50">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-12 rounded-lg overflow-hidden border-2 border-zinc-200">
                                                                <img
                                                                    src={post.thumbnail || "/placeholder.svg"}
                                                                    alt={post.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">{post.title}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {post.isFeatured && (
                                                                        <Badge variant="outline" className="text-xs border-amber-700 text-amber-800">
                                                                            Featured
                                                                        </Badge>
                                                                    )}
                                                                    {post.isActive ? (
                                                                        <Badge variant="outline" className="text-xs border-green-700 text-green-800">
                                                                            Active
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-xs border-zinc-400 text-zinc-700">
                                                                            Inactive
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                {post.excerpt && (
                                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                        {post.excerpt}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs">
                                                            {post.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={`text-xs flex items-center gap-1 ${getStatusColor(post.status)}`}>
                                                            {getStatusIcon(post.status)}
                                                            {post.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3 text-muted-foreground" />
                                                            <span className="font-mono text-sm">{post.views || 0}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {new Date(post.createdAt).toLocaleDateString()}
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
                                                                    onClick={() => { setSelected(post); setDetailsOpen(true); }}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => startEdit(post)}
                                                                >
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit Post
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => sharePost(post)}
                                                                >
                                                                    <Share2 className="w-4 h-4 mr-2" />
                                                                    Share
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    onClick={() => removePost(post)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete Post
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {!loading && items.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="text-zinc-500 mb-2">No blog posts found</div>
                                        <div className="text-sm text-zinc-400">
                                            Try adjusting your filters or search terms
                                        </div>
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="text-sm text-zinc-500">
                                            Page {page} of {totalPages} • {total} total posts
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

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Create New Blog Post</DialogTitle>
                    </DialogHeader>
                    <CreateBlogPostForm
                        submitting={submittingCreate}
                        onSubmit={handleCreate}
                        onCancel={() => setCreateOpen(false)}
                        events={events}
                        celebrities={celebrities}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Edit Blog Post</DialogTitle>
                    </DialogHeader>
                    {selected && (
                        <EditBlogPostForm
                            defaultValues={selected as any}
                            submitting={submittingEdit}
                            onSubmit={handleEdit}
                            onCancel={() => setEditOpen(false)}
                            events={events}
                            celebrities={celebrities}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <AdminBlogPostDetailsModal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                post={selected}
                events={events}
                celebrities={celebrities}
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
                    setConfirm((c) => ({ ...c, confirming: false, open: false, onYes: undefined }));
                }}
            />
        </SidebarProvider>
    );
}