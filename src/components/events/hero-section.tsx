"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Star,
  TrendingUp,
  Flame,
  Eye,
  Zap,
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  Ticket,
} from "lucide-react";

// Sample live activity data
const liveActivities = [
  "Sarah M. just booked Tech Conference 2024",
  "Mike R. purchased tickets for Summer Music Festival",
  "Emma L. is viewing Art Gallery Opening",
  "David K. shared Food & Wine Tasting",
  "Lisa P. liked Comedy Night",
  "Alex T. bookmarked Photography Workshop",
  "Maria S. just booked Business Networking",
  "John D. is viewing Fitness Bootcamp",
];

export function HeroSection() {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [liveStats, setLiveStats] = useState({
    activeViewers: 1247,
    bookingsToday: 89,
    trendingEvents: 12,
    upcomingToday: 8,
  });

  // Auto-rotate live activities
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % liveActivities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats((prev) => ({
        activeViewers: prev.activeViewers + Math.floor(Math.random() * 5) - 2,
        bookingsToday: prev.bookingsToday + Math.floor(Math.random() * 3),
        trendingEvents: prev.trendingEvents + (Math.random() > 0.8 ? 1 : 0),
        upcomingToday: prev.upcomingToday + (Math.random() > 0.9 ? 1 : 0),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative max-w-7xl mx-auto mt-[10rem] rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-14 pb-20 pt-15 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30 px-4 py-2 text-sm font-semibold mb-6">
                <Sparkles className="size-4 mr-2" />
                Live Events Platform
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Discover Amazing{" "}
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Events
                </span>{" "}
                Near You
              </h1>

              <p className=" text-emerald-100 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Join thousands of people discovering and booking incredible
                experiences. From concerts to conferences, find your next
                unforgettable moment.
              </p>
            </div>

            {/* Live Activity Ticker */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-8 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <Zap className="size-5 text-amber-400" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-amber-400 rounded-full animate-pulse" />
                </div>
                <span className="text-sm font-semibold text-white">
                  Live Activity
                </span>
              </div>
              <div className="h-6 overflow-hidden">
                <div
                  key={currentActivity}
                  className="animate-fade-in text-sm text-emerald-100"
                >
                  {liveActivities[currentActivity]}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Calendar className="size-5 mr-2" />
                Browse Events
                <ArrowRight className="size-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-900 px-8 py-4 text-sm font-semibold transition-all duration-300 hover:scale-105"
              >
                <Play className="size-5 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Right Column - Live Stats Dashboard */}
          <div className="grid grid-cols-2 gap-6">
            {/* Active Viewers */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-500/20 rounded-lg group-hover:bg-amber-500/30 transition-colors">
                  <Eye className="size-6 text-amber-400" />
                </div>
                <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30 text-xs">
                  Live
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1 font-mono">
                {liveStats.activeViewers.toLocaleString()}
              </div>
              <div className="text-sm text-emerald-200">Active Viewers</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="size-3 text-emerald-400" />
                <span className="text-xs text-emerald-300">+12% this hour</span>
              </div>
            </div>

            {/* Bookings Today */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <Ticket className="size-6 text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30 text-xs">
                  Today
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1 font-mono">
                {liveStats.bookingsToday}
              </div>
              <div className="text-sm text-emerald-200">Bookings Today</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="size-3 text-emerald-400" />
                <span className="text-xs text-emerald-300">
                  +8% vs yesterday
                </span>
              </div>
            </div>

            {/* Trending Events */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                  <Flame className="size-6 text-orange-400" />
                </div>
                <Badge className="bg-orange-500/20 text-orange-200 border-orange-500/30 text-xs">
                  Hot
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1 font-mono">
                {liveStats.trendingEvents}
              </div>
              <div className="text-sm text-emerald-200">Trending Events</div>
              <div className="flex items-center gap-1 mt-2">
                <Star className="size-3 text-orange-400" />
                <span className="text-xs text-orange-300">Popular now</span>
              </div>
            </div>

            {/* Upcoming Today */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <Clock className="size-6 text-blue-400" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30 text-xs">
                  Soon
                </Badge>
              </div>
              <div className="text-3xl font-bold text-white mb-1 font-mono">
                {liveStats.upcomingToday}
              </div>
              <div className="text-sm text-emerald-200">Starting Today</div>
              <div className="flex items-center gap-1 mt-2">
                <Calendar className="size-3 text-blue-400" />
                <span className="text-xs text-blue-300">Next 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
                500+
              </div>
              <div className="text-sm text-emerald-200">Events Available</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
                50+
              </div>
              <div className="text-sm text-emerald-200">Cities Covered</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
                10K+
              </div>
              <div className="text-sm text-emerald-200">Happy Attendees</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1 font-mono">
                4.9★
              </div>
              <div className="text-sm text-emerald-200">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
