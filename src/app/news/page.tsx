"use client";

import React from 'react';
import { Header2 } from '@/components/header2';
import { Footer2 } from '@/components/footer2';
import { Breadcrumb } from '@/components/breadcrumb';

const Page = () => {

    const newsArticles = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=600&fit=crop',
            title: 'PEOPLE - NEW KIDS ON THE BLOCK SHARE BEHIND-THE-SCENES LOOK AT THE MAKING OF THEIR LAS VEGAS RESIDENCY (EXCLUSIVE)',
            description: 'The New Kids on the Block kicked off the first leg of their Las Vegas residency in June — and are now taking fans backstage to see how their high-flying production came together.',
            link: '#',
            date: 'November 10, 2025'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
            title: 'NEW KIDS ON THE BLOCK ANNOUNCE SPECIAL HOLIDAY CONCERT SERIES',
            description: 'Get ready for the ultimate holiday experience! NKOTB is bringing the magic of the season to life with a special series of intimate holiday concerts. Experience your favorite hits with a festive twist.',
            link: '#',
            date: 'November 8, 2025'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
            title: 'DONNIE WAHLBERG SURPRISES FANS WITH SPECIAL MEET & GREET EVENT',
            description: 'In an unforgettable moment, Donnie Wahlberg surprised lucky fans with an exclusive meet and greet after the Vegas show. Fans were thrilled to meet their idol and take photos with the beloved performer.',
            link: '#',
            date: 'November 5, 2025'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
            title: 'NKOTB RELEASES NEW SINGLE "BRING BACK THE TIME" - AVAILABLE NOW',
            description: 'The wait is over! New Kids on the Block just dropped their latest single "Bring Back The Time" and fans are already calling it an instant classic. The nostalgic anthem takes listeners on a journey through the decades.',
            link: '#',
            date: 'November 1, 2025'
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
            title: 'JOEY MCINTYRE ANNOUNCES SOLO TOUR DATES FOR 2026',
            description: 'Joey McIntyre is hitting the road solo! The multi-talented performer announced an exciting series of intimate concert dates for 2026, showcasing his incredible vocal range and stage presence.',
            link: '#',
            date: 'October 28, 2025'
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop',
            title: 'NKOTB VEGAS RESIDENCY EXTENDS DUE TO OVERWHELMING DEMAND',
            description: 'Due to incredible fan response and sold-out shows, New Kids on the Block are extending their Las Vegas residency with additional dates throughout 2026. Get your tickets before they\'re gone!',
            link: '#',
            date: 'October 25, 2025'
        },
        {
            id: 7,
            image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
            title: 'BEHIND THE MUSIC: NKOTB DOCUMENTARY COMING TO STREAMING SERVICES',
            description: 'Get ready for an intimate look at the journey of New Kids on the Block. A brand new documentary featuring never-before-seen footage and exclusive interviews will premiere next month on major streaming platforms.',
            link: '#',
            date: 'October 20, 2025'
        },
        {
            id: 8,
            image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
            title: 'JORDAN KNIGHT TEAMS UP WITH MAJOR BRAND FOR EXCLUSIVE COLLABORATION',
            description: 'Jordan Knight is taking his style to the next level with an exciting brand collaboration. The limited-edition collection drops next month and features exclusive merchandise and fashion pieces.',
            link: '#',
            date: 'October 15, 2025'
        },
        {
            id: 9,
            image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
            title: 'NKOTB CRUISE 2026 DATES ANNOUNCED - SETTING SAIL NEXT SUMMER',
            description: 'The most anticipated event of the year is back! NKOTB Cruise 2026 will set sail next summer with an incredible lineup of performances, meet and greets, and exclusive experiences. Book your cabin now!',
            link: '#',
            date: 'October 10, 2025'
        },
        {
            id: 10,
            image: 'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=800&h=600&fit=crop',
            title: 'DANNY WOOD LAUNCHES CHARITY INITIATIVE FOR YOUTH PROGRAMS',
            description: 'Danny Wood continues his philanthropic efforts with the launch of a new charity initiative focused on supporting youth music and arts programs across the country. Learn how you can get involved.',
            link: '#',
            date: 'October 5, 2025'
        },
        {
            id: 11,
            image: 'https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?w=800&h=600&fit=crop',
            title: 'NKOTB NOMINATED FOR MULTIPLE AWARDS AT UPCOMING MUSIC CEREMONY',
            description: 'New Kids on the Block have been nominated for several prestigious awards recognizing their continued impact on pop music and entertainment. The awards ceremony will take place in December.',
            link: '#',
            date: 'October 1, 2025'
        },
        {
            id: 12,
            image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&h=600&fit=crop',
            title: 'EXCLUSIVE: NKOTB REVEALS PLANS FOR 40TH ANNIVERSARY CELEBRATION',
            description: 'In an exclusive interview, the band reveals exciting plans for their 40th anniversary celebration, including special performances, merchandise releases, and fan events throughout 2026.',
            link: '#',
            date: 'September 28, 2025'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header2 />

            {/* Hero Carousel */}
            <Breadcrumb
                imageUrl="/newsbreadcrumbimage.jpeg"
                title="NEWS"
            />

            {/* News Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-12">
                        {newsArticles.map((article, index) => (
                            <div key={article.id}>
                                <div className="flex flex-col lg:flex-row items-start space-x-6">
                                    {/* Image section */}
                                    <div className="flex-shrink-0 mb-4 lg:mb-0 lg:w-1/2">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-96 object-cover rounded-lg"
                                        />
                                    </div>

                                    {/* Text section */}
                                    <div className="flex-1">
                                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                                            {article.title}
                                        </h2>
                                        <p className="text-lg sm:text-xl text-gray-600 mt-4">{article.description}</p>
                                        <div className="flex items-center justify-between pt-4">
                                            <a
                                                href={article.link}
                                                className="text-red-600 font-bold hover:underline"
                                            >
                                                Read the full article here
                                            </a>
                                            <span className="text-sm text-gray-500">{article.date}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                {index < newsArticles.length - 1 && (
                                    <hr className="my-8 border-t border-2 border-gray-300" />
                                )}
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