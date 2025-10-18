"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import {
  Search,
  TrendingUp,
  Star,
  Sparkles,
  Flame,
  ChevronRight,
  ChevronDown,
  Calendar,
  MapPin,
  DollarSign,
  UserIcon,
  ArrowUp,
} from "lucide-react";
import { FaLock } from "react-icons/fa";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const features = [
  {
    name: "Push to deploy",
    description:
      "Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "SSL certificates",
    description:
      "Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.",
    icon: LockClosedIcon,
  },
  {
    name: "Simple queues",
    description:
      "Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.",
    icon: ArrowPathIcon,
  },
  {
    name: "Advanced security",
    description:
      "Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.",
    icon: FingerPrintIcon,
  },
];

// Sample celebrities data
const allCelebrities = [
  {
    id: 1,
    name: "Keanu Reeves",
    category: "Actor",
    image: "/keanu-reeves-portrait.jpg",
    basePrice: 50000,
    rating: 4.9,
    bookings: 1250,
    views: 45000,
    availability: "Available",
    trending: true,
    hot: true,
    description: "Hollywood A-list actor known for The Matrix and John Wick",
  },
  {
    id: 2,
    name: "Taylor Swift",
    category: "Musician",
    image: "/portrait-singer.png",
    basePrice: 150000,
    rating: 5.0,
    bookings: 2100,
    views: 98000,
    availability: "Limited",
    trending: true,
    hot: true,
    description: "Grammy-winning pop superstar and cultural icon",
  },
  {
    id: 3,
    name: "Dwayne Johnson",
    category: "Actor",
    image: "/dwayne-johnson-portrait.jpg",
    basePrice: 75000,
    rating: 4.8,
    bookings: 1800,
    views: 67000,
    availability: "Available",
    trending: true,
    hot: false,
    description: "Former WWE champion turned Hollywood megastar",
  },
  {
    id: 4,
    name: "Beyoncé",
    category: "Musician",
    image: "/beyonce-portrait.jpg",
    basePrice: 200000,
    rating: 5.0,
    bookings: 1950,
    views: 89000,
    availability: "Booked",
    trending: true,
    hot: true,
    description: "Queen Bey - Multi-Grammy award winning artist",
  },
  {
    id: 5,
    name: "Chris Hemsworth",
    category: "Actor",
    image: "/chris-hemsworth-portrait.jpg",
    basePrice: 60000,
    rating: 4.7,
    bookings: 980,
    views: 52000,
    availability: "Available",
    trending: false,
    hot: false,
    description: "Marvel's Thor and Australian heartthrob",
  },
  {
    id: 6,
    name: "Ariana Grande",
    category: "Musician",
    image: "/ariana-grande-portrait.jpg",
    basePrice: 120000,
    rating: 4.9,
    bookings: 1650,
    views: 78000,
    availability: "Available",
    trending: true,
    hot: false,
    description: "Pop sensation with powerhouse vocals",
  },
  {
    id: 7,
    name: "Tom Holland",
    category: "Actor",
    image: "/tom-holland-portrait.jpg",
    basePrice: 55000,
    rating: 4.8,
    bookings: 1120,
    views: 61000,
    availability: "Available",
    trending: false,
    hot: false,
    description: "Spider-Man star and talented performer",
  },
  {
    id: 8,
    name: "Zendaya",
    category: "Actor",
    image: "/zendaya-portrait.jpg",
    basePrice: 65000,
    rating: 4.9,
    bookings: 1450,
    views: 72000,
    availability: "Limited",
    trending: true,
    hot: true,
    description: "Emmy-winning actress and fashion icon",
  },
];

const categories = [
  "All",
  "Actor",
  "Musician",
  "Athlete",
  "Comedian",
  "Influencer",
];

const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under $50K", value: "0-50000" },
  { label: "$50K - $100K", value: "50000-100000" },
  { label: "$100K - $200K", value: "100000-200000" },
  { label: "$200K+", value: "200000+" },
];

const availabilityOptions = [
  { label: "All", value: "all" },
  { label: "Available", value: "Available" },
  { label: "Limited", value: "Limited" },
  { label: "Booked", value: "Booked" },
];

const sortOptions = [
  { label: "Popularity", value: "popularity" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Rating", value: "rating" },
  { label: "Name A-Z", value: "name" },
];

// Upcoming events data for carousel
const upcomingEvents = [
  {
    id: 1,
    title: "Taylor Swift Meet & Greet",
    celebrity: "Taylor Swift",
    date: "March 15, 2024",
    time: "7:00 PM",
    location: "Madison Square Garden, NYC",
    price: "$2,500",
    image: "/taylor-swift-event.jpg",
    badge: "Sold Out",
    badgeColor: "bg-red-100 text-red-800 border-red-200",
    spotsLeft: 0,
    type: "Meet & Greet",
  },
  {
    id: 2,
    title: "Keanu Reeves Charity Gala",
    celebrity: "Keanu Reeves",
    date: "March 22, 2024",
    time: "6:30 PM",
    location: "Beverly Hills Hotel, LA",
    price: "$1,800",
    image: "/keanu-charity-event.jpg",
    badge: "Limited",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    spotsLeft: 12,
    type: "Charity Event",
  },
  {
    id: 3,
    title: "Dwayne Johnson Fitness Workshop",
    celebrity: "Dwayne Johnson",
    date: "March 28, 2024",
    time: "10:00 AM",
    location: "Gold's Gym Venice, CA",
    price: "$800",
    image: "/dwayne-fitness-event.jpg",
    badge: "Available",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    spotsLeft: 25,
    type: "Workshop",
  },
  {
    id: 4,
    title: "Beyoncé Private Concert",
    celebrity: "Beyoncé",
    date: "April 5, 2024",
    time: "8:00 PM",
    location: "Private Estate, Miami",
    price: "$5,000",
    image: "/beyonce-private-event.jpg",
    badge: "Exclusive",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    spotsLeft: 8,
    type: "Private Event",
  },
  {
    id: 5,
    title: "Chris Hemsworth Movie Premiere",
    celebrity: "Chris Hemsworth",
    date: "April 12, 2024",
    time: "7:30 PM",
    location: "TCL Chinese Theatre, Hollywood",
    price: "$1,200",
    image: "/chris-premiere-event.jpg",
    badge: "Hot",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    spotsLeft: 15,
    type: "Premiere",
  },
  {
    id: 6,
    title: "Ariana Grande Masterclass",
    celebrity: "Ariana Grande",
    date: "April 18, 2024",
    time: "2:00 PM",
    location: "Capitol Records, LA",
    price: "$1,500",
    image: "/ariana-masterclass-event.jpg",
    badge: "New",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    spotsLeft: 20,
    type: "Masterclass",
  },
];

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set()
  );

  // FAQ data
  const faqData = [
    {
      question: "How do I book a celebrity for my event?",
      answer:
        "Booking a celebrity is simple! Browse our extensive database of celebrities, select your preferred talent, and submit a booking request. Our team will handle all negotiations and logistics to ensure a seamless experience.",
    },
    {
      question: "What types of events can celebrities be booked for?",
      answer:
        "Our celebrities are available for a wide variety of events including corporate functions, private parties, product launches, charity galas, weddings, birthday celebrations, and promotional appearances.",
    },
    {
      question: "How far in advance should I book?",
      answer:
        "We recommend booking at least 3-6 months in advance for A-list celebrities, though some may be available with shorter notice. Popular celebrities during peak seasons may require even earlier booking.",
    },
    {
      question: "What is included in the booking fee?",
      answer:
        "Our booking fees typically include the celebrity's appearance, basic travel arrangements, and our concierge service. Additional costs may apply for special requirements, extended appearances, or premium accommodations.",
    },
    {
      question: "Can I meet the celebrity before the event?",
      answer:
        "Pre-event meetings can often be arranged depending on the celebrity's schedule and preferences. We'll work with you to coordinate any meet-and-greet opportunities as part of the booking process.",
    },
    {
      question: "What if a celebrity cancels last minute?",
      answer:
        "While rare, cancellations can happen. We have a comprehensive backup system and will work immediately to find a suitable replacement or provide full refunds according to our cancellation policy.",
    },
    {
      question: "What is your refund policy?",
      answer:
        "We offer full refunds for cancellations made more than 30 days before the event. Cancellations within 30 days are subject to a 25% fee, while cancellations within 7 days are non-refundable. Force majeure situations are handled on a case-by-case basis.",
    },
  ];

  // Featured celebrities for hero carousel
  const featuredCelebrities = [
    allCelebrities[0], // Keanu Reeves
    allCelebrities[1], // Taylor Swift
    allCelebrities[2], // Dwayne Johnson
    allCelebrities[3], // Beyoncé
    allCelebrities[7], // Zendaya
  ];

  // Auto-rotate hero carousel every 5 seconds with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      // Start fade out transition
      setIsImageTransitioning(true);

      // After fade out completes, change image and fade in
      setTimeout(() => {
        setCurrentCarouselIndex(
          (prevIndex) => (prevIndex + 1) % featuredCelebrities.length
        );
        setIsImageTransitioning(false);
      }, 500); // Match the CSS animation duration
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredCelebrities.length]);

  // Helper functions for formatting data
  const formatBookings = (bookings: number) => {
    if (bookings >= 1000) {
      return `${(bookings / 1000).toFixed(1)}K`;
    }
    return bookings.toString();
  };

  const formatPrice = (price: number) => {
    if (price >= 100000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-emerald-700/40";
      case "Limited":
        return "bg-yellow-600/40";
      case "Booked":
        return "bg-red-600/40";
      default:
        return "bg-emerald-700/40";
    }
  };

  const getAvailabilityDotColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-emerald-500";
      case "Limited":
        return "bg-yellow-500";
      case "Booked":
        return "bg-red-500";
      default:
        return "bg-emerald-500";
    }
  };

  // Filter and sort celebrities
  const filteredCelebrities = useMemo(() => {
    const filtered = allCelebrities.filter((celebrity) => {
      const matchesSearch =
        celebrity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        celebrity.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || celebrity.category === selectedCategory;

      const matchesPrice = (() => {
        if (selectedPriceRange === "all") return true;
        const [min, max] = selectedPriceRange.split("-").map(Number);
        if (selectedPriceRange === "200000+")
          return celebrity.basePrice >= 200000;
        return celebrity.basePrice >= min && celebrity.basePrice <= max;
      })();

      const matchesAvailability =
        selectedAvailability === "all" ||
        celebrity.availability === selectedAvailability;

      return (
        matchesSearch && matchesCategory && matchesPrice && matchesAvailability
      );
    });

    // Sort celebrities
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.basePrice - b.basePrice;
        case "price-high":
          return b.basePrice - a.basePrice;
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        case "popularity":
        default:
          return b.bookings - a.bookings;
      }
    });

    return filtered;
  }, [
    searchTerm,
    selectedCategory,
    selectedPriceRange,
    selectedAvailability,
    sortBy,
  ]);

  // Auto-rotate events carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % upcomingEvents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Intersection observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const statsElement = document.getElementById("stats-section");
    if (statsElement) {
      observer.observe(statsElement);
    }

    return () => {
      if (statsElement) {
        observer.unobserve(statsElement);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-scroll-animate]").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Counter animation hook
  const useCounter = (end: number, duration = 2000) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!statsVisible) return;

      let startTime: number;
      const startValue = 0;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(
          startValue + (end - startValue) * easeOutQuart
        );

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, [statsVisible, end, duration]);

    return count;
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-zinc-100">
      <Header />

      <div className="relative isolate pt-14 mt-10">
        <section className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 items-stretch justify-center gap-x-3">
          <div
            className="w-full py-16 sm:py-24 lg:py-11.5 rounded-xl px-4 sm:px-10 h-full flex flex-col justify-center"
            data-scroll-animate
            id="hero-text"
          >
            <div className="">
              <h1 className="text-3xl  sm:text-4xl md:text-7xl font-black text-emerald-900 sm:text-[5.3rem] leading-tight">
                YOUR <span className="font-black text-amber-600"> #1 </span>{" "}
                CELEBRITY BOOKING PLATFORM
              </h1>
              <p className="mt-3 text-base sm:text-lg text-pretty text-zinc-500">
                Connect with A-list celebrities, musicians, and influencers for
                your next unforgettable event. From intimate meet-and-greets to
                grand galas, we make celebrity bookings seamless, secure, and
                extraordinary.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-x-3 gap-y-3">
                <a
                  href="#"
                  className="rounded-md bg-emerald-800 px-6 sm:px-8 py-2.5 text-sm font-semibold text-zinc-100 shadow-xs hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Start Booking Now
                </a>
                <a
                  href="#"
                  className="text-sm/6 font-semibold border rounded-md bg-zinc-200 px-4 py-2 text-zinc-600 hover:bg-zinc-300 transition-colors duration-300 w-full sm:w-auto text-center"
                >
                  Explore Talent <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Side - Floating Celebrity Portrait with Stats */}
          <div
            className={`relative w-full h-80 sm:h-96 lg:h-[38rem] flex items-center justify-center ${
              isImageTransitioning ? "fade-out-left" : "fade-in-right"
            }`}
            data-scroll-animate
            id="hero-image"
          >
            {/* Central Celebrity Portrait */}
            <div className="relative z-10">
              <div className="max-w-xs sm:max-w-sm lg:max-w-lg h-full rounded-full overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                <img
                  src={
                    featuredCelebrities[currentCarouselIndex]?.image ||
                    "/placeholder.svg"
                  }
                  alt={featuredCelebrities[currentCarouselIndex]?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>

            {/* Floating Rating Card - Top Left */}
            <div className="absolute top-4 sm:top-14 left-2 sm:left-8 animate-float bg-amber-900/40 backdrop-blur-md rounded-xl shadow-xl p-3 sm:p-4 border border-white/20 hover:scale-105 transition-transform duration-300 z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="size-4 sm:size-5 text-amber-600 fill-current" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-zinc-100">
                    {featuredCelebrities[currentCarouselIndex]?.rating}
                  </div>
                  <div className="text-xs text-zinc-200">Rating</div>
                </div>
              </div>
            </div>

            {/* Floating Bookings Card - Top Right */}
            <div className="absolute top-12 sm:top-24 right-2 sm:right-16 animate-float-delayed-1 bg-emerald-800/40 backdrop-blur-md rounded-xl shadow-xl p-3 sm:p-4 border border-white/20 hover:scale-105 transition-transform duration-300 z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="size-4 sm:size-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-zinc-100">
                    {formatBookings(
                      featuredCelebrities[currentCarouselIndex]?.bookings
                    )}
                  </div>
                  <div className="text-xs text-zinc-200">Bookings</div>
                </div>
              </div>
            </div>

            {/* Floating Availability Card - Bottom Left */}
            <div
              className={`absolute bottom-12 sm:bottom-29 left-2 sm:left-8 animate-float-delayed-2 ${getAvailabilityColor(
                featuredCelebrities[currentCarouselIndex]?.availability
              )} backdrop-blur-md rounded-xl shadow-xl p-3 sm:p-4 border border-white/20 hover:scale-105 transition-transform duration-300 z-20`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <div
                    className={`w-3 h-3 ${getAvailabilityDotColor(
                      featuredCelebrities[currentCarouselIndex]?.availability
                    )} rounded-full`}
                  ></div>
                </div>
                <div>
                  <div className="text-base sm:text-lg text-zinc-100">
                    {featuredCelebrities[currentCarouselIndex]?.availability}
                  </div>
                  <div className="text-xs text-zinc-200">Status</div>
                </div>
              </div>
            </div>

            {/* Floating Price Card - Bottom Right */}
            <div className="absolute bottom-4 sm:bottom-22 right-2 sm:right-8 animate-float-delayed-3 bg-purple-800/40 backdrop-blur-md rounded-xl shadow-xl p-3 sm:p-4 border border-white/20 hover:scale-105 transition-transform duration-300 z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="size-4 sm:size-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-zinc-100">
                    {formatPrice(
                      featuredCelebrities[currentCarouselIndex]?.basePrice
                    )}
                  </div>
                  <div className="text-xs text-zinc-200">Starting</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-14 opacity-70 w-full mx-auto overflow-hidden">
          <h4 className="text-xs border mb-6 w-fit px-2 py-1 bg-zinc-50 border-zinc-400/50 rounded-full mx-auto font-semibold text-zinc-400">
            TRUSTED PARTNERS
          </h4>
          <div className="flex gap-x-14 mt-5 items-center animate-scroll">
            {/* First set of logos */}
            <img
              src="/partner1.png"
              alt="Partner 1"
              className="h-fit w-[5rem] flex-shrink-0"
              width={40}
            />
            <img
              src="/partner2.png"
              alt="Partner 2"
              className="h-fit w-[5rem] flex-shrink-0"
            />
            <img
              src="/partner3.png"
              alt="Partner 3"
              className="h-fit w-[5rem] flex-shrink-0"
            />
            <img
              src="/partner1.png"
              alt="Partner 4"
              className="h-fit w-[5rem] flex-shrink-0"
            />
            <img
              src="/partner2.png"
              alt="Partner 5"
              className="h-fit w-[5rem] flex-shrink-0"
            />
            <img
              src="/partner3.png"
              alt="Partner 6"
              className="h-fit w-[5rem] flex-shrink-0"
            />
            {/* Duplicate set for seamless loop */}
            <img
              src="/partner1.png"
              alt="Partner 1"
              className="h-fit w-[8rem] flex-shrink-0"
              width={40}
            />
            <img
              src="/partner2.png"
              alt="Partner 2"
              className="h-fit w-[8rem] flex-shrink-0"
            />
            <img
              src="/partner3.png"
              alt="Partner 3"
              className="h-fit w-[8rem] flex-shrink-0"
            />
            <img
              src="/partner1.png"
              alt="Partner 4"
              className="h-fit w-[8rem] flex-shrink-0"
            />
            <img
              src="/partner2.png"
              alt="Partner 5"
              className="h-fit w-[8rem] flex-shrink-0"
            />
            <img
              src="/partner3.png"
              alt="Partner 6"
              className="h-fit w-[8rem] flex-shrink-0"
            />
          </div>
        </div>

        {/* Events Section */}
        <section className="py-12 sm:py-15 mt-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto"
              data-scroll-animate
              id="events-header"
            >
              <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full mx-auto font-semibold text-emerald-600 mb-6">
                UPCOMING EVENTS
              </h4>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-3">
                Exclusive Celebrity Events <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  You Can Attend
                </span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                Join intimate meet & greets, exclusive workshops, and private
                events with your favorite celebrities. Limited spots available
                for these once-in-a-lifetime experiences.
              </p>
            </div>

            {/* Events Carousel */}
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentEventIndex * 33.333}%)`,
                }}
              >
                {upcomingEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-2 sm:px-3"
                    data-scroll-animate
                  >
                    <div className="group bg-zinc-50 border border-zinc-200 rounded-xl hover:border-emerald-300 transition-all duration-300">
                      <div className="relative h-40 sm:h-48 overflow-hidden">
                        <img
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${event.badgeColor}`}
                          >
                            {event.badge}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-black/70 text-white rounded">
                            {event.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-zinc-900 mb-1">
                          {event.title}
                        </h3>
                        <p className="text-emerald-600 text-sm font-medium mb-3">
                          {event.celebrity}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                            <Calendar className="size-4 text-emerald-600 fill-current flex-shrink-0" />
                            <span>
                              {event.date} at {event.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                            <MapPin className="size-4 text-emerald-600 fill-current flex-shrink-0" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                            <DollarSign className="size-4 text-emerald-600 fill-current flex-shrink-0" />
                            <span className="font-semibold text-emerald-600">
                              {event.price}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs sm:text-sm text-zinc-500">
                            {event.spotsLeft > 0 ? (
                              <span>{event.spotsLeft} spots left</span>
                            ) : (
                              <span className="text-red-500">Sold Out</span>
                            )}
                          </div>
                          <button
                            className={`text-xs sm:text-sm font-medium transition-colors px-3 sm:px-4 py-2 rounded ${
                              event.spotsLeft > 0
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                            }`}
                            disabled={event.spotsLeft === 0}
                          >
                            {event.spotsLeft > 0 ? "Book Now" : "Sold Out"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Dots */}
              <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                {upcomingEvents.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentEventIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentEventIndex
                        ? "bg-emerald-600 w-6"
                        : "bg-zinc-300 hover:bg-zinc-400"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() =>
                  setCurrentEventIndex(
                    (prev) =>
                      (prev - 1 + upcomingEvents.length) % upcomingEvents.length
                  )
                }
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center hover:border-emerald-300 transition-colors"
              >
                <ChevronRight className="size-4 sm:size-5 text-zinc-600 rotate-180" />
              </button>
              <button
                onClick={() =>
                  setCurrentEventIndex(
                    (prev) => (prev + 1) % upcomingEvents.length
                  )
                }
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center hover:border-emerald-300 transition-colors"
              >
                <ChevronRight className="size-4 sm:size-5 text-zinc-600" />
              </button>
            </div>
          </div>
        </section>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#80ff84] to-[#fceb89] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>

      <section className="pt-12 sm:pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="mx-auto max-w-3xl lg:text-center"
            data-scroll-animate
            id="why-section"
          >
            <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-pretty text-emerald-900 lg:text-balance">
              Why We're the
              <span className="text-amber-600"> #1 Choice </span> for Celebrity
              Bookings
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-700">
              We've revolutionized the celebrity booking industry by combining
              cutting-edge technology with personalized service. Our platform is
              trusted by thousands of event planners, corporations, and
              individuals worldwide.
            </p>
          </div>
          <div className="mt-14 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row items-center gap-7">
              <div
                className="border p-2.5 mx-auto rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group w-full lg:w-auto"
                data-scroll-animate
              >
                <Image
                  src="/mic.svg"
                  alt="Verified Talent"
                  width={150}
                  height={150}
                  className="size-24 sm:size-30 mx-auto group-hover:scale-110 transition-transform duration-300"
                />

                <div className="rounded-xl mt-5 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-zinc-50 p-3 group-hover:border-emerald-200/50 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-lg sm:text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Verified Talent Network
                  </h3>
                  <p className="text-zinc-600 text-xs sm:text-sm group-hover:text-zinc-700 transition-colors duration-300">
                    Every celebrity on our platform is verified and
                    authenticated, ensuring you're booking with real talent.
                  </p>
                </div>
              </div>

              <div
                className="border p-2.5 rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group w-full lg:w-auto"
                data-scroll-animate
              >
                <Image
                  src="/global.svg"
                  alt="Global Reach"
                  width={160}
                  height={150}
                  className="w-24 sm:w-30 h-24 sm:h-30 mx-auto group-hover:scale-110 transition-transform duration-300"
                />

                <div className="rounded-xl mt-5 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-white p-3 group-hover:border-emerald-200 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-lg sm:text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Global Reach
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-sm group-hover:text-zinc-700 transition-colors duration-300">
                    From Hollywood to Bollywood, we connect you with celebrities
                    from around the world for your events securely and reliably.
                  </p>
                </div>
              </div>

              <div
                className="border p-2.5 mx-auto rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group w-full lg:w-auto"
                data-scroll-animate
              >
                <Image
                  src="/check.svg"
                  alt="Secure"
                  width={150}
                  height={150}
                  className="w-24 sm:w-30 h-24 sm:h-30 mx-auto group-hover:scale-110 transition-transform duration-300"
                />

                <div className="rounded-xl mt-6 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-white p-3 group-hover:border-emerald-200 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-lg sm:text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Secure & Reliable
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-sm group-hover:text-zinc-700 transition-colors duration-300">
                    Our platform is secure and reliable, ensuring you're booking
                    with real talent and getting the best service possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            {/* Left Side - Content */}
            <div data-scroll-animate id="about-content">
              <div className="mb-8">
                <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 to-amber-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6">
                  ABOUT CELBOOKINGS
                </h4>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-6">
                  Where Dreams Meet{" "}
                  <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    Celebrity Reality
                  </span>
                </h2>
                <p className="text-sm sm:text-base text-zinc-500 mb-3">
                  Founded in 2020, CelBookings has revolutionized the celebrity
                  booking industry by creating a seamless, secure, and
                  transparent platform that connects fans with their favorite
                  stars. We've facilitated over 10,000 successful bookings
                  across 50+ countries, making once-in-a-lifetime experiences
                  accessible to everyone.
                </p>
                <p className="text-sm sm:text-base text-zinc-500 mb-8">
                  Our mission is simple: to democratize access to celebrity
                  talent while ensuring every interaction is authentic, secure,
                  and memorable. Whether you're planning a corporate event,
                  private party, or special occasion, we make the impossible
                  possible.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-100 backdrop-blur-sm border border-zinc-100/50 hover:border-emerald-200/50 transition-all duration-300">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Star className="size-6 sm:size-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2 text-base sm:text-lg">
                      Verified Talent Network
                    </h3>
                    <p className="text-zinc-600 text-xs sm:text-sm">
                      Every celebrity on our platform undergoes rigorous
                      verification and authentication processes. We work
                      directly with talent agencies, managers, and the
                      celebrities themselves to ensure authenticity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-zinc-100/50 hover:border-emerald-200/50 transition-all duration-300">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <TrendingUp className="size-6 sm:size-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2 text-base sm:text-lg">
                      Global Reach & Local Expertise
                    </h3>
                    <p className="text-zinc-600 text-xs sm:text-sm">
                      From Hollywood to Bollywood, we have established
                      partnerships with talent agencies worldwide. Our local
                      teams understand cultural nuances and event requirements
                      in each market.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 sm:px-10 py-4 sm:py-5 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base">
                  Our Story
                  <ChevronRight className="size-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 px-8 sm:px-10 py-4 sm:py-5 transition-all duration-300 text-sm sm:text-base bg-transparent"
                >
                  Meet Our Team
                </Button>
              </div>
            </div>

            {/* Right Side - Image/Visual */}
            <div className="relative" data-scroll-animate id="about-image">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/hollywood-red-carpet.jpg"
                  alt="Celebrity event"
                  className="w-full h-64 sm:h-96 lg:h-[700px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8">
                  <h3 className="text-white font-bold text-xl sm:text-3xl mb-2 sm:mb-3">
                    Making Dreams Come True
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm max-w-md">
                    Join thousands of satisfied clients who've created
                    unforgettable moments with their favorite celebrities. From
                    intimate gatherings to grand galas, we make every event
                    extraordinary.
                  </p>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-zinc-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 sm:w-14 h-10 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <Star className="size-5 sm:size-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-900">
                      98%
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-500 font-medium">
                      Client Satisfaction
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-zinc-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 sm:w-14 h-10 sm:h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <TrendingUp className="size-5 sm:size-7 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                      10K+
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-500 font-medium">
                      Events Booked
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="bg-white border py-8 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className="mx-auto max-w-2xl lg:text-center"
              data-scroll-animate
              id="celebrities-header"
            >
              <h4 className="text-xs border w-fit px-2 py-1 bg-amber-50/50 border-amber-500/50 rounded-full mx-auto font-semibold text-amber-600">
                CELEBRITIES
              </h4>
              <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-pretty text-emerald-900 lg:text-balance">
                Simplifying access to your favorite{" "}
                <span className="text-amber-600">celebrities</span>, everyday.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-gray-500">
                Search through the thousands of acts we work with to find the
                perfect talent for your event. If you don't find who you are
                looking for, our booking agents will be happy to get you pricing
                and availability for any celebrity talent in the industry.
              </p>
            </div>
            <div className="mt-14 max-w-7xl mx-auto space-y-8">
              {/* Grid View - All Celebrities */}
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg sm:text-xl font-bold text-emerald-900">
                    All Celebrities
                  </h3>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full lg:w-auto">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
                      <Input
                        placeholder="Search celebrities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full lg:min-w-2xl"
                      />
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-full sm:w-auto">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedPriceRange}
                        onValueChange={setSelectedPriceRange}
                      >
                        <SelectTrigger className="w-full sm:w-auto">
                          <SelectValue placeholder="Price Range" />
                        </SelectTrigger>
                        <SelectContent>
                          {priceRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedAvailability}
                        onValueChange={setSelectedAvailability}
                      >
                        <SelectTrigger className="w-full sm:w-auto">
                          <SelectValue placeholder="Availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-auto">
                          <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredCelebrities.map((celebrity, index) => {
                    const isLastRow = index >= filteredCelebrities.length - 4;

                    return (
                      <Card
                        key={celebrity.id}
                        className={`overflow-hidden py-0 hover:border-emerald-900 transition-all duration-300 hover:scale-[1.02] cursor-pointer border-0 group bg-white ${
                          isLastRow ? "mask-b-from-10" : ""
                        }`}
                        data-scroll-animate
                      >
                        <div className="relative aspect-square rounded-xl overflow-hidden">
                          <img
                            src={celebrity.image || "/placeholder.svg"}
                            alt={celebrity.name}
                            className="absolute inset-0 w-full h-full object-fill border border-zinc-200 object-center"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {celebrity.hot && (
                              <Badge className="bg-orange-500 text-white border-0 text-xs">
                                <Flame className="size-3 mr-1" />
                                Hot
                              </Badge>
                            )}
                            {celebrity.trending && (
                              <Badge className="bg-emerald-900 text-white border-0 text-xs">
                                <TrendingUp className="size-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <div className="absolute bottom-3 left-3 right-3">
                            <h4 className="text-white font-bold text-sm mb-1 truncate">
                              {celebrity.name}
                            </h4>
                            <p className="text-white/80 text-xs mb-1">
                              {celebrity.category}
                            </p>
                            <div className="flex items-center gap-1 text-white/90 text-xs">
                              <Star className="size-3 fill-yellow-400 text-yellow-400" />
                              <span>{celebrity.rating}</span>
                              <span>•</span>
                              <span>
                                ${celebrity.basePrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* View All Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-emerald-600 bg-emerald-800 text-zinc-100 hover:bg-emerald-700 hover:text-white transition-all duration-300 px-6 sm:px-8 py-2 sm:py-3 rounded-full shadow-xl shadow-emerald-600/10 drop-shadow-2xl hover:shadow-xl text-sm sm:text-base"
                  >
                    View All Celebrities
                    <ChevronRight className="size-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="mt-10 bg-gradient-to-t from-emerald-700 to-emerald-800 py-12 sm:py-15 mb-10 max-w-7xl mx-auto rounded-2xl relative overflow-hidden"
        data-scroll-animate
        id="cta-section"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
                Ready to Book Your{" "}
                <span className="text-amber-300">Dream Celebrity?</span>
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 max-w-3xl mx-auto leading-relaxed">
                Join thousands of satisfied clients who've made their events
                unforgettable. Start your celebrity booking journey today and
                create memories that last a lifetime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 sm:px-12 py-4 sm:py-5.5 text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
              >
                Browse Celebrities
                <ChevronRight className="size-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 px-8 sm:px-10 py-4 sm:py-5 text-sm font-semibold transition-all duration-300 hover:scale-105 w-full sm:w-auto bg-transparent"
              >
                Get Free Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-start">
            {/* Left Column - Header and Contact Cards */}
            <div className="space-y-8" data-scroll-animate id="faq-header">
              <div>
                <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6">
                  FREQUENTLY ASKED QUESTIONS
                </h4>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-6">
                  Everything You Need to Know
                </h2>
                <p className="text-sm sm:text-base text-zinc-500 max-w-md">
                  Get answers to the most common questions about celebrity
                  bookings, pricing, and our services. Can't find what you're
                  looking for? Our support team is here to help.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserIcon className="size-5 sm:size-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-sm sm:text-base">
                        Live Chat Support
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600">
                        Get instant answers 24/7
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="size-5 sm:size-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-sm sm:text-base">
                        Schedule a Call
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600">
                        Book a consultation with our experts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="size-5 sm:size-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-sm sm:text-base">
                        Email Support
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-600">
                        Detailed responses within 2 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - FAQ Items */}
            <div className="space-y-3" data-scroll-animate id="faq-items">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/40 backdrop-blur-sm rounded-lg border border-emerald-100/30 overflow-hidden hover:bg-white/60 transition-all duration-300"
                >
                  <button
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-emerald-50/30 transition-colors duration-200"
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  >
                    <h3 className="text-sm sm:text-base font-medium text-emerald-900 pr-4 leading-snug">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`size-4 text-emerald-600 transition-transform duration-200 flex-shrink-0 ${
                        openFAQ === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFAQ === index
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-5 group-hover:scale-110 transition-transform duration-300" />
        </button>
      )}
    </div>
  );
}
