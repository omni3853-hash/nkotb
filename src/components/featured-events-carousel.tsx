"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const featuredEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "July 15, 2024",
    location: "Central Park, NYC",
    price: "$150",
    image: "/wallpaper.jpg",
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    date: "August 22, 2024",
    location: "Convention Center",
    price: "$299",
    image: "/wallpaper.jpg",
  },
  {
    id: 3,
    title: "Art Gallery Opening",
    date: "September 5, 2024",
    location: "Modern Art Museum",
    price: "$75",
    image: "/wallpaper.jpg",
  },
  {
    id: 4,
    title: "Food & Wine Tasting",
    date: "October 12, 2024",
    location: "Downtown Plaza",
    price: "$120",
    image: "/wallpaper.jpg",
  },
  {
    id: 5,
    title: "Comedy Night",
    date: "November 8, 2024",
    location: "Theater District",
    price: "$85",
    image: "/wallpaper.jpg",
  },
  {
    id: 6,
    title: "Fitness Bootcamp",
    date: "December 1, 2024",
    location: "City Park",
    price: "$50",
    image: "/wallpaper.jpg",
  },
  {
    id: 7,
    title: "Business Networking",
    date: "January 15, 2025",
    location: "Business Center",
    price: "$95",
    image: "/wallpaper.jpg",
  },
  {
    id: 8,
    title: "Photography Workshop",
    date: "February 20, 2025",
    location: "Art Studio",
    price: "$180",
    image: "/wallpaper.jpg",
  },
];

export function FeaturedEventsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getCardPosition = (index: number) => {
    const totalCards = featuredEvents.length;
    const adjustedIndex = (index - currentIndex + totalCards) % totalCards;

    // On mobile, only show the current card
    if (isMobile) {
      if (adjustedIndex === 0) return "center";
      return "hidden";
    }

    // On larger screens, show multiple cards
    if (adjustedIndex === 0) return "center";
    if (adjustedIndex === 1) return "right1";
    if (adjustedIndex === 2) return "right2";
    if (adjustedIndex === totalCards - 1) return "left1";
    if (adjustedIndex === totalCards - 2) return "left2";
    return "hidden";
  };

  const getCardStyle = (position: string) => {
    switch (position) {
      case "center":
        return {
          transform: "translateX(0) scale(1)",
          zIndex: 5,
          opacity: 1,
        };
      case "right1":
        return {
          transform: "translateX(45%) scale(0.9)",
          zIndex: 4,
          opacity: 0.8,
        };
      case "right2":
        return {
          transform: "translateX(90%) scale(0.8)",
          zIndex: 3,
          opacity: 0.6,
        };
      case "left1":
        return {
          transform: "translateX(-45%) scale(0.9)",
          zIndex: 4,
          opacity: 0.8,
        };
      case "left2":
        return {
          transform: "translateX(-90%) scale(0.8)",
          zIndex: 3,
          opacity: 0.6,
        };
      default:
        return {
          transform: "translateX(0) scale(0.8)",
          zIndex: 0,
          opacity: 0,
        };
    }
  };

  return (
    <div className="w-full lg:min-w-2xl py-4 sm:py-6 lg:py-7 px-3 sm:px-4 lg:px-6 rounded-2xl bg-white">
      <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-bold text-zinc-700">
          Featured Events
        </h3>
        <Button
          variant="outline"
          className="text-zinc-100 px-4 sm:px-5 py-3 sm:py-4 rounded-xl bg-emerald-900 text-xs sm:text-sm w-full sm:w-auto"
          size="sm"
        >
          View All
        </Button>
      </div>

      <div className="relative h-[20rem] sm:h-[24rem] lg:h-[28rem] flex items-center justify-center overflow-hidden">
        {featuredEvents.map((event, index) => {
          const position = getCardPosition(index);
          const style = getCardStyle(position);

          if (position === "hidden") return null;

          return (
            <div
              key={event.id}
              className="absolute transition-all duration-500 ease-in-out cursor-pointer"
              style={style}
              onClick={() => setCurrentIndex(index)}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-56 sm:w-60 lg:w-64">
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4">
                    <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
                      {event.price}
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 lg:p-6">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">
                    {event.title}
                  </h4>
                  <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <p className="flex items-center gap-2">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full"></span>
                      {event.date}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gray-400 rounded-full"></span>
                      {event.location}
                    </p>
                  </div>
                  <Button
                    className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-900 w-full text-xs sm:text-sm py-2 sm:py-3"
                    size="sm"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Flat indicators */}
      <div className="flex justify-center mt-4 sm:mt-6 lg:mt-8 gap-1 sm:gap-2">
        {featuredEvents.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 touch-manipulation ${
              index === currentIndex
                ? "w-6 sm:w-8 bg-emerald-900"
                : "w-2 sm:w-3 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
