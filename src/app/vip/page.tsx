"use client"

import React from 'react';
import { Header2 } from '@/components/header2';
import { Footer2 } from '@/components/footer2';

const Page = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header2 />

            {/* VIP Packages Section */}
            <section id="vip-packages" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-8">VIP PACKAGES</h2>

                    <div className="space-y-12">

                        {/* RIGHT STUFF VIP PACKAGE */}
                        <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
                            <h3 className="text-3xl font-black mb-4">THE RIGHT STUFF VIP PACKAGE</h3>
                            <p className="text-lg mb-4">
                                Exclusive NKOTB VIP Meet & Greet laminate
                                <br />
                                On-Site VIP Staff
                                <br />
                                Please note: Not all VIP Banquette Tickets are part of the NKOTB RIGHT STUFF VIP PACKAGE. Please review package description closely when buying your ticket.
                                <br />
                                <strong>*All VIP activities occur pre-show. Package details and timing subject to change.</strong>
                            </p>
                            <a href="/events">
                                <button className="bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors">
                                    GET VIP PACKAGE
                                </button>
                            </a>
                        </div>

                        {/* RIGHT STUFF GROUP PHOTO MEET AND GREET UPGRADE */}
                        <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
                            <h3 className="text-3xl font-black mb-4">THE RIGHT STUFF GROUP PHOTO MEET AND GREET UPGRADE</h3>
                            <p className="text-lg mb-4">
                                Upgrades for all dates will sell through our ticketing platform. VIP links for all dates can be found at <a href="/events" className="text-red-500">HERE</a>.
                                <br />
                                <strong>Please note: YOU MUST ALREADY HAVE A TICKET TO THE CONCERT TO PARTICIPATE IN THE RIGHT STUFF VIP UPGRADE. YOU WILL NOT BE ALLOWED INTO THE VENUE WITHOUT A TICKET.</strong>
                                <br />
                                Meet & Greet photo op with NKOTB (photos taken in groups of 10).
                                <br />
                                Sit in on the NKOTB Meet and Greet photo session from start to finish!
                                <br />
                                VIP check-in with early entrance.
                                <br />
                                Early merchandise shopping.
                                <br />
                                Exclusive NKOTB VIP Meet & Greet laminate.
                            </p>
                            <a href="/events">
                                <button className="bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors">
                                    GET VIP PACKAGE
                                </button>
                            </a>
                        </div>

                        {/* RIGHT STUFF BARSTOOL VIP PACKAGE */}
                        <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
                            <h3 className="text-3xl font-black mb-4">THE RIGHT STUFF BARSTOOL VIP PACKAGE</h3>
                            <p className="text-lg mb-4">
                                Barstool VIP for all dates will sell through Ticketmaster. VIP links for all dates can be found at <a href="/events" className="text-red-500">HERE</a>.
                                <br />
                                One reserved bar-side barstool seat attached to the stage (See ticket map for exact location).
                                <br />
                                Meet & Greet photo op with NKOTB (photos taken in groups of 10).
                                <br />
                                Backstage tour.
                                <br />
                                Sit in on the NKOTB Meet and Greet photo session from start to finish!
                                <br />
                                Access to a private VIP photo gallery. A professional tour photographer will gather pictures of the show while attempting to catch great pictures of you and other Barstool Package VIPs enjoying the show.
                                <br />
                                Early merchandise shopping.
                                <br />
                                Exclusive NKOTB VIP Meet & Greet laminate.
                                <br />
                                On-Site VIP Staff.
                            </p>
                            <a href="/events">
                                <button className="bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors">
                                    GET VIP PACKAGE
                                </button>
                            </a>
                        </div>

                        {/* RIGHT STUFF BANQUETTE VIP PACKAGE */}
                        <div className="bg-gray-100 p-8 rounded-lg shadow-lg">
                            <h3 className="text-3xl font-black mb-4">THE RIGHT STUFF BANQUETTE VIP PACKAGE</h3>
                            <p className="text-lg mb-4">
                                Banquette VIP for all dates will sell through Ticketmaster. VIP links for all dates can be found at <a href="/events" className="text-red-500">HERE</a>.
                                <br />
                                Ultra Exclusive VIP Experience.
                                <br />
                                Meet & Greet photo op with NKOTB (photos taken in Groups of 8).
                                <br />
                                Access to EXCLUSIVE NKOTB preshow VIP Lounge, which includes:
                                <ul className="list-disc pl-5">
                                    <li>A preshow visit in the lounge from some members of NKOTB.</li>
                                </ul>
                                <br />
                                VIP check-in with early entrance.
                                <br />
                                Early merchandise shopping.
                                <br />
                                Backstage lounge.
                            </p>
                            <a href="/events">
                                <button className="bg-black text-white px-8 py-3 font-black uppercase text-sm tracking-wider hover:bg-gray-800 transition-colors">
                                    GET VIP PACKAGE
                                </button>
                            </a>
                        </div>

                    </div>
                </div>
            </section>

            <Footer2 />
        </div>
    );
};

export default Page;
