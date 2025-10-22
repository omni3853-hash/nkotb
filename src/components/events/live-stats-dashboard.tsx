"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Eye,
  Ticket,
  Flame,
  Users,
  Calendar,
  MapPin,
  Star,
  Zap,
  Sparkles,
  Clock,
  Heart,
  Share2,
} from "lucide-react";

// Sample live activity data
const recentBookings = [
  { name: "Sarah M.", event: "Tech Conference 2024", time: "2 min ago" },
  { name: "Mike R.", event: "Summer Music Festival", time: "5 min ago" },
  { name: "Emma L.", event: "Art Gallery Opening", time: "8 min ago" },
  { name: "David K.", event: "Food & Wine Tasting", time: "12 min ago" },
  { name: "Lisa P.", event: "Comedy Night", time: "15 min ago" },
  { name: "Alex T.", event: "Photography Workshop", time: "18 min ago" },
];

const popularCategories = [
  { name: "Music", count: 45, trend: "+12%" },
  { name: "Technology", count: 32, trend: "+8%" },
  { name: "Art", count: 28, trend: "+15%" },
  { name: "Food & Drink", count: 24, trend: "+5%" },
  { name: "Entertainment", count: 19, trend: "+22%" },
  { name: "Sports & Fitness", count: 16, trend: "+3%" },
];

export function LiveStatsDashboard() {
  const [liveStats, setLiveStats] = useState({
    totalEvents: 487,
    activeViewers: 1247,
    bookingsToday: 89,
    trendingEvents: 12,
    totalAttendees: 15420,
    averageRating: 4.8,
  });

  const [currentBookingIndex, setCurrentBookingIndex] = useState(0);

  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats((prev) => ({
        totalEvents: prev.totalEvents + (Math.random() > 0.9 ? 1 : 0),
        activeViewers: prev.activeViewers + Math.floor(Math.random() * 5) - 2,
        bookingsToday: prev.bookingsToday + Math.floor(Math.random() * 3),
        trendingEvents: prev.trendingEvents + (Math.random() > 0.8 ? 1 : 0),
        totalAttendees: prev.totalAttendees + Math.floor(Math.random() * 10),
        averageRating: Math.min(
          5.0,
          prev.averageRating + (Math.random() - 0.5) * 0.01
        ),
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Rotate recent bookings
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBookingIndex((prev) => (prev + 1) % recentBookings.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-zinc-50 via-white to-emerald-50/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full mx-auto font-semibold text-emerald-600 mb-6">
            LIVE DASHBOARD
          </h4>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-3">
            Real-Time Event Activity
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Stay updated with live statistics, recent bookings, and trending
            categories across our platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-6">
            {/* Total Events */}
            <Card className="border-2 border-emerald-900/20 bg-gradient-to-br from-emerald-50 to-white hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-900/10 rounded-xl group-hover:bg-emerald-900/20 transition-colors">
                    <Calendar className="size-6 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-900/10 text-emerald-900 border-emerald-900/20 text-xs">
                    Total
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-emerald-900 mb-1 font-mono">
                  {liveStats.totalEvents}
                </div>
                <div className="text-sm text-zinc-600 mb-2">
                  Events Available
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="size-3 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">
                    +3 this week
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Active Viewers */}
            <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <Eye className="size-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                    Live
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1 font-mono">
                  {liveStats.activeViewers.toLocaleString()}
                </div>
                <div className="text-sm text-zinc-600 mb-2">Active Viewers</div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="size-3 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">
                    +12% this hour
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Today */}
            <Card className="border-2 border-orange-500/20 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                    <Ticket className="size-6 text-orange-600" />
                  </div>
                  <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                    Today
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1 font-mono">
                  {liveStats.bookingsToday}
                </div>
                <div className="text-sm text-zinc-600 mb-2">Bookings Today</div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="size-3 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">
                    +8% vs yesterday
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Trending Events */}
            <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-50 to-white hover:shadow-lg transition-all duration-300 group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-500/10 rounded-xl group-hover:bg-red-500/20 transition-colors">
                    <Flame className="size-6 text-red-600" />
                  </div>
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                    Hot
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-red-600 mb-1 font-mono">
                  {liveStats.trendingEvents}
                </div>
                <div className="text-sm text-zinc-600 mb-2">
                  Trending Events
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">
                    Popular now
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="space-y-6">
            {/* Recent Bookings */}
            <Card className="border-2 border-zinc-200 bg-white hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-900/10 rounded-lg">
                    <Zap className="size-5 text-emerald-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Recent Bookings</h3>
                    <p className="text-xs text-zinc-500">Live activity feed</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentBookings.slice(0, 4).map((booking, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        index === currentBookingIndex
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-zinc-50 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="w-8 h-8 bg-emerald-900/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-emerald-900">
                          {booking.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 truncate">
                          {booking.name} booked
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {booking.event}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-400">
                        {booking.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Live updates every 3 seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Popular Categories */}
            <Card className="border-2 border-zinc-200 bg-white hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <TrendingUp className="size-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">
                      Popular Categories
                    </h3>
                    <p className="text-xs text-zinc-500">This week's trends</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {popularCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-900/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-900">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            {category.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {category.count} events
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                        {category.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-2 border-zinc-200 bg-white hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Sparkles className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">Platform Stats</h3>
                    <p className="text-xs text-zinc-500">Overall metrics</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-zinc-500" />
                      <span className="text-sm text-zinc-600">
                        Total Attendees
                      </span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900">
                      {liveStats.totalAttendees.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="size-4 text-zinc-500" />
                      <span className="text-sm text-zinc-600">
                        Average Rating
                      </span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900">
                      {liveStats.averageRating.toFixed(1)}★
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-zinc-500" />
                      <span className="text-sm text-zinc-600">
                        Cities Covered
                      </span>
                    </div>
                    <span className="font-mono font-bold text-zinc-900">
                      50+
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
