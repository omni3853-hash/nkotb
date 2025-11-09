"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Search,
    Calendar,
    Clock,
    Share2,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    Grid3X3,
    List,
    ArrowUp,
    Tag,
    Star,
    ArrowRight,
    Filter,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { BlogPost, BlogPostsApi } from "@/api/posts.api";

// Debounce hook
function useDebounced<T>(value: T, delay = 350) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

const categories = [
    "All",
    "Entertainment",
    "Music",
    "Sports",
    "Technology",
    "Lifestyle",
    "Business",
    "Art",
    "Food",
    "Travel",
    "Health",
];

const sortOptions = [
    { label: "Latest", value: "latest" },
    { label: "Featured", value: "featured" },
    { label: "Title A-Z", value: "title" },
];

const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const formatReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
};

// Professional Blog Card Component - No Shadows
const BlogCard = ({
    post,
    viewMode,
    onClick
}: {
    post: BlogPost;
    viewMode: "grid" | "list";
    onClick: () => void;
}) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/blog/${post.slug}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url: url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
            }
        } catch (err) {
            // Share dialog was canceled
        }
    };

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
    };

    if (viewMode === "list") {
        return (
            <div
                className="group cursor-pointer bg-white border border-gray-100 rounded-3xl overflow-hidden transition-all duration-500 hover:border-blue-200 hover:bg-blue-50/30"
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex flex-col lg:flex-row gap-0">
                    <div className="lg:w-72 xl:w-80 h-56 lg:h-64 relative overflow-hidden flex-shrink-0">
                        <img
                            src={post.thumbnail || "/placeholder-blog.jpg"}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-700"
                            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent lg:bg-gradient-to-l" />

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                            <Badge className="bg-white/90 text-gray-700 border-0 font-medium px-3 py-1.5">
                                {post.category}
                            </Badge>
                        </div>

                        {/* Featured Badge */}
                        {post.isFeatured && (
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                    <Star className="w-3 h-3 mr-1 fill-current" />
                                    Featured
                                </Badge>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.createdAt)}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm text-gray-600 flex items-center gap-1.5 font-medium">
                                <Clock className="w-4 h-4" />
                                {formatReadTime(post.content)}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                            {post.title}
                        </h3>

                        <p className="text-gray-600 mb-6 text-lg leading-relaxed line-clamp-2">
                            {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 border-0 text-xs font-medium">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {tag}
                                    </Badge>
                                ))}
                                {post.tags.length > 3 && (
                                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0 text-xs font-medium">
                                        +{post.tags.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <Button
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold group/btn rounded-2xl"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onClick();
                                }}
                            >
                                Read More
                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors"
                                    onClick={handleShare}
                                >
                                    <Share2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 rounded-2xl transition-colors ${isBookmarked
                                            ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                        }`}
                                    onClick={handleBookmark}
                                >
                                    <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <div
            className="group cursor-pointer bg-white border border-gray-100 rounded-3xl overflow-hidden transition-all duration-500 hover:border-blue-200 hover:bg-blue-50/30 h-full flex flex-col"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={post.thumbnail || "/placeholder-blog.jpg"}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700"
                    style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-700 border-0 font-medium px-3 py-1.5">
                        {post.category}
                    </Badge>
                </div>

                {/* Featured Badge */}
                {post.isFeatured && (
                    <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                        </Badge>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-all duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <Button className="bg-white/95 text-blue-600 hover:bg-white border border-blue-200 font-semibold rounded-2xl">
                            Read Article
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 font-medium">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.createdAt)}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatReadTime(post.content)}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 leading-tight line-clamp-2">
                    {post.title}
                </h3>

                <p className="text-gray-600 leading-relaxed line-clamp-3 text-sm mb-4">
                    {post.excerpt}
                </p>

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 border-0 text-xs font-medium">
                                {tag}
                            </Badge>
                        ))}
                        {post.tags.length > 2 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0 text-xs font-medium">
                                +{post.tags.length - 2}
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <div className="p-6 pt-0">
                <div className="flex items-center justify-between w-full">
                    <Button
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-sm rounded-2xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                    >
                        Read Full Story
                    </Button>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors"
                            onClick={handleShare}
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-9 w-9 rounded-2xl transition-colors ${isBookmarked
                                    ? "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                                }`}
                            onClick={handleBookmark}
                        >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Professional Loading Skeleton - No Shadows
const BlogCardSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => {
    if (viewMode === "list") {
        return (
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden animate-pulse">
                <div className="flex flex-col lg:flex-row gap-0">
                    <div className="lg:w-72 xl:w-80 h-56 lg:h-64 bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 p-6 lg:p-8 space-y-4">
                        <div className="flex gap-3">
                            <div className="h-4 bg-gray-200 rounded-full w-24" />
                            <div className="h-4 bg-gray-200 rounded-full w-20" />
                        </div>
                        <div className="h-6 bg-gray-200 rounded-full w-3/4" />
                        <div className="h-4 bg-gray-200 rounded-full w-full" />
                        <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                        <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded-full w-16" />
                            <div className="h-6 bg-gray-200 rounded-full w-20" />
                        </div>
                        <div className="flex justify-between pt-4">
                            <div className="h-10 bg-gray-200 rounded-2xl w-24" />
                            <div className="flex gap-1">
                                <div className="h-10 w-10 bg-gray-200 rounded-2xl" />
                                <div className="h-10 w-10 bg-gray-200 rounded-2xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden h-full flex flex-col animate-pulse">
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="flex-1 p-6 space-y-3">
                <div className="flex gap-3">
                    <div className="h-3 bg-gray-200 rounded-full w-20" />
                    <div className="h-3 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="h-5 bg-gray-200 rounded-full w-3/4" />
                <div className="h-3 bg-gray-200 rounded-full w-full" />
                <div className="h-3 bg-gray-200 rounded-full w-2/3" />
            </div>
            <div className="p-6 pt-0">
                <div className="flex justify-between w-full">
                    <div className="flex gap-1">
                        <div className="h-6 bg-gray-200 rounded-full w-12" />
                        <div className="h-6 bg-gray-200 rounded-full w-14" />
                    </div>
                    <div className="flex gap-1">
                        <div className="h-9 w-9 bg-gray-200 rounded-2xl" />
                        <div className="h-9 w-9 bg-gray-200 rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function BlogPage() {
    const router = useRouter();

    // Filters / UI state
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounced(searchTerm, 350);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [sortBy, setSortBy] = useState("latest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Data state
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const postsPerPage = 12;

    // Fetch blog posts
    useEffect(() => {
        let mounted = true;
        const loadPosts = async () => {
            setLoading(true);
            try {
                const query = {
                    page: currentPage,
                    limit: postsPerPage,
                    search: debouncedSearch || undefined,
                    category: selectedCategory !== "All" ? selectedCategory : undefined,
                    status: "published" as const,
                    onlyActive: true,
                    onlyPublished: true,
                };

                const res = await BlogPostsApi.list(query);
                if (!mounted) return;

                let filteredPosts = res.items || [];

                // Local sorting
                if (sortBy === "featured") {
                    filteredPosts.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
                } else if (sortBy === "title") {
                    filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
                }
                // "latest" is default from API

                setPosts(filteredPosts);
                setTotal(res.total || 0);
            } catch (err: any) {
                if (!mounted) return;
                toast.error(err?.response?.data?.message || err?.message || "Failed to load blog posts");
                setPosts([]);
                setTotal(0);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadPosts();
        return () => {
            mounted = false;
        };
    }, [currentPage, debouncedSearch, selectedCategory, sortBy]);

    // Scroll-to-top visibility
    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const totalPages = Math.max(1, Math.ceil(total / postsPerPage));

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.min(Math.max(1, page), totalPages));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePostClick = (post: BlogPost) => {
        router.push(`/blog/${post.slug}`);
    };

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("All");
        setSortBy("latest");
        setCurrentPage(1);
    };

    const featuredPosts = posts.filter(post => post.isFeatured);
    const regularPosts = posts.filter(post => !post.isFeatured);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <Header />

            {/* Hero Section - Kept as requested */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center mb-16 max-w-4xl mx-auto">
                        <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm px-4 py-2 mb-6 font-semibold text-sm">
                            📚 LATEST INSIGHTS
                        </Badge>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Discover{" "}
                            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                                Stories
                            </span>{" "}
                            That Inspire
                        </h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
                            Explore expert insights, behind-the-scenes stories, and the latest trends
                            from the world of entertainment and beyond.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                        {[
                            { label: "Articles", value: "500+" },
                            { label: "Categories", value: "10+" },
                            { label: "Writers", value: "50+" },
                            { label: "Readers", value: "10K+" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Blog Content */}
            <section className="py-20 -mt-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Modern Filter Section */}
                    <div className="mb-16">
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-8">
                            <div className="flex items-center gap-3 mb-6">
                                <Filter className="w-5 h-5 text-gray-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Filter Articles</h2>
                            </div>

                            <div className="flex flex-col lg:flex-row gap-6 mb-6">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                                    <Input
                                        placeholder="Search articles, topics, or keywords..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl bg-white transition-colors"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Select
                                        value={selectedCategory}
                                        onValueChange={(value) => {
                                            setSelectedCategory(value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-48 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl bg-white transition-colors">
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category} className="text-lg">
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={sortBy}
                                        onValueChange={(value) => {
                                            setSortBy(value);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-48 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-2xl bg-white transition-colors">
                                            <SelectValue placeholder="Sort By" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="text-lg">
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="flex gap-2">
                                        <Button
                                            variant={viewMode === "grid" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => setViewMode("grid")}
                                            className="h-14 w-14 rounded-2xl border-2 transition-all"
                                        >
                                            <Grid3X3 className="size-5" />
                                        </Button>
                                        <Button
                                            variant={viewMode === "list" ? "default" : "outline"}
                                            size="icon"
                                            onClick={() => setViewMode("list")}
                                            className="h-14 w-14 rounded-2xl border-2 transition-all"
                                        >
                                            <List className="size-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Results count and clear filters */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-gray-100">
                                <p className="text-lg text-gray-600 font-medium">
                                    {loading ? "Discovering articles..." : `Found ${total.toLocaleString()} articles`}
                                </p>
                                {(debouncedSearch || selectedCategory !== "All" || sortBy !== "latest") && (
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={clearFilters}
                                        className="border-2 rounded-2xl text-gray-600 hover:text-gray-700 transition-colors"
                                    >
                                        Clear All Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Featured Posts */}
                    {viewMode === "grid" && featuredPosts.length > 0 && (
                        <div className="mb-16">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-2 h-12 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">Featured Stories</h2>
                                    <p className="text-gray-600 mt-1">Handpicked articles worth reading</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {featuredPosts.map((post) => (
                                    <BlogCard
                                        key={post._id}
                                        post={post}
                                        viewMode="grid"
                                        onClick={() => handlePostClick(post)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Posts */}
                    <div className={`
            ${viewMode === "grid"
                            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                            : "space-y-8"
                        }
          `}>
                        {loading &&
                            Array.from({ length: postsPerPage }).map((_, i) => (
                                <BlogCardSkeleton key={i} viewMode={viewMode} />
                            ))}

                        {!loading && viewMode === "grid" && regularPosts.map((post) => (
                            <BlogCard
                                key={post._id}
                                post={post}
                                viewMode={viewMode}
                                onClick={() => handlePostClick(post)}
                            />
                        ))}

                        {!loading && viewMode === "list" && posts.map((post) => (
                            <BlogCard
                                key={post._id}
                                post={post}
                                viewMode={viewMode}
                                onClick={() => handlePostClick(post)}
                            />
                        ))}
                    </div>

                    {/* No results */}
                    {!loading && posts.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No articles found</h3>
                            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                                We couldn't find any articles matching your criteria. Try adjusting your search or filters.
                            </p>
                            <Button
                                size="lg"
                                onClick={clearFilters}
                                className="bg-blue-600 hover:bg-blue-700 rounded-2xl px-8 py-3 text-lg transition-colors"
                            >
                                Clear All Filters
                            </Button>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-16">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-12 px-6 rounded-2xl border-2 transition-colors"
                            >
                                <ChevronLeft className="size-5 mr-2" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === currentPage ? "default" : "outline"}
                                        size="lg"
                                        onClick={() => handlePageChange(page)}
                                        className={`h-12 w-12 rounded-2xl font-semibold transition-all ${page === currentPage ? '' : 'border-2'
                                            }`}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-12 px-6 rounded-2xl border-2 transition-colors"
                            >
                                Next
                                <ChevronRight className="size-5 ml-2" />
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Scroll to Top */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 flex items-center justify-center group border border-white/20"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="size-6 group-hover:scale-110 transition-transform duration-300" />
                </button>
            )}

            <Footer />
        </div>
    );
}