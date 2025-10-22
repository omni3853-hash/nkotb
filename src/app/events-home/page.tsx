"use client";

import { useState, useEffect } from "react";
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
import { EventModal } from "@/components/event-modal";
import type { Event } from "@/components/event-modal";
import { HeroSection } from "@/components/events/hero-section";
import { LiveStatsDashboard } from "@/components/events/live-stats-dashboard";
import { RecommendationsSection } from "@/components/events/recommendations-section";
import { CategoryGrid } from "@/components/events/category-grid";
import { CountdownSection } from "@/components/events/countdown-section";
import { NewsletterSignup } from "@/components/events/newsletter-signup";
import { EventCardSocial } from "@/components/events/event-card-social";
import {
  Search,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Calendar,
  MapPin,
  Zap,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

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
    startTime: new Date("2024-07-15T18:00:00"),
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
    startTime: new Date("2024-08-22T09:00:00"),
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
    startTime: new Date("2024-09-05T19:00:00"),
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
    startTime: new Date("2024-10-12T17:00:00"),
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
    startTime: new Date("2024-11-08T20:00:00"),
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
    startTime: new Date("2024-12-01T07:00:00"),
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
    startTime: new Date("2025-01-15T18:30:00"),
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
    startTime: new Date("2025-02-20T10:00:00"),
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

const sortOptions = [
  { label: "Popularity", value: "popularity" },
  { label: "Date", value: "date" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Rating", value: "rating" },
];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [userBalance, setUserBalance] = useState(500);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [bookingData, setBookingData] = useState<{
    event: Event | null;
    ticketQuantity: number;
    selectedTicketType: string;
    totalPrice: number;
  } | null>(null);

  const eventsPerPage = 9;

  // Filter events based on search and filters
  const filteredEvents = allEvents.filter((event) => {
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

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "date":
        return (
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
      case "popularity":
      default:
        return b.bookingsToday - a.bookingsToday;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const paginatedEvents = sortedEvents.slice(
    startIndex,
    startIndex + eventsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  return (
    <div className="bg-white min-h-screen">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Events Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
              Browse through our complete collection of events and find the
              perfect experience for you.
            </p>
          </div>

          {/* Filters and Search */}
          <div className="mb-12">
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
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

                  <Select value={sortBy} onValueChange={setSortBy}>
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
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-sm text-zinc-600">
                  {filteredEvents.length} events found
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
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {paginatedEvents.map((event) => (
              <EventCardSocial
                key={event.id}
                event={event}
                viewMode={viewMode}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>

          {/* No results */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <Calendar className="size-16 mx-auto mb-6 text-zinc-400" />
              <h3 className="text-xl font-bold text-zinc-800 mb-2">
                No events found
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

      {/* Newsletter Signup */}
      <NewsletterSignup />

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
          <div className="bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-emerald-900" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">
                Confirm Your Booking
              </h3>
              <p className="text-sm text-zinc-600">
                You're about to book tickets for{" "}
                <strong>{bookingData.event?.title}</strong>
              </p>
            </div>

            <div className="bg-zinc-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Tickets:</span>
                <span className="font-medium">
                  {bookingData.ticketQuantity}x {bookingData.selectedTicketType}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Event:</span>
                <span className="font-medium text-right max-w-[60%] truncate">
                  {bookingData.event?.title}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Date:</span>
                <span className="font-medium">{bookingData.event?.date}</span>
              </div>
              <div className="border-t border-zinc-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-zinc-800">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-emerald-900">
                    ${bookingData.totalPrice}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-zinc-600">Your Balance:</span>
                  <span className="text-sm font-medium text-zinc-800">
                    ${userBalance}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelBooking}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white"
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
          <div className="bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">
                Booking Successful!
              </h3>
              <p className="text-sm text-zinc-600">
                Your tickets for <strong>{bookingData.event?.title}</strong>{" "}
                have been confirmed.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Amount Paid:</span>
                <span className="font-semibold text-emerald-900">
                  ${bookingData.totalPrice}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Remaining Balance:</span>
                <span className="font-semibold text-zinc-800">
                  ${userBalance}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-zinc-600 mb-4">
                You'll receive a confirmation email shortly with your tickets.
              </p>
              <Button
                onClick={handleCloseSuccessMessage}
                className="bg-emerald-900 hover:bg-emerald-800 text-white px-8 w-full"
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
          <div className="bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">
                Insufficient Balance
              </h3>
              <p className="text-sm text-zinc-600">
                You don't have enough balance to complete this booking.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Required Amount:</span>
                <span className="font-semibold text-red-600">
                  ${bookingData.totalPrice}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Your Balance:</span>
                <span className="font-semibold text-zinc-800">
                  ${userBalance}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Shortfall:</span>
                <span className="font-semibold text-red-600">
                  ${bookingData.totalPrice - userBalance}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCloseInsufficientBalance}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDepositRedirect}
                className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white"
              >
                Add Funds
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
