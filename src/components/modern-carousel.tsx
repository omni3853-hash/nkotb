"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Star } from "lucide-react";

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
  rating: number;
  featured: boolean;
}

interface ModernCarouselProps {
  events: Event[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ModernCarousel({
  events,
  autoPlay = true,
  autoPlayInterval = 5000,
}: ModernCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || events.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, events.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  if (events.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-2xl">
        <p className="text-gray-500">No events available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl bg-white ">
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {events.map((event) => (
            <div key={event.id} className="w-full flex-shrink-0">
              <div className="flex items-center gap-6 p-6 max-h-[180px]">
                {/* Image Section */}
                <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Price Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs px-2 py-1">
                      ${event.price}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {event.featured && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-emerald-600 text-white text-xs px-2 py-0.5">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                  <div className="space-y-2">
                    {/* Title and Rating */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-semibold text-gray-700">
                          {event.rating}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">
                          {event.attendees.toLocaleString()} attendees
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-1">
                      {event.description}
                    </p>

                    {/* Event Details - Horizontal Layout */}
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        <span className="text-xs truncate">
                          {event.location}
                        </span>
                      </div>
                    </div>

                    {/* Category and Action */}
                    <div className="flex items-center justify-between pt-1">
                      <Badge
                        variant="outline"
                        className="text-emerald-600 px-2 py-0.5 text-xs border-emerald-200"
                      >
                        {event.category}
                      </Badge>
                      <Button
                        size="sm"
                        className="bg-emerald-800 hover:bg-emerald-700 text-white px-4 py-1 text-sm"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows (Hidden by default, can be enabled if needed) */}
        {events.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 opacity-0 hover:opacity-100"
              aria-label="Previous slide"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 opacity-0 hover:opacity-100"
              aria-label="Next slide"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Flat Indicators */}
      {events.length > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-emerald-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
