"use client";

import * as React from "react";
import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Grid3X3, List, ChevronLeft, ChevronRight, ArrowUp, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/events/hero-section";
import { NewsletterSignup } from "@/components/events/newsletter-signup";
import { EventCardSocial } from "@/components/events/event-card-social";
import { EventModal, type Event as UIEvent } from "@/components/event-modal";

// ---- Backend types ----------------------------------------------------------
import z from "zod";
import { TicketTypeCreateSchema } from "@/utils/schemas/schemas";
import { EventsApi } from "@/api/events.api";

// SINGLE SOURCE OF TRUTH for pagination size (fixes redeclare error)
const EVENTS_PER_PAGE = 9;

export type ApiEvent = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  tags: string[];
  image?: string | null;
  coverImage?: string | null;
  basePrice: number;
  rating: number;
  totalReviews: number;
  ticketsSold: number;
  views: number;
  availability: string; // "Available" | "Selling Fast" | "Almost Full" | "Hot" | "Sold Out"
  featured: boolean;
  trending: boolean;
  verified: boolean;
  description: string;
  location: string;
  date: string; // ISO or yyyy-mm-dd
  time: string; // "HH:mm"
  attendees: number;
  ticketTypes: Array<z.infer<typeof TicketTypeCreateSchema>>;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

// ---- Debounce ---------------------------------------------------------------
function useDebouncedState<T>(initial: T, delay = 300): [T, (v: T) => void, T] {
  const [val, setVal] = useState<T>(initial);
  const [debounced, setDebounced] = useState<T>(initial);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(val), delay);
    return () => clearTimeout(t);
  }, [val, delay]);
  return [val, setVal, debounced];
}

// ---- Helpers ----------------------------------------------------------------
function formatDateLabel(input: string) {
  const d = new Date(input);
  if (isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function toStatus(avail: string): UIEvent["status"] {
  switch ((avail || "").toLowerCase()) {
    case "selling fast":
      return "selling-fast";
    case "almost full":
      return "almost-full";
    case "hot":
      return "hot";
    case "sold out":
      return "sold-out";
    default:
      return "available";
  }
}

function minTicketPrice(ev: ApiEvent): number {
  const hasTickets = Array.isArray(ev.ticketTypes) && ev.ticketTypes.length > 0;
  if (!hasTickets) return Math.max(0, Number(ev.basePrice) || 0);
  const min = Math.min(...ev.ticketTypes.map((t) => Number(t.price) || 0));
  return isFinite(min) ? min : Math.max(0, Number(ev.basePrice) || 0);
}

function totalTicketsAndLeft(ev: ApiEvent) {
  const hasTickets = Array.isArray(ev.ticketTypes) && ev.ticketTypes.length > 0;
  if (!hasTickets) {
    const total = Math.max(0, Number(ev.attendees) || 0);
    const left = Math.max(0, total - (Number(ev.ticketsSold) || 0));
    return { totalTickets: total, ticketsLeft: left };
  }
  const total = ev.ticketTypes.reduce((s, t) => s + (Number(t.total) || 0), 0);
  const sold =
    ev.ticketTypes.reduce((s, t) => s + (Number((t as any).sold) || 0), 0) ||
    Number(ev.ticketsSold) ||
    0;
  const left = Math.max(0, total - sold);
  return { totalTickets: total, ticketsLeft: left };
}

function buildStartTime(dateStr: string, timeStr?: string) {
  if (!dateStr) return undefined;
  try {
    const iso = timeStr ? `${dateStr}T${timeStr}` : dateStr;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}

/**
 * Default export: wrapper to satisfy Next.js requirement to place
 * useSearchParams() usage under a <Suspense> boundary.
 */
export default function EventsPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] grid place-items-center text-zinc-500">Loading events…</div>}>
      <EventsPageInner />
    </Suspense>
  );
}

/** The real page content (unchanged design/logic). */
function EventsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ---------- UI States ----------
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEvent, setSelectedEvent] = useState<UIEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters / sort
  const [searchTerm, setSearchTerm, debouncedSearch] = useDebouncedState<string>("", 350);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("popularity");

  // Data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [uiEvents, setUiEvents] = useState<UIEvent[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);

  // Slug maps (for share/query-open)
  const [slugById, setSlugById] = useState<Record<number, string>>({});
  const [bySlug, setBySlug] = useState<Record<string, UIEvent>>({});

  // Pagination (client side to preserve design)
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Share URL
  const buildShareUrl = useCallback(
    (slug: string) =>
      typeof window !== "undefined"
        ? `${window.location.origin}${pathname}?event=${encodeURIComponent(slug)}`
        : `${pathname}?event=${encodeURIComponent(slug)}`,
    [pathname]
  );

  // --------- Fetch ALL events (cache locally) ----------
  const fetchAllEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageLimit = 100;
      let page = 1;
      let total = Infinity;
      const all: ApiEvent[] = [];

      while (all.length < total) {
        const res = await EventsApi.list({
          page,
          limit: pageLimit,
          onlyActive: true,
        });
        total = Number(res.total) || 0;
        all.push(...(res.items || []));
        if (!res.items?.length) break;
        page += 1;
      }

      setApiEvents(all);

      // map to UI shape used by cards + modal
      const mapped: UIEvent[] = all.map((ev, i) => {
        const price = minTicketPrice(ev);
        const { totalTickets, ticketsLeft } = totalTicketsAndLeft(ev);
        const status = toStatus(ev.availability);
        const startTime = buildStartTime(ev.date, ev.time);

        return {
          id: i + 1,
          title: ev.title,
          date: formatDateLabel(ev.date),
          time: ev.time || "",
          location: ev.location || "",
          price,
          category: ev.category || "Other",
          image: (ev.image || ev.coverImage || "/placeholder.svg") as string,
          description: ev.description || "",
          attendees: Number(ev.attendees) || 0,
          featured: !!ev.featured,
          trending: !!ev.trending,
          ticketsLeft,
          totalTickets,
          rating: Number(ev.rating) || 0,
          reviews: Number(ev.totalReviews) || 0,
          viewsToday: Math.max(1, Math.round((Number(ev.views) || 0) * 0.07)),
          bookingsToday: Math.max(0, (Number(ev.ticketsSold) || 0) % 50),
          status,
          startTime,
          ticketTypes: ev.ticketTypes?.map((t) => ({
            name: t.name,
            price: Number(t.price) || 0,
            description: t.description || "",
            features: (t.features || []).filter(Boolean) as string[],
            total: Number(t.total) || 0,
            sold: Number((t as any).sold) || 0,
            popular: !!t.popular,
          })) ?? [],
          slug: ev.slug,
          availability: ev.availability,
          verified: !!ev.verified,
          createdAt: ev.createdAt,
          updatedAt: ev.updatedAt,
          tags: ev.tags || [],
        };
      });

      setUiEvents(mapped);

      // Build slug maps
      const _slugById: Record<number, string> = {};
      const _bySlug: Record<string, UIEvent> = {};
      mapped.forEach((ui) => {
        if (ui.slug) {
          _slugById[ui.id] = ui.slug;
          _bySlug[ui.slug] = ui;
        }
      });
      setSlugById(_slugById);
      setBySlug(_bySlug);

      // Categories (dynamic) + "All"
      const cats = Array.from(new Set(all.map((e) => e.category).filter(Boolean)));
      setCategories(["All", ...cats]);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // --------- Open modal from ?event=slug ----------
  useEffect(() => {
    const slug = searchParams.get("event");
    if (!slug || !Object.keys(bySlug).length) return;
    const match = bySlug[slug];
    if (match) {
      setSelectedEvent(match);
      setIsModalOpen(true);
    }
  }, [searchParams, bySlug]);

  // --------- Filtering / sorting (client) ----------
  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();

    return uiEvents.filter((ev) => {
      const matchesSearch =
        !term ||
        ev.title.toLowerCase().includes(term) ||
        ev.description.toLowerCase().includes(term) ||
        ev.location.toLowerCase().includes(term) ||
        ev.tags?.some((t) => t.toLowerCase().includes(term));

      const matchesCategory = selectedCategory === "All" || ev.category === selectedCategory;

      const matchesPrice = (() => {
        if (selectedPriceRange === "all") return true;
        if (selectedPriceRange === "200+") return ev.price >= 200;
        const [min, max] = selectedPriceRange.split("-").map(Number);
        return ev.price >= min && ev.price <= max;
      })();

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [uiEvents, debouncedSearch, selectedCategory, selectedPriceRange]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sortBy) {
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "rating":
        return list.sort((a, b) => b.rating - a.rating);
      case "date":
        return list.sort((a, b) => {
          const at = a.startTime ? a.startTime.getTime() : 0;
          const bt = b.startTime ? b.startTime.getTime() : 0;
          return at - bt;
        });
      case "popularity":
      default:
        return list.sort((a, b) => (b.bookingsToday || 0) - (a.bookingsToday || 0));
    }
  }, [filtered, sortBy]);

  // Pagination slices (uses module-level EVENTS_PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(sorted.length / EVENTS_PER_PAGE));
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
  const pageEvents = sorted.slice(startIndex, startIndex + EVENTS_PER_PAGE);

  // --------- Handlers ----------
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEventClick = (ev: UIEvent) => {
    setSelectedEvent(ev);
    setIsModalOpen(true);
    const slug = ev.slug || slugById[ev.id];
    if (slug) {
      const next = `${pathname}?event=${encodeURIComponent(slug)}`;
      router.replace(next, { scroll: false });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    if (searchParams.get("event")) router.replace(pathname, { scroll: false });
  };

  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedPriceRange("all");
    setSortBy("popularity");
    setCurrentPage(1);
  };

  const selectedShareUrl =
    selectedEvent && (selectedEvent.slug || slugById[selectedEvent.id])
      ? (() => {
        const slug = selectedEvent.slug || slugById[selectedEvent.id];
        return buildShareUrl(slug!);
      })()
      : undefined;

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <HeroSection />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Heading */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full mx-auto font-semibold text-emerald-600 mb-6">
              ALL EVENTS
            </h4>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-3">
              Discover Amazing <br />
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Experiences
              </span>
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Browse through our complete collection of events and find the perfect experience for you.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="mb-12">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="0-50">Under $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-200">$100 - $200</SelectItem>
                      <SelectItem value="200+">Over $200</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="h-10 w-10"
                    >
                      <Grid3X3 className="size-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="h-10 w-10"
                    >
                      <List className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results count + clear */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-zinc-600">
                  {loading ? "Loading events..." : `${filtered.length} events found`}
                  {error ? ` — ${error}` : ""}
                </p>
                {(debouncedSearch || selectedCategory !== "All" || selectedPriceRange !== "all" || sortBy !== "popularity") && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
          >
            {!loading &&
              pageEvents.map((event) => (
                <EventCardSocial key={event.id} event={event} viewMode={viewMode} onClick={() => handleEventClick(event)} />
              ))}
          </div>

          {/* No results */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="size-16 mx-auto mb-6 text-zinc-400" />
              <h3 className="text-xl font-bold text-zinc-800 mb-2">No events found</h3>
              <p className="text-zinc-500 mb-6">Try adjusting your search criteria or filters</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="size-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <NewsletterSignup />

      {/* Event Details Modal (read-only) */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        shareUrl={selectedShareUrl}
      />

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-emerald-900 hover:bg-emerald-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-5 group-hover:scale-110 transition-transform duration-300" />
        </button>
      )}

      <Footer />
    </div>
  );
}
