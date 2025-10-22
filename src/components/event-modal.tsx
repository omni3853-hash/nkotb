"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Heart,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  Flame,
  Zap,
  ArrowRight,
  Minus,
  Plus,
  CreditCard,
  Shield,
  CheckCircle,
  Info,
  User,
  Mail,
  Phone,
  X,
  Building2,
  Ticket,
  MessageSquare,
  ThumbsUp,
  MapPinned,
  Timer,
  Sparkles,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  image: string;
  description: string;
  attendees: number;
  featured: boolean;
  trending: boolean;
  ticketsLeft: number;
  totalTickets: number;
  rating: number;
  reviews: number;
  viewsToday: number;
  bookingsToday: number;
  status: string;
  startTime?: Date;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingRequest?: (
    event: Event,
    ticketQuantity: number,
    selectedTicketType: string,
    totalPrice: number
  ) => void;
  userBalance?: number;
}

export function EventModal({
  event,
  isOpen,
  onClose,
  onBookingRequest,
  userBalance = 0,
}: EventModalProps) {
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [selectedTicketType, setSelectedTicketType] = useState("general");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [liveViewers, setLiveViewers] = useState(0);
  const [recentBookings, setRecentBookings] = useState(0);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    paymentMethod: "card",
  });

  // Simulate live activity
  useEffect(() => {
    if (event) {
      setLiveViewers(Math.floor(Math.random() * 50) + 20);
      setRecentBookings(Math.floor(Math.random() * 10) + 5);

      const interval = setInterval(() => {
        setLiveViewers((prev) => prev + Math.floor(Math.random() * 3) - 1);
        if (Math.random() > 0.7) {
          setRecentBookings((prev) => prev + 1);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [event]);

  if (!event) return null;

  const ticketPercentage =
    ((event.totalTickets - event.ticketsLeft) / event.totalTickets) * 100;

  const ticketTypes = [
    {
      id: "general",
      name: "General Admission",
      price: event.price,
      description: "Standard entry with full access",
      perks: ["Event access", "Standard seating", "Digital ticket"],
    },
    {
      id: "vip",
      name: "VIP Access",
      price: Math.round(event.price * 1.5),
      description: "Premium experience with extras",
      perks: [
        "Priority entry",
        "VIP seating",
        "Welcome drink",
        "Event merchandise",
      ],
    },
    {
      id: "premium",
      name: "Premium Experience",
      price: Math.round(event.price * 2),
      description: "Ultimate event experience",
      perks: [
        "Exclusive entry",
        "Front row seats",
        "Meet & greet",
        "Premium gift bag",
        "Backstage access",
      ],
    },
  ];

  const selectedTicket =
    ticketTypes.find((t) => t.id === selectedTicketType) || ticketTypes[0];
  const totalPrice = selectedTicket.price * ticketQuantity;
  const serviceFee = Math.round(totalPrice * 0.05);
  const finalTotal = totalPrice + serviceFee;

  const handleBooking = () => {
    if (bookingStep === 3) {
      // Use the new booking system with in-app balance
      if (onBookingRequest && event) {
        onBookingRequest(event, ticketQuantity, selectedTicketType, finalTotal);
      } else {
        // Fallback to old behavior if onBookingRequest is not provided
        console.log("Booking processed:", {
          event,
          ticketQuantity,
          selectedTicketType,
          bookingData,
        });
        onClose();
      }
    } else {
      setBookingStep(bookingStep + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selling-fast":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "almost-full":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "hot":
        return "bg-red-600/10 text-red-700 border-red-600/20";
      default:
        return "bg-emerald-900/10 text-emerald-900 border-emerald-900/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "selling-fast":
        return "Selling Fast";
      case "almost-full":
        return "Almost Full";
      case "hot":
        return "Hot Event";
      default:
        return "Available";
    }
  };

  const mockReviews = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 5,
      comment: "Amazing event! Highly recommend attending.",
      date: "2 days ago",
      helpful: 24,
    },
    {
      id: 2,
      name: "Michael Chen",
      rating: 5,
      comment: "Great organization and fantastic atmosphere.",
      date: "1 week ago",
      helpful: 18,
    },
    {
      id: 3,
      name: "Emma Davis",
      rating: 4,
      comment: "Really enjoyed it, would go again!",
      date: "2 weeks ago",
      helpful: 12,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 gap-0 bg-background rounded-xl border-border">
        <div className="relative">
          {/* Header Image with Gradient Overlay */}
          <div className="relative h-72 md:h-96 overflow-hidden rounded-t-xl">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Top Bar with Status and Actions */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border ${getStatusColor(
                    event.status
                  )}`}
                >
                  {event.status === "selling-fast" && (
                    <Zap className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {event.status === "hot" && (
                    <Flame className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {getStatusText(event.status)}
                </Badge>
                {event.trending && (
                  <Badge className="px-4 py-2 text-xs font-mono uppercase tracking-wider border bg-emerald-900/10 text-emerald-900 border-emerald-900/20">
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                    Trending
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-lg bg-white/95 hover:bg-white backdrop-blur-sm border border-border/50"
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      isLiked ? "fill-red-500 text-red-500" : "text-foreground"
                    }`}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-lg bg-white/95 hover:bg-white backdrop-blur-sm border border-border/50"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-lg bg-white/95 hover:bg-white backdrop-blur-sm border border-border/50"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                >
                  <Bookmark
                    className={`h-4 w-4 transition-colors ${
                      isBookmarked
                        ? "fill-emerald-900 text-emerald-900"
                        : "text-foreground"
                    }`}
                  />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-10 w-10 rounded-lg bg-white/95 hover:bg-white backdrop-blur-sm border border-border/50"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end justify-between">
                <div className="flex-1">
                  <Badge
                    variant="outline"
                    className="mb-3 bg-white/10 backdrop-blur-sm border-white/20 text-white"
                  >
                    {event.category}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight text-balance">
                    {event.title}
                  </h2>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-mono font-semibold">
                        {event.rating}
                      </span>
                      <span className="text-sm text-white/70">
                        ({event.reviews} reviews)
                      </span>
                    </div>
                    <Separator
                      orientation="vertical"
                      className="h-4 bg-white/30"
                    />
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span className="font-mono font-semibold">
                        {liveViewers}
                      </span>
                      <span className="text-sm text-white/70">viewing now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8 p-6 md:p-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Live Activity Banner */}
              <div className="bg-emerald-900/5 border border-emerald-900/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Sparkles className="h-5 w-5 text-emerald-900" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Live Activity
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {recentBookings} bookings in the last hour
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-900 text-zinc-100 font-mono">
                    {liveViewers} online
                  </Badge>
                </div>
              </div>

              {/* Tabs for Details */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-xl">
                  <TabsTrigger value="overview" className="rounded-lg">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="rounded-lg">
                    Reviews ({event.reviews})
                  </TabsTrigger>
                  <TabsTrigger value="venue" className="rounded-lg">
                    Venue
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-3">
                      About This Event
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            Date
                          </p>
                          <p className="font-semibold text-foreground">
                            {event.date}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            Time
                          </p>
                          <p className="font-semibold text-foreground">
                            {event.time}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            Location
                          </p>
                          <p className="font-semibold text-foreground">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-xl p-4 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-1">
                            Capacity
                          </p>
                          <p className="font-semibold text-foreground">
                            {event.attendees.toLocaleString()} attendees
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                      <Eye className="h-5 w-5 text-primary mb-2" />
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {event.viewsToday}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Views Today
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-900/5 to-emerald-900/10 rounded-xl p-4 border border-emerald-900/20">
                      <TrendingUp className="h-5 w-5 text-emerald-900 mb-2" />
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {event.bookingsToday}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bookings Today
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                      <Ticket className="h-5 w-5 text-orange-600 mb-2" />
                      <p className="text-2xl font-bold font-mono text-foreground">
                        {event.ticketsLeft}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tickets Left
                      </p>
                    </div>
                  </div>

                  {/* Availability Progress */}
                  <div className="bg-muted/30 rounded-xl p-5 border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          Ticket Availability
                        </span>
                      </div>
                      <span className="text-sm font-mono font-semibold text-foreground">
                        {Math.round(ticketPercentage)}% sold
                      </span>
                    </div>
                    <Progress
                      value={ticketPercentage}
                      className="h-3 rounded-full"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {event.ticketsLeft} of {event.totalTickets} tickets
                      remaining
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4 mt-6">
                  {/* Reviews Summary */}
                  <div className="bg-muted/30 rounded-xl p-6 border border-border">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-foreground mb-1">
                          {event.rating}
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(event.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {event.reviews} reviews
                        </p>
                      </div>
                      <Separator orientation="vertical" className="h-20" />
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-8">
                              {stars} ★
                            </span>
                            <Progress
                              value={stars === 5 ? 75 : stars === 4 ? 20 : 5}
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {stars === 5 ? "75%" : stars === 4 ? "20%" : "5%"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-4">
                    {mockReviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-muted/30 rounded-xl p-5 border border-border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {review.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {review.date}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {review.comment}
                        </p>
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1.5" />
                            Helpful ({review.helpful})
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                          >
                            <MessageSquare className="h-3 w-3 mr-1.5" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="venue" className="space-y-6 mt-6">
                  <div className="bg-muted/30 rounded-xl p-6 border border-border">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {event.location}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          123 Event Street, City Center, ST 12345
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg bg-transparent"
                      >
                        <MapPinned className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                    </div>

                    <div className="aspect-video bg-muted rounded-xl overflow-hidden border border-border">
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <MapPin className="h-12 w-12" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                        <Info className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Parking Available
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Free parking on-site
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                        <Info className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Accessible Venue
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Wheelchair accessible
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-card rounded-xl border border-border p-6 space-y-6">
                {/* Price Header */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-foreground">
                      ${selectedTicket.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      per ticket
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedTicket.description}
                  </p>
                </div>

                <Separator />

                {/* Booking Steps Indicator */}
                {showBookingForm && (
                  <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center flex-1">
                        <div
                          className={`flex items-center justify-center h-8 w-8 rounded-full border-2 font-mono text-sm font-semibold transition-colors ${
                            bookingStep >= step
                              ? "bg-emerald-900 border-emerald-900 text-zinc-100"
                              : "bg-background border-border text-muted-foreground"
                          }`}
                        >
                          {bookingStep > step ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            step
                          )}
                        </div>
                        {step < 3 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 transition-colors ${
                              bookingStep > step
                                ? "bg-emerald-900"
                                : "bg-border"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 1: Ticket Selection */}
                {(!showBookingForm || bookingStep === 1) && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">
                        Select Ticket Type
                      </Label>
                      <div className="space-y-2">
                        {ticketTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setSelectedTicketType(type.id)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              selectedTicketType === type.id
                                ? "border-emerald-900 bg-emerald-900/5"
                                : "border-border hover:border-emerald-900/30 bg-background"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-foreground">
                                  {type.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {type.description}
                                </p>
                              </div>
                              <Badge className="bg-emerald-900 text-zinc-100 font-mono">
                                ${type.price}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {type.perks.map((perk, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {perk}
                                </Badge>
                              ))}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-3 block">
                        Quantity
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() =>
                            setTicketQuantity(Math.max(1, ticketQuantity - 1))
                          }
                          className="h-11 w-11 rounded-xl"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={ticketQuantity}
                          onChange={(e) =>
                            setTicketQuantity(
                              Math.max(1, Number.parseInt(e.target.value) || 1)
                            )
                          }
                          className="flex-1 text-center font-mono text-lg font-semibold rounded-xl"
                          min="1"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setTicketQuantity(ticketQuantity + 1)}
                          className="h-11 w-11 rounded-xl"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Information */}
                {showBookingForm && bookingStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold mb-2 block"
                      >
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={bookingData.name}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter your full name"
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold mb-2 block"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={bookingData.email}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter your email"
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm font-semibold mb-2 block"
                      >
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={bookingData.phone}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Enter your phone number"
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment */}
                {showBookingForm && bookingStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold mb-3 block">
                        Payment Method
                      </Label>
                      <div className="bg-emerald-900/5 border border-emerald-900/20 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-900/10 rounded-lg">
                            <CreditCard className="h-5 w-5 text-emerald-900" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">
                              In-App Balance
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pay using your account balance
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono font-semibold text-emerald-900">
                              ${userBalance}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Available
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-emerald-900/5 border border-emerald-900/10 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-emerald-900 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">
                            Secure Payment
                          </p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Payment will be deducted from your in-app balance.
                            {userBalance < finalTotal && (
                              <span className="text-red-600 font-medium">
                                {" "}
                                Insufficient balance - you'll need to add funds.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-3 border border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tickets ({ticketQuantity}x)
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      ${totalPrice}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-mono font-semibold text-foreground">
                      ${serviceFee}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold font-mono text-emerald-900">
                      ${finalTotal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span
                      className={`font-mono font-semibold ${
                        userBalance >= finalTotal
                          ? "text-emerald-900"
                          : "text-red-600"
                      }`}
                    >
                      ${userBalance}
                    </span>
                  </div>
                  {userBalance < finalTotal && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Shortfall</span>
                      <span className="font-mono font-semibold text-red-600">
                        ${finalTotal - userBalance}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleBooking}
                    className={`w-full py-6 rounded-xl font-semibold text-base ${
                      showBookingForm &&
                      bookingStep === 3 &&
                      userBalance < finalTotal
                        ? "bg-red-600 hover:bg-red-600/90 text-zinc-100"
                        : "bg-emerald-900 hover:bg-emerald-900/90 text-zinc-100"
                    }`}
                  >
                    {!showBookingForm ? (
                      <>
                        <Ticket className="h-5 w-5 mr-2" />
                        Continue to Booking
                      </>
                    ) : bookingStep < 3 ? (
                      <>
                        Next Step
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    ) : userBalance < finalTotal ? (
                      <>
                        <X className="h-5 w-5 mr-2" />
                        Insufficient Balance
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Complete Payment
                      </>
                    )}
                  </Button>

                  {showBookingForm && bookingStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setBookingStep(bookingStep - 1)}
                      className="w-full rounded-xl"
                    >
                      Back
                    </Button>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-900 mt-0.5 flex-shrink-0" />
                    <span>Free cancellation up to 24 hours before event</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-900 mt-0.5 flex-shrink-0" />
                    <span>Instant confirmation via email</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-900 mt-0.5 flex-shrink-0" />
                    <span>Mobile tickets accepted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
