"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  TrendingUp,
  Flame,
  ChevronRight,
  ChevronLeft,
  Grid3X3,
  List,
  ArrowUp,
  Calendar,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { CelebritiesApi, type Celebrity } from "@/api/celebrities.api";
import { CelebrityQuerySchema } from "@/utils/schemas/schemas";

// debounce
function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const categories = ["All", "Actor", "Musician", "Athlete", "Comedian", "Influencer"];
const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under $50K", value: "0-50000" },
  { label: "$50K - $100K", value: "50000-100000" },
  { label: "$100K - $200K", value: "100000-200000" },
  { label: "$200K+", value: "200000+" },
];
const availabilityOptions = [
  { label: "All", value: "all" },
  { label: "Available", value: "Available" },
  { label: "Limited", value: "Limited" },
  { label: "Booked", value: "Booked" },
];
const sortOptions = [
  { label: "Popularity", value: "popularity" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Name A-Z", value: "name" },
];

const formatPrice = (price?: number) => {
  const v = price || 0;
  if (v >= 100000) return `$${(v / 1000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
};

const getAvailabilityColor = (availability?: string) => {
  switch (availability) {
    case "Available":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Limited":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Booked":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
};

export default function CelebritiesPage() {
  // filters / ui state
  const [searchTerm, setSearchTerm] = useState("");
  const dSearch = useDebounced(searchTerm, 350);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // data state
  const [items, setItems] = useState<Celebrity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const celebritiesPerPage = 12;

  // fetch (server pagination + local filters)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const query = CelebrityQuerySchema.partial().parse({
          page: currentPage,
          limit: celebritiesPerPage,
          search: dSearch || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
        });
        const res = await CelebritiesApi.list(query);
        let list = res.items || [];

        // local price filters
        if (selectedPriceRange !== "all") {
          if (selectedPriceRange === "0-50000") {
            list = list.filter((x) => (x.basePrice || 0) < 50000);
          } else if (selectedPriceRange === "50000-100000") {
            list = list.filter((x) => (x.basePrice || 0) >= 50000 && (x.basePrice || 0) <= 100000);
          } else if (selectedPriceRange === "100000-200000") {
            list = list.filter((x) => (x.basePrice || 0) >= 100000 && (x.basePrice || 0) <= 200000);
          } else if (selectedPriceRange === "200000+") {
            list = list.filter((x) => (x.basePrice || 0) >= 200000);
          }
        }

        // local availability
        if (selectedAvailability !== "all") {
          list = list.filter((x) => (x.availability || "Available") === selectedAvailability);
        }

        // local sort
        list.sort((a, b) => {
          switch (sortBy) {
            case "price-low":
              return (a.basePrice || 0) - (b.basePrice || 0);
            case "price-high":
              return (b.basePrice || 0) - (a.basePrice || 0);
            case "name":
              return (a.name || "").localeCompare(b.name || "");
            case "popularity":
            default:
              return (b.bookings || 0) - (a.bookings || 0);
          }
        });

        if (!mounted) return;
        setItems(list);
        setTotal(res.total || 0);
      } catch (e: any) {
        if (!mounted) return;
        toast.error(e?.response?.data?.message || e?.message || "Failed to load celebrities");
        setItems([]);
        setTotal(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [
    currentPage,
    celebritiesPerPage,
    dSearch,
    selectedCategory,
    selectedPriceRange,
    selectedAvailability,
    sortBy,
  ]);

  // scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const totalPages = Math.max(1, Math.ceil(total / celebritiesPerPage));
  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-36 pb-16 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto" data-scroll-animate>
            <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full mx-auto font-semibold text-emerald-600 mb-6">
              CELEBRITY DIRECTORY
            </h4>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-4">
              Browse & Book Your Favorite{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Celebrities</span>
            </h1>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Explore our extensive network of verified celebrities, musicians, and influencers. Find the perfect talent for your event and
              book with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="mb-12">
            <div className="bg-emerald-50/20 border border-zinc-200 rounded-xl p-6 ">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
                  <Input
                    placeholder="Search celebrities..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedPriceRange}
                    onValueChange={(value) => {
                      setSelectedPriceRange(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedAvailability}
                    onValueChange={(value) => {
                      setSelectedAvailability(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent>
                      {availabilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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

              {/* Results count */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-zinc-600">{total.toLocaleString()} celebrities found</p>
                {(dSearch ||
                  selectedCategory !== "All" ||
                  selectedPriceRange !== "all" ||
                  selectedAvailability !== "all" ||
                  sortBy !== "popularity") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All");
                        setSelectedPriceRange("all");
                        setSelectedAvailability("all");
                        setSortBy("popularity");
                        setCurrentPage(1);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {loading &&
              Array.from({ length: celebritiesPerPage }).map((_, i) => (
                <Card key={i} className="overflow-hidden py-0 border-0 group bg-white shadow-md">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100 animate-pulse" />
                </Card>
              ))}

            {!loading &&
              items.map((celebrity, index) => (
                <div key={celebrity._id || `${celebrity.name}-${index}`} data-scroll-animate className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <Card
                    className="overflow-hidden py-0 hover:border-emerald-300 transition-all duration-300 hover:scale-105 cursor-pointer border-0 group bg-white shadow-md hover:shadow-xl"
                    onClick={() => setSelectedCelebrity(celebrity)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
                      <img
                        src={celebrity.image || "/placeholder.svg"}
                        alt={celebrity.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {celebrity.hot && (
                          <Badge className="bg-orange-500 text-white border-0 text-xs">
                            <Flame className="size-3 mr-1" />
                            Hot
                          </Badge>
                        )}
                        {celebrity.trending && (
                          <Badge className="bg-emerald-600 text-white border-0 text-xs">
                            <TrendingUp className="size-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>

                      {/* Availability */}
                      <div className="absolute top-3 left-3">
                        <Badge className={`border ${getAvailabilityColor(celebrity.availability)} text-xs`}>
                          {celebrity.availability || "Available"}
                        </Badge>
                      </div>

                      {/* Info Overlay (rating removed) */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-1 truncate">{celebrity.name}</h3>
                        <p className="text-white/80 text-sm mb-3">{celebrity.category}</p>

                        <div className="flex items-center justify-between text-white/90 text-xs mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>{celebrity.bookings ?? 0} bookings</span>
                          </div>
                        </div>

                        <div className="text-white font-bold text-lg">{formatPrice(celebrity.basePrice)}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
          </div>

          {/* No results */}
          {!loading && items.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="size-16 mx-auto mb-6 text-zinc-400" />
              <h3 className="text-xl font-bold text-zinc-800 mb-2">No celebrities found</h3>
              <p className="text-zinc-500 mb-6">Try adjusting your search criteria or filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSelectedPriceRange("all");
                  setSelectedAvailability("all");
                  setSortBy("popularity");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
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

      {/* Celebrity Detail Modal — informational only (no rating, no booking) */}
      {selectedCelebrity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-zinc-200 max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-emerald-900 mb-2">{selectedCelebrity.name}</h2>
                <p className="text-base sm:text-lg text-emerald-600 font-medium mb-3 sm:mb-4">{selectedCelebrity.category}</p>
                <p className="text-sm sm:text-base text-zinc-600 mb-4 sm:mb-6">{selectedCelebrity.description || "—"}</p>

                {/* Quick facts (rating removed) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="text-sm text-zinc-600">Base Price</div>
                    <div className="text-2xl font-bold text-emerald-900">{formatPrice(selectedCelebrity.basePrice)}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-zinc-600">Availability</div>
                    <div className="mt-1">
                      <Badge className={`border ${getAvailabilityColor(selectedCelebrity.availability)}`}>
                        {selectedCelebrity.availability || "Available"}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-zinc-600">Response Time</div>
                    <div className="text-xl font-semibold text-blue-900">{selectedCelebrity.responseTime || "—"}</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="text-sm text-zinc-600">Category</div>
                    <div className="text-xl font-semibold text-amber-800">{selectedCelebrity.category || "—"}</div>
                  </div>
                </div>

                {/* Tags */}
                {Array.isArray(selectedCelebrity.tags) && selectedCelebrity.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-emerald-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCelebrity.tags.map((t, i) => (
                        <Badge key={`${t}-${i}`} className="bg-emerald-100 text-emerald-800 border-emerald-200">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {Array.isArray(selectedCelebrity.achievements) && selectedCelebrity.achievements.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-emerald-900 mb-3">Achievements</h3>
                    <ul className="space-y-2">
                      {selectedCelebrity.achievements.map((a, i) => (
                        <li key={`${a}-${i}`} className="text-sm text-zinc-700">
                          • {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Booking Availability & Slots (read-only) */}
                <div className="mb-6">
                  <h3 className="font-semibold text-emerald-900 mb-3">Booking Availability</h3>
                  {Array.isArray((selectedCelebrity as any).bookingTypes) &&
                    (selectedCelebrity as any).bookingTypes.length > 0 ? (
                    <div className="space-y-3">
                      {(selectedCelebrity as any).bookingTypes.map((bt: any) => (
                        <div
                          key={bt._id || bt.name}
                          className="rounded-xl border-2 p-4 transition-colors hover:border-emerald-900/50"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold">{bt.name}</div>
                              <div className="text-xs text-zinc-600">{bt.duration}</div>
                            </div>
                            <Badge
                              className={`text-white ${(bt.availability ?? 0) > 10
                                ? "bg-green-600"
                                : (bt.availability ?? 0) > 5
                                  ? "bg-yellow-600"
                                  : "bg-red-600"
                                }`}
                            >
                              {bt.availability ?? 0} slots left
                            </Badge>
                          </div>
                          {bt.description && (
                            <div className="mt-2 text-sm text-zinc-600">{bt.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">—</p>
                  )}
                </div>

                {/* Membership Upsell */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <h4 className="font-semibold text-emerald-900 mb-1">Become a Member</h4>
                  <p className="text-sm text-emerald-900/80">
                    Join our membership to unlock booking, premium access, and exclusive features for talents like {selectedCelebrity.name}.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      className="bg-emerald-900 text-white hover:bg-emerald-800"
                      onClick={() => (window.location.href = "/auth")}
                    >
                      Become a Member
                    </Button>
                    <Button variant="outline" onClick={() => (window.location.href = "/auth")}>
                      Sign in
                    </Button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCelebrity(null)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label="Close details"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setSelectedCelebrity(null)} className="flex-1 bg-transparent">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
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
