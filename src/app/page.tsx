"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Header2 } from '@/components/header2';
import { Footer2 } from '@/components/footer2';

const Page = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const events = [
    { date: 'NOV 1, 2025', venue: 'DOLBY THEATRE AT PARK MGM', location: 'Las Vegas, NV' },
    { date: 'NOV 2, 2025', venue: 'DOLBY THEATRE AT PARK MGM', location: 'Las Vegas, NV' },
    { date: 'NOV 5, 2025', venue: 'DOLBY THEATRE AT PARK MGM', location: 'Las Vegas, NV' },
    { date: 'NOV 7, 2025', venue: 'DOLBY THEATRE AT PARK MGM', location: 'Las Vegas, NV' },
  ];

  const heroSlides = [
    { image: '/heroimage1.jpg' },
    { image: '/heroimage2.jpg' },
    { image: '/heroimage3.png' },
    { image: '/heroimage4.jpg' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  return (
    <div className="min-h-screen bg-white">
      <Header2 />

      {/* Hero Carousel */}
      <section className="relative h-[100vh] sm:h-[80vh] lg:h-[60vh] overflow-hidden">
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <img
                src={slide.image}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

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

      {/* Video Section */}
      <section id="video" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-black mb-8 tracking-tight">VIDEOS</h3>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-video bg-gradient-to-r from-blue-900 via-purple-900 to-pink-900 rounded-lg overflow-hidden shadow-2xl">
            <iframe
              className="w-full h-full"
              src="//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FmQsfU8Y6XyU%3Ffeature%3Doembed&display_name=YouTube&url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DmQsfU8Y6XyU&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FmQsfU8Y6XyU%2Fhqdefault.jpg&key=96f1f04c5f4143bcb0f2e68c87d65feb&type=text%2Fhtml&schema=youtube"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer2 />
    </div>
  );
};

export default Page;
