"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Star,
  TrendingUp,
  Flame,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Sparkles,
  Target,
  ArrowRight,
  Zap,
} from "lucide-react";

// Sample recommended events with personalized reasons
const recommendedEvents = [
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
    rating: 4.8,
    reviews: 342,
    viewsToday: 1247,
    bookingsToday: 23,
    status: "selling-fast",
    recommendationReasons: [
      "Based on your interest in Music",
      "Similar to events you've attended",
      "High-rated by users like you",
      "Trending in your area",
    ],
    matchScore: 95,
    personalizedNote:
      "Perfect for music lovers! This festival features artists similar to your favorites.",
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
    rating: 4.9,
    reviews: 189,
    viewsToday: 892,
    bookingsToday: 15,
    status: "hot",
    recommendationReasons: [
      "Based on your interest in Technology",
      "Popular among tech professionals",
      "Networking opportunities",
      "Early bird pricing available",
    ],
    matchScore: 88,
    personalizedNote:
      "Great networking opportunity for tech professionals like yourself!",
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
    rating: 4.6,
    reviews: 67,
    viewsToday: 234,
    bookingsToday: 8,
    status: "available",
    recommendationReasons: [
      "Based on your interest in Art",
      "Exclusive event with limited spots",
      "Cultural experience",
      "Affordable pricing",
    ],
    matchScore: 82,
    personalizedNote:
      "Perfect for art enthusiasts! Limited spots available for this exclusive opening.",
  },
];

// Mock user interests for personalization
const userInterests = ["Music", "Technology", "Art"];

export function RecommendationsSection() {
  const [currentRecommendation, setCurrentRecommendation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotate recommendations
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentRecommendation(
          (prev) => (prev + 1) % recommendedEvents.length
        );
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentEvent = recommendedEvents[currentRecommendation];

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-amber-50/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Algorithm Display */}
        <div className="mb-12">
          <Card className="border-2 border-emerald-900/20 bg-gradient-to-r from-emerald-50 to-amber-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-900/10 rounded-xl">
                  <Target className="size-6 text-emerald-900" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">
                    Recommendation Algorithm
                  </h3>
                  <p className="text-sm text-zinc-600">
                    Based on your profile and preferences
                  </p>
                </div>
                <Badge className="bg-emerald-900/10 text-emerald-900 border-emerald-900/20 ml-auto">
                  {currentEvent.matchScore}% Match
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-zinc-600">
                  Based on your interests:
                </span>
                {userInterests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-white/50 border-emerald-900/30 text-emerald-900"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-zinc-600">Past event preferences</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-zinc-600">Location proximity</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-zinc-600">Similar user behavior</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Recommendation Card */}
        <div className="mb-12">
          <Card className="border-2 py-0 border-emerald-900/20 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative h-64 lg:h-auto">
                <img
                  src={currentEvent.image}
                  alt={currentEvent.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isAnimating
                      ? "opacity-50 scale-105"
                      : "opacity-100 scale-100"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Recommendation Badge */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-amber-500 text-white border-0">
                    <Sparkles className="size-3 mr-1" />
                    Recommended
                  </Badge>
                </div>

                {/* Match Score */}
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-900">
                        {currentEvent.matchScore}%
                      </div>
                      <div className="text-xs text-zinc-600">Match</div>
                    </div>
                  </div>
                </div>

                {/* Social Actions */}
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                  >
                    <Heart className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                  >
                    <Share2 className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-white/90 hover:bg-white"
                  >
                    <Bookmark className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-6">
                  <Badge
                    variant="outline"
                    className="mb-3 bg-emerald-50 border-emerald-200 text-emerald-900"
                  >
                    {currentEvent.category}
                  </Badge>

                  <h3 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-3 leading-tight">
                    {currentEvent.title}
                  </h3>

                  <p className="text-zinc-600 mb-4 leading-relaxed">
                    {currentEvent.description}
                  </p>

                  {/* Personalized Note */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-amber-500/20 rounded">
                        <Zap className="size-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          Why we recommend this:
                        </p>
                        <p className="text-sm text-amber-800">
                          {currentEvent.personalizedNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="size-4 text-emerald-600" />
                    <span className="text-zinc-700">
                      {currentEvent.date} at {currentEvent.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="size-4 text-emerald-600" />
                    <span className="text-zinc-700">
                      {currentEvent.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="size-4 text-emerald-600" />
                    <span className="text-zinc-700">
                      {currentEvent.attendees.toLocaleString()} attendees
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Star className="size-4 text-amber-500 fill-current" />
                    <span className="text-zinc-700">
                      {currentEvent.rating} ({currentEvent.reviews} reviews)
                    </span>
                  </div>
                </div>

                {/* Recommendation Reasons */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-zinc-900 mb-3">
                    Why this matches you:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentEvent.recommendationReasons.map((reason, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-emerald-50 border-emerald-200 text-emerald-900 text-xs"
                      >
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-emerald-900">
                      ${currentEvent.price}
                    </div>
                    <div className="text-sm text-zinc-500">per ticket</div>
                  </div>
                  <Button
                    size="lg"
                    className="bg-emerald-900 hover:bg-emerald-800 text-white px-8 py-3"
                  >
                    Book Now
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendation Navigation */}
        <div className="flex items-center justify-center gap-4">
          {recommendedEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentRecommendation(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentRecommendation
                  ? "bg-emerald-900 w-8"
                  : "bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
