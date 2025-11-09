"use client";

import * as React from "react";
import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
import { Calendar, Grid3X3, List, ChevronLeft, ChevronRight, ArrowUp, Search, MapPin, Users, Star, Clock, Filter } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { EventsApi, type Event } from "@/api/events.api";

// Debounce hook
function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const categories = ["All", "Music", "Sports", "Art", "Business", "Technology", "Food", "Travel", "Health"];
const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under $50", value: "0-50" },
  { label: "$50 - $100", value: "50-100" },
  { label: "$100 - $200", value: "100-200" },
  { label: "$200+", value: "200+" },
];
const sortOptions = [
  { label: "Popularity", value: "popularity" },
  { label: "Date", value: "date" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Rating", value: "rating" },
];

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getStatusColor = (availability: string) => {
  switch (availability.toLowerCase()) {
    case "selling fast":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "almost full":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "hot":
      return "bg-red-100 text-red-800 border-red-200";
    case "sold out":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-green-100 text-green-800 border-green-200";
  }
};

// Event Card Component
const EventCard = ({
  event,
  viewMode,
  onClick
}: {
  event: Event;
  viewMode: "grid" | "list";
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === "list") {
    return (
      <div
        className="group cursor-pointer bg-white border border-gray-100 rounded-3xl overflow-hidden transition-all duration-500 hover:border-blue-200 hover:bg-blue-50/30"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col lg:flex-row gap-0">
          <div className="lg:w-80 h-64 relative overflow-hidden flex-shrink-0">
            <img
              src={event.image || event.coverImage || "/placeholder-event.jpg"}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent lg:bg-gradient-to-l" />

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <Badge className={`border ${getStatusColor(event.availability)} text-xs font-medium`}>
                {event.availability}
              </Badge>
            </div>

            {/* Featured Badge */}
            {event.featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            )}
          </div>

          <div className="flex-1 p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4" />
                {formatDate(event.date)}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4" />
                {formatTime(event.time)}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
              {event.title}
            </h3>

            <p className="text-gray-600 mb-6 text-lg leading-relaxed line-clamp-2">
              {event.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{event.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{event.attendees} attendees</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${event.basePrice}
                </div>
                <Badge className="bg-gray-100 text-gray-700 border-0 font-medium">
                  {event.category}
                </Badge>
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div
      className="group cursor-pointer bg-white border border-gray-100 rounded-3xl overflow-hidden transition-all duration-500 hover:border-blue-200 hover:bg-blue-50/30 h-full flex flex-col"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={event.image || event.coverImage || "/placeholder-event.jpg"}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge className={`border ${getStatusColor(event.availability)} text-xs font-medium`}>
            {event.availability}
          </Badge>
        </div>

        {/* Featured Badge */}
        {event.featured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all duration-500 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <Button className="bg-white/95 text-blue-600 hover:bg-white border border-blue-200 font-semibold rounded-2xl">
              View Event
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 font-medium">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(event.date)}
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatTime(event.time)}
          </span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 leading-tight line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-600 leading-relaxed line-clamp-2 text-sm mb-4">
          {event.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="font-medium">{event.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            ${event.basePrice}
          </div>
          <Badge className="bg-gray-100 text-gray-700 border-0 font-medium">
            {event.category}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const EventCardSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => {
  if (viewMode === "list") {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden animate-pulse">
        <div className="flex flex-col lg:flex-row gap-0">
          <div className="lg:w-80 h-64 bg-gray-200 flex-shrink-0" />
          <div className="flex-1 p-6 lg:p-8 space-y-4">
            <div className="flex gap-3">
              <div className="h-4 bg-gray-200 rounded-full w-24" />
              <div className="h-4 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-3/4" />
            <div className="h-4 bg-gray-200 rounded-full w-full" />
            <div className="h-4 bg-gray-200 rounded-full w-2/3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-200 rounded-full w-32" />
              <div className="h-4 bg-gray-200 rounded-full w-28" />
            </div>
            <div className="flex justify-between pt-4">
              <div className="h-8 bg-gray-200 rounded-full w-20" />
              <div className="h-10 bg-gray-200 rounded-2xl w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden h-full flex flex-col animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="flex-1 p-6 space-y-3">
        <div className="flex gap-3">
          <div className="h-3 bg-gray-200 rounded-full w-20" />
          <div className="h-3 bg-gray-200 rounded-full w-16" />
        </div>
        <div className="h-5 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-full" />
        <div className="h-3 bg-gray-200 rounded-full w-2/3" />
        <div className="h-3 bg-gray-200 rounded-full w-32" />
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
};

// Events Page Component
function EventsPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters / UI state
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounced(searchTerm, 350);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Data state
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const eventsPerPage = 12;

  // Fetch events
  useEffect(() => {
    let mounted = true;
    const loadEvents = async () => {
      setLoading(true);
      try {
        const query = {
          page: currentPage,
          limit: eventsPerPage,
          search: debouncedSearch || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          onlyActive: true,
        };

        const res = await EventsApi.list(query);
        if (!mounted) return;

        let filteredEvents = res.items || [];

        // Local price filters
        if (selectedPriceRange !== "all") {
          if (selectedPriceRange === "0-50") {
            filteredEvents = filteredEvents.filter((x) => (x.basePrice || 0) < 50);
          } else if (selectedPriceRange === "50-100") {
            filteredEvents = filteredEvents.filter((x) => (x.basePrice || 0) >= 50 && (x.basePrice || 0) <= 100);
          } else if (selectedPriceRange === "100-200") {
            filteredEvents = filteredEvents.filter((x) => (x.basePrice || 0) >= 100 && (x.basePrice || 0) <= 200);
          } else if (selectedPriceRange === "200+") {
            filteredEvents = filteredEvents.filter((x) => (x.basePrice || 0) >= 200);
          }
        }

        // Local sort
        filteredEvents.sort((a, b) => {
          switch (sortBy) {
            case "price-low":
              return (a.basePrice || 0) - (b.basePrice || 0);
            case "price-high":
              return (b.basePrice || 0) - (a.basePrice || 0);
            case "rating":
              return (b.rating || 0) - (a.rating || 0);
            case "date":
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            case "popularity":
            default:
              return (b.ticketsSold || 0) - (a.ticketsSold || 0);
          }
        });

        setEvents(filteredEvents);
        setTotal(res.total || 0);
      } catch (err: any) {
        if (!mounted) return;
        toast.error(err?.response?.data?.message || err?.message || "Failed to load events");
        setEvents([]);
        setTotal(0);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadEvents();
    return () => {
      mounted = false;
    };
  }, [currentPage, debouncedSearch, selectedCategory, selectedPriceRange, sortBy]);

  // Scroll-to-top visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const totalPages = Math.max(1, Math.ceil(total / eventsPerPage));

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEventClick = (event: Event) => {
    router.push(`/events-home/${event.slug}`);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedPriceRange("all");
    setSortBy("popularity");
    setCurrentPage(1);
  };

  const featuredEvents = events.filter(event => event.featured);
  const regularEvents = events.filter(event => !event.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 max-w-4xl mx-auto">
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-2 mb-6 font-semibold text-sm">
              🎉 UPCOMING EVENTS
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                Unforgettable
              </span>{" "}
              Experiences
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Explore our curated collection of events, concerts, and gatherings.
              Find your next adventure and create lasting memories.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { label: "Events", value: "200+" },
              { label: "Cities", value: "50+" },
              { label: "Attendees", value: "100K+" },
              { label: "Categories", value: "10+" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Content */}
      <section className="py-20 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Modern Filter Section */}
          <div className="mb-16">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-2xl font-bold text-gray-900">Find Your Event</h2>
              </div>

              <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                  <Input
                    placeholder="Search events, locations, or categories..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl bg-white transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => {
                      setSelectedCategory(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-48 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl bg-white transition-colors">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category} className="text-lg">
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
                    <SelectTrigger className="w-full sm:w-48 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl bg-white transition-colors">
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value} className="text-lg">
                          {range.label}
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
                    <SelectTrigger className="w-full sm:w-48 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl bg-white transition-colors">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-lg">
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
                      className="h-14 w-14 rounded-2xl border-2 transition-all"
                    >
                      <Grid3X3 className="size-5" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="h-14 w-14 rounded-2xl border-2 transition-all"
                    >
                      <List className="size-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results count and clear filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-gray-100">
                <p className="text-lg text-gray-600 font-medium">
                  {loading ? "Discovering events..." : `Found ${total.toLocaleString()} events`}
                </p>
                {(debouncedSearch || selectedCategory !== "All" || selectedPriceRange !== "all" || sortBy !== "popularity") && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={clearFilters}
                    className="border-2 rounded-2xl text-gray-600 hover:text-gray-700 transition-colors"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Featured Events */}
          {viewMode === "grid" && featuredEvents.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-12 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Featured Events</h2>
                  <p className="text-gray-600 mt-1">Handpicked experiences you won't want to miss</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    viewMode="grid"
                    onClick={() => handleEventClick(event)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          <div className={`
            ${viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
              : "space-y-8"
            }
          `}>
            {loading &&
              Array.from({ length: eventsPerPage }).map((_, i) => (
                <EventCardSkeleton key={i} viewMode={viewMode} />
              ))}

            {!loading && viewMode === "grid" && regularEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                viewMode={viewMode}
                onClick={() => handleEventClick(event)}
              />
            ))}

            {!loading && viewMode === "list" && events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                viewMode={viewMode}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>

          {/* No results */}
          {!loading && events.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No events found</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                We couldn't find any events matching your criteria. Try adjusting your search or filters.
              </p>
              <Button
                size="lg"
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-8 py-3 text-lg transition-colors"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-12 px-6 rounded-2xl border-2 transition-colors"
              >
                <ChevronLeft className="size-5 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="lg"
                    onClick={() => handlePageChange(page)}
                    className={`h-12 w-12 rounded-2xl font-semibold transition-all ${page === currentPage ? '' : 'border-2'
                      }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-12 px-6 rounded-2xl border-2 transition-colors"
              >
                Next
                <ChevronRight className="size-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 flex items-center justify-center group border border-white/20"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-6 group-hover:scale-110 transition-transform duration-300" />
        </button>
      )}

      <Footer />
    </div>
  );
}

// Main Events Page with Suspense
export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading events...</p>
        </div>
      </div>
    }>
      <EventsPageInner />
    </Suspense>
  );
}