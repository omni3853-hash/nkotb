"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Calendar,
  MapPin,
  Users,
  Star,
  Flame,
  Zap,
  AlertTriangle,
  ArrowRight,
  Timer,
  Eye,
  Ticket,
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

interface CountdownSectionProps {
  events: Event[];
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownSection({ events }: CountdownSectionProps) {
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: TimeLeft }>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  // Filter events starting within the next 24 hours
  const upcomingEvents = events
    .filter((event) => {
      const eventTime = new Date(event.startTime);
      const now = new Date();
      const timeDiff = eventTime.getTime() - now.getTime();
      return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000; // Within 24 hours
    })
    .slice(0, 3); // Show top 3

  // Calculate time left for each event
  const calculateTimeLeft = (eventTime: Date): TimeLeft => {
    const now = new Date();
    const difference = eventTime.getTime() - now.getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      const newTimeLeft: { [key: number]: TimeLeft } = {};

      upcomingEvents.forEach((event) => {
        newTimeLeft[event.id] = calculateTimeLeft(new Date(event.startTime));
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [upcomingEvents]);

  const formatTime = (time: number): string => {
    return time.toString().padStart(2, "0");
  };

  const getUrgencyLevel = (event: Event): "low" | "medium" | "high" => {
    const eventTime = new Date(event.startTime);
    const now = new Date();
    const timeDiff = eventTime.getTime() - now.getTime();
    const hoursLeft = timeDiff / (1000 * 60 * 60);

    if (hoursLeft <= 2) return "high";
    if (hoursLeft <= 6) return "medium";
    return "low";
  };

  const getUrgencyColor = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return "from-red-500 to-orange-500";
      case "medium":
        return "from-orange-500 to-yellow-500";
      case "low":
        return "from-emerald-500 to-green-500";
    }
  };

  const getUrgencyBadge = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "high":
        return { text: "Starting Soon!", color: "bg-red-500 text-white" };
      case "medium":
        return { text: "Limited Time", color: "bg-orange-500 text-white" };
      case "low":
        return { text: "Upcoming", color: "bg-emerald-500 text-white" };
    }
  };

  if (upcomingEvents.length === 0) {
    return null; // Don't show section if no upcoming events
  }

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h4 className="text-xs border w-fit px-3 py-1.5 bg-red-50 border-red-500/30 rounded-full mx-auto font-semibold text-red-600 mb-6">
            STARTING SOON
          </h4>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-3">
            Don't Miss These <br />
            <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
              Upcoming Events
            </span>
          </h2>
          <p className="text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            These events are starting within the next 24 hours. Book your
            tickets now before they're sold out!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {upcomingEvents.map((event) => {
            const urgencyLevel = getUrgencyLevel(event);
            const urgencyBadge = getUrgencyBadge(urgencyLevel);
            const eventTimeLeft = timeLeft[event.id] || {
              days: 0,
              hours: 0,
              minutes: 0,
              seconds: 0,
            };

            return (
              <Card
                key={event.id}
                className={`border-2 overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                  urgencyLevel === "high"
                    ? "border-red-300 bg-gradient-to-br from-red-50 to-orange-50"
                    : urgencyLevel === "medium"
                    ? "border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50"
                    : "border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50"
                }`}
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Urgency Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      className={`${urgencyBadge.color} border-0 animate-pulse`}
                    >
                      <AlertTriangle className="size-3 mr-1" />
                      {urgencyBadge.text}
                    </Badge>
                  </div>

                  {/* Tickets Left */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/90 text-zinc-900 border-0">
                      {event.ticketsLeft} left
                    </Badge>
                  </div>

                  {/* Countdown Timer */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <div className="flex items-center justify-between text-center">
                        <div className="flex-1">
                          <div className="text-lg font-bold text-zinc-900 font-mono">
                            {formatTime(eventTimeLeft.hours)}
                          </div>
                          <div className="text-xs text-zinc-600">Hours</div>
                        </div>
                        <div className="text-zinc-400 text-lg">:</div>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-zinc-900 font-mono">
                            {formatTime(eventTimeLeft.minutes)}
                          </div>
                          <div className="text-xs text-zinc-600">Minutes</div>
                        </div>
                        <div className="text-zinc-400 text-lg">:</div>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-zinc-900 font-mono">
                            {formatTime(eventTimeLeft.seconds)}
                          </div>
                          <div className="text-xs text-zinc-600">Seconds</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge
                      variant="outline"
                      className="mb-3 bg-white/50 border-zinc-300 text-zinc-700"
                    >
                      {event.category}
                    </Badge>

                    <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-emerald-900 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Calendar className="size-4 text-emerald-600" />
                      <span>
                        {event.date} at {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <MapPin className="size-4 text-emerald-600" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Users className="size-4 text-emerald-600" />
                      <span>{event.attendees.toLocaleString()} attendees</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Star className="size-4 text-amber-500 fill-current" />
                      <span>
                        {event.rating} ({event.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Urgency Indicators */}
                  <div className="mb-4">
                    {urgencyLevel === "high" && (
                      <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Flame className="size-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">
                            Event starts in less than 2 hours!
                          </span>
                        </div>
                      </div>
                    )}

                    {urgencyLevel === "medium" && (
                      <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Timer className="size-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-800">
                            Limited time to book - event starts soon!
                          </span>
                        </div>
                      </div>
                    )}

                    {event.ticketsLeft <= 10 && (
                      <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Ticket className="size-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">
                            Only {event.ticketsLeft} tickets remaining!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-emerald-900">
                        ${event.price}
                      </div>
                      <div className="text-sm text-zinc-500">per ticket</div>
                    </div>
                    <Button
                      size="lg"
                      className={`${
                        urgencyLevel === "high"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : urgencyLevel === "medium"
                          ? "bg-orange-600 hover:bg-orange-700 text-white"
                          : "bg-emerald-900 hover:bg-emerald-800 text-white"
                      } px-6 py-3 font-semibold`}
                    >
                      Book Now
                      <ArrowRight className="size-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="border-2 border-zinc-200 bg-gradient-to-r from-zinc-50 to-white max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-emerald-900/10 rounded-lg">
                  <Eye className="size-5 text-emerald-900" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">
                  Want to see more upcoming events?
                </h3>
              </div>
              <p className="text-zinc-600 mb-6">
                Browse our full calendar to discover events happening in the
                next week, month, or beyond.
              </p>
              <Button
                size="lg"
                className="bg-emerald-900 hover:bg-emerald-800 text-white px-8 py-3"
              >
                View All Upcoming Events
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
