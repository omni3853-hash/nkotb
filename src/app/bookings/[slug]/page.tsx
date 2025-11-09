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
    Flame,
    TrendingUp,
    ArrowRight,
    CheckCircle,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { CelebritiesApi, type Celebrity } from "@/api/celebrities.api";

const formatPrice = (price?: number) => {
    const v = price || 0;
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (v >= 100000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
};

const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
        case "Available":
            return "bg-green-100 text-green-800 border-green-200";
        case "Limited":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "Booked":
            return "bg-red-100 text-red-800 border-red-200";
        default:
            return "bg-green-100 text-green-800 border-green-200";
    }
};

export default function CelebrityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedCelebrities, setRelatedCelebrities] = useState<Celebrity[]>([]);

    useEffect(() => {
        const loadCelebrity = async () => {
            try {
                setLoading(true);
                const celebrityData = await CelebritiesApi.getBySlug(slug);
                setCelebrity(celebrityData);

                // Load related celebrities
                const related = await CelebritiesApi.list({
                    category: celebrityData.category,
                    limit: 3,
                    isActive: true,
                });
                setRelatedCelebrities(related.items.filter(c => c._id !== celebrityData._id));
            } catch (err: any) {
                toast.error(err?.response?.data?.message || err?.message || "Celebrity not found");
                router.push("/bookings");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadCelebrity();
        }
    }, [slug, router]);

    const handleShare = async () => {
        const url = window.location.href;
        const title = celebrity?.name || "";

        try {
            if (navigator.share) {
                await navigator.share({
                    title,
                    text: celebrity?.description || "",
                    url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Celebrity profile link copied to clipboard!");
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
                                    <div className="aspect-square bg-gray-200 rounded-3xl" />
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
                                    <div className="h-32 bg-gray-200 rounded-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!celebrity) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
                <Header />
                <div className="pt-32 pb-20 text-center">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Celebrity Not Found</h1>
                        <p className="text-gray-600 mb-8">The celebrity profile you're looking for doesn't exist.</p>
                        <Button onClick={() => router.push("/bookings")}>
                            Back to Celebrities
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

            {/* Celebrity Details */}
            <div className="pt-32 pb-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/bookings")}
                            className="flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Celebrities
                        </Button>
                        <span>/</span>
                        <span>{celebrity.category}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Celebrity Image and Details */}
                        <div className="space-y-6">
                            <div className="relative rounded-3xl overflow-hidden">
                                <img
                                    src={celebrity.image || celebrity.coverImage || "/placeholder-celebrity.jpg"}
                                    alt={celebrity.name}
                                    className="w-full h-auto object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-white/90 text-gray-700 border-0 font-medium px-3 py-1.5">
                                        {celebrity.category}
                                    </Badge>
                                </div>
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {celebrity.hot && (
                                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                                            <Flame className="w-3 h-3 mr-1 fill-current" />
                                            Hot
                                        </Badge>
                                    )}
                                    {celebrity.trending && (
                                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Trending
                                        </Badge>
                                    )}
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <Badge className={`border ${getAvailabilityColor(celebrity.availability)} text-sm font-medium`}>
                                        {celebrity.availability || "Available"}
                                    </Badge>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6 text-center">
                                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">
                                            {
                                                celebrity.bookings > 0
                                                    ? celebrity.bookings > 1000
                                                        ? '1000+'
                                                        : Math.round(celebrity.bookings * 1.5)
                                                    : '22+'
                                            }
                                        </div>
                                        <div className="text-sm text-gray-600">Bookings</div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6 text-center">
                                        <Star className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">{celebrity.rating || 4.5}</div>
                                        <div className="text-sm text-gray-600">Rating</div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6 text-center">
                                        <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">{celebrity.totalReviews || 0}</div>
                                        <div className="text-sm text-gray-600">Reviews</div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6 text-center">
                                        <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">{celebrity.verified ? "Yes" : "No"}</div>
                                        <div className="text-sm text-gray-600">Verified</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Celebrity Information */}
                        <div className="space-y-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <Badge className="bg-gray-100 text-gray-700 border-0 font-medium">
                                            {celebrity.category}
                                        </Badge>
                                        {celebrity.verified && (
                                            <Badge className="bg-green-100 text-green-700 border-0">
                                                <Star className="w-3 h-3 mr-1 fill-current" />
                                                Verified
                                            </Badge>
                                        )}
                                    </div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                        {celebrity.name}
                                    </h1>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {celebrity.description || "Professional talent with extensive experience in their field."}
                                    </p>
                                </div>
                            </div>

                            {/* Key Details */}
                            <Card className="border border-gray-100 rounded-2xl bg-white">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl font-bold text-gray-900">
                                            {formatPrice(celebrity.basePrice)}
                                        </div>
                                        <div className="text-sm text-gray-600">Starting Price</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Response Time</div>
                                            <div className="text-gray-600">{celebrity.responseTime || "Within 48 hours"}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-green-600" />
                                        <div>
                                            <div className="font-semibold text-gray-900">Availability</div>
                                            <div className="text-gray-600">Worldwide • {celebrity.availability || "Available"}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Achievements */}
                            {celebrity.achievements && celebrity.achievements.length > 0 && (
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Achievements & Recognition</h3>
                                        <div className="space-y-2">
                                            {celebrity.achievements.map((achievement, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                    <span className="text-gray-700">{achievement}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Booking Types */}
                            {celebrity.bookingTypes && celebrity.bookingTypes.length > 0 && (
                                <Card className="border border-gray-100 rounded-2xl bg-white">
                                    <CardContent className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Options</h3>
                                        <div className="space-y-3">
                                            {celebrity.bookingTypes.map((bookingType, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-blue-200 transition-colors"
                                                >
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{bookingType.name}</div>
                                                        <div className="text-sm text-gray-600">{bookingType.duration}</div>
                                                        {bookingType.description && (
                                                            <div className="text-sm text-gray-600 mt-1">{bookingType.description}</div>
                                                        )}
                                                        {bookingType.features && bookingType.features.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {bookingType.features.slice(0, 3).map((feature, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                                        {feature}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900">${bookingType.price}</div>
                                                        <div className="text-sm text-gray-600">
                                                            {bookingType.availability || 10} slots left
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
                                    Book Now
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
                            {celebrity.tags && celebrity.tags.length > 0 && (
                                <div className="pt-6">
                                    <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {celebrity.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 border-0">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Related Celebrities */}
                    {relatedCelebrities.length > 0 && (
                        <section className="mt-20">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Similar Talent</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedCelebrities.map((relatedCelebrity) => (
                                    <div
                                        key={relatedCelebrity._id}
                                        className="cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30"
                                        onClick={() => router.push(`/bookings/${relatedCelebrity.slug}`)}
                                    >
                                        <div className="aspect-[4/3] overflow-hidden">
                                            <img
                                                src={relatedCelebrity.image || relatedCelebrity.coverImage || "/placeholder-celebrity.jpg"}
                                                alt={relatedCelebrity.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Badge className="bg-gray-100 text-gray-700 border-0 text-xs">
                                                    {relatedCelebrity.category}
                                                </Badge>
                                                {relatedCelebrity.verified && (
                                                    <Star className="w-4 h-4 text-green-500 fill-current" />
                                                )}
                                            </div>
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                                                {relatedCelebrity.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {formatPrice(relatedCelebrity.basePrice)}
                                                </div>
                                                <Badge className={`border ${getAvailabilityColor(relatedCelebrity.availability)} text-xs`}>
                                                    {relatedCelebrity.availability || "Available"}
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