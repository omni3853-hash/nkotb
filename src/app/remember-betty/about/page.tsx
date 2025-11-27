"use client";

import React from "react";
import Link from "next/link";
import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";
import { usePathname } from "next/navigation";

const navLinks = [
    { label: "About", href: "/remember-betty/about" },
    { label: "Donate", href: "/remember-betty/donate" },
    { label: "Need Help", href: "/remember-betty/application" },
    { label: "Volunteer", href: "/remember-betty/volunteer" },
    { label: "Gallery", href: "/remember-betty/gallery" },
];

const AboutPage: React.FC = () => {
    const pathname = usePathname();
    const leftImages = ["/betty-family1.webp", "/betty-family.webp", "/betty-family2.webp"];
    const rightImages = ["/betty-family3.webp", "/betty-family4.webp", "/betty-family5.webp"];

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
                {/* Main Story Layout */}
                <section className="py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 xl:px-8 grid grid-cols-1 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.8fr)_minmax(0,0.7fr)] gap-8">
                        {/* Left image column */}
                        <div className="hidden lg:flex flex-col gap-6">
                            {leftImages.map((src, idx) => (
                                <div key={idx} className="overflow-hidden">
                                    <img
                                        src={src}
                                        alt="Betty Wood and family"
                                        className="w-full h-52 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Center story column */}
                        <article className="order-first lg:order-none text-center lg:text-left">
                            <header className="mb-10">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4">
                                    In Memory of Elizabeth &quot;Betty&quot; Wood
                                </h1>
                                <p className="text-sm md:text-xs tracking-[0.25em] uppercase text-pink-500 mb-6">
                                    Our mission is to help minimize the financial burden associated with breast cancer for
                                    patients and survivors by providing direct financial support to them so that they can
                                    focus on recovery and quality of life.
                                </p>
                                <div className="flex justify-center lg:justify-start">
                                    <div className="w-28 h-1 rounded-full bg-pink-300" />
                                </div>
                            </header>

                            <div className="space-y-5 text-base md:text-lg leading-relaxed text-gray-700">
                                <p>
                                    After the death of his mother, Betty, from breast cancer in 1998, New Kids On The Block
                                    member Danny Wood searched for a way to keep her memory alive. During his break from
                                    NKOTB in the 90s and early 2000s, he partnered with well-known breast cancer charities to
                                    help raise funds for breast cancer research &amp; early detection.
                                </p>
                                <p>
                                    The return of NKOTB in 2008 gave Danny a larger audience for the story of his mother and
                                    her fight against breast cancer. Fans began walking &amp; raising money directly for these
                                    charities at breast cancer awareness races across the US and Canada. Rallying behind their
                                    brother, the members of NKOTB created pink ribbon items to sell during their reunion tour.
                                    Using his mother&apos;s memory as inspiration, Danny released a solo album, &quot;Stronger:
                                    Remember Betty&quot;, with all proceeds going directly into his fundraising efforts.
                                </p>
                                <p>
                                    In 2015, unsatisfied with the status quo of some of the larger charities, Danny ventured
                                    out to make Remember Betty an independent 501(c)3 organization. From there, the Remember
                                    Betty Foundation was born.
                                </p>
                                <p>
                                    Danny returned to the recording studio for the first time in 8 years, releasing &quot;Look
                                    At Me,&quot; in January 2016. The introspective, singer-songwriter album and subsequent
                                    tour helped raise over $70,000 for the foundation in just 27 shows.
                                </p>
                                <p>
                                    As the foundation continued to grow, teams across the United States and various parts of
                                    the world began putting together local events to assist with additional fundraising
                                    efforts. Teams hosted and participated in various events, including paint nights, karaoke
                                    parties, bake sales, merchandise auctions, and more to raise money for those in need.
                                    These events have become a staple of the foundation.
                                </p>
                                <p>
                                    Then, in 2020, as the world shut down due to a worldwide pandemic, the Remember Betty
                                    Foundation expanded its fundraising efforts to also include interactive, virtual events.
                                    These events helped the foundation continue to be able to assist those in need, even in
                                    the darkest of times.
                                </p>
                                <p>
                                    Holding strong in Elizabeth &quot;Betty&quot; Wood&apos;s memory, the Remember Betty
                                    Foundation is looking forward to continuing its growth, both in support and in the
                                    assistance we can provide to breast cancer patients and survivors.
                                </p>
                            </div>
                        </article>

                        {/* Right image column */}
                        <div className="hidden lg:flex flex-col gap-6">
                            {rightImages.map((src, idx) => (
                                <div key={idx} className="overflow-hidden">
                                    <img
                                        src={src}
                                        alt="Remember Betty events"
                                        className="w-full h-52 object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Closing CTA / mission emphasis */}
                <section className="bg-pink-50 py-12">
                    <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-6 text-center">
                        <h2 className="text-2xl md:text-3xl font-black mb-4">
                            Carrying Betty&apos;s Legacy Forward
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Every donation, event, and volunteer hour helps us honor Betty&apos;s legacy by directly
                            supporting patients and survivors facing the financial strain of breast cancer. Thank you for
                            standing with us as we continue this work, one family at a time.
                        </p>
                    </div>
                </section>
            </main>

            <Footer2 />
        </div>
    );
};

export default AboutPage;
