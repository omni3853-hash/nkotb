"use client";

import { useState, useMemo, useEffect } from "react";
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
  Star,
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

// Sample celebrities data
const allCelebrities = [
  {
    id: 1,
    name: "Keanu Reeves",
    category: "Actor",
    image: "/keanu-reeves-portrait.jpg",
    basePrice: 50000,
    rating: 4.9,
    bookings: 1250,
    views: 45000,
    availability: "Available",
    trending: true,
    hot: true,
    description: "Hollywood A-list actor known for The Matrix and John Wick",
    specialties: ["Film", "Events", "Appearances"],
  },
  {
    id: 2,
    name: "Taylor Swift",
    category: "Musician",
    image: "/portrait-singer.png",
    basePrice: 150000,
    rating: 5.0,
    bookings: 2100,
    views: 98000,
    availability: "Limited",
    trending: true,
    hot: true,
    description: "Grammy-winning pop superstar and cultural icon",
    specialties: ["Performances", "Meet & Greet", "Private Events"],
  },
  {
    id: 3,
    name: "Dwayne Johnson",
    category: "Actor",
    image: "/dwayne-johnson-portrait.jpg",
    basePrice: 75000,
    rating: 4.8,
    bookings: 1800,
    views: 67000,
    availability: "Available",
    trending: true,
    hot: false,
    description: "Former WWE champion turned Hollywood megastar",
    specialties: ["Film", "Fitness", "Corporate Events"],
  },
  {
    id: 4,
    name: "Beyoncé",
    category: "Musician",
    image: "/beyonce-portrait.jpg",
    basePrice: 200000,
    rating: 5.0,
    bookings: 1950,
    views: 89000,
    availability: "Booked",
    trending: true,
    hot: true,
    description: "Queen Bey - Multi-Grammy award winning artist",
    specialties: ["Performances", "Private Events", "Collaborations"],
  },
  {
    id: 5,
    name: "Chris Hemsworth",
    category: "Actor",
    image: "/chris-hemsworth-portrait.jpg",
    basePrice: 60000,
    rating: 4.7,
    bookings: 980,
    views: 52000,
    availability: "Available",
    trending: false,
    hot: false,
    description: "Marvel's Thor and Australian heartthrob",
    specialties: ["Film", "Events", "Charity"],
  },
  {
    id: 6,
    name: "Ariana Grande",
    category: "Musician",
    image: "/ariana-grande-portrait.jpg",
    basePrice: 120000,
    rating: 4.9,
    bookings: 1650,
    views: 78000,
    availability: "Available",
    trending: true,
    hot: false,
    description: "Pop sensation with powerhouse vocals",
    specialties: ["Performances", "Masterclass", "Meet & Greet"],
  },
  {
    id: 7,
    name: "Tom Holland",
    category: "Actor",
    image: "/tom-holland-portrait.jpg",
    basePrice: 55000,
    rating: 4.8,
    bookings: 1120,
    views: 61000,
    availability: "Available",
    trending: false,
    hot: false,
    description: "Spider-Man star and talented performer",
    specialties: ["Film", "Events", "Appearances"],
  },
  {
    id: 8,
    name: "Zendaya",
    category: "Actor",
    image: "/zendaya-portrait.jpg",
    basePrice: 65000,
    rating: 4.9,
    bookings: 1450,
    views: 72000,
    availability: "Limited",
    trending: true,
    hot: true,
    description: "Emmy-winning actress and fashion icon",
    specialties: ["Film", "Fashion", "Corporate Events"],
  },
  {
    id: 9,
    name: "The Weeknd",
    category: "Musician",
    image: "/the-weeknd-portrait.jpg",
    basePrice: 180000,
    rating: 4.9,
    bookings: 890,
    views: 54000,
    availability: "Available",
    trending: true,
    hot: true,
    description: "Grammy-winning R&B and hip-hop artist",
    specialties: ["Performances", "Private Events", "Collaborations"],
  },
  {
    id: 10,
    name: "Scarlett Johansson",
    category: "Actor",
    image: "/scarlett-johansson-portrait.jpg",
    basePrice: 85000,
    rating: 4.8,
    bookings: 1320,
    views: 68000,
    availability: "Available",
    trending: false,
    hot: false,
    description: "Acclaimed actress and Marvel star",
    specialties: ["Film", "Events", "Charity"],
  },
  {
    id: 11,
    name: "Bad Bunny",
    category: "Musician",
    image: "/bad-bunny-portrait.jpg",
    basePrice: 140000,
    rating: 4.8,
    bookings: 1560,
    views: 82000,
    availability: "Limited",
    trending: true,
    hot: true,
    description: "Latin trap and reggaeton superstar",
    specialties: ["Performances", "Meet & Greet", "Private Events"],
  },
  {
    id: 12,
    name: "Ryan Gosling",
    category: "Actor",
    image: "/ryan-gosling-portrait.jpg",
    basePrice: 70000,
    rating: 4.7,
    bookings: 1100,
    views: 59000,
    availability: "Available",
    trending: false,
    hot: false,
    description: "Versatile actor known for diverse roles",
    specialties: ["Film", "Events", "Appearances"],
  },
];

const categories = [
  "All",
  "Actor",
  "Musician",
  "Athlete",
  "Comedian",
  "Influencer",
];

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
  { label: "Rating", value: "rating" },
  { label: "Name A-Z", value: "name" },
];

export default function CelebritiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCelebrity, setSelectedCelebrity] = useState<
    (typeof allCelebrities)[0] | null
  >(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const celebritiesPerPage = 12;

  // Filter celebrities based on search and filters
  const filteredCelebrities = useMemo(() => {
    const filtered = allCelebrities.filter((celebrity) => {
      const matchesSearch =
        celebrity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        celebrity.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || celebrity.category === selectedCategory;

      const matchesPrice = (() => {
        if (selectedPriceRange === "all") return true;
        const [min, max] = selectedPriceRange.split("-").map(Number);
        if (selectedPriceRange === "200000+")
          return celebrity.basePrice >= 200000;
        return celebrity.basePrice >= min && celebrity.basePrice <= max;
      })();

      const matchesAvailability =
        selectedAvailability === "all" ||
        celebrity.availability === selectedAvailability;

      return (
        matchesSearch && matchesCategory && matchesPrice && matchesAvailability
      );
    });

    // Sort celebrities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.basePrice - b.basePrice;
        case "price-high":
          return b.basePrice - a.basePrice;
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        case "popularity":
        default:
          return b.bookings - a.bookings;
      }
    });

    return filtered;
  }, [
    searchTerm,
    selectedCategory,
    selectedPriceRange,
    selectedAvailability,
    sortBy,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredCelebrities.length / celebritiesPerPage);
  const startIndex = (currentPage - 1) * celebritiesPerPage;
  const paginatedCelebrities = filteredCelebrities.slice(
    startIndex,
    startIndex + celebritiesPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  // Get availability color
  const getAvailabilityColor = (availability: string) => {
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

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-36 pb-16 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center mb-12 max-w-3xl mx-auto"
            data-scroll-animate
          >
            <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full mx-auto font-semibold text-emerald-600 mb-6">
              CELEBRITY DIRECTORY
            </h4>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-4">
              Browse & Book Your Favorite{" "}
              <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                Celebrities
              </span>
            </h1>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Explore our extensive network of verified celebrities, musicians,
              and influencers. Find the perfect talent for your event and book
              with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Celebrities Grid Section */}
      <section className="pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters and Search */}
          <div className="mb-12">
            <div className="bg-emerald-50/20 border border-zinc-200 rounded-xl p-6 ">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
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
                <p className="text-sm text-zinc-600">
                  {filteredCelebrities.length} celebrities found
                </p>
                {(searchTerm ||
                  selectedCategory !== "All" ||
                  selectedPriceRange !== "all" ||
                  selectedAvailability !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                      setSelectedPriceRange("all");
                      setSelectedAvailability("all");
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Celebrities Grid */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {paginatedCelebrities.map((celebrity, index) => (
              <div
                key={celebrity.id}
                data-scroll-animate
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
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

                    {/* Availability Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge
                        className={`border ${getAvailabilityColor(
                          celebrity.availability
                        )} text-xs`}
                      >
                        {celebrity.availability}
                      </Badge>
                    </div>

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg mb-1 truncate">
                        {celebrity.name}
                      </h3>
                      <p className="text-white/80 text-sm mb-3">
                        {celebrity.category}
                      </p>

                      <div className="flex items-center justify-between text-white/90 text-xs mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          <span>{celebrity.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>{celebrity.bookings} bookings</span>
                        </div>
                      </div>

                      <div className="text-white font-bold text-lg">
                        {formatPrice(celebrity.basePrice)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {/* No results */}
          {filteredCelebrities.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="size-16 mx-auto mb-6 text-zinc-400" />
              <h3 className="text-xl font-bold text-zinc-800 mb-2">
                No celebrities found
              </h3>
              <p className="text-zinc-500 mb-6">
                Try adjusting your search criteria or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSelectedPriceRange("all");
                  setSelectedAvailability("all");
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  )
                )}
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

      {/* Celebrity Detail Modal */}
      {selectedCelebrity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-emerald-900 mb-2">
                  {selectedCelebrity.name}
                </h2>
                <p className="text-lg text-emerald-600 font-medium mb-4">
                  {selectedCelebrity.category}
                </p>
                <p className="text-zinc-600 mb-4">
                  {selectedCelebrity.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-emerald-900 mb-1">
                      {selectedCelebrity.rating}
                    </div>
                    <div className="text-sm text-zinc-600">Rating</div>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-amber-600 mb-1">
                      {selectedCelebrity.bookings}
                    </div>
                    <div className="text-sm text-zinc-600">Bookings</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-emerald-900 mb-3">
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCelebrity.specialties.map((specialty) => (
                      <Badge
                        key={specialty}
                        className="bg-emerald-100 text-emerald-800 border-emerald-200"
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-zinc-600">Base Price:</span>
                    <span className="text-2xl font-bold text-emerald-900">
                      {formatPrice(selectedCelebrity.basePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-600">Availability:</span>
                    <Badge
                      className={`border ${getAvailabilityColor(
                        selectedCelebrity.availability
                      )}`}
                    >
                      {selectedCelebrity.availability}
                    </Badge>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCelebrity(null)}
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedCelebrity(null)}
                className="flex-1 bg-transparent"
              >
                Close
              </Button>
              <Button
                onClick={() => setSelectedCelebrity(null)}
                className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white"
              >
                Book Now
                <ChevronRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
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
