"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
// NOTE: Link removed; we compute parent path instead
import { useParams, useRouter, usePathname } from "next/navigation";
import {
    ChevronLeft,
    Flame,
    TrendingUp,
    CheckCircle2,
    Star,
    Eye,
    Share2,
    Sparkles,
    Shield,
    Award,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { CelebritiesApi, type Celebrity } from "@/api/celebrities.api";
import { BookingsApi, type Booking } from "@/api/bookings.api";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    CreateBookingSchema,
    type CreateBookingFormData,
    BookingQuerySchema,
} from "@/utils/schemas/schemas";
import { toast } from "sonner";

// ---------------- helpers ----------------
const fmtMoney = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        n || 0
    );

const fmtDateTime = (s?: string) => (s ? new Date(s).toLocaleString() : "—");

// lightweight share button with graceful clipboard fallback
function ShareBtn({ url, title }: { url: string; title: string }) {
    const [busy, setBusy] = useState(false);
    const share = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ url, title, text: title });
                return;
            }
            setBusy(true);
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard");
        } catch (e: any) {
            toast.error(e?.message || "Unable to share");
        } finally {
            setBusy(false);
        }
    };
    return (
        <Button variant="outline" size="sm" onClick={share} disabled={busy}>
            {busy ? (
                <>
                    <span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Copying…
                </>
            ) : (
                <>
                    <div className="text-white flex">
                        <Share2 className="mr-2 size-4" /> Share
                    </div>
                </>
            )}
        </Button>
    );
}

// ---------------- page ----------------
export default function CelebrityDetailPage() {
    const params = useParams<{ slugOrId: string }>();
    const router = useRouter();
    const pathname = usePathname();
    const idOrSlug = params?.slugOrId;

    // Compute parent path by removing the last segment (slug/id) from current URL
    const parentPath = useMemo(() => {
        const parts = (pathname || "/").split("/").filter(Boolean);
        parts.pop(); // remove slug/id
        const base = "/" + parts.join("/");
        return base || "/";
    }, [pathname]);

    const [item, setItem] = useState<Celebrity | null>(null);
    const [loading, setLoading] = useState(true);
    const [views, setViews] = useState(0);

    // dialogs
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // preferred date/time kept outside schema; appended to notes on submit
    const [preferredDate, setPreferredDate] = useState<string>("");
    const [preferredTime, setPreferredTime] = useState<string>("");

    // fetch celebrity by slug or id
    const loadCelebrity = async () => {
        setLoading(true);
        try {
            let c: Celebrity | null = null;
            try {
                c = await CelebritiesApi.getBySlug(idOrSlug);
            } catch { }
            if (!c) c = await CelebritiesApi.getById(idOrSlug);
            setItem(c);
            setViews(c?.views ?? 0);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || e?.message || "Not found");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idOrSlug) loadCelebrity();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idOrSlug]);

    // live views tick
    useEffect(() => {
        if (!item) return;
        const t = setInterval(
            () => setViews((v) => v + Math.floor(Math.random() * 5)),
            3000
        );
        return () => clearInterval(t);
    }, [item]);

    // ------------- booking form -------------
    const bookingTypes = useMemo(() => item?.bookingTypes ?? [], [item]);

    const form = useForm<CreateBookingFormData>({
        resolver: zodResolver(CreateBookingSchema),
        defaultValues: {
            celebrity: item?._id ?? "",
            bookingTypeId: "",
            quantity: 1,
            notes: "",
        },
        mode: "onChange",
    });

    // initialize form when item ready
    useEffect(() => {
        const firstId = (bookingTypes[0] as any)?._id || "";
        form.reset({
            celebrity: item?._id ?? "",
            bookingTypeId: firstId, // ✅ non-empty value fixes Select.Item error
            quantity: 1,
            notes: "",
        } as any);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item?._id]);

    const selectedType = useMemo(
        () => bookingTypes.find((bt: any) => bt._id === form.watch("bookingTypeId")),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [bookingTypes, form.watch("bookingTypeId")]
    );

    const total = useMemo(() => {
        const qty = Number(form.watch("quantity") || 1);
        return (selectedType?.price ?? 0) * qty;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType, form.watch("quantity")]);

    // create booking (notes augmented with preferred date/time)
    const doCreate = async (raw: CreateBookingFormData) => {
        const merged: CreateBookingFormData = {
            ...raw,
            notes: [
                raw?.notes?.trim?.() || "",
                preferredDate ? `Preferred date: ${preferredDate}` : "",
                preferredTime ? `Preferred time: ${preferredTime}` : "",
            ]
                .filter(Boolean)
                .join(" | "),
        };
        const payload = CreateBookingSchema.parse(merged);
        setCreating(true);
        try {
            await BookingsApi.create(payload);
            setConfirmOpen(false);
            setSuccessOpen(true);
            // refresh my bookings list
            loadMine(1, mineLimit);
            toast.success("Booking created");
        } catch (e: any) {
            toast.error(
                e?.response?.data?.message || e?.message || "Failed to create booking"
            );
        } finally {
            setCreating(false);
        }
    };

    // ------------- my bookings -------------
    const [mine, setMine] = useState<Booking[]>([]);
    const [mineLoading, setMineLoading] = useState(false);
    const [minePage, setMinePage] = useState(1);
    const [mineLimit, setMineLimit] = useState(10);
    const [mineTotal, setMineTotal] = useState(0);

    const loadMine = async (page = minePage, limit = mineLimit) => {
        if (!item?._id) return;
        setMineLoading(true);
        try {
            const q = BookingQuerySchema.partial().parse({
                celebrityId: item._id,
                page,
                limit,
            });
            const res = await BookingsApi.listMine(q);
            setMine(res.items || []);
            setMineTotal(res.total || 0);
        } catch (e: any) {
            toast.error(
                e?.response?.data?.message || e?.message || "Failed to load bookings"
            );
        } finally {
            setMineLoading(false);
        }
    };

    useEffect(() => {
        if (item?._id) loadMine(1, mineLimit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item?._id]);

    useEffect(() => {
        if (item?._id) loadMine(minePage, mineLimit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [minePage, mineLimit]);

    if (loading) {
        return (
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="p-6">Loading…</div>
                </SidebarInset>
            </SidebarProvider>
        );
    }
    if (!item) {
        return (
            <SidebarProvider>
                <AppSidebar variant="inset" />
                <SidebarInset>
                    <SiteHeader />
                    <div className="p-6">Celebrity not found</div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    const href = `/celebrities/${item.slug || item._id}`;
    const shareUrl =
        typeof window !== "undefined" ? `${window.location.origin}${href}` : href;

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col bg-zinc-100">
                    <div className="@container/main flex flex-1 flex-col gap-4 px-3 py-4">
                        {/* Back — remove slug from current URL */}
                        <div className="px-3 sm:px-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() => router.push(parentPath)}
                            >
                                <ChevronLeft className="size-4" />
                                Back
                            </Button>
                        </div>

                        {/* Hero */}
                        <div className="px-3 sm:px-6">
                            <Card className="overflow-hidden border-2 bg-white">
                                <div className="relative h-64 bg-zinc-800">
                                    <img
                                        src={item.coverImage || "/placeholder.svg"}
                                        alt="Cover"
                                        className="h-full w-full object-cover opacity-60"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute right-4 top-4 flex gap-2">
                                        {item.hot && (
                                            <Badge className="border-0 bg-orange-500 text-white">
                                                <Flame className="mr-1 size-3" />
                                                Hot
                                            </Badge>
                                        )}
                                        {item.trending && (
                                            <Badge className="border-0 bg-emerald-900 text-white">
                                                <TrendingUp className="mr-1 size-3" />
                                                Trending
                                            </Badge>
                                        )}
                                        {item.verified && (
                                            <Badge className="border-0 bg-blue-500 text-white">
                                                <CheckCircle2 className="mr-1 size-3" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <CardContent className="pt-0">
                                    <div className="relative z-10 -mt-20 flex flex-col gap-6 md:flex-row">
                                        {/* avatar */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={item.image || "/placeholder.svg"}
                                                alt={item.name}
                                                className="size-40 rounded-2xl border-4 border-white object-cover"
                                            />
                                        </div>

                                        {/* info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h1 className="mb-1 text-3xl font-bold text-white md:text-4xl">
                                                        {item.name}
                                                    </h1>

                                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                                        {(item.tags || []).slice(0, 6).map((t, i) => (
                                                            <Badge
                                                                key={i}
                                                                variant="outline"
                                                                className="bg-emerald-50 text-emerald-900 outline-emerald-900"
                                                            >
                                                                {t}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    {/* <div className="flex flex-wrap items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="size-4 fill-yellow-500 text-yellow-500" />
                                                            <span className="font-semibold text-white">
                                                                {item.rating?.toFixed?.(1) ?? item.rating ?? "—"}
                                                            </span>
                                                            <span className="text-zinc-300">
                                                                ({item.totalReviews ?? 0} reviews)
                                                            </span>
                                                        </div>
                                                        <Separator orientation="vertical" className="h-4 bg-white/40" />
                                                        <div className="flex items-center gap-1">
                                                            <Eye className="size-4 text-white" />
                                                            <span className="text-zinc-100">
                                                                {views.toLocaleString()} views
                                                            </span>
                                                        </div>
                                                    </div> */}
                                                </div>

                                                <ShareBtn url={shareUrl} title={`Book ${item.name}`} />
                                            </div>

                                            {item.description && (
                                                <p className="mt-4">{item.description}</p>
                                            )}

                                            {/* QUICK STATS — exact colors from the first design */}
                                            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                                                <div className="rounded-xl border-2 border-emerald-900/20 bg-gradient-to-br from-emerald-50 to-white p-4">
                                                    <p className="mb-1 text-xs font-mono uppercase tracking-wider text-emerald-900/70">
                                                        Category
                                                    </p>
                                                    <p className="font-mono text-2xl font-bold text-emerald-900">
                                                        {item.category || "—"}
                                                    </p>
                                                </div>
                                                <div className="rounded-xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-white p-4">
                                                    <p className="mb-1 text-xs font-mono uppercase tracking-wider text-blue-900/70">
                                                        Base Price
                                                    </p>
                                                    <p className="font-mono text-2xl font-bold text-blue-900">
                                                        {fmtMoney(item.basePrice || 0)}
                                                    </p>
                                                </div>
                                                <div className="rounded-xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-white p-4">
                                                    <p className="mb-1 text-xs font-mono uppercase tracking-wider text-purple-900/70">
                                                        Availability
                                                    </p>
                                                    <p className="font-mono text-2xl font-bold text-purple-900">
                                                        {item.availability || "—"}
                                                    </p>
                                                </div>
                                                <div className="rounded-xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-50 to-white p-4">
                                                    <p className="mb-1 text-xs font-mono uppercase tracking-wider text-orange-900/70">
                                                        Response Time
                                                    </p>
                                                    <p className="font-mono text-2xl font-bold text-orange-900">
                                                        {item.responseTime || "—"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info tabs (Reviews removed) */}
                        <div className="px-3 sm:px-6">
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                                    <TabsTrigger value="overview" className="rounded-lg">
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value="achievements" className="rounded-lg">
                                        Achievements
                                    </TabsTrigger>
                                    <TabsTrigger value="availability" className="rounded-lg">
                                        Availability
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>About</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <p className="leading-relaxed text-zinc-600">
                                                {item.description || "—"}
                                            </p>
                                            <Separator />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="mb-1 text-sm font-medium text-zinc-500">
                                                        Category
                                                    </div>
                                                    <div className="font-semibold">{item.category}</div>
                                                </div>
                                                <div>
                                                    <div className="mb-1 text-sm font-medium text-zinc-500">
                                                        Response Time
                                                    </div>
                                                    <div className="font-semibold">
                                                        {item.responseTime || "—"}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="mb-1 text-sm font-medium text-zinc-500">
                                                        Availability
                                                    </div>
                                                    <Badge className="bg-green-500 text-white">
                                                        {item.availability || "—"}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <div className="mb-1 text-sm font-medium text-zinc-500">
                                                        Verification
                                                    </div>
                                                    <div className="flex items-center gap-1 font-semibold">
                                                        <CheckCircle2 className="size-4 text-blue-500" />
                                                        {item.verified ? "Verified" : "Unverified"}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="achievements" className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Achievements & Awards</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {(item.achievements || []).length ? (
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {item.achievements!.map((achievement, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-3 rounded-xl border-2 border-amber-500/20 bg-gradient-to-br from-amber-50 to-white p-4"
                                                        >
                                                            <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500">
                                                                <Award className="size-6 text-white" />
                                                            </div>
                                                            <p className="text-sm font-semibold">{achievement}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-zinc-500">—</div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="availability" className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Booking Availability</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {(item.bookingTypes || []).map((bt: any) => (
                                                <div
                                                    key={bt._id}
                                                    className="rounded-xl border-2 p-4 transition-colors hover:border-emerald-900/50"
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <div>
                                                            <div className="font-semibold">{bt.name}</div>
                                                            <div className="text-sm text-zinc-600">
                                                                {bt.duration}
                                                            </div>
                                                        </div>
                                                        <Badge
                                                            className={`text-white ${bt.availability > 10
                                                                    ? "bg-green-500"
                                                                    : bt.availability > 5
                                                                        ? "bg-yellow-500"
                                                                        : "bg-red-500"
                                                                }`}
                                                        >
                                                            {bt.availability ?? 0} slots left
                                                        </Badge>
                                                    </div>
                                                    <div className="text-sm text-zinc-600">
                                                        {bt.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Booking section (designer layout) */}
                        <div className="px-3 sm:px-6">
                            <Card className="border-2 border-emerald-900/20 bg-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="size-5 text-emerald-900" />
                                        Book Now
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                        {/* Left: selectable packages */}
                                        <div className="space-y-4">
                                            <Label className="mb-2 block text-sm font-semibold">
                                                Select Booking Type
                                            </Label>
                                            <div className="space-y-3">
                                                {(item.bookingTypes || []).map((bt: any) => {
                                                    const isActive =
                                                        form.watch("bookingTypeId") === bt._id;
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={bt._id}
                                                            onClick={() =>
                                                                form.setValue("bookingTypeId", bt._id, {
                                                                    shouldValidate: true,
                                                                    shouldDirty: true,
                                                                })
                                                            }
                                                            className={[
                                                                "w-full rounded-xl border-2 p-3 text-left transition-all",
                                                                isActive
                                                                    ? "border-emerald-900 bg-emerald-50"
                                                                    : "border-border hover:border-emerald-900/50",
                                                            ].join(" ")}
                                                        >
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <div className="font-semibold">{bt.name}</div>
                                                                {bt.popular && (
                                                                    <Badge className="bg-emerald-900 text-xs text-white">
                                                                        Popular
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="mb-2 text-xs text-zinc-600">
                                                                {bt.duration}
                                                            </div>
                                                            <div className="font-mono text-lg font-bold text-emerald-900">
                                                                {fmtMoney(bt.price)}
                                                            </div>
                                                            <div className="mt-2 flex items-center gap-2 text-xs">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={
                                                                        bt.availability > 10
                                                                            ? "border-green-500 text-green-700"
                                                                            : bt.availability > 5
                                                                                ? "border-yellow-500 text-yellow-700"
                                                                                : "border-red-500 text-red-700"
                                                                    }
                                                                >
                                                                    {bt.availability ?? 0} slots left
                                                                </Badge>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Included features */}
                                            {selectedType?.features?.length ? (
                                                <div className="rounded-xl bg-muted/50 p-4">
                                                    <div className="mb-3 text-sm font-semibold">
                                                        What’s Included
                                                    </div>
                                                    <ul className="space-y-2 text-sm">
                                                        {selectedType.features.map((f: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <CheckCircle2 className="mt-0.5 size-4 text-emerald-900" />
                                                                <span>{f}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Right: form & summary */}
                                        <div className="space-y-6">
                                            {/* Form core fields (schema-compliant) */}
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <Label>Booking Type *</Label>
                                                        <Controller
                                                            name="bookingTypeId"
                                                            control={form.control}
                                                            render={({ field }) => (
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="mt-2 rounded-xl">
                                                                        <SelectValue placeholder="Select type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {(item.bookingTypes || []).map((bt: any) => (
                                                                            <SelectItem
                                                                                key={bt._id}
                                                                                value={bt._id /* ✅ non-empty */}
                                                                            >
                                                                                {bt.name} • {bt.duration} •{" "}
                                                                                {fmtMoney(bt.price)}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {form.formState.errors.bookingTypeId && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                {form.formState.errors.bookingTypeId.message}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <Label>Quantity *</Label>
                                                        <Controller
                                                            name="quantity"
                                                            control={form.control}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    min={1}
                                                                    value={String(field.value ?? 1)}
                                                                    onChange={(e) =>
                                                                        field.onChange(Number(e.target.value))
                                                                    }
                                                                    className="mt-2 rounded-xl"
                                                                />
                                                            )}
                                                        />
                                                        {form.formState.errors.quantity && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                {form.formState.errors.quantity.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* UI-only preferred date/time (folded into notes on submit) */}
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <Label>Preferred Date</Label>
                                                        <Input
                                                            type="date"
                                                            value={preferredDate}
                                                            onChange={(e) => setPreferredDate(e.target.value)}
                                                            className="mt-2 rounded-xl"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Preferred Time</Label>
                                                        <Select
                                                            value={preferredTime}
                                                            onValueChange={setPreferredTime}
                                                        >
                                                            <SelectTrigger className="mt-2 rounded-xl">
                                                                <SelectValue placeholder="Select time" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="morning">
                                                                    Morning (9AM–12PM)
                                                                </SelectItem>
                                                                <SelectItem value="afternoon">
                                                                    Afternoon (12PM–5PM)
                                                                </SelectItem>
                                                                <SelectItem value="evening">
                                                                    Evening (5PM–9PM)
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label>Special Requests</Label>
                                                    <Controller
                                                        name="notes"
                                                        control={form.control}
                                                        render={({ field }) => (
                                                            <Textarea
                                                                {...field}
                                                                rows={3}
                                                                placeholder="Any special requests or details…"
                                                                className="mt-2 rounded-xl"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            {/* Price summary */}
                                            <div className="rounded-xl bg-muted/30 p-4">
                                                <div className="mb-3 text-sm font-semibold">
                                                    Price Summary
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-zinc-600">
                                                            {selectedType?.name || "—"}
                                                        </span>
                                                        <span className="font-mono font-semibold">
                                                            {fmtMoney(selectedType?.price || 0)}
                                                        </span>
                                                    </div>
                                                    <Separator className="my-2" />
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold">Total</span>
                                                        <span className="font-mono text-xl font-bold text-emerald-900">
                                                            {fmtMoney(total)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Book button */}
                                            <Button
                                                className="w-full rounded-xl bg-emerald-900 py-4 text-lg text-white hover:bg-emerald-800 disabled:opacity-50"
                                                size="lg"
                                                onClick={() => setConfirmOpen(true)}
                                                disabled={!form.watch("bookingTypeId") || creating}
                                            >
                                                <Sparkles className="mr-2 size-5" />
                                                Confirm Booking
                                            </Button>

                                            {/* Security note */}
                                            <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                                                <Shield className="size-4 flex-shrink-0 text-blue-600" />
                                                <p className="text-xs text-blue-900">
                                                    Your booking is protected. Full refund if the
                                                    celebrity cancels.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* My bookings table (for this celebrity) */}
                        <div className="px-3 sm:px-6">
                            <Card className="border-2">
                                <CardHeader>
                                    <CardTitle>My Bookings for {item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-zinc-50">
                                                <tr>
                                                    <th className="p-2 text-left">ID</th>
                                                    <th className="p-2 text-left">Type</th>
                                                    <th className="p-2 text-left">Qty</th>
                                                    <th className="p-2 text-left">Total</th>
                                                    <th className="p-2 text-left">Status</th>
                                                    <th className="p-2 text-left">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mineLoading ? (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="py-8 text-center text-zinc-500"
                                                        >
                                                            Loading…
                                                        </td>
                                                    </tr>
                                                ) : mine.length === 0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={6}
                                                            className="py-8 text-center text-zinc-500"
                                                        >
                                                            No bookings yet
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    mine.map((m) => (
                                                        <tr key={m._id} className="border-t">
                                                            <td className="p-2 font-mono text-xs">{m._id}</td>
                                                            <td className="p-2">{m.bookingTypeName}</td>
                                                            <td className="p-2">{m.quantity}</td>
                                                            <td className="p-2">{fmtMoney(m.totalAmount)}</td>
                                                            <td className="p-2">
                                                                <Badge variant="outline" className="uppercase">
                                                                    {m.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-2">{fmtDateTime(m.createdAt)}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-sm text-zinc-600">Total: {mineTotal}</div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setMinePage((p) => Math.max(1, p - 1))}
                                                disabled={minePage <= 1}
                                            >
                                                Prev
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setMinePage((p) => p + 1)}
                                                disabled={minePage * mineLimit >= mineTotal}
                                            >
                                                Next
                                            </Button>

                                            <Select
                                                value={String(mineLimit)}
                                                onValueChange={(v) => {
                                                    const l = Number(v);
                                                    setMineLimit(l);
                                                    setMinePage(1);
                                                }}
                                            >
                                                <SelectTrigger className="h-9 w-[120px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[10, 20, 30].map((n) => (
                                                        <SelectItem key={n} value={String(n)}>
                                                            {n} / page
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>

            {/* Confirm booking dialog */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="size-5 text-emerald-900" />
                            Confirm Booking
                        </DialogTitle>
                        <DialogDescription>
                            Review your details before confirming.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="rounded-xl bg-muted/50 p-4">
                            <div className="mb-2 font-semibold">Booking Details</div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Celebrity:</span>
                                    <span className="font-medium">{item.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Package:</span>
                                    <span className="font-medium">{selectedType?.name || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span className="font-medium">
                                        {selectedType?.duration || "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Quantity:</span>
                                    <span className="font-medium">
                                        {form.getValues("quantity") || 1}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Preferred Date:</span>
                                    <span className="font-medium">{preferredDate || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Preferred Time:</span>
                                    <span className="font-medium">{preferredTime || "—"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <div className="mb-2 font-semibold text-blue-900">
                                Payment Summary
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span>Package Price:</span>
                                    <span className="font-mono">{fmtMoney(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-emerald-900 text-white hover:bg-emerald-800"
                            disabled={creating}
                            onClick={form.handleSubmit((raw) => doCreate(raw))}
                        >
                            {creating ? (
                                <>
                                    <span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating…
                                </>
                            ) : (
                                "Confirm"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success dialog */}
            <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-emerald-900">
                            Booking Confirmed
                        </DialogTitle>
                        <DialogDescription>
                            You’ll receive a confirmation email with next steps.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            className="w-full bg-emerald-900 text-white hover:bg-emerald-800"
                            onClick={() => setSuccessOpen(false)}
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    );
}
