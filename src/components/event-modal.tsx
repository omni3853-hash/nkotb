"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  X,
  Ticket,
  Tag,
} from "lucide-react";

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
  status: "available" | "selling-fast" | "almost-full" | "hot" | "sold-out" | string;
  startTime?: Date;

  // extra fields for richer details
  ticketTypes?: Array<{
    name: string;
    price: number;
    description?: string;
    features?: string[];
    total?: number;
    sold?: number;
    popular?: boolean;
  }>;
  slug?: string;
  availability?: string;
  verified?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  tags?: string[];
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;

  /** Optional URL used by the Share button. If omitted, falls back to current location. */
  shareUrl?: string;
}

export function EventModal({ event, isOpen, onClose, shareUrl }: EventModalProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveViewers, setLiveViewers] = useState(0);

  useEffect(() => {
    setIsBookmarked(false);
    setIsLiked(false);
    setCopied(false);
    if (event) {
      setLiveViewers(Math.floor(Math.random() * 50) + 20);
      const t = setInterval(() => {
        setLiveViewers((v) => Math.max(0, v + (Math.random() > 0.5 ? 1 : -1)));
      }, 3000);
      return () => clearInterval(t);
    }
  }, [event, isOpen]);

  const ticketPercentage = useMemo(() => {
    if (!event) return 0;
    return event.totalTickets > 0
      ? ((event.totalTickets - event.ticketsLeft) / event.totalTickets) * 100
      : 0;
  }, [event]);

  if (!event) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "selling-fast":
        return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "almost-full":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      case "hot":
        return "bg-red-600/10 text-red-700 border-red-600/20";
      case "sold-out":
        return "bg-zinc-500/10 text-zinc-700 border-zinc-500/20";
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
      case "sold-out":
        return "Sold Out";
      default:
        return "Available";
    }
  };

  // ---- Share (slug link) ----------------------------------------------------
  const doShare = async () => {
    try {
      const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
      if (!url) return;

      if (navigator.share) {
        await navigator.share({ title: event.title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-y-auto p-0 gap-0 bg-background rounded-xl border-border">
        <div className="relative">
          {/* Header Image */}
          <div className="relative h-48 sm:h-64 md:h-72 lg:h-96 overflow-hidden rounded-t-xl">
            <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 md:p-6 flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <Badge className={`px-4 py-2 text-xs font-mono uppercase tracking-wider border ${getStatusColor(event.status)}`}>
                  {event.status === "selling-fast" && <Zap className="h-3.5 w-3.5 mr-1.5" />}
                  {event.status === "hot" && <Flame className="h-3.5 w-3.5 mr-1.5" />}
                  {getStatusText(event.status)}
                </Badge>
                {event.trending && (
                  <Badge className="px-4 py-2 text-xs font-mono uppercase tracking-wider border bg-emerald-900/10 text-emerald-900 border-emerald-900/20">
                    <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                    Trending
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* SHARE */}
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={doShare}
                  title={copied ? "Link copied!" : "Share"}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white/95 hover:bg-white backdrop-blur-sm border border-border/50"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>

                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-white/95 hover:bg-white backdrop-blur-sm border border-border/50"
                  onClick={onClose}
                  title="Close"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
              <div className="flex items-end justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="mb-2 sm:mb-3 bg-white/10 backdrop-blur-sm border-white/20 text-white text-xs sm:text-sm">
                    {event.category}
                  </Badge>
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white mb-1 sm:mb-2 leading-tight text-balance break-words">{event.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-white/90 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-mono font-semibold">{event.rating}</span>
                      <span className="text-sm text-white/70">({event.reviews} reviews)</span>
                    </div>
                    <Separator orientation="vertical" className="h-4 bg-white/30" />
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      <span className="font-mono font-semibold">{liveViewers}</span>
                      <span className="text-sm text-white/70">viewing now</span>
                    </div>
                  </div>
                </div>

                {/* Starting price chip */}
                <div className="hidden sm:block shrink-0">
                  <Badge className="bg-white/90 text-emerald-900 border-0 text-xs sm:text-sm font-semibold">
                    from ${event.price}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 md:p-8">
            {/* Left: Details */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Quick facts */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-emerald-700" />
                  <span className="font-medium">{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-emerald-700" />
                  <span className="font-medium">{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>

              {/* Availability */}
              <div className="rounded-xl border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-emerald-700" />
                    <span className="text-sm font-semibold">Availability</span>
                  </div>
                  <span className="text-xs text-zinc-600">{event.ticketsLeft} tickets left</span>
                </div>
                <Progress value={ticketPercentage} className="h-2" />
              </div>

              {/* Tabs: Overview / Ticket Types / Venue */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tickets">Ticket Types</TabsTrigger>
                  <TabsTrigger value="venue">Venue</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="prose prose-zinc max-w-none">
                    <p className="text-zinc-700 leading-relaxed">{event.description || "No description available."}</p>
                  </div>

                  {event.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {event.tags.map((t) => (
                        <Badge key={t} variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </TabsContent>

                <TabsContent value="tickets" className="mt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {(event.ticketTypes?.length ? event.ticketTypes : [
                      {
                        name: "General Admission",
                        price: event.price,
                        description: "Standard entry with full access",
                        features: ["Event access", "Standard seating", "Digital ticket"],
                        popular: true,
                      },
                    ]).map((t, idx) => {
                      const sold = Number(t.sold) || 0;
                      const total = Number(t.total) || 0;
                      const left = Math.max(0, total - sold);
                      const pct = total > 0 ? ((sold / total) * 100) : 0;
                      return (
                        <div key={`${t.name}-${idx}`} className="rounded-xl border border-zinc-200 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{t.name}</h4>
                                {t.popular && <Badge className="bg-emerald-900 text-white border-0">Popular</Badge>}
                              </div>
                              {t.description && <p className="text-sm text-zinc-600 mt-1">{t.description}</p>}
                            </div>
                            <Badge className="bg-emerald-900 text-zinc-100 font-mono">${t.price}</Badge>
                          </div>

                          {t.features?.length ? (
                            <ul className="mt-3 grid gap-1 text-sm text-zinc-700 list-disc pl-5">
                              {t.features.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          ) : null}

                          {total > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-1 text-xs text-zinc-600">
                                <span>Sold: {sold}/{total}</span>
                                <span>{left} left</span>
                              </div>
                              <Progress value={pct} className="h-2" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-xs text-zinc-500 mt-3">Ticket purchase will be available on the booking page.</p>
                </TabsContent>

                <TabsContent value="venue" className="mt-4">
                  <div className="rounded-xl border border-zinc-200 p-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-700">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      <span>{event.location}</span>
                    </div>
                    <p className="text-sm text-zinc-600 mt-2">
                      Detailed venue info, access guidance, and seating layout will appear here.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right: Summary Card (no booking) */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 sm:top-6 bg-card rounded-xl border border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Price Header */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-foreground">${event.price}</span>
                    <span className="text-sm text-muted-foreground">starting from</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pricing may vary by ticket type.
                  </p>
                </div>

                <Separator />

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-muted/50 border border-border p-3">
                    <div className="text-xs text-muted-foreground">Attendees</div>
                    <div className="font-semibold">{event.attendees.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 border border-border p-3">
                    <div className="text-xs text-muted-foreground">Reviews</div>
                    <div className="font-semibold">{event.reviews}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 border border-border p-3">
                    <div className="text-xs text-muted-foreground">Status</div>
                    <div className="font-semibold">{getStatusText(event.status)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/50 border border-border p-3">
                    <div className="text-xs text-muted-foreground">Viewing now</div>
                    <div className="font-semibold">{event.viewsToday}</div>
                  </div>
                </div>

                {/* Disabled CTA (no booking here) */}
                <div className="space-y-2">
                  <Button
                    className="w-full py-6 rounded-xl font-semibold text-base bg-emerald-900 text-white"
                    disabled
                    title="Ticket purchase not available in this view"
                  >
                    Tickets Unavailable Here
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Use the main booking page to purchase tickets when enabled.
                  </p>
                </div>

                <Separator />

                {/* Safety / assurance blurb */}
                <div className="text-xs text-muted-foreground">
                  Verified events are checked for quality and accuracy. Always review event details before purchasing.
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
