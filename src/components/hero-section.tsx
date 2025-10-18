"use client";

import { useState, useEffect } from "react";

const celebrityQuotes = [
  {
    quote:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    quote: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
  },
  {
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
  },
  {
    quote:
      "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
  },
  {
    quote: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
  },
];

export function HeroSection() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(
        (prevIndex) => (prevIndex + 1) % celebrityQuotes.length
      );
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentQuote = celebrityQuotes[currentQuoteIndex];

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center p-12 text-white">
      {/* Content */}
      <div className="relative max-w-2xl flex flex-col items-center justify-end h-full">
        {/* Hero Image - positioned behind text, centered */}
        <img
          src="/print.webp"
          alt="Hero Image"
          className="absolute top-1/2 left-1/2 opacity-50 transform -translate-x-1/2 -translate-y-1/2 max-w-sm object-contain rounded-3xl z-10"
        />
        {/* Text Content - positioned in front of image */}
        <div className=" z-30 bg-zinc-50/5 backdrop-blur-sm rounded-2xl pt-5 px-7 border border-zinc-300/10 transition-all duration-1000 ease-in-out">
          <h3 className="text-2xl font-bold mb-4 transition-all duration-1000 ease-in-out">
            "{currentQuote.quote}"
          </h3>
          <p className="text-gray-400 mb-4 transition-all duration-1000 ease-in-out">
            — {currentQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
}
