"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import {
  Star,
  Users,
  Heart,
  Share2,
  Bookmark,
  TrendingUp,
  Eye,
  CheckCircle2,
  Flame,
  Award,
  Shield,
  CreditCard,
  ChevronLeft,
  Sparkles,
  Wallet,
  AlertCircle,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

// Sample celebrity data (in real app, fetch based on ID)
const celebrityData = {
  id: 1,
  name: "Keanu Reeves",
  category: "Actor",
  tags: ["Actor", "Producer", "Musician"],
  image: "/keanu-reeves-professional.jpg",
  coverImage: "/hollywood-red-carpet.jpg",
  basePrice: 50000,
  rating: 4.9,
  totalReviews: 1250,
  bookings: 1250,
  views: 45000,
  availability: "Available",
  trending: true,
  hot: true,
  verified: true,
  responseTime: "Within 24 hours",
  description:
    "Hollywood A-list actor known for iconic roles in The Matrix trilogy and John Wick franchise. With over 30 years in the industry, Keanu brings professionalism, charisma, and genuine warmth to every appearance.",
  achievements: [
    "3x MTV Movie Award Winner",
    "Hollywood Walk of Fame Star",
    "Saturn Award for Best Actor",
    "Empire Award for Best Actor",
  ],
  bookingTypes: [
    {
      id: 1,
      name: "Virtual Meet & Greet",
      duration: "30 minutes",
      price: 15000,
      description: "Personal video call with Q&A session",
      features: [
        "30-minute private video call",
        "Q&A session",
        "Personalized autograph (digital)",
        "Photo opportunity (screenshot)",
      ],
      availability: 15,
      popular: false,
    },
    {
      id: 2,
      name: "In-Person Appearance",
      duration: "2 hours",
      price: 50000,
      description: "Attend your event in person",
      features: [
        "2-hour event appearance",
        "Photo opportunities",
        "Brief meet & greet",
        "Social media mention",
      ],
      availability: 5,
      popular: true,
    },
    {
      id: 3,
      name: "Premium Experience",
      duration: "4 hours",
      price: 100000,
      description: "Extended appearance with exclusive access",
      features: [
        "4-hour event appearance",
        "Extended meet & greet",
        "Professional photo session",
        "Personalized video message",
        "Social media collaboration",
        "Signed memorabilia",
      ],
      availability: 2,
      popular: false,
    },
    {
      id: 4,
      name: "Corporate Event",
      duration: "Full day",
      price: 150000,
      description: "Full day corporate event hosting",
      features: [
        "Full day availability",
        "Keynote speech (30 min)",
        "Panel participation",
        "VIP meet & greet",
        "Professional photography",
        "Social media coverage",
        "Branded content rights",
      ],
      availability: 1,
      popular: false,
    },
  ],
  reviews: [
    {
      id: 1,
      author: "Sarah M.",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "Absolutely incredible experience! Keanu was so genuine and kind. Worth every penny!",
      verified: true,
    },
    {
      id: 2,
      author: "Michael R.",
      rating: 5,
      date: "1 month ago",
      comment:
        "Professional, punctual, and exceeded all expectations. Our corporate event was a huge success!",
      verified: true,
    },
    {
      id: 3,
      author: "Jennifer L.",
      rating: 4,
      date: "2 months ago",
      comment:
        "Great experience overall. The virtual meet & greet was well organized and Keanu was very engaging.",
      verified: true,
    },
  ],
  stats: {
    totalBookings: 1250,
    repeatClients: 340,
    avgRating: 4.9,
    responseRate: 98,
  },
};

export default function CelebrityDetailPage() {
  const [selectedBookingType, setSelectedBookingType] = useState(
    celebrityData.bookingTypes[1]
  );
  const [quantity, setQuantity] = useState(1);
  const [liveViews, setLiveViews] = useState(celebrityData.views);
  const [bookingStep, setBookingStep] = useState(1);

  // Payment flow states
  const [userBalance, setUserBalance] = useState(75000); // Sample user balance
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Live views counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViews((prev) => prev + Math.floor(Math.random() * 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalPrice = selectedBookingType.price * quantity;
  const serviceFee = totalPrice * 0.05;
  const finalTotal = totalPrice + serviceFee;

  // Payment handling functions
  const handlePaymentClick = () => {
    if (userBalance >= finalTotal) {
      setShowConfirmationDialog(true);
    } else {
      setShowInsufficientBalance(true);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setShowConfirmationDialog(false);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Deduct amount from balance
    setUserBalance((prev) => prev - finalTotal);
    setIsProcessing(false);
    setShowSuccessMessage(true);
  };

  const handleDepositClick = () => {
    setShowInsufficientBalance(false);
    // In a real app, this would navigate to deposit page
    window.location.href = "/dashboard?tab=deposit";
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100">
          <div className="@container/main flex flex-1 flex-col gap-2 px-3">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Back Button */}
              <div className="px-6">
                <Link href="/user-dashboard/celebrities">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ChevronLeft className="size-4" />
                    Back to Celebrities
                  </Button>
                </Link>
              </div>

              {/* Hero Section */}
              <div className="px-6">
                <Card className="overflow-hidden border-2 bg-white">
                  <div className="relative h-64 bg-gradient-to-r from-zinc-900 to-zinc-700">
                    <img
                      src={celebrityData.coverImage || "/placeholder.svg"}
                      alt="Cover"
                      className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute top-4 right-4 flex gap-2">
                      {celebrityData.hot && (
                        <Badge className="bg-orange-500 text-white border-0">
                          <Flame className="size-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                      {celebrityData.trending && (
                        <Badge className="bg-emerald-900 text-white border-0">
                          <TrendingUp className="size-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {celebrityData.verified && (
                        <Badge className="bg-blue-500 text-white border-0">
                          <CheckCircle2 className="size-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="pt-0">
                    <div className="flex flex-col md:flex-row gap-6 -mt-20 relative z-10">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        <div className="size-40 rounded-2xl border-4 border-white bg-white overflow-hidden">
                          <img
                            src={celebrityData.image || "/placeholder.svg"}
                            alt={celebrityData.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 pt-24 md:pt-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h1 className="text-4xl font-bold text-zinc-100 mb-2">
                              {celebrityData.name}
                            </h1>
                            <div className="flex items-center gap-2 mb-3">
                              {celebrityData.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="border-emerald-900 text-emerald-900 bg-emerald-50"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-black">
                                  {celebrityData.rating}
                                </span>
                                <span>
                                  ({celebrityData.totalReviews} reviews)
                                </span>
                              </div>
                              <Separator
                                orientation="vertical"
                                className="h-4"
                              />
                              <div className="flex items-center gap-1">
                                <Users className="size-4" />
                                <span>{celebrityData.bookings} bookings</span>
                              </div>
                              <Separator
                                orientation="vertical"
                                className="h-4"
                              />
                              <div className="flex items-center gap-1">
                                <Eye className="size-4" />
                                <span>{liveViews.toLocaleString()} views</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-500 bg-transparent"
                            >
                              <Heart className="size-5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl hover:bg-blue-50 hover:text-blue-500 hover:border-blue-500 bg-transparent"
                            >
                              <Share2 className="size-5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-xl hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-900 bg-transparent"
                            >
                              <Bookmark className="size-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-4 mt-6">
                          <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border-2 border-emerald-900/20">
                            <p className="text-xs font-mono uppercase tracking-wider text-emerald-900/70 mb-1">
                              Total Bookings
                            </p>
                            <p className="text-2xl font-bold text-emerald-900 font-mono">
                              {celebrityData.stats.totalBookings}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border-2 border-blue-500/20">
                            <p className="text-xs font-mono uppercase tracking-wider text-blue-900/70 mb-1">
                              Repeat Clients
                            </p>
                            <p className="text-2xl font-bold text-blue-900 font-mono">
                              {celebrityData.stats.repeatClients}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border-2 border-purple-500/20">
                            <p className="text-xs font-mono uppercase tracking-wider text-purple-900/70 mb-1">
                              Avg Rating
                            </p>
                            <p className="text-2xl font-bold text-purple-900 font-mono">
                              {celebrityData.stats.avgRating}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border-2 border-orange-500/20">
                            <p className="text-xs font-mono uppercase tracking-wider text-orange-900/70 mb-1">
                              Response Rate
                            </p>
                            <p className="text-2xl font-bold text-orange-900 font-mono">
                              {celebrityData.stats.responseRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="px-6 space-y-6">
                {/* Details Section */}
                <div className="space-y-6">
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 rounded-xl">
                      <TabsTrigger value="overview" className="rounded-lg">
                        Overview
                      </TabsTrigger>
                      <TabsTrigger value="reviews" className="rounded-lg">
                        Reviews
                      </TabsTrigger>
                      <TabsTrigger value="achievements" className="rounded-lg">
                        Achievements
                      </TabsTrigger>
                      <TabsTrigger value="availability" className="rounded-lg">
                        Availability
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle>About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {celebrityData.description}
                          </p>
                          <Separator />
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Category
                              </p>
                              <p className="font-semibold">
                                {celebrityData.category}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Response Time
                              </p>
                              <p className="font-semibold">
                                {celebrityData.responseTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Availability
                              </p>
                              <Badge className="bg-green-500 text-white">
                                {celebrityData.availability}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                Verification
                              </p>
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="size-4 text-blue-500" />
                                <span className="font-semibold">Verified</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-6">
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle>Reviews & Ratings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Rating Breakdown */}
                          <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-white rounded-xl border-2 border-emerald-900/20">
                              <div className="text-5xl font-bold text-emerald-900 font-mono mb-2">
                                {celebrityData.rating}
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="size-5 text-yellow-500 fill-yellow-500"
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Based on {celebrityData.totalReviews} reviews
                              </p>
                            </div>
                            <div className="space-y-3">
                              {[5, 4, 3, 2, 1].map((stars) => (
                                <div
                                  key={stars}
                                  className="flex items-center gap-3"
                                >
                                  <span className="text-sm font-medium w-8">
                                    {stars}★
                                  </span>
                                  <Progress
                                    value={
                                      stars === 5
                                        ? 85
                                        : stars === 4
                                        ? 12
                                        : stars === 3
                                        ? 2
                                        : 1
                                    }
                                    className="flex-1"
                                  />
                                  <span className="text-sm text-muted-foreground w-12">
                                    {stars === 5
                                      ? "85%"
                                      : stars === 4
                                      ? "12%"
                                      : stars === 3
                                      ? "2%"
                                      : "1%"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          {/* Individual Reviews */}
                          <div className="space-y-4">
                            {celebrityData.reviews.map((review) => (
                              <div
                                key={review.id}
                                className="p-4 bg-muted/50 rounded-xl"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold">
                                        {review.author}
                                      </span>
                                      {review.verified && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs border-emerald-900 text-emerald-900"
                                        >
                                          <CheckCircle2 className="size-3 mr-1" />
                                          Verified
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        {[...Array(review.rating)].map(
                                          (_, i) => (
                                            <Star
                                              key={i}
                                              className="size-3 text-yellow-500 fill-yellow-500"
                                            />
                                          )
                                        )}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {review.date}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {review.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="achievements" className="mt-6">
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle>Achievements & Awards</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {celebrityData.achievements.map(
                              (achievement, index) => (
                                <div
                                  key={index}
                                  className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-amber-500/20"
                                >
                                  <div className="size-12 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                                    <Award className="size-6 text-white" />
                                  </div>
                                  <p className="font-semibold text-sm">
                                    {achievement}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="availability" className="mt-6">
                      <Card className="bg-white">
                        <CardHeader>
                          <CardTitle>Booking Availability</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {celebrityData.bookingTypes.map((type) => (
                              <div
                                key={type.id}
                                className="p-4 border-2 rounded-xl hover:border-emerald-900/50 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-semibold">
                                      {type.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {type.duration}
                                    </p>
                                  </div>
                                  <Badge
                                    className={`${
                                      type.availability > 10
                                        ? "bg-green-500"
                                        : type.availability > 5
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    } text-white`}
                                  >
                                    {type.availability} slots left
                                  </Badge>
                                </div>
                                <Progress
                                  value={(type.availability / 20) * 100}
                                  className="mb-2"
                                />
                                <p className="text-sm text-muted-foreground">
                                  {type.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Booking Section - Landscape Layout */}
                <Card className="border-2 border-emerald-900/20 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="size-5 text-emerald-900" />
                      Book Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Side - Booking Types */}
                      <div className="space-y-6">
                        {/* Booking Type Selection */}
                        <div>
                          <Label className="text-sm font-semibold mb-3 block">
                            Select Booking Type
                          </Label>
                          <div className="space-y-3">
                            {celebrityData.bookingTypes.map((type) => (
                              <div
                                key={type.id}
                                onClick={() => setSelectedBookingType(type)}
                                className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                  selectedBookingType.id === type.id
                                    ? "border-emerald-900 bg-emerald-50"
                                    : "border-border hover:border-emerald-900/50"
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-sm">
                                        {type.name}
                                      </h4>
                                      {type.popular && (
                                        <Badge className="bg-emerald-900 text-white text-xs">
                                          Popular
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {type.duration}
                                    </p>
                                    <p className="text-lg font-bold text-emerald-900 font-mono">
                                      ${(type.price / 1000).toFixed(0)}K
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      type.availability > 10
                                        ? "border-green-500 text-green-700"
                                        : type.availability > 5
                                        ? "border-yellow-500 text-yellow-700"
                                        : "border-red-500 text-red-700"
                                    }`}
                                  >
                                    {type.availability} slots left
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Selected Package Details */}
                        <div className="bg-muted/50 p-4 rounded-xl">
                          <h4 className="font-semibold mb-3 text-sm">
                            What's Included:
                          </h4>
                          <ul className="space-y-2">
                            {selectedBookingType.features.map(
                              (feature, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm"
                                >
                                  <CheckCircle2 className="size-4 text-emerald-900 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>

                      {/* Right Side - Booking Form & Payment */}
                      <div className="space-y-6">
                        {/* Booking Form */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm">
                            Booking Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="date">Preferred Date</Label>
                              <Input
                                id="date"
                                type="date"
                                className="mt-2 rounded-xl"
                              />
                            </div>
                            <div>
                              <Label htmlFor="time">Preferred Time</Label>
                              <Select>
                                <SelectTrigger className="mt-2 rounded-xl">
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="morning">
                                    Morning (9AM-12PM)
                                  </SelectItem>
                                  <SelectItem value="afternoon">
                                    Afternoon (12PM-5PM)
                                  </SelectItem>
                                  <SelectItem value="evening">
                                    Evening (5PM-9PM)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="message">Special Requests</Label>
                            <Textarea
                              id="message"
                              placeholder="Any special requests or details..."
                              className="mt-2 rounded-xl"
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* User Balance Display */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wallet className="size-5 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                Your Balance
                              </span>
                            </div>
                            <span className="text-lg font-bold text-blue-900 font-mono">
                              ${userBalance.toLocaleString()}
                            </span>
                          </div>
                          {userBalance < finalTotal && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="size-3" />
                              <span>Insufficient balance for this booking</span>
                            </div>
                          )}
                        </div>

                        {/* Price Summary */}
                        <div className="bg-muted/30 p-4 rounded-xl">
                          <h4 className="font-semibold mb-3 text-sm">
                            Price Summary
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {selectedBookingType.name}
                              </span>
                              <span className="font-mono font-semibold">
                                ${selectedBookingType.price.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Service Fee (5%)
                              </span>
                              <span className="font-mono font-semibold">
                                ${serviceFee.toLocaleString()}
                              </span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">Total</span>
                              <span className="text-xl font-bold text-emerald-900 font-mono">
                                ${finalTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Book Button */}
                        <Button
                          onClick={handlePaymentClick}
                          disabled={isProcessing}
                          className="w-full bg-emerald-900 hover:bg-emerald-800 rounded-xl py-4 text-lg text-white disabled:opacity-50"
                          size="lg"
                        >
                          {isProcessing ? (
                            <>
                              <div className="size-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Wallet className="size-5 mr-2" />
                              Pay with Balance
                            </>
                          )}
                        </Button>

                        {/* Security Notice */}
                        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200">
                          <Shield className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-900">
                            Your payment is secure and protected. 100%
                            money-back guarantee if booking is cancelled by
                            celebrity.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="size-5 text-emerald-900" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription>
              Please review your booking details before confirming the payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-xl">
              <h4 className="font-semibold mb-2">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Celebrity:</span>
                  <span className="font-medium">{celebrityData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-medium">
                    {selectedBookingType.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">
                    {selectedBookingType.duration}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-900">
                Payment Summary
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Package Price:</span>
                  <span className="font-mono">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee (5%):</span>
                  <span className="font-mono">
                    ${serviceFee.toLocaleString()}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="font-mono text-emerald-900">
                    ${finalTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-blue-700">
                  <span>Your Balance:</span>
                  <span className="font-mono">
                    ${userBalance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-blue-700">
                  <span>After Payment:</span>
                  <span className="font-mono">
                    ${(userBalance - finalTotal).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmationDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="bg-emerald-900 hover:bg-emerald-800 text-white"
            >
              {isProcessing ? (
                <>
                  <div className="size-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="size-4 mr-2" />
                  Confirm Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Message Dialog */}
      <Dialog open={showSuccessMessage} onOpenChange={setShowSuccessMessage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-900">
              <CheckCircle className="size-5" />
              Payment Successful!
            </DialogTitle>
            <DialogDescription>
              Your booking has been confirmed and payment has been processed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="size-4 text-emerald-600" />
                <span className="font-semibold text-emerald-900">
                  Booking Confirmed
                </span>
              </div>
              <p className="text-sm text-emerald-800">
                You will receive a confirmation email with booking details and
                next steps within 24 hours.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-900">
                Payment Details
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-semibold">
                    ${finalTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Balance:</span>
                  <span className="font-mono">
                    ${(userBalance - finalTotal).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowSuccessMessage(false)}
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insufficient Balance Dialog */}
      <Dialog
        open={showInsufficientBalance}
        onOpenChange={setShowInsufficientBalance}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="size-5" />
              Insufficient Balance
            </DialogTitle>
            <DialogDescription>
              You don't have enough balance to complete this booking.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="size-4 text-red-600" />
                <span className="font-semibold text-red-900">
                  Balance Required
                </span>
              </div>
              <p className="text-sm text-red-800">
                You need ${finalTotal.toLocaleString()} to complete this
                booking, but you only have ${userBalance.toLocaleString()} in
                your account.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <h4 className="font-semibold mb-2 text-blue-900">
                Quick Deposit
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                Add funds to your account to complete your booking instantly.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="size-4 text-blue-600" />
                <span>
                  Amount needed:{" "}
                  <span className="font-mono font-semibold">
                    ${(finalTotal - userBalance).toLocaleString()}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInsufficientBalance(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDepositClick}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <DollarSign className="size-4 mr-2" />
              Add Funds
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
