"use client";

import React from "react";
import Link from "next/link";
import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { usePathname } from "next/navigation";

const navLinks = [
    { label: "About", href: "/remember-betty/about" },
    { label: "Donate", href: "/remember-betty/donate" },
    { label: "Need Help", href: "/remember-betty/application" },
    { label: "Volunteer", href: "/remember-betty/volunteer" },
    { label: "Gallery", href: "/remember-betty/gallery" },
];

const RememberBettyPage: React.FC = () => {
    const pathname = usePathname();

    return (
        <div className="min-h-screen flex flex-col bg-white">
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

            <main className="flex-1 flex flex-col justify-between">
                {/* Hero with big centered logo */}
                <section className="flex-1 flex items-center justify-center px-4 pt-12 pb-16">
                    <div className="w-full max-w-4xl flex justify-center">
                        <img
                            src="/betty-hero.webp"
                            alt="Remember Betty Foundation logo"
                            className="w-full max-w-xl h-auto"
                        />
                    </div>
                </section>

                {/* Bottom strip: socials + sub-navigation + mission text */}
                <section className="bg-black text-pink-200 py-6 md:py-8">
                    <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        {/* Social icons */}
                        <div className="flex items-center justify-center md:justify-start gap-5 text-2xl text-white">
                            <Link
                                href="https://www.instagram.com/rememberbetty/"
                                aria-label="Remember Betty on Instagram"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-pink-300 transition-colors"
                            >
                                <FaInstagram />
                            </Link>
                            <Link
                                href="https://x.com/rememberbetty"
                                aria-label="Remember Betty on X"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-pink-300 transition-colors"
                            >
                                <FaXTwitter />
                            </Link>
                            <Link
                                href="https://web.facebook.com/rememberbetty"
                                aria-label="Remember Betty on Facebook"
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-pink-300 transition-colors"
                            >
                                <FaFacebookF />
                            </Link>
                        </div>

                        {/* Sub-nav + mission statement */}
                        <div className="flex-1 flex flex-col items-center md:items-end gap-3 text-center md:text-right">
                            <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-[11px] md:text-xs tracking-[0.25em] uppercase text-pink-300">
                                {navLinks.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                            <p className="max-w-xl text-[11px] md:text-xs leading-relaxed">
                                We are a 501(c)3 tax exempt organization whose mission is to help
                                minimize the financial burden associated with breast cancer for
                                patients and survivors so that they can focus on recovery &amp;
                                quality of life.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer2 />
        </div>
    );
};

export default RememberBettyPage;