"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useFieldArray,
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
  Calendar,
  Users,
  PlusIcon,
  Edit,
  Trash2,
  Search,
  MapPin,
  DollarSign,
  Eye,
  Share2,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
  Tag as TagIcon,
  Star,
  Flame,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Filter,
  RefreshCw,
  Download,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

import {
  AdminEventsApi,
  type Event,
} from "@/api/events.api";
import { AdminTicketsApi, type Ticket } from "@/api/tickets.api";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";

import {
  CreateEventSchema,
  UpdateEventSchema,
  type CreateEventFormData,
  type UpdateEventFormData,
  EventAvailabilityEnum,
  TicketTypeUpdateSchema,
  TicketStatusEnum,
  AdminUpdateTicketStatusSchema,
  type AdminUpdateTicketStatusFormData,
} from "@/utils/schemas/schemas";

/* ----------------------------------------------------------------------------
 * Local helpers & types
 * --------------------------------------------------------------------------*/

type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

const categories = [
  "Music",
  "Technology",
  "Art",
  "Food & Drink",
  "Entertainment",
  "Sports & Fitness",
  "Business",
  "Education",
];

const availabilityOptions = EventAvailabilityEnum.options;

// Use z.output to match what zodResolver returns after defaults/coercions.
type CreateValues = z.output<typeof CreateEventSchema>;
type UpdateValues = z.output<typeof UpdateEventSchema>;

// Narrow resolvers to the exact shapes to avoid RHF "Resolver mismatch" errors.
const createResolver = zodResolver(CreateEventSchema) as Resolver<CreateValues>;
const updateResolver = zodResolver(UpdateEventSchema) as Resolver<UpdateValues>;

// Chips Input Component (reused from original)
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

// Stats Cards Component
function EventStatsCards({ events }: { events: Event[] }) {
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.isActive).length;
  const featuredEvents = events.filter(e => e.featured).length;
  const totalRevenue = events.reduce((sum, event) => {
    const ticketsSold = event.ticketsSold || 0;
    const basePrice = event.basePrice || 0;
    return sum + (ticketsSold * basePrice);
  }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
            <Calendar className="size-5 text-emerald-900" />
          </div>
          <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
            {totalEvents}
          </Badge>
        </div>
        <p className="text-xs font-mono text-zinc-600 mb-1">
          TOTAL EVENTS
        </p>
        <p className="text-2xl font-bold text-emerald-900">
          {totalEvents}
        </p>
      </Card>

      <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
            <CheckCircle2 className="size-5 text-emerald-900" />
          </div>
          <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
            {Math.round((activeEvents / totalEvents) * 100)}%
          </Badge>
        </div>
        <p className="text-xs font-mono text-zinc-600 mb-1">
          ACTIVE EVENTS
        </p>
        <p className="text-2xl font-bold text-emerald-900">
          {activeEvents}
        </p>
      </Card>

      <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
            <Star className="size-5 text-emerald-900" />
          </div>
          <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
            {featuredEvents}
          </Badge>
        </div>
        <p className="text-xs font-mono text-zinc-600 mb-1">
          FEATURED EVENTS
        </p>
        <p className="text-2xl font-bold text-emerald-900">
          {featuredEvents}
        </p>
      </Card>

      <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
            <TrendingUp className="size-5 text-emerald-900" />
          </div>
          <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
            ${(totalRevenue / 1000).toFixed(0)}K
          </Badge>
        </div>
        <p className="text-xs font-mono text-zinc-600 mb-1">
          TOTAL REVENUE
        </p>
        <p className="text-2xl font-bold text-emerald-900">
          ${totalRevenue.toLocaleString()}
        </p>
      </Card>
    </div>
  );
}

// Enhanced Filters Component
function EventFilters({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
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
  onlyActive: boolean;
  onOnlyActiveChange: (value: boolean) => void;
  limit: number;
  onLimitChange: (value: number) => void;
  onClearFilters: () => void;
}) {
  return (
    <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
      <CardHeader>
        <CardTitle className="text-emerald-900">
          Filters & Search
        </CardTitle>
        <CardDescription>
          Filter events by category, status, and search terms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-zinc-50 focus:border-emerald-500 w-full"
            />
          </div>

          <Select value={category || "all"} onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-zinc-50 focus:border-emerald-500 w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select
            value={onlyActive ? "active" : "all"}
            onValueChange={(v) => onOnlyActiveChange(v === "active")}
          >
            <SelectTrigger className="bg-zinc-50 focus:border-emerald-500 w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Only Active</SelectItem>
              <SelectItem value="all">All Events</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={limit.toString()}
            onValueChange={(v) => onLimitChange(Number(v))}
          >
            <SelectTrigger className="bg-zinc-50 focus:border-emerald-500 w-full">
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
            className="bg-zinc-50 focus:border-emerald-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ----------------------------------------------------------------------------
 * Admin: Event Details modal + ticket history
 * --------------------------------------------------------------------------*/
function AdminEventDetailsModal({
  open,
  onOpenChange,
  event,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: Event | null;
}) {
  const [tickets, setTickets] = useState<Paginated<Ticket> | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTickets = async () => {
    if (!event?._id) return;
    try {
      setLoading(true);
      const res = await AdminTicketsApi.list({ page, limit, eventId: event._id });
      setTickets(res);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page, limit, event?._id]);

  const handleUpdateStatus = async (id: string, status: z.infer<typeof TicketStatusEnum>) => {
    try {
      setUpdatingId(id);
      const payload: AdminUpdateTicketStatusFormData = AdminUpdateTicketStatusSchema.parse({
        status,
      });
      await AdminTicketsApi.updateStatus(id, payload);
      toast.success("Ticket status updated");
      await loadTickets();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = tickets ? Math.max(1, Math.ceil(tickets.total / tickets.limit)) : 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Eye className="size-5" />
            Event Details
          </DialogTitle>
        </DialogHeader>

        {!event ? null : (
          <div className="space-y-6">
            {/* Snapshot */}
            <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white">
              <div className="flex items-start gap-4">
                <div className="size-20 rounded-lg overflow-hidden border-2 border-zinc-200 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{event.title}</h3>
                    {event.featured ? <Badge className="text-xs">Featured</Badge> : null}
                    {event.trending ? <Badge className="text-xs">Trending</Badge> : null}
                    {event.verified ? (
                      <Badge variant="outline" className="text-xs">
                        Verified
                      </Badge>
                    ) : null}
                    {event.isActive ? (
                      <Badge variant="outline" className="text-xs border-emerald-700 text-emerald-800">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs border-zinc-400 text-zinc-700">
                        Inactive
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{event.date} · {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.attendees?.toLocaleString?.() || 0} attendees</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-3">{event.description}</p>

                  {/* Read-only metrics */}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Views: {event.views?.toLocaleString?.() ?? 0}
                    </span>
                    <span>Tickets Sold: {event.ticketsSold?.toLocaleString?.() ?? 0}</span>
                    <span>Rating: {typeof event.rating === "number" ? event.rating.toFixed(1) : "—"} ⭐</span>
                    <span>Reviews: {event.totalReviews?.toLocaleString?.() ?? 0}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-semibold">${event.basePrice}</span>
                  </div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {event.availability || "—"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Ticket history */}
            <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-900" />
                  <h4 className="font-semibold">Ticket Purchase History</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={String(limit)}
                    onValueChange={(v) => { setPage(1); setLimit(Number(v)); }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50">
                    <TableRow>
                      <TableHead className="font-mono text-xs">USER</TableHead>
                      <TableHead className="font-mono text-xs">TYPE</TableHead>
                      <TableHead className="font-mono text-xs">QTY</TableHead>
                      <TableHead className="font-mono text-xs">AMOUNT</TableHead>
                      <TableHead className="font-mono text-xs">STATUS</TableHead>
                      <TableHead className="font-mono text-xs">DATE</TableHead>
                      <TableHead className="font-mono text-xs">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(tickets?.items ?? []).map((t) => (
                      <TableRow key={t._id}>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{t?.user?.name || "—"}</p>
                            <p className="text-muted-foreground text-xs">{t?.user?.email || "—"}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{t.ticketTypeName}</TableCell>
                        <TableCell className="font-mono text-sm">{t.quantity}</TableCell>
                        <TableCell className="font-mono text-sm">${t.totalAmount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{t.status}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(t.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={t.status}
                            onValueChange={(v) => handleUpdateStatus(t._id, v as any)}
                            disabled={updatingId === t._id}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TicketStatusEnum.options.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!loading && (tickets?.items.length ?? 0) === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                          No ticket purchases yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                  {tickets?.total ?? 0} total · page {tickets?.page ?? page} / {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={loading || page <= 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => (tickets ? Math.min(Math.ceil(tickets.total / tickets.limit), p + 1) : p + 1))}
                    disabled={loading || (tickets ? page >= Math.ceil(tickets.total / tickets.limit) : false)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------------------------
 * Create Event Form — strictly typed to CreateValues
 * --------------------------------------------------------------------------*/
function CreateEventForm({
  onSubmit,
  submitting,
  onCancel,
}: {
  onSubmit: (data: CreateEventFormData) => void;
  submitting: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    control,
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
      image: null,
      coverImage: null,
      basePrice: 0,
      description: "",
      location: "",
      date: "",
      time: "",
      attendees: 0,
      ticketTypes: [],
      availability: undefined,
      featured: false,
      trending: false,
      verified: false,
      isActive: true,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray<CreateValues, "ticketTypes", "id">({
    control,
    name: "ticketTypes",
  });

  const imageUrl = watch("image");
  const coverUrl = watch("coverImage");
  const tagValues = watch("tags");
  const availability = watch("availability");
  const categoryValue = watch("category");
  const featured = watch("featured");
  const trending = watch("trending");
  const verified = watch("verified");
  const isActive = watch("isActive");

  const [imgProgress, setImgProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);

  const doUpload = async (file: File, target: "image" | "coverImage") => {
    try {
      const setPct = target === "image" ? setImgProgress : setCoverProgress;
      setPct(0);
      const res = await uploadToCloudinary(file, { onProgress: (p) => setPct(p) });
      setValue(target, res.url as any, { shouldValidate: true, shouldTouch: true });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setImgProgress(0);
      setCoverProgress(0);
    }
  };

  const submit: SubmitHandler<CreateValues> = (data) => onSubmit(data as CreateEventFormData);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Calendar className="h-5 w-5 text-emerald-900" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input id="title" {...register("title")} placeholder="Enter event title" />
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

        {/* Date/Time/Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-red-600">{errors.date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" {...register("time")} />
            {errors.time && <p className="text-xs text-red-600">{errors.time.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price ($) *</Label>
            <Input id="basePrice" type="number" step="0.01" {...register("basePrice", { valueAsNumber: true })} />
            {errors.basePrice && <p className="text-xs text-red-600">{errors.basePrice.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} placeholder="Enter event location" />
          {errors.location && <p className="text-xs text-red-600">{errors.location.message}</p>}
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doUpload(f, "image");
              }} />
              <Button type="button" variant="outline" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
            {!!imageUrl && (
              <div className="mt-2 size-24 rounded-md overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl ?? undefined} alt="image" className="w-full h-full object-cover" />
              </div>
            )}
            {imgProgress > 0 && <p className="text-xs text-muted-foreground">Uploading… {imgProgress}%</p>}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl ?? undefined} alt="cover" className="w-full h-full object-cover" />
              </div>
            )}
            {coverProgress > 0 && <p className="text-xs text-muted-foreground">Uploading… {coverProgress}%</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} className="min-h-[120px]" />
          {errors.description && <p className="text-xs text-red-600">{errors.description as any}</p>}
        </div>

        {/* Tags */}
        <ChipsInput
          label="Tags"
          values={tagValues}
          onChange={(next) => setValue("tags", next, { shouldValidate: true })}
          placeholder="Type a tag and press Enter"
          icon={<TagIcon className="h-4 w-4 text-muted-foreground" />}
        />

        {/* Flags */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Checkbox checked={featured} onCheckedChange={(v) => setValue("featured", !!v, { shouldValidate: true })} id="featured" />
            <Label htmlFor="featured" className="flex items-center gap-1"><Star className="h-4 w-4" /> Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={trending} onCheckedChange={(v) => setValue("trending", !!v, { shouldValidate: true })} id="trending" />
            <Label htmlFor="trending" className="flex items-center gap-1"><Flame className="h-4 w-4" /> Trending</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={verified} onCheckedChange={(v) => setValue("verified", !!v, { shouldValidate: true })} id="verified" />
            <Label htmlFor="verified" className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Verified</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={isActive} onCheckedChange={(v) => setValue("isActive", !!v, { shouldValidate: true })} id="isActive" />
            <Label htmlFor="isActive" className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Active</Label>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label>Availability</Label>
          <Select value={availability || ""} onValueChange={(v) => setValue("availability", v as any, { shouldValidate: true })}>
            <SelectTrigger>
              <SelectValue placeholder="Select availability" />
            </SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.availability && <p className="text-xs text-red-600">{errors.availability as any}</p>}
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
          <div className="p-2 bg-blue-50 rounded-lg"><Users className="h-5 w-5 text-blue-900" /></div>
          <h3 className="text-lg font-semibold text-zinc-900">Event Details</h3>
        </div>

        {/* Ticket Types (Create — no 'sold') */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Ticket Types</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: "", price: 0, description: "", features: [], total: 0, popular: false })}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Ticket Type
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((f, idx) => {
              const features = (watch(`ticketTypes.${idx}.features`) ?? []) as string[];
              const popular = watch(`ticketTypes.${idx}.popular`) ?? false;

              return (
                <Card key={f.id} className="p-4 border rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input {...register(`ticketTypes.${idx}.name`)} />
                      {(errors.ticketTypes?.[idx] as any)?.name && (
                        <p className="text-xs text-red-600">{(errors.ticketTypes?.[idx] as any)?.name?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Price *</Label>
                      <Input type="number" step="0.01" {...register(`ticketTypes.${idx}.price`, { valueAsNumber: true })} />
                      {(errors.ticketTypes?.[idx] as any)?.price && (
                        <p className="text-xs text-red-600">{(errors.ticketTypes?.[idx] as any)?.price?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Total *</Label>
                      <Input type="number" {...register(`ticketTypes.${idx}.total`, { valueAsNumber: true })} />
                      {(errors.ticketTypes?.[idx] as any)?.total && (
                        <p className="text-xs text-red-600">{(errors.ticketTypes?.[idx] as any)?.total?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Popular</Label>
                      <div className="flex items-center h-10 px-3 border rounded-md">
                        <Checkbox checked={!!popular} onCheckedChange={(v) => setValue(`ticketTypes.${idx}.popular`, !!v, { shouldValidate: true })} />
                        <span className="ml-2 text-sm text-muted-foreground">Mark as popular</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <Label>Description</Label>
                    <Textarea {...register(`ticketTypes.${idx}.description`)} />
                  </div>

                  <div className="mt-3">
                    <ChipsInput
                      label="Features"
                      values={features}
                      onChange={(next) => setValue(`ticketTypes.${idx}.features`, next, { shouldValidate: true })}
                      placeholder="Type a feature and press Enter"
                    />
                  </div>

                  <div className="flex justify-end mt-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => remove(idx)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={submitting}>Create Event</Button>
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------------------
 * Edit Event Form — strictly typed to UpdateValues (supports sold & _id)
 * --------------------------------------------------------------------------*/
function EditEventForm({
  defaultValues,
  onSubmit,
  submitting,
  onCancel,
}: {
  defaultValues: Partial<UpdateEventFormData>;
  onSubmit: (data: UpdateEventFormData) => void;
  submitting: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    control,
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

  const { fields, append, remove } = useFieldArray<UpdateValues, "ticketTypes", "id">({
    control,
    name: "ticketTypes" as any,
  });

  const imageUrl = watch("image") as string | null | undefined;
  const coverUrl = watch("coverImage") as string | null | undefined;
  const tagValues = (watch("tags") as string[] | undefined) ?? [];
  const availability = watch("availability") as string | undefined;
  const categoryValue = watch("category") as string | undefined;
  const featured = !!watch("featured");
  const trending = !!watch("trending");
  const verified = !!watch("verified");
  const isActive = !!watch("isActive");

  const [imgProgress, setImgProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);

  const doUpload = async (file: File, target: "image" | "coverImage") => {
    try {
      const setPct = target === "image" ? setImgProgress : setCoverProgress;
      setPct(0);
      const res = await uploadToCloudinary(file, { onProgress: (p) => setPct(p) });
      setValue(target, res.url as any, { shouldValidate: true, shouldTouch: true });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setImgProgress(0);
      setCoverProgress(0);
    }
  };

  const submit: SubmitHandler<UpdateValues> = (data) => onSubmit(data as UpdateEventFormData);

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Calendar className="h-5 w-5 text-emerald-900" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Basic Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" {...register("title")} placeholder="Enter event title" />
            {errors.title && <p className="text-xs text-red-600">{errors.title as any}</p>}
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
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-600">{errors.category as any}</p>}
          </div>
        </div>

        {/* Date/Time/Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-red-600">{errors.date as any}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" {...register("time")} />
            {errors.time && <p className="text-xs text-red-600">{errors.time as any}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price ($)</Label>
            <Input id="basePrice" type="number" step="0.01" {...register("basePrice", { valueAsNumber: true })} />
            {errors.basePrice && <p className="text-xs text-red-600">{errors.basePrice as any}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} placeholder="Enter event location" />
          {errors.location && <p className="text-xs text-red-600">{errors.location as any}</p>}
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) doUpload(f, "image");
              }} />
              <Button type="button" variant="outline" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
            {!!imageUrl && (
              <div className="mt-2 size-24 rounded-md overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl ?? undefined} alt="image" className="w-full h-full object-cover" />
              </div>
            )}
            {imgProgress > 0 && <p className="text-xs text-muted-foreground">Uploading… {imgProgress}%</p>}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl ?? undefined} alt="cover" className="w-full h-full object-cover" />
              </div>
            )}
            {coverProgress > 0 && <p className="text-xs text-muted-foreground">Uploading… {coverProgress}%</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} className="min-h-[120px]" />
          {errors.description && <p className="text-xs text-red-600">{errors.description as any}</p>}
        </div>

        {/* Tags */}
        <ChipsInput
          label="Tags"
          values={tagValues}
          onChange={(next) => setValue("tags", next, { shouldValidate: true })}
          placeholder="Type a tag and press Enter"
          icon={<TagIcon className="h-4 w-4 text-muted-foreground" />}
        />

        {/* Flags */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Checkbox checked={featured} onCheckedChange={(v) => setValue("featured", !!v, { shouldValidate: true })} id="featured_e" />
            <Label htmlFor="featured_e" className="flex items-center gap-1"><Star className="h-4 w-4" /> Featured</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={trending} onCheckedChange={(v) => setValue("trending", !!v, { shouldValidate: true })} id="trending_e" />
            <Label htmlFor="trending_e" className="flex items-center gap-1"><Flame className="h-4 w-4" /> Trending</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={verified} onCheckedChange={(v) => setValue("verified", !!v, { shouldValidate: true })} id="verified_e" />
            <Label htmlFor="verified_e" className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Verified</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={isActive} onCheckedChange={(v) => setValue("isActive", !!v, { shouldValidate: true })} id="active_e" />
            <Label htmlFor="active_e" className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Active</Label>
          </div>
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <Label>Availability</Label>
          <Select value={availability || ""} onValueChange={(v) => setValue("availability", v as any, { shouldValidate: true })}>
            <SelectTrigger><SelectValue placeholder="Select availability" /></SelectTrigger>
            <SelectContent>
              {availabilityOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.availability && <p className="text-xs text-red-600">{errors.availability as any}</p>}
        </div>
      </div>

      {/* Ticket Types (Update — supports sold & _id) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
          <div className="p-2 bg-blue-50 rounded-lg"><Users className="h-5 w-5 text-blue-900" /></div>
          <h3 className="text-lg font-semibold text-zinc-900">Ticket Types</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Manage ticket tiers</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: "",
                  price: 0,
                  description: "",
                  features: [],
                  total: 0,
                  sold: 0,
                  popular: false,
                } as z.infer<typeof TicketTypeUpdateSchema>)
              }
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Ticket Type
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((f, idx) => {
              const features = (watch(`ticketTypes.${idx}.features`) ?? []) as string[];
              const popular = watch(`ticketTypes.${idx}.popular`) ?? false;

              return (
                <Card key={f.id} className="p-4 border rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input {...register(`ticketTypes.${idx}.name`)} />
                      {(errors.ticketTypes?.[idx] as any)?.name && (
                        <p className="text-xs text-red-600">{(errors.ticketTypes?.[idx] as any)?.name?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Price</Label>
                      <Input type="number" step="0.01" {...register(`ticketTypes.${idx}.price`, { valueAsNumber: true })} />
                      {(errors.ticketTypes?.[idx] as any)?.price && (
                        <p className="text-xs text-red-600">{(errors.ticketTypes?.[idx] as any)?.price?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Total</Label>
                      <Input type="number" {...register(`ticketTypes.${idx}.total`, { valueAsNumber: true })} />
                      {(errors.ticketTypes?.[idx] as any)?.total && (
                        <p className="text-xs text-red-600">{(errors.ticketTypes?.[idx] as any)?.total?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Sold</Label>
                      <Input type="number" {...register(`ticketTypes.${idx}.sold`, { valueAsNumber: true })} />
                      {(errors.ticketTypes?.[idx] as any)?.sold && (
                        <p className="text-xs text-red-600">{(errors.ticketTypes?.[idx] as any)?.sold?.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Popular</Label>
                      <div className="flex items-center h-10 px-3 border rounded-md">
                        <Checkbox
                          checked={!!popular}
                          onCheckedChange={(v) => setValue(`ticketTypes.${idx}.popular`, !!v, { shouldValidate: true })}
                        />
                        <span className="ml-2 text-sm text-muted-foreground">Mark as popular</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <Label>Description</Label>
                    <Textarea {...register(`ticketTypes.${idx}.description`)} />
                  </div>

                  <div className="mt-3">
                    <ChipsInput
                      label="Features"
                      values={features}
                      onChange={(next) => setValue(`ticketTypes.${idx}.features`, next, { shouldValidate: true })}
                      placeholder="Type a feature and press Enter"
                    />
                  </div>

                  <div className="flex justify-end mt-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => remove(idx)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={submitting}>Save Changes</Button>
      </div>
    </form>
  );
}

/* ----------------------------------------------------------------------------
 * Page: ManageEventsPage (with new design matching ManageDepositsPage)
 * --------------------------------------------------------------------------*/
type ConfirmState = {
  open: boolean;
  tone?: "danger" | "default";
  title: React.ReactNode;
  onYes?: () => Promise<void> | void;
  confirming?: boolean;
};

export default function ManageEventsPage() {
  const [items, setItems] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [onlyActive, setOnlyActive] = useState(true);

  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<Event | null>(null);

  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    title: <></>,
    tone: "default",
    confirming: false,
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await AdminEventsApi.list({
        page,
        limit,
        search: searchTerm || undefined,
        category: category || undefined,
        onlyActive,
      } as any);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, category, onlyActive]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Create
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const handleCreate = (data: CreateEventFormData) => {
    setConfirm({
      open: true,
      title: <>Create this event?</>,
      onYes: async () => {
        try {
          setSubmittingCreate(true);
          const created = await AdminEventsApi.create(data);
          toast.success("Event created");
          setCreateOpen(false);
          setPage(1);
          await load();
          setSelected(created);
          setDetailsOpen(true);
        } catch (err: any) {
          toast.error(err?.response?.data?.message || err?.message || "Create failed");
        } finally {
          setSubmittingCreate(false);
          setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
        }
      },
      confirming: false,
    });
  };

  // Edit
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const startEdit = (ev: Event) => {
    setSelected(ev);
    setEditOpen(true);
  };

  const handleEdit = (data: UpdateEventFormData) => {
    if (!selected?._id) return;
    setConfirm({
      open: true,
      title: <>Save changes to "{selected.title}"?</>,
      onYes: async () => {
        try {
          setSubmittingEdit(true);
          const updated = await AdminEventsApi.update(selected._id, data);
          toast.success("Event updated");
          setEditOpen(false);
          setItems((prev) => prev.map((it) => (it._id === updated._id ? updated : it)));
          setSelected(updated);
          setDetailsOpen(true);
        } catch (err: any) {
          toast.error(err?.response?.data?.message || err?.message || "Update failed");
        } finally {
          setSubmittingEdit(false);
          setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
        }
      },
    });
  };

  // Delete (confirmation + danger tone)
  const removeEvent = (ev: Event) => {
    setConfirm({
      open: true,
      tone: "danger",
      title: <>Delete "{ev.title}"? This cannot be undone.</>,
      onYes: async () => {
        try {
          await AdminEventsApi.remove(ev._id);
          toast.success("Event deleted");
          await load();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || err?.message || "Delete failed");
        } finally {
          setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
        }
      },
    });
  };

  // Activate/Deactivate (now uses confirmation modal)
  const requestToggleActive = (ev: Event) => {
    const willActivate = !ev.isActive;
    setConfirm({
      open: true,
      tone: willActivate ? "default" : "danger",
      title: willActivate
        ? <>Activate "{ev.title}"?</>
        : <>Deactivate "{ev.title}"? Users will no longer see it in active listings.</>,
      onYes: async () => {
        try {
          const updated = await AdminEventsApi.toggleActive(ev._id, willActivate);
          setItems((prev) => prev.map((x) => (x._id === ev._id ? updated : x)));
          toast.success(willActivate ? "Event activated" : "Event deactivated");
        } catch (err: any) {
          toast.error(err?.response?.data?.message || err?.message || "Toggle failed");
        } finally {
          setConfirm((c) => ({ ...c, open: false, onYes: undefined }));
        }
      },
    });
  };

  const shareEvent = async (ev: Event) => {
    const url = typeof window !== "undefined" ? `${location.origin}/events/${ev.slug}` : ev.slug;
    const shareData = { title: ev.title, text: ev.description || ev.title, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Event link copied");
      }
    } catch {
      // no-op
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCategory(undefined);
    setOnlyActive(true);
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
              title="Manage Events"
              subtitle="Create, edit, and manage all platform events"
              actionButton={{
                text: "Create Event",
                icon: <PlusIcon className="size-4" />,
                onClick: () => setCreateOpen(true),
              }}
            />

            {/* Stats Cards */}
            <EventStatsCards events={items} />

            {/* Enhanced Filters */}
            <EventFilters
              searchTerm={searchTerm}
              onSearchChange={(value) => { setPage(1); setSearchTerm(value); }}
              category={category}
              onCategoryChange={(value) => { setPage(1); setCategory(value === "all" ? undefined : value); }}
              onlyActive={onlyActive}
              onOnlyActiveChange={(value) => { setPage(1); setOnlyActive(value); }}
              limit={limit}
              onLimitChange={(value) => { setPage(1); setLimit(value); }}
              onClearFilters={clearFilters}
            />

            {/* Events Table */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-emerald-900">Events</CardTitle>
                    <CardDescription>
                      {items.length} events found
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="bg-emerald-800 border-emerald-800 text-white hover:bg-emerald-700"
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
                          Event
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Category
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Date & Time
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Location
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Price
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                          Availability
                        </TableHead>
                        <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
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
                              Loading events...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : items.map((ev) => (
                        <TableRow key={ev._id} className="hover:bg-zinc-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-12 rounded-lg overflow-hidden border-2 border-zinc-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={ev.image || "/placeholder.svg"} alt={ev.title} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="font-semibold">{ev.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {ev.featured && <Badge className="text-xs">Featured</Badge>}
                                  {ev.trending && <Badge className="text-xs">Trending</Badge>}
                                  {ev.verified && <Badge variant="outline" className="text-xs">Verified</Badge>}
                                  {ev.isActive ? (
                                    <Badge variant="outline" className="text-xs border-emerald-700 text-emerald-800">Active</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-xs border-zinc-400 text-zinc-700">Inactive</Badge>
                                  )}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                                  <span>⭐ {typeof ev.rating === "number" ? ev.rating.toFixed(1) : "—"}</span>
                                  <span>Reviews: {ev.totalReviews ?? 0}</span>
                                  <span>Sold: {ev.ticketsSold ?? 0}</span>
                                  <span>Views: {ev.views ?? 0}</span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{ev.category}</Badge></TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{ev.date}</p>
                              <p className="text-sm text-muted-foreground">{ev.time}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm truncate">{ev.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono font-semibold">${ev.basePrice}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{ev.availability || "—"}</Badge></TableCell>
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
                                  onClick={() => { setSelected(ev); setDetailsOpen(true); }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => startEdit(ev)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Event
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => shareEvent(ev)}
                                >
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => requestToggleActive(ev)}
                                >
                                  {ev.isActive ? (
                                    <>
                                      <ToggleLeft className="w-4 h-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="w-4 h-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => removeEvent(ev)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Event
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
                    <div className="text-zinc-500 mb-2">No events found</div>
                    <div className="text-sm text-zinc-400">
                      Try adjusting your filters or search terms
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-zinc-500">
                      Page {page} of {totalPages} • {total} total events
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

      {/* Create Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Event</DialogTitle>
          </DialogHeader>
          <CreateEventForm
            submitting={submittingCreate}
            onSubmit={handleCreate}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Event</DialogTitle>
          </DialogHeader>
          {selected && (
            <EditEventForm
              defaultValues={selected as any}
              submitting={submittingEdit}
              onSubmit={handleEdit}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <AdminEventDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} event={selected} />

      {/* Global Confirm */}
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