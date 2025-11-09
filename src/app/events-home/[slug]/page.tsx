"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Share2,
    ArrowLeft,
    Star,
    Ticket,
    ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { EventsApi, type Event } from "@/api/events.api";

const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

const getStatusColor = (availability: string) => {
    switch (availability.toLowerCase()) {
        case "selling fast":
            return "bg-orange-100 text-orange-800 border-orange-200";
        case "almost full":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "hot":
            return "bg-red-100 text-red-800 border-red-200";
        case "sold out":
            return "bg-gray-100 text-gray-800 border-gray-200";
        default:
            return "bg-green-100 text-green-800 border-green-200";
    }
};

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);

    useEffect(() => {
        const loadEvent = async () => {
            try {
                setLoading(true);
                const eventData = await EventsApi.getBySlug(slug);
                setEvent(eventData);

                // Load related events
                const related = await EventsApi.list({
                    category: eventData.category,
                    limit: 3,
                    onlyActive: true,
                });
                setRelatedEvents(related.items.filter(e => e._id !== eventData._id));
            } catch (err: any) {
                toast.error(err?.response?.data?.message || err?.message || "Event not found");
                router.push("/events-home");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadEvent();
        }
    }, [slug, router]);

    const handleShare = async () => {
        const url = window.location.href;
        const title = event?.title || "";

        try {
            if (navigator.share) {
                await navigator.share({
                    title,
                    text: event?.description || "",
                    url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Event link copied to clipboard!");
            }
        } catch (err) {
            // Share dialog was canceled
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                <Header />
                <div className="pt-32 pb-20">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse space-y-8">
                            {/* Breadcrumb skeleton */}
                            <div className="h-4 bg-gray-200 rounded-full w-1/4" />

                            {/* Main content skeleton */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="aspect-video bg-gray-200 rounded-3xl" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-20 bg-gray-200 rounded-2xl" />
                                        <div className="h-20 bg-gray-200 rounded-2xl" />
                                        <div className="h-20 bg-gray-200 rounded-2xl" />
                                        <div className="h-20 bg-gray-200 rounded-2xl" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="h-8 bg-gray-200 rounded-full w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded-full w-full" />
                                    <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                                    <div className="h-20 bg-gray-200 rounded-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                <Header />
                <div className="pt-32 pb-20 text-center">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
                        <p className="text-gray-600 mb-8">The event you're looking for doesn't exist.</p>
                        <Button onClick={() => router.push("/events-home")}>
                            Back to Events
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <Header />

            {/* Event Details */}
            <div className="pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/events-home")}
                            className="flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Events
                        </Button>
                        <span>/</span>
                        <span>{event.category}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Event Image and Details */}
                        <div className="space-y-6">
                            <div className="relative rounded-3xl overflow-hidden">
                                <img
                                    src={event.image || event.coverImage || "/placeholder-event.jpg"}
                                    alt={event.title}
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className={`border ${getStatusColor(event.availability)} text-sm font-medium`}>
                                        {event.availability}
                                    </Badge>
                                </div>
                                {event.featured && (
                                    <div className="absolute top-4 right-4">
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                            <Star className="w-3 h-3 mr-1 fill-current" />
                                            Featured
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6 text-center">
                                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">
                                            {
                                                event.attendees > 0
                                                    ? event.attendees > 1000
                                                        ? '1000+'
                                                        : Math.round(event.attendees * 1.5)
                                                    : '22+'
                                            }
                                        </div>
                                        <div className="text-sm text-gray-600">Attendees</div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6 text-center">
                                        <Ticket className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">
                                            {
                                                event.ticketsSold > 0
                                                    ? event.ticketsSold > 1000
                                                        ? '1000+'
                                                        : Math.round(event.ticketsSold * 1.5)
                                                    : '22+'
                                            }
                                        </div>
                                        <div className="text-sm text-gray-600">Tickets Sold</div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6 text-center">
                                        <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">{event.rating}</div>
                                        <div className="text-sm text-gray-600">Rating</div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6 text-center">
                                        <div className="text-2xl font-bold text-gray-900">{event.totalReviews}</div>
                                        <div className="text-sm text-gray-600">Reviews</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Event Information */}
                        <div className="space-y-6">
                            <div>
                                <Badge className="bg-gray-100 text-gray-700 border-0 font-medium mb-4">
                                    {event.category}
                                </Badge>
                                <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                    {event.title}
                                </h1>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    {event.description}
                                </p>
                            </div>

                            {/* Event Details */}
                            <Card className="border border-gray-100 rounded-2xl bg-white">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Date & Time</div>
                                            <div className="text-gray-600">
                                                {formatDate(event.date)} at {formatTime(event.time)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Location</div>
                                            <div className="text-gray-600">{event.location}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Ticket className="w-5 h-5 text-purple-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Starting Price</div>
                                            <div className="text-2xl font-bold text-gray-900">${event.basePrice}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ticket Types */}
                            {event.ticketTypes && event.ticketTypes.length > 0 && (
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Tickets</h3>
                                        <div className="space-y-3">
                                            {event.ticketTypes.map((ticketType, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-blue-200 transition-colors"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{ticketType.name}</div>
                                                        <div className="text-sm text-gray-600">{ticketType.description}</div>
                                                        {ticketType.features && ticketType.features.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {ticketType.features.slice(0, 2).map((feature, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                                        {feature}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900">${ticketType.price}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {ticketType.total} left
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl py-3 text-lg transition-colors"
                                    disabled
                                >
                                    Get Tickets
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleShare}
                                    className="border-2 rounded-2xl py-3 text-lg transition-colors"
                                >
                                    <Share2 className="w-5 h-5 mr-2" />
                                    Share
                                </Button>
                            </div>
                            <h3 className="font-semibold text-orange-400 mb-3">Register as a user to access all this features</h3>
                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                                <div className="pt-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {event.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Events */}
                    {relatedEvents.length > 0 && (
                        <section className="mt-20">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Events</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedEvents.map((relatedEvent) => (
                                    <div
                                        key={relatedEvent._id}
                                        className="cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30"
                                        onClick={() => router.push(`/events-home/${relatedEvent.slug}`)}
                                    >
                                        <div className="aspect-[4/3] overflow-hidden">
                                            <img
                                                src={relatedEvent.image || relatedEvent.coverImage || "/placeholder-event.jpg"}
                                                alt={relatedEvent.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <Badge className="bg-gray-100 text-gray-700 border-0 text-xs mb-2">
                                                {relatedEvent.category}
                                            </Badge>
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {relatedEvent.title}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div className="text-lg font-bold text-gray-900">${relatedEvent.basePrice}</div>
                                                <Badge className={`border ${getStatusColor(relatedEvent.availability)} text-xs`}>
                                                    {relatedEvent.availability}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}