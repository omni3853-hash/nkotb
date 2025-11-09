"use client";

import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Star,
  TrendingUp,
  Users,
  Flame,
  Sparkles,
  Eye,
  Share2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  CelebrityQuerySchema,
  type CelebrityQuery,
} from "@/utils/schemas/schemas";
import { CelebritiesApi, type Celebrity } from "@/api/celebrities.api";

// ---------------- helpers ----------------
const fmtMoney = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n || 0);

const k = (n: number) => {
  if (!n && n !== 0) return "—";
  if (n < 1000) return String(n);
  const val = n / 1000;
  return `${val.toFixed(val >= 10 ? 0 : 1)}K`;
};

// robust path joiner to append a segment to the current path (no double slashes)
function joinPath(base: string, segment: string) {
  const b = base.replace(/\/+$/, "");
  const s = segment.replace(/^\/+/, "");
  return `${b}/${encodeURIComponent(s)}`.replace(/\/+/g, "/");
}

function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function ShareBtn({ url, title }: { url: string; title: string }) {
  const [busy, setBusy] = useState(false);
  const share = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({ url, title, text: title });
        return;
      }
      setBusy(true);
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (e: any) {
      toast.error(e?.message || "Share failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={share}
      disabled={busy}
      title="Share"
      aria-label="Share"
      className="size-8 hover:bg-blue-50 hover:text-blue-600"
    >
      {busy ? (
        <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Share2 className="size-4" />
      )}
    </Button>
  );
}

// ---------------- constants (match the design) ----------------
const CATEGORIES = ["All", "Actor", "Musician", "Athlete", "Comedian", "Influencer"] as const;
const PRICE_RANGES = [
  { label: "All Prices", value: "all" },
  { label: "Under $50K", value: "0-50000" },
  { label: "$50K - $100K", value: "50000-100000" },
  { label: "$100K - $200K", value: "100000-200000" },
  { label: "Over $200K", value: "200000+" },
] as const;

// ---------------- pagination controls ----------------
function PaginationControls({
  page,
  limit,
  total,
  onPage,
  onLimit,
}: {
  page: number;
  limit: number;
  total: number;
  onPage: (p: number) => void;
  onLimit: (l: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div className="text-sm text-zinc-600">
        Page <span className="font-semibold">{page}</span> of{" "}
        <span className="font-semibold">{totalPages}</span> •{" "}
        {total.toLocaleString()} items
      </div>
      <div className="flex items-center gap-2">
        <Select value={String(limit)} onValueChange={(v) => onLimit(Number(v))}>
          <SelectTrigger className="h-9 w-[120px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[12, 24, 36, 48].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPage(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPage(page + 1)}
            disabled={page * limit >= total}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------- page ----------------
export default function CelebritiesPage() {
  const pathname = usePathname();

  // main list
  const [items, setItems] = useState<Celebrity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [loading, setLoading] = useState(true);

  // hot list (for the “Hot Celebrities” section)
  const [hot, setHot] = useState<Celebrity[]>([]);
  const [hotLoading, setHotLoading] = useState(false);

  // filters matching the original design
  const [search, setSearch] = useState("");
  const dSearch = useDebounced(search, 350);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [price, setPrice] = useState<(typeof PRICE_RANGES)[number]["value"]>("all");

  // live stats
  const [liveBookings, setLiveBookings] = useState(0);
  const [liveViews, setLiveViews] = useState(0);

  useEffect(() => {
    const t1 = setInterval(
      () => setLiveBookings((prev) => prev + Math.floor(Math.random() * 3)),
      3000
    );
    const t2 = setInterval(
      () => setLiveViews((prev) => prev + Math.floor(Math.random() * 10)),
      2000
    );
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  // build server query (without price, which we local-filter to match the design)
  const query = useMemo(() => {
    const out: Partial<CelebrityQuery> = { page, limit };
    if (dSearch) out.search = dSearch;
    if (category !== "All") out.category = category;
    return CelebrityQuerySchema.partial().parse(out);
  }, [page, limit, dSearch, category]);

  // load main list
  const load = async () => {
    setLoading(true);
    try {
      const res = await CelebritiesApi.list(query);
      let list = res.items || [];

      // local price filtering to match the design’s simple dropdown behavior
      if (price !== "all") {
        if (price === "0-50000")
          list = list.filter((x) => (x.basePrice || 0) < 50000);
        else if (price === "50000-100000")
          list = list.filter(
            (x) => (x.basePrice || 0) >= 50000 && (x.basePrice || 0) <= 100000
          );
        else if (price === "100000-200000")
          list = list.filter(
            (x) => (x.basePrice || 0) >= 100000 && (x.basePrice || 0) <= 200000
          );
        else if (price === "200000+")
          list = list.filter((x) => (x.basePrice || 0) >= 200000);
      }

      setItems(list);
      setTotal(res.total || 0);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  // load hot list (top 8)
  const loadHot = async () => {
    setHotLoading(true);
    try {
      const res = await CelebritiesApi.list(
        CelebrityQuerySchema.partial().parse({ page: 1, limit: 8, hot: true })
      );
      setHot(res.items || []);
    } catch (e: any) {
      // don't fail the page if hot query fails—just show none
      setHot([]);
    } finally {
      setHotLoading(false);
    }
  };

  useEffect(() => {
    loadHot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, dSearch, category, price]);

  // helpers
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setPrice("all");
    setPage(1);
  };

  // ---------------- render ----------------
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100">
          <div className="@container/main flex flex-1 flex-col gap-4 px-3 py-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 gap-3 sm:gap-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
                  <span className="text-zinc-500">Book</span>{" "}
                  <span className="text-emerald-900">Celebrities</span>
                </h2>
                <p className="mt-1 text-xs sm:text-sm md:text-base text-zinc-500">
                  Connect with your favorite stars
                </p>
              </div>
            </div>

            {/* Live Stats Dashboard (exact palette) */}
            <div className="px-4 sm:px-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                <Card className="border-2 border-emerald-900/20 bg-gradient-to-br from-emerald-50 to-white">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-emerald-900/70">
                          Live Bookings
                        </p>
                        <p className="mt-1 font-mono text-xl font-bold text-emerald-900 sm:text-2xl lg:text-3xl">
                          {(12450 + liveBookings).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-900 sm:size-10 lg:size-12">
                        <TrendingUp className="size-4 text-white sm:size-5 lg:size-6" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <Sparkles className="size-3 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-600">
                        +{Math.floor(Math.random() * 20 + 10)}% this week
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-white">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-blue-900/70">
                          Active Views
                        </p>
                        <p className="mt-1 font-mono text-xl font-bold text-blue-900 sm:text-2xl lg:text-3xl">
                          {(567890 + liveViews).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500 sm:size-10 lg:size-12">
                        <Eye className="size-4 text-white sm:size-5 lg:size-6" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp className="size-3 text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">
                        Live tracking
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-white">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-purple-900/70">
                          Celebrities
                        </p>
                        <p className="mt-1 font-mono text-xl font-bold text-purple-900 sm:text-2xl lg:text-3xl">
                          {total.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500 sm:size-10 lg:size-12">
                        <Star className="size-4 text-white sm:size-5 lg:size-6" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <Flame className="size-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-600">
                        {hot.length} hot right now
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="pt-4 sm:pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-mono uppercase tracking-wider text-orange-900/70">
                          Avg Rating
                        </p>
                        <p className="mt-1 font-mono text-xl font-bold text-orange-900 sm:text-2xl lg:text-3xl">
                          4.8
                        </p>
                      </div>
                      <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500 sm:size-10 lg:size-12">
                        <Star className="size-4 fill-white text-white sm:size-5 lg:size-6" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <Users className="size-3 text-orange-600" />
                      <span className="text-xs font-medium text-orange-600">
                        From 12K+ reviews
                      </span>
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            </div>

            {/* Hot Celebrities */}
            <div className="px-4 sm:px-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Flame className="size-4 sm:size-5 md:size-6 text-orange-500 flex-shrink-0" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-zinc-800">
                    Hot Celebrities
                  </h3>
                  <Badge className="border-0 bg-orange-500 text-[10px] sm:text-xs text-white">
                    Trending
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl bg-transparent sm:w-auto"
                  size="sm"
                  onClick={() => {
                    // simple UX: reset filters & scroll to "All"
                    clearFilters();
                    document.getElementById("all-celebs")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  View All <ChevronRight className="size-3 sm:size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {hotLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="border-2">
                      <CardContent className="pt-3">
                        <div className="aspect-square animate-pulse rounded-md bg-zinc-100" />
                        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
                      </CardContent>
                    </Card>
                  ))
                  : hot.slice(0, 4).map((c) => {
                    const slug = c.slug || c._id;
                    const href = joinPath(pathname || "", slug);
                    const origin =
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "";
                    const shareUrl = origin ? `${origin}${href}` : href;

                    return (
                      <Link key={c._id} href={href} prefetch>
                        <Card className="group cursor-pointer overflow-hidden border-2 bg-white transition-all duration-300 hover:scale-[1.02] hover:border-emerald-900">
                          <div className="relative aspect-square">
                            <img
                              src={c.image || "/placeholder.svg"}
                              alt={c.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                            <div className="absolute right-2 top-2 flex gap-2 sm:right-3 sm:top-3">
                              <Badge className="border-0 bg-orange-500 text-xs text-white">
                                <Flame className="mr-1 size-3" />
                                Hot
                              </Badge>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                              <h4 className="mb-1 text-lg font-bold text-white sm:text-xl">
                                {c.name}
                              </h4>
                              <div className="flex items-center gap-1 sm:gap-2">
                                {(c.tags || []).slice(0, 2).map((t, i) => (
                                  <Badge
                                    key={`${t}-${i}`}
                                    variant="outline"
                                    className="border-white/30 bg-white/20 text-xs text-white backdrop-blur-sm"
                                  >
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <CardContent className="pt-3 sm:pt-4">
                            <div className="mb-2 flex items-center justify-between sm:mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="size-3 fill-yellow-500 text-yellow-500 sm:size-4" />
                                <span className="text-xs font-bold sm:text-sm">
                                  {c.rating?.toFixed?.(1) ?? c.rating ?? "—"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({c.bookings ?? c.totalReviews ?? 0})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Eye className="size-3" />
                                {k(c.views ?? 0)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                                  FROM
                                </p>
                                <p className="font-mono text-sm sm:text-base md:text-lg font-bold text-emerald-900 truncate">
                                  {fmtMoney(c.basePrice || 0)}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  className="rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] md:text-[12px] text-white bg-emerald-900 hover:bg-emerald-800 group-hover:scale-105 transition-transform"
                                >
                                  Book Now
                                </Button>
                                <ShareBtn url={shareUrl} title={`Book ${c.name}`} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
              </div>
            </div>

            {/* Filters + Search */}
            <div className="px-4 sm:px-6">
              <div className="rounded-xl sm:rounded-2xl border-2 bg-white p-3 sm:p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 size-3 sm:size-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      placeholder="Search celebrities..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl pl-9 sm:pl-10 text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
                    <Select
                      value={category}
                      onValueChange={(v) =>
                        setCategory(v as (typeof CATEGORIES)[number])
                      }
                    >
                      <SelectTrigger className="w-full rounded-xl sm:w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={price}
                      onValueChange={(v) =>
                        setPrice(
                          v as (typeof PRICE_RANGES)[number]["value"]
                        )
                      }
                    >
                      <SelectTrigger className="w-full rounded-xl sm:w-40">
                        <SelectValue placeholder="Price Range" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICE_RANGES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Showing {items.length} of {total.toLocaleString()}
                  </p>
                  {(search || category !== "All" || price !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* All Celebrities Grid */}
            <div className="px-4 sm:px-6" id="all-celebs">
              <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl font-bold text-zinc-800">
                All Celebrities
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} className="border-2">
                      <CardContent className="pt-3">
                        <div className="aspect-square animate-pulse rounded-md bg-zinc-100" />
                        <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
                        <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-100" />
                      </CardContent>
                    </Card>
                  ))
                  : items.map((c) => {
                    const slug = c.slug || c._id;
                    const href = joinPath(pathname || "", slug);
                    const origin =
                      typeof window !== "undefined"
                        ? window.location.origin
                        : "";
                    const shareUrl = origin ? `${origin}${href}` : href;

                    const availability =
                      c.availability || "Available"; // safety
                    const availClass =
                      availability === "Available"
                        ? "bg-green-500"
                        : availability === "Limited"
                          ? "bg-yellow-500"
                          : "bg-red-500";

                    return (
                      <Link key={c._id} href={href} prefetch className="block">
                        <Card className="group cursor-pointer overflow-hidden border-2 bg-white transition-all duration-300 hover:scale-[1.02] hover:border-emerald-900">
                          <div className="relative aspect-square">
                            <img
                              src={c.image || "/placeholder.svg"}
                              alt={c.name}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute left-1.5 sm:left-2 md:left-3 top-1.5 sm:top-2 md:top-3">
                              <Badge
                                className={`${availClass} border-0 text-[10px] sm:text-xs text-white`}
                              >
                                {availability}
                              </Badge>
                            </div>
                            <div className="absolute right-1.5 sm:right-2 md:right-3 top-1.5 sm:top-2 md:top-3 flex flex-col gap-0.5 sm:gap-1 md:gap-2">
                              {c.hot && (
                                <Badge className="border-0 bg-orange-500 text-[10px] sm:text-xs text-white">
                                  <Flame className="mr-0.5 sm:mr-1 size-2.5 sm:size-3" />
                                  Hot
                                </Badge>
                              )}
                              {c.trending && (
                                <Badge className="border-0 bg-emerald-900 text-[10px] sm:text-xs text-white">
                                  <TrendingUp className="mr-0.5 sm:mr-1 size-2.5 sm:size-3" />
                                  Trending
                                </Badge>
                              )}
                            </div>
                            <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-3 left-1.5 sm:left-2 md:left-3 right-1.5 sm:right-2 md:right-3">
                              <h4 className="mb-0.5 sm:mb-1 text-base sm:text-lg md:text-xl font-bold text-white line-clamp-1">
                                {c.name}
                              </h4>
                              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                {(c.tags || []).slice(0, 2).map((t, i) => (
                                  <Badge
                                    key={`${t}-${i}`}
                                    variant="outline"
                                    className="border-white/30 bg-white/20 text-[10px] sm:text-xs text-white backdrop-blur-sm"
                                  >
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <CardContent className="pt-2 sm:pt-3 md:pt-4 px-2 sm:px-4">
                            <p className="mb-2 line-clamp-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                              {c.description || "—"}
                            </p>

                            <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
                              <div className="flex items-center gap-0.5 sm:gap-1 min-w-0 flex-1">
                                <Star className="size-2.5 sm:size-3 md:size-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                                <span className="text-[10px] sm:text-xs md:text-sm font-bold truncate">
                                  {c.rating?.toFixed?.(1) ?? c.rating ?? "—"}
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                  ({c.bookings ?? c.totalReviews ?? 0})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
                                <ShareBtn
                                  url={shareUrl}
                                  title={`Book ${c.name}`}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                                  FROM
                                </p>
                                <p className="font-mono text-sm sm:text-base md:text-lg font-bold text-emerald-900 truncate">
                                  {fmtMoney(c.basePrice || 0)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                className="rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 md:py-4 md:px-4 text-[10px] sm:text-[11px] md:text-[12px] text-white bg-emerald-900 hover:bg-emerald-800 group-hover:scale-105 transition-transform shrink-0"
                              >
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
              </div>

              {!loading && items.length === 0 && (
                <div className="py-8 sm:py-12 text-center px-4">
                  <div className="mx-auto mb-3 sm:mb-4 text-gray-400">
                    <Star className="mx-auto h-12 w-12 sm:h-16 sm:w-16" />
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold text-gray-900">
                    No celebrities found
                  </h3>
                  <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-600">
                    Try adjusting your search criteria or filters
                  </p>
                  <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                    Clear Filters
                  </Button>
                </div>
              )}

              <PaginationControls
                page={page}
                limit={limit}
                total={total}
                onPage={setPage}
                onLimit={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
