"use client"

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Header2 } from '@/components/header2';
import { Footer2 } from '@/components/footer2';
import { Breadcrumb } from '@/components/breadcrumb';

const Page = () => {

    const events = [
        { date: 'NOV 1, 2025', venue: 'DOLBY THEATRE AT PARK MGM', location: 'Las Vegas, NV' },
        { date: 'NOV 2, 2025', venue: 'DOLBY THEATRE AT PARK MGM', location: 'Las Vegas, NV' },
        { date: 'NOV 5, 2025', venue: 'DOLBY THEATRE AT PARK MGM', location: 'Las Vegas, NV' },
        { date: 'NOV 7, 2025', venue: 'DOLBY THEATRE AT PARK MGM', location: 'Las Vegas, NV' },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header2 />

            <Breadcrumb
                imageUrl="/eventbreadcrumbimage.jpg"
                title="EVENTS"
            />


            {/* Events Section */}
            <section id="events" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-5xl sm:text-4xl lg:text-5xl font-black tracking-tight">EVENTS</h2>
                        <a
                            href="/events"
                            className="flex items-center space-x-2 text-lg font-black uppercase hover:underline group"
                        >
                            <span>VIEW ALL EVENTS</span>
                            <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </a>
                    </div>

                    <div className="border-t-4 border-black mb-8"></div>

                    <div className="space-y-6">
                        {events.map((event, index) => (
                            <div
                                key={index}
                                className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-300 pb-6 space-y-4 lg:space-y-0"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12 space-y-2 lg:space-y-0">
                                    <div className="text-2xl font-black tracking-tight whitespace-nowrap">
                                        {event.date}
                                    </div>
                                    <div className="text-xl font-medium">
                                        {event.venue}
                                    </div>
                                    <div className="text-lg text-gray-600">
                                        {event.location}
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button className="bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors">
                                        TICKETS
                                    </button>
                                    <button className="bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors">
                                        VIP UPGRADE
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer2 />
        </div>
    );
};

export default Page;