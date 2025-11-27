"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";
import { RememberBettyMedia, RememberBettyMediaApi } from "@/api/rememberbettymedia.api";
import { usePathname } from "next/navigation";

const navLinks = [
    { label: "About", href: "/remember-betty/about" },
    { label: "Donate", href: "/remember-betty/donate" },
    { label: "Need Help", href: "/remember-betty/application" },
    { label: "Volunteer", href: "/remember-betty/volunteer" },
    { label: "Gallery", href: "/remember-betty/gallery" },
];

const GalleryPage: React.FC = () => {
    const pathname = usePathname();
    const [items, setItems] = useState<RememberBettyMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const categories = [
        { value: "all", label: "All" },
        { value: "FUNDRAISERS", label: "Fundraisers" },
        { value: "EVENTS", label: "Events" },
        { value: "TEAM_GATHERINGS", label: "Team Gatherings" },
        { value: "MOMENTS", label: "Moments" },
    ];

    useEffect(() => {
        let mounted = true;

        const fetchGallery = async () => {
            try {
                setLoading(true);
                setError(null);

                const query: Record<string, any> = {
                    page: 1,
                    limit: 100,
                    onlyActive: true,
                };

                const res = await RememberBettyMediaApi.list(query);
                if (!mounted) return;

                // Do not show videos – keep only non-video / image-like items
                const imagesOnly = (res.items || []).filter(
                    (item) =>
                        !String(item.category)
                            .toLowerCase()
                            .includes("video"),
                );

                setItems(imagesOnly);
            } catch (err) {
                console.error(err);
                if (mounted) setError("Unable to load gallery.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchGallery();

        return () => {
            mounted = false;
        };
    }, [selectedCategory]);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header2 />

            {/* Remember Betty sub-navigation under header */}
            <section className="border-y border-pink-100 bg-white/90 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4">
                    <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-3 text-[11px] md:text-xs tracking-[0.25em] uppercase">
                        {navLinks.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`pb-2 border-b-2 transition-colors ${isActive
                                        ? "border-pink-600 text-pink-700"
                                        : "border-transparent text-pink-500 hover:text-pink-700 hover:border-pink-400"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </section>

            <main className="flex-1">
                {/* Hero / Intro */}
                <section className="pt-16 pb-10 bg-white border-b border-pink-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-black mb-5 text-pink-600">
                            Photo Gallery
                        </h1>
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                            This photo gallery captures the heart of our mission — to support breast cancer
                            patients and honor the legacy of Betty Wood. From fundraisers and events to team
                            gatherings and inspiring moments, these snapshots showcase our hearts and the
                            passion that drives us.
                        </p>
                        <p className="text-base md:text-lg text-gray-700 mt-4">
                            Together we are making a difference, one event at a time!
                        </p>
                    </div>
                </section>

                {/* Gallery Grid */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-gray-200 rounded-lg h-80 animate-pulse"
                                    />
                                ))}
                            </div>
                        )}

                        {!loading && error && (
                            <div className="text-center py-12 text-red-500 text-lg font-semibold">
                                {error}
                            </div>
                        )}

                        {!loading && !error && items.length === 0 && (
                            <div className="text-center py-12 text-gray-500 text-lg">
                                No gallery items found for this category.
                            </div>
                        )}

                        {!loading && !error && items.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {items.map((item) => {
                                    const description = (item as any)
                                        .description as string | undefined;

                                    return (
                                        <figure
                                            key={item._id}
                                            className="group cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all"
                                        >
                                            <div className="relative h-80">
                                                <img
                                                    src={item.mediaUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-end p-4">
                                                    <figcaption className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <h3 className="text-lg font-bold">
                                                            {item.title}
                                                        </h3>
                                                        {description && (
                                                            <p className="text-xs mt-2 leading-snug">
                                                                {description}
                                                            </p>
                                                        )}
                                                    </figcaption>
                                                </div>
                                            </div>
                                        </figure>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>

                {/* Join / Start a Team CTA */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-black mb-4">
                            Join or Start a Team
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed mb-8">
                            Reach out to one of our active teams for more information on how to join their
                            fundraising efforts. Interested in starting your own chapter, involving your business,
                            or have additional questions? We&apos;d love to hear from you.
                        </p>
                        <div className="flex justify-center">
                            <Link
                                href="/remember-betty/volunteer"
                                className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-black uppercase tracking-widest text-sm md:text-base transition-all"
                            >
                                Active Teams
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer2 />
        </div>
    );
};

export default GalleryPage;
