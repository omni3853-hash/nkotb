"use client"

import React from 'react';
import { Header2 } from '@/components/header2';
import { Footer2 } from '@/components/footer2';
import { Breadcrumb } from '@/components/breadcrumb';

const App = () => {

    const mediaItems = [
        {
            id: 1,
            mediaUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
            title: 'New Kids on the Block Live Performance',
            date: 'November 10, 2025',
            category: 'image'
        },
        {
            id: 2,
            mediaUrl: 'https://www.youtube.com/embed/some-video-id',
            title: 'Behind the Scenes of NKOTB Vegas Residency',
            date: 'November 8, 2025',
            category: 'video'
        },
        {
            id: 3,
            mediaUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
            title: 'Meet & Greet with Donnie Wahlberg',
            date: 'November 5, 2025',
            category: 'image'
        },
        {
            id: 4,
            mediaUrl: 'https://www.youtube.com/embed/some-other-video-id',
            title: 'Exclusive Interview with Joey McIntyre',
            date: 'October 28, 2025',
            category: 'video'
        },
        {
            id: 5,
            mediaUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
            title: 'New Single Release "Bring Back The Time"',
            date: 'October 25, 2025',
            category: 'image'
        },
        {
            id: 6,
            mediaUrl: 'https://www.youtube.com/embed/yet-another-video-id',
            title: 'Exclusive Behind-the-Scenes Footage',
            date: 'October 20, 2025',
            category: 'video'
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header2 />

            {/* Breadcrumb */}
            <Breadcrumb imageUrl="/newsbreadcrumbimage.jpeg" title="MEDIA" />

            {/* Media Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Pictures Section */}
                    <h2 className="text-5xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-8">PICTURES</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {mediaItems.filter(item => item.category === 'image').map((media) => (
                            <div key={media.id} className="group">
                                <div className="mb-6 overflow-hidden">
                                    <img
                                        src={media.mediaUrl}
                                        alt={media.title}
                                        className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold leading-tight">{media.title}</h3>
                                    <span className="text-sm text-gray-500">{media.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Videos Section */}
                    <h2 className="text-5xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-8 mt-16">VIDEOS</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {mediaItems.filter(item => item.category === 'video').map((media) => (
                            <div key={media.id} className="group">
                                <div className="mb-6 overflow-hidden">
                                    <iframe
                                        width="100%"
                                        height="300"
                                        src={media.mediaUrl}
                                        title={media.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold leading-tight">{media.title}</h3>
                                    <span className="text-sm text-gray-500">{media.date}</span>
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

export default App;