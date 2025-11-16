"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";
import { Breadcrumb } from "@/components/breadcrumb";
import { EventsApi, Event } from "@/api/events.api";

function formatEventDate(dateString: string) {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    const formatted = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    return formatted.toUpperCase(); // e.g. "NOV 1, 2025"
}

const Page: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchEvents = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await EventsApi.list();
                if (!mounted) return;

                const activeEvents = (res.items || []).filter((ev) => ev.isActive);
                setEvents(activeEvents.slice(0, 7));
            } catch (err) {
                console.error(err);
                if (mounted) setError("Unable to load events right now.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchEvents();

        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Header2 />

            <Breadcrumb imageUrl="/eventbreadcrumbimage.jpg" title="EVENTS" />

            {/* Events Section */}
            <section id="events" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-5xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                            EVENTS
                        </h2>

                        <Link
                            href="/events"
                            className="flex items-center space-x-2 text-lg font-black uppercase hover:underline group"
                        >
                            <span>ALL EVENTS</span>
                            <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </Link>
                    </div>

                    <div className="border-t-4 border-black mb-8"></div>

                    <div className="space-y-6">
                        {/* Shadow loader */}
                        {loading &&
                            Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-300 pb-6 space-y-4 lg:space-y-0 rounded-md shadow-sm animate-pulse"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12 space-y-2 lg:space-y-0 w-full">
                                        <div className="h-6 w-40 bg-gray-200 rounded" />
                                        <div className="h-5 w-64 bg-gray-200 rounded" />
                                    </div>
                                    <div className="flex space-x-4">
                                        <div className="h-10 w-32 bg-gray-200 rounded" />
                                        <div className="h-10 w-32 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            ))}

                        {/* Error state */}
                        {!loading && error && (
                            <div className="py-12 text-center text-red-500 text-lg">
                                {error}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && !error && events.length === 0 && (
                            <div className="py-12 text-center text-gray-500 text-lg">
                                No upcoming events at the moment. Please check back soon.
                            </div>
                        )}

                        {/* Events list (only active, max 7) */}
                        {!loading &&
                            !error &&
                            events.length > 0 &&
                            events.map((event) => (
                                <div
                                    key={event._id}
                                    className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-300 pb-6 space-y-4 lg:space-y-0"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12 space-y-2 lg:space-y-0">
                                        <div className="text-2xl font-black tracking-tight whitespace-nowrap">
                                            {formatEventDate(event.date)}
                                        </div>
                                        <div className="text-xl font-medium">
                                            {event.location || "Location TBA"}
                                        </div>
                                    </div>

                                    <div className="flex space-x-4">
                                        {/* TICKETS -> event details */}
                                        <Link
                                            href={`/events/${event.slug}`}
                                            className="bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center"
                                        >
                                            TICKETS
                                        </Link>
                                        <button className="bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors">
                                            VIP UPGRADE
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </section>

            <Footer2 />
        </div>
    );
};

export default Page;
