"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";
import { Breadcrumb } from "@/components/breadcrumb";
import { BlogPostsApi, BlogPost } from "@/api/posts.api";

function formatDate(value: string | Date | null | undefined) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

const Page: React.FC = () => {
    const params = useParams();
    const slug = (params?.slug as string) || "";

    const [article, setArticle] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        let mounted = true;

        const fetchArticle = async () => {
            try {
                setLoading(true);
                setError(null);

                const post = await BlogPostsApi.getBySlug(slug);
                if (!mounted) return;

                if (!post.isActive || post.status !== "published") {
                    setError("This article is not available.");
                    setArticle(null);
                } else {
                    setArticle(post);
                }
            } catch (err) {
                console.error(err);
                if (mounted) setError("Unable to load this article.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchArticle();
        return () => {
            mounted = false;
        };
    }, [slug]);

    return (
        <div className="min-h-screen bg-white">
            <Header2 />

            <Breadcrumb imageUrl="/newsbreadcrumbimage.jpeg" title="NEWS" />

            <section className="py-12 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href="/news"
                            className="text-sm font-semibold text-gray-600 hover:text-black"
                        >
                            ← Back to News
                        </Link>
                    </div>

                    {/* Loader */}
                    {loading && (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-8 w-2/3 bg-gray-200 rounded" />
                            <div className="h-4 w-1/3 bg-gray-200 rounded" />
                            <div className="mt-6 h-72 w-full bg-gray-200 rounded-lg" />
                            <div className="mt-6 space-y-3">
                                <div className="h-4 w-full bg-gray-200 rounded" />
                                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                                <div className="h-4 w-4/5 bg-gray-200 rounded" />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="py-12 text-center text-red-500 text-lg">
                            {error}
                        </div>
                    )}

                    {/* Article Content */}
                    {!loading && !error && article && (
                        <article className="space-y-6">
                            <header>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                                    {article.title}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                    <span>{formatDate(article.createdAt)}</span>
                                    {article.category && (
                                        <>
                                            <span>•</span>
                                            <span className="uppercase tracking-wide font-semibold">
                                                {article.category}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {article.tags && article.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {article.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </header>

                            {article.coverImage || article.thumbnail ? (
                                <div className="mt-6">
                                    <img
                                        src={article.coverImage || article.thumbnail!}
                                        alt={article.title}
                                        className="w-full max-h-[480px] object-cover rounded-lg"
                                    />
                                </div>
                            ) : null}

                            {/* Excerpt */}
                            {article.excerpt && (
                                <p className="mt-6 text-lg text-gray-700 font-medium">
                                    {article.excerpt}
                                </p>
                            )}

                            {/* Main Content */}
                            <div className="mt-4 text-base sm:text-lg leading-relaxed text-gray-800 whitespace-pre-line">
                                {article.content}
                            </div>
                        </article>
                    )}
                </div>
            </section>

            <Footer2 />
        </div>
    );
};

export default Page;
