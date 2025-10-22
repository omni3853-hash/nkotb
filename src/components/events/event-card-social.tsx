"use client";

import { useState } from "react";
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
  Zap,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";

interface Event {
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
  startTime: Date;
}

interface EventCardSocialProps {
  event: Event;
  viewMode: "grid" | "list";
  onClick: () => void;
}

export function EventCardSocial({
  event,
  viewMode,
  onClick,
}: EventCardSocialProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(
    Math.floor(Math.random() * 50) + 10
  );
  const [shareCount, setShareCount] = useState(
    Math.floor(Math.random() * 20) + 5
  );
  const [liveViewers, setLiveViewers] = useState(
    Math.floor(Math.random() * 15) + 3
  );

  const ticketPercentage =
    ((event.totalTickets - event.ticketsLeft) / event.totalTickets) * 100;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShareCount((prev) => prev + 1);
    // In a real app, this would open share dialog
    console.log(`Sharing event: ${event.title}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selling-fast":
        return "bg-orange-500 text-white";
      case "almost-full":
        return "bg-red-500 text-white";
      case "hot":
        return "bg-red-600 text-white";
      default:
        return "bg-emerald-500 text-white";
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

  if (viewMode === "list") {
    return (
      <Card className="border border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer group">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative w-full md:w-80 h-48 md:h-auto overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <Badge
                className={`${getStatusColor(event.status)} border-0 text-xs`}
              >
                {event.status === "selling-fast" && (
                  <Zap className="size-3 mr-1" />
                )}
                {event.status === "hot" && <Flame className="size-3 mr-1" />}
                {getStatusText(event.status)}
              </Badge>
            </div>

            {/* Trending Badge */}
            {event.trending && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-emerald-900 text-white border-0 text-xs">
                  <TrendingUp className="size-3 mr-1" />
                  Trending
                </Badge>
              </div>
            )}

            {/* Social Actions */}
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleLike}
              >
                <Heart
                  className={`size-4 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleBookmark}
              >
                <Bookmark
                  className={`size-4 ${
                    isBookmarked ? "fill-emerald-500 text-emerald-500" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 border-emerald-200 text-emerald-900"
                  >
                    {event.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Eye className="size-4" />
                    <span>{liveViewers} viewing</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-emerald-900 transition-colors">
                  {event.title}
                </h3>

                <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Calendar className="size-4 text-emerald-600" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Clock className="size-4 text-emerald-600" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <MapPin className="size-4 text-emerald-600" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Users className="size-4 text-emerald-600" />
                    <span>{event.attendees.toLocaleString()}</span>
                  </div>
                </div>

                {/* Rating and Social Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="size-4 text-amber-500 fill-current" />
                      <span className="text-sm font-medium">
                        {event.rating}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ({event.reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Heart
                          className={`size-4 ${
                            isLiked ? "fill-red-500 text-red-500" : ""
                          }`}
                        />
                        <span>{likeCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="size-4" />
                        <span>{shareCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500">Availability</span>
                    <span className="text-xs font-medium">
                      {event.ticketsLeft} left
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        ticketPercentage > 90
                          ? "bg-red-500"
                          : ticketPercentage > 70
                          ? "bg-orange-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${ticketPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
                <div>
                  <div className="text-2xl font-bold text-emerald-900">
                    ${event.price}
                  </div>
                  <div className="text-sm text-zinc-500">per ticket</div>
                </div>
                <Button
                  className="bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  Book Now
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="border border-zinc-200 bg-white hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(event.status)} border-0 text-xs`}>
            {event.status === "selling-fast" && <Zap className="size-3 mr-1" />}
            {event.status === "hot" && <Flame className="size-3 mr-1" />}
            {getStatusText(event.status)}
          </Badge>
        </div>

        {/* Trending Badge */}
        {event.trending && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-emerald-900 text-white border-0 text-xs">
              <TrendingUp className="size-3 mr-1" />
              Trending
            </Badge>
          </div>
        )}

        {/* Price Badge */}
        <div className="absolute bottom-3 right-3">
          <Badge className="bg-white/90 text-emerald-900 border-0 text-sm font-semibold">
            ${event.price}
          </Badge>
        </div>

        {/* Social Actions */}
        <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleLike}
          >
            <Heart
              className={`size-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={handleBookmark}
          >
            <Bookmark
              className={`size-4 ${
                isBookmarked ? "fill-emerald-500 text-emerald-500" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge
            variant="outline"
            className="bg-emerald-50 border-emerald-200 text-emerald-900 text-xs"
          >
            {event.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <Eye className="size-3" />
            <span>{liveViewers}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-zinc-900 mb-2 group-hover:text-emerald-900 transition-colors line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Calendar className="size-4 text-emerald-600" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Clock className="size-4 text-emerald-600" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <MapPin className="size-4 text-emerald-600" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Users className="size-4 text-emerald-600" />
            <span>{event.attendees.toLocaleString()} attendees</span>
          </div>
        </div>

        {/* Rating and Social Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="size-4 text-amber-500 fill-current" />
            <span className="text-sm font-medium">{event.rating}</span>
            <span className="text-xs text-zinc-500">({event.reviews})</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <div className="flex items-center gap-1">
              <Heart
                className={`size-3 ${
                  isLiked ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span>{likeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="size-3" />
              <span>{shareCount}</span>
            </div>
          </div>
        </div>

        {/* Availability Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Availability</span>
            <span className="text-xs font-medium">
              {event.ticketsLeft} left
            </span>
          </div>
          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                ticketPercentage > 90
                  ? "bg-red-500"
                  : ticketPercentage > 70
                  ? "bg-orange-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${ticketPercentage}%` }}
            />
          </div>
        </div>

        {/* High Activity Indicator */}
        {event.bookingsToday > 10 && (
          <div className="mb-4 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-xs">
              <span className="text-emerald-900 font-medium">
                {event.bookingsToday} people
              </span>
              <span className="text-emerald-700"> booked today</span>
            </p>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-emerald-900">
              ${event.price}
            </div>
            <div className="text-xs text-zinc-500">per ticket</div>
          </div>
          <Button
            size="sm"
            className="bg-emerald-900 hover:bg-emerald-800 text-white px-4 py-2"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
