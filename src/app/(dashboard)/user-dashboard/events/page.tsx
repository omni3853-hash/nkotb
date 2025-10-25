"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Flame,
  Star,
  Share2,
  Eye,
  DollarSign,
  Zap,
  X,
  Check,
  Info,
  Minus,
  Plus,
} from "lucide-react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { TicketsApi } from "@/api/tickets.api";
import { Event, EventsApi } from "@/api/events.api";

/* =========================================================================
   BOOKING MODAL — Ticket cards + synced Select + quantity stepper
   ========================================================================= */
function EventBookingModal({
  isOpen,
  onClose,
  event,
  onBooked,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onBooked: () => void;
}) {
  const [ticketTypeId, setTicketTypeId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // hydrate selection
  useEffect(() => {
    if (isOpen && event) {
      const firstId =
        (event.ticketTypes?.[0] as any)?._id ||
        (event.ticketTypes?.[0] as any)?.id ||
        "";
      setTicketTypeId(firstId || "base");
      setQty(1);
      setConfirm(false);
      setLoading(false);
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const ticketTypes: any[] =
    (Array.isArray(event.ticketTypes) ? event.ticketTypes : []) || [];

  // Determine currently selected ticket (fallback to "base" when there are no ticket types)
  const usingBaseOnly = ticketTypes.length === 0;
  const selected =
    (!usingBaseOnly &&
      ticketTypes.find((t: any) => (t?._id || t?.id) === ticketTypeId)) ||
    null;

  const unit = Number(
    usingBaseOnly ? event.basePrice ?? 0 : selected?.price ?? event.basePrice ?? 0
  );

  const total = Math.max(1, qty) * unit;

  const adjustQty = (delta: number) => {
    setQty((n) => Math.max(1, n + delta));
  };

  const quickQty = [1, 2, 3, 4];

  const submit = async () => {
    setConfirm(false);
    try {
      setLoading(true);
      await TicketsApi.create({
        event: event._id,
        ticketTypeId: ticketTypeId,
        quantity: Math.max(1, qty),
        notes: "",
      });
      toast.success("Booking successful");
      onBooked();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Booking failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Accessibility-friendly close (clicking backdrop)
  const onBackdrop = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset?.backdrop === "true") onClose();
  };

  // Ticket Card
  const TicketCard = ({ t }: { t: any }) => {
    const id: string = t?._id || t?.id || "";
    const selectedCard = id === ticketTypeId;
    const capacity = Number(t?.capacity ?? 0);
    const sold = Number(t?.sold ?? 0);
    const available =
      typeof t?.available === "number"
        ? t.available
        : capacity
          ? Math.max(0, capacity - sold)
          : undefined;
    const soldOut = typeof available === "number" && available <= 0;

    return (
      <button
        type="button"
        disabled={soldOut || loading}
        onClick={() => setTicketTypeId(id)}
        className={[
          "relative w-full text-left border rounded-xl p-4 transition-all",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900/40",
          selectedCard
            ? "border-emerald-900 ring-1 ring-emerald-900/50 shadow-md"
            : "border-border hover:border-emerald-900/50 hover:shadow-sm bg-white",
          soldOut ? "opacity-60 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate">{t?.name}</span>
              {t?.isBestValue && (
                <Badge className="text-[10px] px-2 py-0.5">Best Value</Badge>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {t?.description || "General admission access to the event."}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {typeof available === "number" && (
                <span className="text-[11px] text-muted-foreground">
                  {available} left
                </span>
              )}
              {t?.perks?.length ? (
                <span className="text-[11px] text-emerald-900/80">
                  {(t.perks as string[]).slice(0, 2).join(" • ")}
                  {t.perks.length > 2 ? " • +" + (t.perks.length - 2) : ""}
                </span>
              ) : null}
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-base font-semibold">
              ${Number(t?.price || 0)}
            </div>
            <div className="mt-1">
              <span
                className={[
                  "inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 text-[11px]",
                  selectedCard
                    ? "bg-emerald-900 text-white border-emerald-900"
                    : "bg-zinc-50 text-zinc-700 border-border",
                ].join(" ")}
              >
                {selectedCard ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Selected
                  </>
                ) : (
                  "Choose"
                )}
              </span>
            </div>
          </div>
        </div>

        {soldOut && (
          <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center">
            <Badge variant="outline" className="bg-white">Sold out</Badge>
          </div>
        )}
      </button>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      data-backdrop="true"
      onClick={onBackdrop}
    >
      <div className="bg-white rounded-2xl border border-border max-w-3xl w-full max-h-[92vh] overflow-hidden">
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-12 rounded-lg overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold truncate">
                  {event.title}
                </h3>
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{event.date || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{event.time || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate">{event.location || "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 font-mono text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                From {Number(event.basePrice || 0)}
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {/* Choose Ticket Type */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">Choose your ticket</h4>
                <Badge variant="outline" className="text-[10px]">
                  {usingBaseOnly ? "Base ticket" : `${ticketTypes.length} types`}
                </Badge>
              </div>
              {/* Synced Select — helpful for long lists / a11y */}
              {!usingBaseOnly && (
                <div className="w-44">
                  <Select
                    value={ticketTypeId}
                    onValueChange={setTicketTypeId}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Ticket type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes.map((t: any) => (
                        <SelectItem key={t?._id || t?.id} value={t?._id || t?.id}>
                          {t?.name} — ${Number(t?.price || 0)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {usingBaseOnly ? (
              <Card className="p-4 border-dashed">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">General Admission</div>
                    <div className="text-xs text-muted-foreground">
                      Access to the event
                    </div>
                  </div>
                  <div className="font-mono font-semibold">${Number(event.basePrice || 0)}</div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ticketTypes.map((t: any) => (
                  <TicketCard key={t?._id || t?.id} t={t} />
                ))}
              </div>
            )}

            <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3.5 w-3.5 mt-0.5" />
              <span>
                Select a ticket type above, or use the dropdown for quick access.
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold mb-2">Quantity</h4>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="inline-flex items-center border rounded-lg overflow-hidden w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-10 w-10"
                  onClick={() => adjustQty(-1)}
                  disabled={loading || qty <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) =>
                    setQty(Math.max(1, Number(e.target.value || 1)))
                  }
                  className="h-10 w-[80px] text-center border-x-0 rounded-none font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-none h-10 w-10"
                  onClick={() => adjustQty(1)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {quickQty.map((n) => (
                  <Button
                    key={n}
                    variant={qty === n ? "default" : "outline"}
                    size="sm"
                    className={
                      qty === n
                        ? "bg-emerald-900 text-white"
                        : "hover:bg-emerald-50"
                    }
                    onClick={() => setQty(n)}
                    disabled={loading}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="text-muted-foreground">Unit price</div>
                <div className="font-mono">${unit}</div>
              </div>
              <div className="text-sm text-right">
                <div className="text-muted-foreground">Total</div>
                <div className="font-mono text-lg font-semibold">${total}</div>
              </div>
            </div>
          </Card>

          {/* Sticky action bar */}
          <div className="sticky bottom-0 left-0 right-0 mt-5 -mx-4 sm:-mx-6 p-3 sm:p-4 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t">
            <div className="flex items-center justify-between gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">You’ll pay</span>
                <span className="font-semibold font-mono">${total}</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setConfirm(true)}
                  isLoading={loading}
                  className="bg-emerald-900 text-white"
                  disabled={usingBaseOnly ? false : !ticketTypeId}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Dialog */}
        <ConfirmDialog
          open={confirm}
          onOpenChange={setConfirm}
          title="Proceed with this booking?"
          confirmText="Yes, confirm"
          onConfirm={submit}
          confirming={loading}
        />
      </div>
    </div>
  );
}

/* =========================================================================
   DETAILS MODAL — fetch richer event details; share; leads into booking
   ========================================================================= */
function EventDetailsModal({
  isOpen,
  onClose,
  event,
  onShare,
  onBook,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onShare: (ev: Event) => Promise<void>;
  onBook: (ev: Event) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [full, setFull] = useState<Event | null>(event);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const api = EventsApi as any;
      const res =
        (api.get && (await api.get(id))) ||
        (api.getById && (await api.getById(id))) ||
        (api.detail && (await api.detail(id))) ||
        (api.retrieve && (await api.retrieve(id)));
      const enriched = res?.item || res?.data || res || null;
      if (!enriched) throw new Error("Event not found");
      setFull({ ...(event || ({} as Event)), ...enriched });
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load");
      setFull(event || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFull(event || null);
    setError(null);
    if (isOpen && event?._id) fetchDetails(event._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, event?._id]);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !full) return null;

  const price = Number(full.basePrice || 0);
  const ticketTypes: any[] = (full.ticketTypes as any[]) || [];
  const gallery: string[] = (full as any).gallery || [];

  const onBackdrop = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset?.backdrop === "true") onClose();
  };

  const stat = (label: string, value: React.ReactNode) => (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      data-backdrop="true"
      onClick={onBackdrop}
    >
      <div className="bg-white rounded-xl border border-border max-w-5xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-9 rounded-lg overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={full.image || "/placeholder.svg"}
                alt={full.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold truncate">
                {full.title}
              </h3>
              <div className="flex items-center gap-2">
                {full.category && (
                  <Badge variant="outline" className="text-[10px]">
                    {full.category}
                  </Badge>
                )}
                {full.trending && <Badge className="text-[10px]">Trending</Badge>}
                {full.featured && <Badge className="text-[10px]">Featured</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(full)}
              disabled={loading}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Hero / Gallery */}
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 rounded-xl overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={full.image || "/placeholder.svg"}
                alt={full.title}
                className="w-full h-[220px] sm:h-[280px] md:h-[320px] object-cover"
              />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-1 gap-3">
              {(gallery.length ? gallery.slice(0, 3) : [1, 2, 3]).map(
                (g, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border h-[70px] sm:h-[86px] md:h-[100px] bg-zinc-50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        typeof g === "string" ? g : full.image || "/placeholder.svg"
                      }
                      alt={`${full.title} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stat(
              "Date",
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {full.date || "—"}
              </span>
            )}
            {stat(
              "Time",
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {full.time || "—"}
              </span>
            )}
            {stat(
              "Location",
              <span className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{full.location || "—"}</span>
              </span>
            )}
            {stat(
              "Base Price",
              <span className="flex items-center gap-1 font-mono">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                {price}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-sm font-semibold">About this event</h4>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-100 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-zinc-100 rounded animate-pulse w-full" />
                  <div className="h-4 bg-zinc-100 rounded animate-pulse w-5/6" />
                </div>
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {full.description || "No description available."}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(full as any)?.organizer && (
                  <Card className="p-3">
                    <div className="text-[11px] uppercase text-muted-foreground mb-1">
                      Organizer
                    </div>
                    <div className="text-sm font-medium">
                      {(full as any).organizer}
                    </div>
                  </Card>
                )}
                {(full as any)?.capacity && (
                  <Card className="p-3">
                    <div className="text-[11px] uppercase text-muted-foreground mb-1">
                      Capacity
                    </div>
                    <div className="text-sm font-medium">
                      {(full as any).capacity}
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* Tickets Preview */}
            <div className="lg:col-span-1">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold">Tickets</h4>
                  {loading && (
                    <span className="text-xs text-muted-foreground">
                      Loading…
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {(ticketTypes.length ? ticketTypes : []).slice(0, 3).map((t) => (
                    <div key={(t as any)?._id || (t as any)?.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <div className="text-sm font-medium">{(t as any)?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          ${(t as any)?.price ?? 0}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-emerald-900 text-white"
                        onClick={() => onBook(full)}
                      >
                        Select
                      </Button>
                    </div>
                  ))}
                  {!ticketTypes.length && (
                    <div className="text-sm text-muted-foreground">
                      Ticket types will appear here when available.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm">
                    From{" "}
                    <span className="font-semibold font-mono">${price}</span>
                  </div>
                  <Button
                    className="bg-emerald-900 text-white"
                    onClick={() => onBook(full)}
                    disabled={loading}
                  >
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   FILTERS / PAGE
   ========================================================================= */
const categories = [
  "All",
  "Music",
  "Technology",
  "Art",
  "Food & Drink",
  "Entertainment",
  "Sports & Fitness",
  "Business",
  "Education",
];

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under $50", value: "0-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100 - $200", value: "100-200" },
  { label: "Over $200", value: "200+" },
];

/* =========================================================================
   PAGE
   ========================================================================= */
export default function EventsPage() {
  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  // paging
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [total, setTotal] = useState(0);

  // data
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  // details modal
  const [detailsEvent, setDetailsEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // booking modal
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // share
  const [shareBusyId, setShareBusyId] = useState<string | null>(null);

  // live stats (lightweight)
  const [liveViews, setLiveViews] = useState(4523);
  const [liveBookings, setLiveBookings] = useState(127);

  /* ------------------------------- Loaders -------------------------------- */
  const load = async () => {
    try {
      setLoading(true);
      const res = await EventsApi.list({
        page,
        limit,
        search: searchTerm || undefined,
        category: selectedCategory === "All" ? undefined : selectedCategory,
        onlyActive: true,
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, selectedCategory]);

  useEffect(() => {
    const iv1 = setInterval(
      () => setLiveViews((n) => n + Math.floor(Math.random() * 6)),
      3000
    );
    const iv2 = setInterval(
      () => setLiveBookings((n) => n + Math.floor(Math.random() * 3)),
      5000
    );
    return () => {
      clearInterval(iv1);
      clearInterval(iv2);
    };
  }, []);

  /* -------------------------- Local Price Filter -------------------------- */
  const filteredByPrice = useMemo(() => {
    if (selectedPriceRange === "all") return items;
    if (selectedPriceRange === "200+")
      return items.filter((e) => Number(e.basePrice || 0) >= 200);
    const [min, max] = selectedPriceRange.split("-").map(Number);
    return items.filter((e) => {
      const p = Number(e.basePrice || 0);
      return p >= min && p <= max;
    });
  }, [items, selectedPriceRange]);

  const featuredEvents = useMemo(
    () => filteredByPrice.filter((e) => e.featured),
    [filteredByPrice]
  );
  const trendingEvents = useMemo(
    () => filteredByPrice.filter((e) => e.trending),
    [filteredByPrice]
  );

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));

  /* -------------------------------- Share --------------------------------- */
  const shareEvent = async (ev: Event) => {
    setShareBusyId(ev._id);
    try {
      const url =
        typeof window !== "undefined"
          ? `${location.origin}/events/${ev.slug || ev._id}`
          : ev.slug || ev._id;
      if (navigator.share) {
        await navigator.share({
          title: ev.title,
          text: ev.description || ev.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Event link copied");
      }
    } catch {
      // cancelled / unsupported
    } finally {
      setShareBusyId(null);
    }
  };

  /* ------------------------------ Handlers -------------------------------- */
  const openDetails = (ev: Event) => {
    setDetailsEvent(ev);
    setIsDetailsOpen(true);
  };

  const openBooking = (ev: Event) => {
    setSelectedEvent(ev);
    setIsBookingOpen(true);
  };

  /* ------------------------------- Render --------------------------------- */
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100">
          <div className="@container/main flex flex-1 flex-col gap-2 px-3 sm:px-4 md:px-6">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DynamicPageHeader
                title={
                  <>
                    <span className="text-zinc-500">Discover</span> Events
                  </>
                }
                subtitle="Find and book amazing experiences that inspire, educate, and entertain"
              />

              {/* Top Metric Cards */}
              <div className="px-3 sm:px-4 md:px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <Eye className="size-5 text-emerald-900" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-900 border">
                        live
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Live Views</p>
                    <p className="text-2xl font-bold">
                      {liveViews.toLocaleString()}
                    </p>
                  </Card>

                  <Card className="border rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="size-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                        <Zap className="size-5 text-orange-900" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bookings Today
                    </p>
                    <p className="text-2xl font-bold">{liveBookings}</p>
                  </Card>

                  <Card className="border rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="size-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <TrendingUp className="size-5 text-blue-900" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Trending</p>
                    <p className="text-2xl font-bold">
                      {trendingEvents.length}
                    </p>
                  </Card>

                  <Card className="border rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="size-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center">
                        <Star className="size-5 text-purple-900" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">
                      {filteredByPrice.filter((e) => e.isActive).length}
                    </p>
                  </Card>
                </div>
              </div>

              {/* Trending Now */}
              <div className="px-3 sm:px-4 md:px-6">
                <div className="mb-8 md:mb-12">
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <Flame className="h-5 w-5 text-emerald-800" />
                    <h3 className="text-xl md:text-2xl font-bold text-zinc-800">
                      Trending Now
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(loading && trendingEvents.length === 0
                      ? Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border p-6 bg-white">
                          <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse mb-3" />
                          <div className="h-5 w-3/4 bg-zinc-100 rounded animate-pulse mb-3" />
                          <div className="h-4 w-20 bg-zinc-100 rounded animate-pulse" />
                        </Card>
                      ))
                      : trendingEvents.slice(0, 3)
                    ).map((ev: any) => (
                      <div
                        key={ev._id}
                        className="border border-border bg-white p-4 sm:p-6 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer group rounded-xl"
                        onClick={() => openDetails(ev)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge
                            variant="outline"
                            className="text-xs uppercase tracking-wider"
                          >
                            {ev.category || "Event"}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span className="text-sm">
                              {(ev as any)?.rating ?? "—"}
                            </span>
                          </div>
                        </div>
                        <h4 className="font-bold text-zinc-800 mb-2 group-hover:text-emerald-800 transition-colors text-sm sm:text-base">
                          {ev.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {ev.date || "—"}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-emerald-800">
                            ${Number(ev.basePrice || 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Featured Carousel */}
              <FeaturedCarousel
                items={featuredEvents.length ? featuredEvents : items}
                onOpenDetails={(ev) => openDetails(ev)}
                onOpenBooking={(ev) => openBooking(ev)}
              />

              {/* Filters */}
              <div className="px-3 sm:px-4 md:px-6">
                <div className="mb-8 md:mb-12 border border-border bg-white p-4 sm:p-6 rounded-xl">
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => {
                          setPage(1);
                          setSearchTerm(e.target.value);
                        }}
                        className="pl-10"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select
                        value={selectedCategory}
                        onValueChange={(v) => {
                          setPage(1);
                          setSelectedCategory(v);
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedPriceRange}
                        onValueChange={(v) => setSelectedPriceRange(v)}
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Price Range" />
                        </SelectTrigger>
                        <SelectContent>
                          {priceRanges.map((r) => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={String(limit)}
                        onValueChange={(v) => {
                          setPage(1);
                          setLimit(Number(v));
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue placeholder="Per page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="9">9</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {loading
                          ? "Loading…"
                          : `${filteredByPrice.length} of ${total} events`}
                      </p>
                      {(searchTerm ||
                        selectedCategory !== "All" ||
                        selectedPriceRange !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedCategory("All");
                              setSelectedPriceRange("all");
                              setPage(1);
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Events Grid */}
              <div className="px-3 sm:px-4 md:px-6">
                <div className="mb-8 md:mb-12">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {loading && filteredByPrice.length === 0
                      ? Array.from({ length: limit }).map((_, i) => (
                        <Card key={i} className="border p-4 sm:p-6 bg-white">
                          <div className="aspect-[16/10] rounded-md bg-zinc-100 animate-pulse" />
                          <div className="mt-4 h-4 w-2/3 bg-zinc-100 rounded animate-pulse" />
                          <div className="mt-2 h-4 w-1/3 bg-zinc-100 rounded animate-pulse" />
                        </Card>
                      ))
                      : filteredByPrice.map((ev) => {
                        const price = Number(ev.basePrice || 0);
                        return (
                          <div
                            key={ev._id}
                            className="group border border-border bg-white overflow-hidden transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/10 relative rounded-xl cursor-pointer"
                            onClick={() => openDetails(ev)}
                          >
                            <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={ev.image || "/placeholder.svg"}
                                alt={ev.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute top-2 left-2 flex flex-col gap-2">
                                {ev.trending && (
                                  <div className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded-md flex items-center gap-1">
                                    <Flame className="h-3 w-3" />
                                    <span>Trending</span>
                                  </div>
                                )}
                              </div>
                              <div className="absolute top-2 right-2">
                                <div className="bg-background text-foreground px-2 py-1 text-xs rounded-md flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${price}
                                </div>
                              </div>
                              <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="h-8 w-8 bg-background/90"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    await shareEvent(ev);
                                  }}
                                  isLoading={shareBusyId === ev._id}
                                >
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="p-4 sm:p-6">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <h3 className="text-lg sm:text-xl font-bold">
                                  {ev.title}
                                </h3>
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                <div className="flex items-center gap-1.5">
                                  <Star className="h-4 w-4 text-accent" />
                                  <span className="text-sm font-medium">
                                    {(ev as any)?.rating ?? "—"}
                                  </span>
                                </div>
                                {ev.category && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {ev.category}
                                  </Badge>
                                )}
                              </div>

                              {ev.description && (
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                  {ev.description}
                                </p>
                              )}

                              <div className="space-y-2 mb-5">
                                <div className="flex items-center gap-3 text-xs">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>{ev.date || "—"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{ev.time || "—"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <span className="truncate">
                                    {ev.location || "—"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <Button
                                  size="sm"
                                  className="bg-emerald-900 rounded-full text-zinc-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openBooking(ev);
                                  }}
                                >
                                  Book Now
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <span className="text-lg font-bold text-emerald-900">
                                  ${price}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {/* No results */}
                  {!loading && filteredByPrice.length === 0 && (
                    <div className="text-center py-12 border rounded-xl">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-bold text-zinc-800 mb-2">
                        No events found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Try adjusting your filters
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("All");
                          setSelectedPriceRange("all");
                          setPage(1);
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-3 sm:px-4 md:px-6">
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading || page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (p) => (
                          <Button
                            key={p}
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(p)}
                            className={p === page ? "bg-emerald-900 text-white" : ""}
                          >
                            {p}
                          </Button>
                        )
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading || page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Details Modal */}
      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailsEvent(null);
        }}
        event={detailsEvent}
        onShare={shareEvent}
        onBook={(ev) => {
          setIsDetailsOpen(false);
          setDetailsEvent(null);
          openBooking(ev);
        }}
      />

      {/* Booking Modal */}
      <EventBookingModal
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onBooked={() => {
          // Refresh after booking to reflect availability if your API returns it
          load();
        }}
      />
    </SidebarProvider>
  );
}

/* =========================================================================
   Featured Carousel (tidy)
   ========================================================================= */
function FeaturedCarousel({
  items,
  onOpenDetails,
  onOpenBooking,
}: {
  items: Event[];
  onOpenDetails: (ev: Event) => void;
  onOpenBooking: (ev: Event) => void;
}) {
  const [idx, setIdx] = useState(0);
  const next = () =>
    setIdx((p) => (items.length ? (p + 1) % items.length : 0));
  const prev = () =>
    setIdx((p) => (items.length ? (p - 1 + items.length) % items.length : 0));

  return (
    <div className="px-3 sm:px-4 md:px-6">
      <div className="mb-12 md:mb-20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
          <h3 className="text-xl md:text-2xl font-bold text-zinc-800">
            Featured Events
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
              disabled={!items.length}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={next}
              className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
              disabled={!items.length}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${items.length ? idx * 100 : 0}%)`,
            }}
          >
            {(items.length ? items : []).map((ev) => {
              const price = Number(ev.basePrice || 0);
              return (
                <div key={ev._id} className="min-w-full">
                  <div
                    className="border border-border bg-white overflow-hidden rounded-xl cursor-pointer"
                    onClick={() => onOpenDetails(ev)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      <div className="aspect-[4/3] md:aspect-auto relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ev.image || "/placeholder.svg"}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
                          {ev.category && (
                            <Badge
                              variant="outline"
                              className="text-xs uppercase tracking-wider w-fit"
                            >
                              {ev.category}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="text-sm font-medium">
                              {(ev as any)?.rating ?? "—"}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-balance text-zinc-800">
                          {ev.title}
                        </h3>
                        {ev.description && (
                          <p className="text-sm sm:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                            {ev.description}
                          </p>
                        )}
                        <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            <span className="text-sm md:text-base">
                              {ev.date || "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            <span className="text-sm md:text-base">
                              {ev.location || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <Button
                            size="lg"
                            className="bg-emerald-900 py-3 px-6 md:py-5 md:px-8 rounded-full text-zinc-100 text-xs md:text-[13px] flex items-center gap-2 w-full sm:w-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenBooking(ev);
                            }}
                          >
                            <span>Book Now</span>
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          <span className="text-xl md:text-2xl font-bold text-emerald-800 text-center sm:text-left">
                            ${price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
