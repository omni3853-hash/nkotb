"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Calendar,
    Clock,
    Eye,
    Share2,
    Bookmark,
    User,
    Tag,
    ArrowLeft,
    Facebook,
    Twitter,
    Linkedin,
    Link2,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { BlogPost, BlogPostsApi } from "@/api/posts.api";

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

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        const loadPost = async () => {
            try {
                setLoading(true);
                const postData = await BlogPostsApi.getBySlug(slug);
                setPost(postData);

                // Load related posts
                const related = await BlogPostsApi.list({
                    category: postData.category,
                    limit: 3,
                    status: "published",
                    onlyActive: true,
                });
                setRelatedPosts(related.items.filter(p => p._id !== postData._id));
            } catch (err: any) {
                toast.error(err?.response?.data?.message || err?.message || "Post not found");
                router.push("/blog");
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            loadPost();
        }
    }, [slug, router]);

    const handleShare = async (platform?: string) => {
        const url = window.location.href;
        const title = post?.title || "";
        const text = post?.excerpt || "";

        try {
            if (platform === "copy") {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
                return;
            }

            if (platform === "facebook") {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                return;
            }

            if (platform === "twitter") {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, "_blank");
                return;
            }

            if (platform === "linkedin") {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
                return;
            }

            // Native share
            if (navigator.share) {
                await navigator.share({
                    title,
                    text,
                    url,
                });
            } else {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
            }
        } catch (err) {
            console.log("Error sharing:", err);
        }
    };

    if (loading) {
        return (
            <div className="bg-white min-h-screen">
                <Header />
                <div className="pt-32 pb-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="animate-pulse space-y-6">
                            {/* Breadcrumb skeleton */}
                            <div className="h-4 bg-zinc-200 rounded w-1/4" />

                            {/* Title skeleton */}
                            <div className="h-8 bg-zinc-200 rounded w-3/4" />

                            {/* Meta skeleton */}
                            <div className="flex gap-4">
                                <div className="h-4 bg-zinc-200 rounded w-20" />
                                <div className="h-4 bg-zinc-200 rounded w-16" />
                                <div className="h-4 bg-zinc-200 rounded w-24" />
                            </div>

                            {/* Image skeleton */}
                            <div className="aspect-video bg-zinc-200 rounded-xl" />

                            {/* Content skeleton */}
                            <div className="space-y-3">
                                <div className="h-4 bg-zinc-200 rounded w-full" />
                                <div className="h-4 bg-zinc-200 rounded w-full" />
                                <div className="h-4 bg-zinc-200 rounded w-2/3" />
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="bg-white min-h-screen">
                <Header />
                <div className="pt-32 pb-20 text-center">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-2xl font-bold text-zinc-900 mb-4">Post Not Found</h1>
                        <p className="text-zinc-600 mb-8">The blog post you're looking for doesn't exist.</p>
                        <Button onClick={() => router.push("/blog")}>
                            Back to Blog
                        </Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <Header />

            {/* Article */}
            <article className="pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push("/blog")}
                            className="flex items-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Button>
                        <span>/</span>
                        <span>{post.category}</span>
                    </nav>

                    {/* Header */}
                    <header className="mb-8">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">
                            {post.category}
                        </Badge>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 mb-6">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(post.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatReadTime(post.content)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.views || 0} views
                            </span>
                        </div>

                        <p className="text-lg text-zinc-600 leading-relaxed mb-8">
                            {post.excerpt}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 mb-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleShare()}
                                className="flex items-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </Button>

                            {/* Quick Share Options */}
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleShare("copy")}
                                    className="h-8 w-8"
                                >
                                    <Link2 className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleShare("facebook")}
                                    className="h-8 w-8"
                                >
                                    <Facebook className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleShare("twitter")}
                                    className="h-8 w-8"
                                >
                                    <Twitter className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleShare("linkedin")}
                                    className="h-8 w-8"
                                >
                                    <Linkedin className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Featured Image */}
                    {(post.coverImage || post.thumbnail) && (
                        <div className="mb-8 rounded-xl overflow-hidden">
                            <img
                                src={post.coverImage || post.thumbnail || "/placeholder-blog.jpg"}
                                alt={post.title}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose prose-lg max-w-none mb-12">
                        <div
                            className="blog-content"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-sm">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Share Section */}
                    <Card className="mb-12 bg-blue-50 border-blue-200">
                        <CardContent className="p-6 text-center">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Enjoyed this article?
                            </h3>
                            <p className="text-blue-700 mb-4">
                                Share it with your friends and colleagues!
                            </p>
                            <div className="flex justify-center gap-2">
                                <Button
                                    variant="default"
                                    onClick={() => handleShare()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share Article
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-zinc-900 mb-6">Related Articles</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedPosts.map((relatedPost) => (
                                    <Card
                                        key={relatedPost._id}
                                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white shadow-sm"
                                        onClick={() => router.push(`/blog/${relatedPost.slug}`)}
                                    >
                                        <div className="aspect-[4/3] overflow-hidden rounded-t-xl">
                                            <img
                                                src={relatedPost.thumbnail || "/placeholder-blog.jpg"}
                                                alt={relatedPost.title}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <Badge variant="outline" className="text-xs mb-2">
                                                {relatedPost.category}
                                            </Badge>
                                            <h3 className="font-semibold text-zinc-900 mb-2 line-clamp-2">
                                                {relatedPost.title}
                                            </h3>
                                            <p className="text-sm text-zinc-600 line-clamp-2">
                                                {relatedPost.excerpt}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </article>

            <Footer />
        </div>
    );
}