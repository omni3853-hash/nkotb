"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Flame,
  Star,
  Bookmark,
  Share2,
  Heart,
  Zap,
  Eye,
  PlusIcon,
  CreditCard,
  CheckCircle,
  X,
} from "lucide-react";
import { EventModal } from "@/components/event-modal";
import type { Event } from "@/components/event-modal";

// Sample events data
const allEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "July 15, 2024",
    time: "6:00 PM",
    location: "Central Park, NYC",
    price: 150,
    category: "Music",
    image: "/summer-music-festival-concert-stage.jpg",
    description:
      "Join us for an unforgettable summer music experience featuring top artists from around the world.",
    attendees: 5000,
    featured: true,
    trending: true,
    ticketsLeft: 45,
    totalTickets: 5000,
    rating: 4.8,
    reviews: 342,
    viewsToday: 1247,
    bookingsToday: 23,
    status: "selling-fast",
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    date: "August 22, 2024",
    time: "9:00 AM",
    location: "Convention Center",
    price: 299,
    category: "Technology",
    image: "/tech-conference-modern-stage-presentation.jpg",
    description:
      "The biggest tech conference of the year with industry leaders and innovative startups.",
    attendees: 2500,
    featured: true,
    trending: true,
    ticketsLeft: 234,
    totalTickets: 2500,
    rating: 4.9,
    reviews: 189,
    viewsToday: 892,
    bookingsToday: 15,
    status: "hot",
  },
  {
    id: 3,
    title: "Art Gallery Opening",
    date: "September 5, 2024",
    time: "7:00 PM",
    location: "Modern Art Museum",
    price: 75,
    category: "Art",
    image: "/contemporary-art-gallery.png",
    description:
      "Exclusive opening of contemporary art exhibition featuring emerging artists.",
    attendees: 200,
    featured: false,
    trending: false,
    ticketsLeft: 89,
    totalTickets: 200,
    rating: 4.6,
    reviews: 67,
    viewsToday: 234,
    bookingsToday: 8,
    status: "available",
  },
  {
    id: 4,
    title: "Food & Wine Tasting",
    date: "October 12, 2024",
    time: "5:00 PM",
    location: "Downtown Plaza",
    price: 120,
    category: "Food & Drink",
    image: "/elegant-wine-tasting-food-event.jpg",
    description:
      "Culinary experience with world-class chefs and premium wine selections.",
    attendees: 300,
    featured: true,
    trending: false,
    ticketsLeft: 12,
    totalTickets: 300,
    rating: 4.7,
    reviews: 124,
    viewsToday: 567,
    bookingsToday: 19,
    status: "almost-full",
  },
  {
    id: 5,
    title: "Comedy Night",
    date: "November 8, 2024",
    time: "8:00 PM",
    location: "Theater District",
    price: 85,
    category: "Entertainment",
    image: "/comedy-club-stage-spotlight.jpg",
    description: "Laugh your night away with top comedians and rising stars.",
    attendees: 400,
    featured: false,
    trending: true,
    ticketsLeft: 156,
    totalTickets: 400,
    rating: 4.5,
    reviews: 98,
    viewsToday: 445,
    bookingsToday: 11,
    status: "available",
  },
  {
    id: 6,
    title: "Fitness Bootcamp",
    date: "December 1, 2024",
    time: "7:00 AM",
    location: "City Park",
    price: 50,
    category: "Sports & Fitness",
    image: "/outdoor-fitness-bootcamp-training.jpg",
    description: "High-intensity workout session with certified trainers.",
    attendees: 100,
    featured: false,
    trending: false,
    ticketsLeft: 67,
    totalTickets: 100,
    rating: 4.4,
    reviews: 45,
    viewsToday: 178,
    bookingsToday: 5,
    status: "available",
  },
  {
    id: 7,
    title: "Business Networking",
    date: "January 15, 2025",
    time: "6:30 PM",
    location: "Business Center",
    price: 95,
    category: "Business",
    image: "/professional-business-networking-event.jpg",
    description: "Connect with industry professionals and expand your network.",
    attendees: 150,
    featured: false,
    trending: false,
    ticketsLeft: 98,
    totalTickets: 150,
    rating: 4.3,
    reviews: 56,
    viewsToday: 289,
    bookingsToday: 7,
    status: "available",
  },
  {
    id: 8,
    title: "Photography Workshop",
    date: "February 20, 2025",
    time: "10:00 AM",
    location: "Art Studio",
    price: 180,
    category: "Education",
    image: "/photography-workshop-camera-equipment.jpg",
    description:
      "Learn professional photography techniques from award-winning photographers.",
    attendees: 25,
    featured: false,
    trending: false,
    ticketsLeft: 3,
    totalTickets: 25,
    rating: 5.0,
    reviews: 18,
    viewsToday: 412,
    bookingsToday: 9,
    status: "almost-full",
  },
];

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

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [liveViews, setLiveViews] = useState(4523);
  const [liveBookings, setLiveBookings] = useState(127);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userBalance, setUserBalance] = useState(500); // User's in-app balance
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [bookingData, setBookingData] = useState<{
    event: Event | null;
    ticketQuantity: number;
    selectedTicketType: string;
    totalPrice: number;
  } | null>(null);
  const eventsPerPage = 6;

  const featuredEvents = allEvents.filter((event) => event.featured);
  const trendingEvents = allEvents.filter((event) => event.trending);

  useEffect(() => {
    const viewsInterval = setInterval(() => {
      setLiveViews((prev) => prev + Math.floor(Math.random() * 5));
    }, 3000);

    const bookingsInterval = setInterval(() => {
      setLiveBookings((prev) => prev + Math.floor(Math.random() * 2));
    }, 5000);

    return () => {
      clearInterval(viewsInterval);
      clearInterval(bookingsInterval);
    };
  }, []);

  // Filter events based on search and filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || event.category === selectedCategory;

      const matchesPrice = (() => {
        if (selectedPriceRange === "all") return true;
        const [min, max] = selectedPriceRange.split("-").map(Number);
        if (selectedPriceRange === "200+") return event.price >= 200;
        return event.price >= min && event.price <= max;
      })();

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [searchTerm, selectedCategory, selectedPriceRange]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + eventsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevFeatured = () => {
    setFeaturedIndex(
      (prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length
    );
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleBookingRequest = (
    event: Event,
    ticketQuantity: number,
    selectedTicketType: string,
    totalPrice: number
  ) => {
    setBookingData({
      event,
      ticketQuantity,
      selectedTicketType,
      totalPrice,
    });
    setShowConfirmationDialog(true);
  };

  const handleConfirmBooking = () => {
    if (!bookingData) return;

    if (userBalance >= bookingData.totalPrice) {
      // Deduct from balance
      setUserBalance((prev) => prev - bookingData.totalPrice);
      setShowConfirmationDialog(false);
      setShowSuccessMessage(true);
      setIsModalOpen(false);
      setSelectedEvent(null);
    } else {
      setShowConfirmationDialog(false);
      setShowInsufficientBalance(true);
    }
  };

  const handleCancelBooking = () => {
    setShowConfirmationDialog(false);
    setBookingData(null);
  };

  const handleDepositRedirect = () => {
    setShowInsufficientBalance(false);
    // In a real app, this would navigate to the deposit page
    // For now, we'll just add some balance
    setUserBalance((prev) => prev + 200);
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
    setBookingData(null);
  };

  const handleCloseInsufficientBalance = () => {
    setShowInsufficientBalance(false);
    setBookingData(null);
  };

  const EventCard = ({ event }: { event: Event }) => {
    const ticketPercentage =
      ((event.totalTickets - event.ticketsLeft) / event.totalTickets) * 100;

    return (
      <div
        className="group border border-border bg-white overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10 relative rounded-xl cursor-pointer"
        onClick={() => handleEventClick(event)}
      >
        <div className="aspect-[16/10] bg-muted relative overflow-hidden">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-col gap-1 sm:gap-2">
            {event.trending && (
              <div className="bg-primary text-primary-foreground px-2 sm:px-3 py-1 text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 rounded-md">
                <Flame className="h-3 w-3" />
                <span className="hidden sm:inline">Trending</span>
              </div>
            )}
            {event.status === "selling-fast" && (
              <div className="bg-orange-500 text-white px-2 sm:px-3 py-1 text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 rounded-md">
                <Zap className="h-3 w-3" />
                <span className="hidden sm:inline">Selling Fast</span>
              </div>
            )}
            {event.status === "almost-full" && (
              <div className="bg-red-500 text-white px-2 sm:px-3 py-1 text-xs uppercase tracking-wider rounded-md">
                <span className="hidden sm:inline">Almost Full</span>
                <span className="sm:hidden">Full</span>
              </div>
            )}
            {event.status === "hot" && (
              <div className="bg-red-600 text-white px-2 sm:px-3 py-1 text-xs uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 rounded-md">
                <TrendingUp className="h-3 w-3" />
                <span className="hidden sm:inline">Hot</span>
              </div>
            )}
          </div>

          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <div className="bg-background text-foreground px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md">
              ${event.price}
            </div>
          </div>

          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 sm:h-8 sm:w-8 bg-background/90 hover:bg-background"
            >
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 sm:h-8 sm:w-8 bg-background/90 hover:bg-background"
            >
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-6 w-6 sm:h-8 sm:w-8 bg-background/90 hover:bg-background"
            >
              <Bookmark className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4 mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-zinc-800 text-balance leading-tight">
              {event.title}
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{event.rating}</span>
              <span className="text-xs text-muted-foreground">
                ({event.reviews})
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              <span>{event.viewsToday} views today</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">
                Availability
              </span>
              <span className="text-xs">{event.ticketsLeft} left</span>
            </div>
            <div className="h-1.5 bg-muted overflow-hidden rounded-full">
              <div
                className={`h-full transition-all duration-500 ${
                  ticketPercentage > 90
                    ? "bg-red-500"
                    : ticketPercentage > 70
                    ? "bg-orange-500"
                    : "bg-primary"
                }`}
                style={{ width: `${ticketPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{event.attendees.toLocaleString()} attendees</span>
            </div>
          </div>

          {event.bookingsToday > 10 && (
            <div className="mb-4 px-3 py-2 bg-muted border border-border rounded-lg">
              <p className="text-xs">
                <span className="text-foreground font-medium">
                  {event.bookingsToday} people
                </span>
                <span className="text-muted-foreground"> booked today</span>
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-wider w-fit"
            >
              {event.category}
            </Badge>
            <Button
              size="sm"
              className="bg-emerald-900 py-3 sm:py-5 px-6 sm:px-8 rounded-full text-zinc-100 text-xs sm:text-[13px] flex items-center gap-2 w-full sm:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleEventClick(event);
              }}
            >
              <span>Book Now</span>
            </Button>
          </div>
        </div>
      </div>
    );
  };

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

              {/* User Balance Display */}
              <div className="px-3 sm:px-4 md:px-6">
                <div className="bg-gradient-to-r from-emerald-900/5 to-emerald-900/10 border border-emerald-900/20 rounded-xl p-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-900/10 rounded-lg">
                        <CreditCard className="h-5 w-5 text-emerald-900" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Account Balance
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Available for bookings
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold font-mono text-emerald-900">
                        ${userBalance}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        In-App Balance
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-3 sm:px-4 md:px-6">
                <div className="mb-8 md:mb-12 border border-border bg-white rounded-xl overflow-hidden">
                  <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-primary" />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Live Views
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-medium text-primary">
                        {liveViews.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-secondary" />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Bookings Today
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-medium text-secondary">
                        {liveBookings}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="h-4 w-4 text-accent" />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Trending
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-medium text-accent">
                        {trendingEvents.length}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Active Events
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-medium text-primary">
                        {allEvents.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 md:mb-12">
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <Flame className="h-5 w-5 text-emerald-800" />
                    <h3 className="text-xl md:text-2xl font-bold text-zinc-800">
                      Trending Now
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="border border-border bg-white p-4 sm:p-6 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer group rounded-xl"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <Badge
                            variant="outline"
                            className="text-xs uppercase tracking-wider"
                          >
                            {event.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                            <span className="text-sm">{event.rating}</span>
                          </div>
                        </div>
                        <h4 className="font-bold text-zinc-800 mb-2 group-hover:text-emerald-800 transition-colors text-sm sm:text-base">
                          {event.title}
                        </h4>
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {event.date}
                          </span>
                          <span className="text-base sm:text-lg font-bold text-emerald-800">
                            ${event.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Events Carousel */}
                <div className="mb-12 md:mb-20">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-zinc-800">
                      Featured Events
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevFeatured}
                        className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextFeatured}
                        className="h-8 w-8 sm:h-10 sm:w-10 bg-transparent"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{
                        transform: `translateX(-${featuredIndex * 100}%)`,
                      }}
                    >
                      {featuredEvents.map((event) => (
                        <div key={event.id} className="min-w-full">
                          <div
                            className="border border-border bg-white overflow-hidden rounded-xl cursor-pointer"
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                              <div className="aspect-[4/3] md:aspect-auto relative">
                                <img
                                  src={event.image || "/placeholder.svg"}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
                                  <Badge
                                    variant="outline"
                                    className="text-xs uppercase tracking-wider w-fit"
                                  >
                                    {event.category}
                                  </Badge>
                                  <div className="flex items-center gap-1.5">
                                    <Star className="h-4 w-4 fill-accent text-accent" />
                                    <span className="text-sm font-medium">
                                      {event.rating}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      ({event.reviews} reviews)
                                    </span>
                                  </div>
                                </div>
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-balance text-zinc-800">
                                  {event.title}
                                </h3>
                                <p className="text-sm sm:text-base text-muted-foreground mb-6 md:mb-8 leading-relaxed">
                                  {event.description}
                                </p>
                                <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                                  <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                    <span className="text-sm md:text-base">
                                      {event.date}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                                    <span className="text-sm md:text-base">
                                      {event.location}
                                    </span>
                                  </div>
                                </div>
                                {event.bookingsToday > 10 && (
                                  <div className="mb-4 md:mb-6 px-3 py-2 md:px-4 md:py-3 bg-muted border border-border rounded-lg">
                                    <p className="text-xs md:text-sm">
                                      <span className="text-primary font-medium">
                                        {event.bookingsToday} people
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        booked this event today
                                      </span>
                                    </p>
                                  </div>
                                )}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                  <Button
                                    size="lg"
                                    className="bg-emerald-900 py-3 px-6 md:py-5 md:px-8 rounded-full text-zinc-100 text-xs md:text-[13px] flex items-center gap-2 w-full sm:w-auto"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEventClick(event);
                                    }}
                                  >
                                    <span>Book Now</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Button>
                                  <span className="text-xl md:text-2xl font-bold text-emerald-800 text-center sm:text-left">
                                    ${event.price}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filters and Search */}
                <div className="mb-8 md:mb-12">
                  <div className="border border-border bg-white p-4 sm:p-6 rounded-xl">
                    <div className="flex flex-col gap-4">
                      {/* Search */}
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search events..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>

                      {/* Filters */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Select
                          value={selectedCategory}
                          onValueChange={setSelectedCategory}
                        >
                          <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category}
                                value={category}
                                className="text-[13px] border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white rounded-full px-3 py-1"
                              >
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={selectedPriceRange}
                          onValueChange={setSelectedPriceRange}
                        >
                          <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Price Range" />
                          </SelectTrigger>
                          <SelectContent>
                            {priceRanges.map((range) => (
                              <SelectItem
                                key={range.value}
                                value={range.value}
                                className="text-[13px] border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white rounded-full px-3 py-1"
                              >
                                {range.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Results count */}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-sm text-muted-foreground">
                        {filteredEvents.length} events
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
                          }}
                          className="text-[13px] border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white rounded-full px-3 py-1 w-full sm:w-auto"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Events Grid */}
                <div className="mb-8 md:mb-12">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {paginatedEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>

                  {/* No results */}
                  {filteredEvents.length === 0 && (
                    <div className="text-center py-12 sm:py-20 border border-border rounded-xl px-4">
                      <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 sm:mb-6 text-muted-foreground" />
                      <h3 className="text-lg sm:text-xl font-bold text-zinc-800 mb-2">
                        No events found
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                        Try adjusting your search criteria or filters
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("All");
                          setSelectedPriceRange("all");
                        }}
                        className="text-[13px] border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white rounded-full px-3 py-1"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="text-[13px] border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white rounded-full px-3 py-1 w-full sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1 overflow-x-auto">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <Button
                            key={page}
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 text-[13px] border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white rounded-full ${
                              page === currentPage
                                ? "bg-emerald-900 text-white"
                                : ""
                            }`}
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
                      className="text-[13px] border-emerald-900 text-emerald-900 hover:bg-emerald-900 hover:text-white rounded-full px-3 py-1 w-full sm:w-auto"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onBookingRequest={handleBookingRequest}
        userBalance={userBalance}
      />

      {/* Confirmation Dialog */}
      {showConfirmationDialog && bookingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-border max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-900" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-800 mb-2">
                Confirm Your Booking
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                You're about to book tickets for{" "}
                <strong>{bookingData.event?.title}</strong>
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Tickets:</span>
                <span className="font-medium">
                  {bookingData.ticketQuantity}x {bookingData.selectedTicketType}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Event:</span>
                <span className="font-medium text-right max-w-[60%] truncate">
                  {bookingData.event?.title}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{bookingData.event?.date}</span>
              </div>
              <div className="border-t border-border pt-2 sm:pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-zinc-800">
                    Total Amount:
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-emerald-900">
                    ${bookingData.totalPrice}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Your Balance:
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-zinc-800">
                    ${userBalance}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleCancelBooking}
                className="flex-1 rounded-lg order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1 bg-emerald-900 hover:bg-emerald-900/90 text-zinc-100 rounded-lg order-1 sm:order-2"
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && bookingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-border max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-800 mb-2">
                Booking Successful!
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your tickets for <strong>{bookingData.event?.title}</strong>{" "}
                have been confirmed.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-semibold text-emerald-900">
                  ${bookingData.totalPrice}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  Remaining Balance:
                </span>
                <span className="font-semibold text-zinc-800">
                  ${userBalance}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                You'll receive a confirmation email shortly with your tickets.
              </p>
              <Button
                onClick={handleCloseSuccessMessage}
                className="bg-emerald-900 hover:bg-emerald-900/90 text-zinc-100 rounded-lg px-6 sm:px-8 w-full sm:w-auto"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Insufficient Balance Message */}
      {showInsufficientBalance && bookingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-border max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <X className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-zinc-800 mb-2">
                Insufficient Balance
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                You don't have enough balance to complete this booking.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-3 sm:p-4 space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Required Amount:</span>
                <span className="font-semibold text-red-600">
                  ${bookingData.totalPrice}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Your Balance:</span>
                <span className="font-semibold text-zinc-800">
                  ${userBalance}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Shortfall:</span>
                <span className="font-semibold text-red-600">
                  ${bookingData.totalPrice - userBalance}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                onClick={handleCloseInsufficientBalance}
                className="flex-1 rounded-lg order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDepositRedirect}
                className="flex-1 bg-emerald-900 hover:bg-emerald-900/90 text-zinc-100 rounded-lg order-1 sm:order-2"
              >
                Add Funds
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
