"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  StarIcon,
} from "@heroicons/react/24/outline";
import {
  Search,
  TrendingUp,
  Star,
  Sparkles,
  Flame,
  Eye,
  ChevronRight,
  Heart,
  Calendar,
  MapPin,
  DollarSign,
  UserIcon,
  ArrowUp,
} from "lucide-react";
import { FaLock } from "react-icons/fa";

const navigation = [
  { name: "About Us", href: "#" },
  { name: "Events", href: "#" },
  { name: "Bookings", href: "#" },
  { name: "Memberships", href: "#" },
  { name: "Contact Us", href: "#" },
];

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
  const [statsVisible, setStatsVisible] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Filter and sort celebrities
  const filteredCelebrities = useMemo(() => {
    let filtered = allCelebrities.filter((celebrity) => {
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

  const featuredCelebrities = allCelebrities.filter((c) => c.trending || c.hot);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselIndex(
        (prev) => (prev + 1) % featuredCelebrities.length
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredCelebrities.length]);

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

  // Counter animation hook
  const useCounter = (end: number, duration: number = 2000) => {
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
    <div className="bg-white">
      <header className="fixed  bg-emerald-900 rounded-xl inset-x-0 top-0 z-50 px-6 mb-10 max-w-7xl mx-auto mt-2">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-6 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=white"
                className="h-8 w-auto"
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12 bg-amber-200/5 text-white rounded-lg px-8 py-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm text-zinc-100 hover:text-amber-200 transition-colors duration-300 relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-200 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href="#"
              className="text-sm/6 font-semibold flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-200/5 text-zinc-100 hover:bg-amber-200/10 hover:text-amber-200 transition-all duration-300"
            >
              <FaLock className="size-4" />
              <span>Log in</span>
            </a>
          </div>
        </nav>
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent className="lg:hidden fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 translate-x-0 translate-y-0 left-auto top-0 max-w-none h-full border-0 rounded-none">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Company</span>
                <img
                  alt=""
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                  className="h-8 w-auto"
                />
              </a>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="relative isolate  pt-14  mt-10 ">
        <section className="flex max-w-7xl mx-auto px-8 mt-14 items-stretch justify-center gap-x-3">
          <div className="w-full py-32 sm:py-48 lg:py-11.5 rounded-xl px-10   h-full flex flex-col justify-center">
            <div className="">
              <h1 className="text-5xl font-extrabold leading-20  text-balance text-emerald-900 sm:text-8xl">
                YOUR <span className="font-black text-amber-600"> #1 </span>{" "}
                CELEBRITY BOOKING PLATFORM
              </h1>
              <p className="mt-3 text-lg  text-pretty text-zinc-500 sm:text-base">
                Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
                lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat.
              </p>
              <div className="mt-6 flex items-center gap-x-3">
                <a
                  href="#"
                  className="rounded-md bg-emerald-800 px-8 py-2.5 text-sm font-semibold text-zinc-100 shadow-xs hover:bg-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </a>
                <a
                  href="#"
                  className="text-sm/6 font-semibold border rounded-md bg-zinc-200 px-4 py-2 text-zinc-400"
                >
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>

              {/* Stats Section */}
              <div
                id="stats-section"
                className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {useCounter(500)}+
                  </div>
                  <div className="text-sm text-zinc-500">Celebrities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {useCounter(10000).toLocaleString()}+
                  </div>
                  <div className="text-sm text-zinc-500">Events Booked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {useCounter(50)}+
                  </div>
                  <div className="text-sm text-zinc-500">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600 mb-1">
                    {statsVisible ? "4.9" : "0.0"}★
                  </div>
                  <div className="text-sm text-zinc-500">Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full rounded-xl h-[38rem] overflow-hidden">
            <img
              src="/wallpaper.jpg"
              alt="Wallpaper"
              className="w-full h-full object-fill"
            />
          </div>
        </section>

        <div className="mt-14 opacity-70 w-full mx-auto overflow-hidden">
          <h4 className="text-sm border mb-6 w-fit px-2 py-1 bg-amber-50/50 border-amber-500/50 rounded-full mx-auto font-semibold text-amber-600">
            TRUSTED PARTNERS
          </h4>
          <div className="flex gap-x-14 mt-5  items-center animate-scroll">
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
        <section className="py-15 mt-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h4 className="text-sm border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full mx-auto font-semibold text-emerald-600 mb-6">
                UPCOMING EVENTS
              </h4>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-3">
                Exclusive Celebrity Events <br />
                <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  You Can Attend
                </span>
              </h2>
              <p className=" text-zinc-500 max-w-2xl mx-auto leading-relaxed">
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
                  <div key={event.id} className="w-1/3 flex-shrink-0 px-3">
                    <div className="group bg-zinc-50 border border-zinc-200 rounded-xl hover:border-emerald-300 transition-all duration-300">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
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
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                          {event.title}
                        </h3>
                        <p className="text-emerald-600 text-sm font-medium mb-3">
                          {event.celebrity}
                        </p>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-600">
                            <Calendar className="size-4 text-emerald-600 fill-current" />
                            <span>
                              {event.date} at {event.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-600">
                            <MapPin className="size-4 text-emerald-600 fill-current" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-600">
                            <DollarSign className="size-4 text-emerald-600 fill-current" />
                            <span className="font-semibold text-emerald-600">
                              {event.price}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-zinc-500">
                            {event.spotsLeft > 0 ? (
                              <span>{event.spotsLeft} spots left</span>
                            ) : (
                              <span className="text-red-500">Sold Out</span>
                            )}
                          </div>
                          <button
                            className={`text-sm font-medium transition-colors px-4 py-2 rounded ${
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
              <div className="flex justify-center mt-8 space-x-2">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center hover:border-emerald-300 transition-colors"
              >
                <ChevronRight className="size-5 text-zinc-600 rotate-180" />
              </button>
              <button
                onClick={() =>
                  setCurrentEventIndex(
                    (prev) => (prev + 1) % upcomingEvents.length
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center hover:border-emerald-300 transition-colors"
              >
                <ChevronRight className="size-5 text-zinc-600" />
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

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl lg:text-center">
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-pretty text-emerald-900 sm:text-5xl lg:text-balance">
              Why we're at the
              <span className="text-amber-600"> top </span> of our game and why
              you should choose us.
            </h2>
            <p className="mt-3 text-gray-700">
              These are the reasons why we're at the top of our game. We're not
              just a platform, we're a community of fans, celebrities, and event
              planners who are passionate about making dreams come true.
            </p>
          </div>
          <div className="mt-14 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center gap-7">
              <div className="border p-2.5 mx-auto rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group">
                <Image
                  src="/mic.svg"
                  alt="Secure"
                  width={150}
                  height={150}
                  className="size-30 mx-auto group-hover:scale-110 transition-transform duration-300"
                />

                <div className="rounded-xl mt-5 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-zinc-50 p-3 group-hover:border-emerald-200/50 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Verified Talent Network
                  </h3>
                  <p className="text-zinc-600 text-sm group-hover:text-zinc-700 transition-colors duration-300">
                    Every celebrity on our platform is verified and
                    authenticated, ensuring you're booking with real talent.
                  </p>
                </div>
              </div>

              <div className="border p-2.5 rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group">
                <Image
                  src="/global.svg"
                  alt="Secure"
                  width={160}
                  height={150}
                  className="w-30 h-30 mx-auto group-hover:scale-110 transition-transform duration-300"
                />

                <div className="rounded-xl mt-5 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-white p-3 group-hover:border-emerald-200 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Global Reach
                  </h3>
                  <p className="text-zinc-500 text-sm group-hover:text-zinc-700 transition-colors duration-300">
                    From Hollywood to Bollywood, we connect you with celebrities
                    from around the world for your events securely and reliably.
                  </p>
                </div>
              </div>

              <div className="border p-2.5 mx-auto rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group">
                <Image
                  src="/check.svg"
                  alt="Secure"
                  width={150}
                  height={150}
                  className="w-30 h-30 mx-auto group-hover:scale-110 transition-transform duration-300"
                />

                <div className="rounded-xl mt-6 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-white p-3 group-hover:border-emerald-200 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Secure and Reliable
                  </h3>
                  <p className="text-zinc-500 text-sm group-hover:text-zinc-700 transition-colors duration-300">
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
      <section className="bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <div>
              <div className="mb-8">
                <h4 className="text-sm border w-fit px-3 py-1.5  bg-emerald-50 to-amber-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6">
                  ABOUT CELBOOKINGS
                </h4>
                <h2 className="text-5xl font-bold tracking-tight text-emerald-900 mb-6 ">
                  Where Dreams Meet{" "}
                  <span className=" bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    Celebrity Reality
                  </span>
                </h2>
                <p className=" text-zinc-500 mb-3">
                  Founded in 2020, CelBookings has revolutionized the celebrity
                  booking industry by creating a seamless, secure, and
                  transparent platform that connects fans with their favorite
                  stars. We've facilitated over 10,000 successful bookings
                  across 50+ countries, making once-in-a-lifetime experiences
                  accessible to everyone.
                </p>
                <p className="text-zinc-500 mb-8">
                  Our mission is simple: to democratize access to celebrity
                  talent while ensuring every interaction is authentic, secure,
                  and memorable. Whether you're planning a corporate event,
                  private party, or special occasion, we make the impossible
                  possible.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-100 backdrop-blur-sm border border-zinc-100/50 hover:border-emerald-200/50 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Star className="size-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2 text-lg">
                      Verified Talent Network
                    </h3>
                    <p className="text-zinc-600 text-sm ">
                      Every celebrity on our platform undergoes rigorous
                      verification and authentication processes. We work
                      directly with talent agencies, managers, and the
                      celebrities themselves to ensure authenticity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-zinc-100/50 hover:border-emerald-200/50 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <TrendingUp className="size-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2 text-lg">
                      Global Reach & Local Expertise
                    </h3>
                    <p className="text-zinc-600 text-sm ">
                      From Hollywood to Bollywood, we have established
                      partnerships with talent agencies worldwide. Our local
                      teams understand cultural nuances and event requirements
                      in each market.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-800 text-white px-10 py-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  Our Story
                  <ChevronRight className="size-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 px-10 py-5 transition-all duration-300"
                >
                  Meet Our Team
                </Button>
              </div>
            </div>

            {/* Right Side - Image/Visual */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/hollywood-red-carpet.jpg"
                  alt="Celebrity event"
                  className="w-full h-[700px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-white font-bold text-3xl mb-3">
                    Making Dreams Come True
                  </h3>
                  <p className="text-white/90 text-sm max-w-md">
                    Join thousands of satisfied clients who've created
                    unforgettable moments with their favorite celebrities. From
                    intimate gatherings to grand galas, we make every event
                    extraordinary.
                  </p>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-xl p-6 border border-zinc-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm">
                    <Star className="size-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-900">
                      98%
                    </div>
                    <div className="text-sm text-zinc-500 font-medium">
                      Client Satisfaction
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-zinc-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center shadow-sm">
                    <TrendingUp className="size-7 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-600">
                      10K+
                    </div>
                    <div className="text-sm text-zinc-500 font-medium">
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
        <div className="bg-white border py-8">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h4 className="text-sm border w-fit px-2 py-1 bg-amber-50/50 border-amber-500/50 rounded-full mx-auto font-semibold text-amber-600">
                CELEBRITIES
              </h4>
              <h2 className="mt-2 text-4xl font-bold tracking-tight text-pretty text-emerald-900 sm:text-5xl lg:text-balance">
                Simplifying access to your favorite{" "}
                <span className="text-amber-600">celebrities</span>, everyday.
              </h2>
              <p className="mt-3 text-gray-500">
                Search through the thousands of acts we work with to find the
                perfect talent for your event. If you don't find who you are
                looking for, your Booking Entertainment.com agent will be happy
                to get you pricing and availability for any celebrity talent in
                the industry.
              </p>
            </div>
            <div className="mt-14 max-w-7xl mx-auto space-y-8">
              {/* Grid View - All Celebrities */}
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <h3 className="text-xl font-bold text-emerald-900">
                    All Celebrities
                  </h3>
                  <div className="flex items-center justify-between">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 size-4" />
                      <Input
                        placeholder="Search celebrities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 min-w-2xl"
                      />
                    </div>

                    {/* Filter Controls */}
                    <div className="flex space-x-2">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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
                    className="border-emerald-600 bg-emerald-800 text-zinc-100 hover:bg-emerald-700 hover:text-white transition-all duration-300 px-8 py-3 rounded-full shadow-xl shadow-emerald-600/10 drop-shadow-2xl hover:shadow-xl"
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
      <section className="mt-10 bg-gradient-to-t from-emerald-700  to-emerald-800 py-15 mb-10 max-w-7xl mx-auto rounded-2xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="max-w-2xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 ">
                Ready to Book Your{" "}
                <span className="text-amber-300">Dream Celebrity?</span>
              </h2>
              <p className=" text-emerald-100 max-w-3xl mx-auto leading-relaxed">
                Join thousands of satisfied clients who've made their events
                unforgettable. Start your celebrity booking journey today and
                create memories that last a lifetime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center ">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 px-12 py-5.5 text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Browse Celebrities
                <ChevronRight className="size-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 px-10 py-5 text-sm font-semibold transition-all duration-300 hover:scale-105"
              >
                Get Free Quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img
                  alt="CelBookings"
                  src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=white"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">CelBookings</span>
              </div>
              <p className="text-zinc-400 mb-6 max-w-md">
                Your premier destination for celebrity bookings. Connect with
                A-list stars, musicians, and influencers for your next event.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">f</span>
                </div>
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">t</span>
                </div>
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">in</span>
                </div>
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                  <span className="text-sm font-semibold">ig</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Celebrities
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Events
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Bookings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Memberships
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-400 text-sm">
              © 2024 CelBookings. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>Live Bookings</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Star className="size-4 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

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
