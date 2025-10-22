"use client";

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
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Star,
  TrendingUp,
  Users,
  Flame,
  Sparkles,
  Eye,
  Heart,
  Share2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// Sample celebrities data
const allCelebrities = [
  {
    id: 1,
    name: "Keanu Reeves",
    category: "Actor",
    tags: ["Actor", "Producer"],
    image: "/keanu-reeves-portrait.jpg",
    basePrice: 50000,
    rating: 4.9,
    bookings: 1250,
    views: 45000,
    availability: "Available",
    trending: true,
    hot: true,
    description: "Hollywood A-list actor known for The Matrix and John Wick",
  },
  {
    id: 2,
    name: "Taylor Swift",
    category: "Musician",
    tags: ["Singer", "Songwriter"],
    image: "/portrait-singer.png",
    basePrice: 150000,
    rating: 5.0,
    bookings: 2100,
    views: 98000,
    availability: "Limited",
    trending: true,
    hot: true,
    description: "Grammy-winning pop superstar and cultural icon",
  },
  {
    id: 3,
    name: "Dwayne Johnson",
    category: "Actor",
    tags: ["Actor", "Producer", "Athlete"],
    image: "/dwayne-johnson-portrait.jpg",
    basePrice: 75000,
    rating: 4.8,
    bookings: 1800,
    views: 67000,
    availability: "Available",
    trending: true,
    hot: false,
    description: "Former WWE champion turned Hollywood megastar",
  },
  {
    id: 4,
    name: "Beyoncé",
    category: "Musician",
    tags: ["Singer", "Performer"],
    image: "/beyonce-portrait.jpg",
    basePrice: 200000,
    rating: 5.0,
    bookings: 1950,
    views: 89000,
    availability: "Booked",
    trending: true,
    hot: true,
    description: "Queen Bey - Multi-Grammy award winning artist",
  },
  {
    id: 5,
    name: "Chris Hemsworth",
    category: "Actor",
    tags: ["Actor", "Model"],
    image: "/chris-hemsworth-portrait.jpg",
    basePrice: 60000,
    rating: 4.7,
    bookings: 980,
    views: 52000,
    availability: "Available",
    trending: false,
    hot: false,
    description: "Marvel's Thor and Australian heartthrob",
  },
  {
    id: 6,
    name: "Ariana Grande",
    category: "Musician",
    tags: ["Singer", "Actress"],
    image: "/ariana-grande-portrait.jpg",
    basePrice: 120000,
    rating: 4.9,
    bookings: 1650,
    views: 78000,
    availability: "Available",
    trending: true,
    hot: false,
    description: "Pop sensation with powerhouse vocals",
  },
  {
    id: 7,
    name: "Tom Holland",
    category: "Actor",
    tags: ["Actor", "Dancer"],
    image: "/tom-holland-portrait.jpg",
    basePrice: 55000,
    rating: 4.8,
    bookings: 1120,
    views: 61000,
    availability: "Available",
    trending: false,
    hot: false,
    description: "Spider-Man star and talented performer",
  },
  {
    id: 8,
    name: "Zendaya",
    category: "Actor",
    tags: ["Actress", "Singer", "Model"],
    image: "/zendaya-portrait.jpg",
    basePrice: 65000,
    rating: 4.9,
    bookings: 1450,
    views: 72000,
    availability: "Limited",
    trending: true,
    hot: true,
    description: "Emmy-winning actress and fashion icon",
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
  { label: "Over $200K", value: "200000+" },
];

export default function CelebritiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [liveBookings, setLiveBookings] = useState(0);
  const [liveViews, setLiveViews] = useState(0);

  // Live stats animation
  useEffect(() => {
    const bookingsInterval = setInterval(() => {
      setLiveBookings((prev) => prev + Math.floor(Math.random() * 3));
    }, 3000);

    const viewsInterval = setInterval(() => {
      setLiveViews((prev) => prev + Math.floor(Math.random() * 10));
    }, 2000);

    return () => {
      clearInterval(bookingsInterval);
      clearInterval(viewsInterval);
    };
  }, []);

  // Filter celebrities
  const filteredCelebrities = useMemo(() => {
    return allCelebrities.filter((celebrity) => {
      const matchesSearch =
        celebrity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        celebrity.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        celebrity.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "All" || celebrity.category === selectedCategory;

      const matchesPrice = (() => {
        if (selectedPriceRange === "all") return true;
        const [min, max] = selectedPriceRange.split("-").map(Number);
        if (selectedPriceRange === "200000+")
          return celebrity.basePrice >= 200000;
        return celebrity.basePrice >= min && celebrity.basePrice <= max;
      })();

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchTerm, selectedCategory, selectedPriceRange]);

  const hotCelebrities = allCelebrities.filter((c) => c.hot);
  const trendingCelebrities = allCelebrities.filter((c) => c.trending);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100">
          <div className="@container/main flex flex-1 flex-col gap-2 px-3">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Header */}
              <div className="flex px-4 sm:px-6 justify-between items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                    <span className="text-zinc-500">Book</span>{" "}
                    <span className="text-emerald-900">Celebrities</span>
                  </h2>
                  <p className="text-zinc-500 mt-1 text-sm sm:text-base">
                    Connect with your favorite stars
                  </p>
                </div>
              </div>

              {/* Live Stats Dashboard */}
              <div className="px-4 sm:px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Card className="border-2 border-emerald-900/20 bg-gradient-to-br from-emerald-50 to-white">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-emerald-900/70">
                            Live Bookings
                          </p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-900 font-mono mt-1">
                            {(12450 + liveBookings).toLocaleString()}
                          </p>
                        </div>
                        <div className="size-8 sm:size-10 lg:size-12 rounded-xl bg-emerald-900 flex items-center justify-center">
                          <TrendingUp className="size-4 sm:size-5 lg:size-6 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Sparkles className="size-3 text-emerald-600" />
                        <span className="text-xs text-emerald-600 font-medium">
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
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 font-mono mt-1">
                            {(567890 + liveViews).toLocaleString()}
                          </p>
                        </div>
                        <div className="size-8 sm:size-10 lg:size-12 rounded-xl bg-blue-500 flex items-center justify-center">
                          <Eye className="size-4 sm:size-5 lg:size-6 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="size-3 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">
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
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 font-mono mt-1">
                            {allCelebrities.length}
                          </p>
                        </div>
                        <div className="size-8 sm:size-10 lg:size-12 rounded-xl bg-purple-500 flex items-center justify-center">
                          <Star className="size-4 sm:size-5 lg:size-6 text-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Flame className="size-3 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">
                          {hotCelebrities.length} hot right now
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-50 to-white">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-mono uppercase tracking-wider text-orange-900/70">
                            Avg Rating
                          </p>
                          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 font-mono mt-1">
                            4.8
                          </p>
                        </div>
                        <div className="size-8 sm:size-10 lg:size-12 rounded-xl bg-orange-500 flex items-center justify-center">
                          <Star className="size-4 sm:size-5 lg:size-6 text-white fill-white" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <Users className="size-3 text-orange-600" />
                        <span className="text-xs text-orange-600 font-medium">
                          From 12K+ reviews
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Hot Celebrities Section */}
              <div className="px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <Flame className="size-5 sm:size-6 text-orange-500" />
                    <h3 className="text-xl sm:text-2xl font-bold text-zinc-800">
                      Hot Celebrities
                    </h3>
                    <Badge className="bg-orange-500 text-white border-0 text-xs">
                      Trending
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-xl bg-transparent w-full sm:w-auto"
                    size="sm"
                  >
                    View All
                    <ChevronRight className="size-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hotCelebrities.slice(0, 4).map((celebrity) => (
                    <Link
                      key={celebrity.id}
                      href={`/user-dashboard/celebrities/${celebrity.id}`}
                    >
                      <Card className="overflow-hidden hover:border-emerald-900 transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 group bg-white">
                        <div className="relative aspect-square">
                          <img
                            src={celebrity.image || "/placeholder.svg"}
                            alt={celebrity.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-2">
                            <Badge className="bg-orange-500 text-white border-0 text-xs">
                              <Flame className="size-3 mr-1" />
                              Hot
                            </Badge>
                          </div>
                          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                            <h4 className="text-white font-bold text-lg sm:text-xl mb-1">
                              {celebrity.name}
                            </h4>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {celebrity.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <CardContent className="pt-3 sm:pt-4">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="size-3 sm:size-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-xs sm:text-sm">
                                {celebrity.rating}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({celebrity.bookings})
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Eye className="size-3" />
                              {(celebrity.views / 1000).toFixed(1)}K
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground font-mono">
                                FROM
                              </p>
                              <p className="text-base sm:text-lg font-bold text-emerald-900 font-mono">
                                ${(celebrity.basePrice / 1000).toFixed(0)}K
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="bg-emerald-900 hover:bg-emerald-800 text-white py-2 sm:py-4 px-2 sm:px-4 rounded-lg text-[10px] sm:text-[12px] group-hover:scale-105 transition-transform"
                            >
                              Book Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Filters and Search */}
              <div className="px-4 sm:px-6">
                <div className="bg-white rounded-2xl p-4 sm:p-6 border-2">
                  <div className="flex flex-col gap-4">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search celebrities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl w-full"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-full sm:w-40 rounded-xl">
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
                        onValueChange={setSelectedPriceRange}
                      >
                        <SelectTrigger className="w-full sm:w-40 rounded-xl">
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
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-sm text-gray-600">
                      Showing {filteredCelebrities.length} celebrities
                    </p>
                    {(searchTerm ||
                      selectedCategory !== "All" ||
                      selectedPriceRange !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("All");
                          setSelectedPriceRange("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* All Celebrities Grid */}
              <div className="px-4 sm:px-6">
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-800 mb-4">
                  All Celebrities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredCelebrities.map((celebrity) => (
                    <Link
                      key={celebrity.id}
                      href={`/celebrities/${celebrity.id}`}
                    >
                      <Card className="overflow-hidden hover:border-emerald-900 transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 group bg-white">
                        <div className="relative aspect-square">
                          <img
                            src={celebrity.image || "/placeholder.svg"}
                            alt={celebrity.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1 sm:gap-2">
                            {celebrity.hot && (
                              <Badge className="bg-orange-500 text-white border-0 text-xs">
                                <Flame className="size-3 mr-1" />
                                Hot
                              </Badge>
                            )}
                            {celebrity.trending && (
                              <Badge className="bg-emerald-900 text-white border-0 text-xs">
                                <TrendingUp className="size-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                            <Badge
                              className={`${
                                celebrity.availability === "Available"
                                  ? "bg-green-500"
                                  : celebrity.availability === "Limited"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              } text-white border-0 text-xs`}
                            >
                              {celebrity.availability}
                            </Badge>
                          </div>
                          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3">
                            <h4 className="text-white font-bold text-lg sm:text-xl mb-1">
                              {celebrity.name}
                            </h4>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {celebrity.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <CardContent className="pt-3 sm:pt-4">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                            {celebrity.description}
                          </p>
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-1">
                              <Star className="size-3 sm:size-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-xs sm:text-sm">
                                {celebrity.rating}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({celebrity.bookings})
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 sm:size-8 hover:bg-red-50 hover:text-red-500"
                                onClick={(e) => e.preventDefault()}
                              >
                                <Heart className="size-3 sm:size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 sm:size-8 hover:bg-blue-50 hover:text-blue-500"
                                onClick={(e) => e.preventDefault()}
                              >
                                <Share2 className="size-3 sm:size-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-muted-foreground font-mono">
                                FROM
                              </p>
                              <p className="text-base sm:text-lg font-bold text-emerald-900 font-mono">
                                ${(celebrity.basePrice / 1000).toFixed(0)}K
                              </p>
                            </div>
                            <Button
                              size="sm"
                              className="bg-emerald-900 hover:bg-emerald-800 text-white py-2 sm:py-4 px-2 sm:px-4 rounded-xl text-[10px] sm:text-[12px] group-hover:scale-105 transition-transform"
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {filteredCelebrities.length === 0 && (
                  <div className="text-center py-8 sm:py-12">
                    <div className="text-gray-400 mb-4">
                      <Star className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      No celebrities found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("All");
                        setSelectedPriceRange("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
