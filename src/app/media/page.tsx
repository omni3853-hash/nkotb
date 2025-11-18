"use client";

import React, { useEffect, useState } from "react";
import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";
import { Breadcrumb } from "@/components/breadcrumb";
import { MediaApi, Media } from "@/api/media.api";

// Helper to normalize the video URL into an embeddable iframe src
const buildVideoEmbedUrl = (url: string): string => {
    if (!url) return "";

    // If it's already an Embedly widget URL, just normalize protocol
    if (url.includes("cdn.embedly.com/widgets/media.html")) {
        if (url.startsWith("//")) return `https:${url}`;
        return url;
    }

    // Handle YouTube links
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        try {
            const normalizedUrl = url.startsWith("http") ? url : `https:${url}`;
            const parsed = new URL(normalizedUrl);

            let videoId = "";

            if (parsed.hostname === "youtu.be") {
                // e.g. https://youtu.be/mQsfU8Y6XyU
                videoId = parsed.pathname.replace("/", "");
            } else {
                // e.g. https://www.youtube.com/watch?v=mQsfU8Y6XyU
                videoId = parsed.searchParams.get("v") || "";
            }

            if (videoId) {
                // Standard YouTube embed URL
                return `https://www.youtube.com/embed/${videoId}?feature=oembed`;
            }
        } catch (err) {
            console.warn("Failed to parse video URL:", url, err);
        }
    }

    // Fallback: ensure it has a protocol
    if (url.startsWith("//")) return `https:${url}`;
    return url;
};

const MediaPage: React.FC = () => {
    const [items, setItems] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchMedia = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await MediaApi.list({ page: 1, limit: 60 });
                if (!mounted) return;

                setItems(res.items || []);
            } catch (err) {
                console.error(err);
                if (mounted) setError("Unable to load media right now.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchMedia();
        return () => {
            mounted = false;
        };
    }, []);

    // Normalize category to lowercase string for filtering
    const pictures = items.filter((item) =>
        String(item.category).toLowerCase().includes("image")
    );
    const videos = items.filter((item) =>
        String(item.category).toLowerCase().includes("video")
    );

    const renderPictureSkeleton = (count: number) => (
        <>
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="group animate-pulse">
                    <div className="mb-6 overflow-hidden rounded-lg bg-gray-200 h-[300px]" />
                    <div className="space-y-3">
                        <div className="h-5 w-3/4 bg-gray-200 rounded" />
                        <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    </div>
                </div>
            ))}
        </>
    );

    const renderVideoSkeleton = (count: number) => (
        <>
            {Array.from({ length: count }).map((_, idx) => (
                <div key={idx} className="group animate-pulse">
                    <div className="mb-6 overflow-hidden rounded-lg bg-gray-200 h-[300px]" />
                    <div className="space-y-3">
                        <div className="h-5 w-3/4 bg-gray-200 rounded" />
                        <div className="h-4 w-1/3 bg-gray-200 rounded" />
                    </div>
                </div>
            ))}
        </>
    );

    return (
        <div className="min-h-screen bg-white">
            <Header2 />

            {/* Breadcrumb */}
            <Breadcrumb imageUrl="/newsbreadcrumbimage.jpeg" title="MEDIA" />

            {/* Media Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Error state */}
                    {!loading && error && (
                        <div className="mb-10 text-center text-red-500 text-lg">
                            {error}
                        </div>
                    )}

                    {/* PICTURES */}
                    <h2 className="text-5xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-8">
                        PICTURES
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {/* Loading skeleton */}
                        {loading && renderPictureSkeleton(6)}

                        {/* Empty state */}
                        {!loading && !error && pictures.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 text-sm">
                                No pictures available at the moment. Please check back soon.
                            </div>
                        )}

                        {/* Picture cards */}
                        {!loading &&
                            !error &&
                            pictures.length > 0 &&
                            pictures.map((media) => (
                                <div key={media._id} className="group">
                                    <div className="mb-6 overflow-hidden rounded-lg">
                                        <img
                                            src={media.mediaUrl}
                                            alt={media.title}
                                            className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold leading-tight">
                                            {media.title}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {/* VIDEOS */}
                    <h2 className="text-5xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-8 mt-16">
                        VIDEOS
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {/* Loading skeleton */}
                        {loading && renderVideoSkeleton(6)}

                        {/* Empty state */}
                        {!loading && !error && videos.length === 0 && (
                            <div className="col-span-full text-center text-gray-500 text-sm">
                                No videos available at the moment. Please check back soon.
                            </div>
                        )}

                        {/* Video cards */}
                        {!loading &&
                            !error &&
                            videos.length > 0 &&
                            videos.map((media) => {
                                const iframeSrc = buildVideoEmbedUrl(media.mediaUrl);

                                return (
                                    <div key={media._id} className="group">
                                        <div className="mb-6 rounded-lg overflow-hidden shadow-2xl bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900">
                                            <div className="relative aspect-video">
                                                {iframeSrc ? (
                                                    <iframe
                                                        className="w-full h-full"
                                                        src={iframeSrc}
                                                        title={media.title}
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center w-full h-full text-white text-sm">
                                                        Invalid video URL
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-semibold leading-tight">
                                                {media.title}
                                            </h3>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </section>

            <Footer2 />
        </div>
    );
};

export default MediaPage;