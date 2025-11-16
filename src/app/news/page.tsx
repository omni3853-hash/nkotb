"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

const NewsPage: React.FC = () => {
    const [articles, setArticles] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchNews = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await BlogPostsApi.list({
                    onlyActive: true,
                    onlyPublished: true,
                    limit: 20,
                });

                if (!mounted) return;

                const activePublished = (res.items || [])
                    .filter(
                        (post) => post.isActive && post.status === "published"
                    )
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    );

                setArticles(activePublished);
            } catch (err) {
                console.error(err);
                if (mounted) setError("Unable to load news articles right now.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchNews();
        return () => {
            mounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Header2 />

            <Breadcrumb imageUrl="/newsbreadcrumbimage.jpeg" title="NEWS" />

            {/* News Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Loader */}
                    {loading && (
                        <div className="space-y-12">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col lg:flex-row items-start lg:space-x-6 rounded-lg shadow-sm animate-pulse"
                                >
                                    <div className="flex-shrink-0 mb-4 lg:mb-0 lg:w-1/2">
                                        <div className="w-full h-96 bg-gray-200 rounded-lg" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="h-8 w-3/4 bg-gray-200 rounded" />
                                        <div className="h-5 w-full bg-gray-200 rounded" />
                                        <div className="h-5 w-5/6 bg-gray-200 rounded" />
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="h-5 w-48 bg-gray-200 rounded" />
                                            <div className="h-4 w-32 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="py-12 text-center text-red-500 text-lg">
                            {error}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && articles.length === 0 && (
                        <div className="py-12 text-center text-gray-500 text-lg">
                            No news articles available at the moment. Please check back soon.
                        </div>
                    )}

                    {/* Articles */}
                    {!loading && !error && articles.length > 0 && (
                        <div className="space-y-12">
                            {articles.map((article, index) => (
                                <div key={article._id}>
                                    <div className="flex flex-col lg:flex-row items-start lg:space-x-6">
                                        {/* Image */}
                                        <div className="flex-shrink-0 mb-4 lg:mb-0 lg:w-1/2">
                                            <img
                                                src={
                                                    article.thumbnail ||
                                                    "/images/news-placeholder.jpg"
                                                }
                                                alt={article.title}
                                                className="w-full h-96 object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Text */}
                                        <div className="flex-1">
                                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                                                {article.title}
                                            </h2>
                                            <p className="text-lg sm:text-xl text-gray-600 mt-4">
                                                {article.excerpt}
                                            </p>

                                            <div className="flex items-center justify-between pt-4">
                                                <Link
                                                    href={`/news/${article.slug}`}
                                                    className="text-red-600 font-bold hover:underline"
                                                >
                                                    Read the full article here
                                                </Link>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(article.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    {index < articles.length - 1 && (
                                        <hr className="my-8 border-t border-2 border-gray-300" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer2 />
        </div>
    );
};

export default NewsPage;