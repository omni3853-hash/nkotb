"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
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
  Info,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

import { CelebritiesApi, type Celebrity } from "@/api/celebrities.api";
import { EventsApi, type Event } from "@/api/events.api";
import { CelebrityQuerySchema, EventQuerySchema } from "@/utils/schemas/schemas";

// ---------- utils ----------
function useDebounced<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const features = [
  { name: "Push to deploy", description: "Morbi viverra dui mi arcu sed. Tellus semper adipiscing suspendisse semper morbi. Odio urna massa nunc massa.", icon: CloudArrowUpIcon },
  { name: "SSL certificates", description: "Sit quis amet rutrum tellus ullamcorper ultricies libero dolor eget. Sem sodales gravida quam turpis enim lacus amet.", icon: LockClosedIcon },
  { name: "Simple queues", description: "Quisque est vel vulputate cursus. Risus proin diam nunc commodo. Lobortis auctor congue commodo diam neque.", icon: ArrowPathIcon },
  { name: "Advanced security", description: "Arcu egestas dolor vel iaculis in ipsum mauris. Tincidunt mattis aliquet hac quis. Id hac maecenas ac donec pharetra eget.", icon: FingerPrintIcon },
];

const categories = ["All", "Actor", "Musician", "Athlete", "Comedian", "Influencer"];

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

// ---------- hero (kept exactly like your design) ----------
type HeroCard = {
  name: string;
  image: string;
  basePrice: number;
  rating: number;
  bookings: number;
  availability: "Available" | "Limited" | "Booked";
};
const heroCelebrities: HeroCard[] = [
  { name: "Keanu Reeves", image: "/keanu-reeves-portrait.jpg", basePrice: 50000, rating: 4.9, bookings: 1250, availability: "Available" },
  { name: "Taylor Swift", image: "/portrait-singer.png", basePrice: 150000, rating: 5.0, bookings: 2100, availability: "Limited" },
  { name: "Dwayne Johnson", image: "/dwayne-johnson-portrait.jpg", basePrice: 75000, rating: 4.8, bookings: 1800, availability: "Available" },
  { name: "Beyoncé", image: "/beyonce-portrait.jpg", basePrice: 200000, rating: 5.0, bookings: 1950, availability: "Booked" },
  { name: "Zendaya", image: "/zendaya-portrait.jpg", basePrice: 65000, rating: 4.9, bookings: 1450, availability: "Limited" },
];

// ---------- helpers ----------
const formatBookings = (bookings?: number) => {
  const n = bookings || 0;
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
};
const formatPrice = (price?: number) => {
  const v = price || 0;
  return v >= 100000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toLocaleString()}`;
};
const getAvailabilityColor = (availability?: string) => {
  switch (availability) {
    case "Available": return "bg-emerald-700/40";
    case "Limited": return "bg-yellow-600/40";
    case "Booked": return "bg-red-600/40";
    default: return "bg-emerald-700/40";
  }
};
const getAvailabilityDotColor = (availability?: string) => {
  switch (availability) {
    case "Available": return "bg-emerald-500";
    case "Limited": return "bg-yellow-500";
    case "Booked": return "bg-red-500";
    default: return "bg-emerald-500";
  }
};
const badgeColorOf = (availability?: string) => {
  switch (availability) {
    case "Sold Out":
    case "Booked":
      return "bg-red-100 text-red-800 border-red-200";
    case "Limited":
    case "Almost Full":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Hot":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Available":
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
};

// ---------- component ----------
export default function Example() {
  // search + filters (celebrities)
  const [searchTerm, setSearchTerm] = useState("");
  const dSearch = useDebounced(searchTerm, 350);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  // hero
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isImageTransitioning, setIsImageTransitioning] = useState(false);

  // events carousel
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // celebs grid
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loadingCelebs, setLoadingCelebs] = useState(true);

  // misc UI
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  const faqData = [
    {
      question: "How do I book a celebrity for my event?",
      answer: "Booking a celebrity is simple! Browse our extensive database of celebrities, select your preferred talent, and submit a booking request. Our team will handle all negotiations and logistics to ensure a seamless experience.",
    },
    {
      question: "What types of events can celebrities be booked for?",
      answer: "Our celebrities are available for a wide variety of events including corporate functions, private parties, product launches, charity galas, weddings, birthday celebrations, and promotional appearances.",
    },
    {
      question: "How far in advance should I book?",
      answer: "We recommend booking at least 3-6 months in advance for A-list celebrities, though some may be available with shorter notice. Popular celebrities during peak seasons may require even earlier booking.",
    },
    {
      question: "What is included in the booking fee?",
      answer: "Our booking fees typically include the celebrity's appearance, basic travel arrangements, and our concierge service. Additional costs may apply for special requirements, extended appearances, or premium accommodations.",
    },
    {
      question: "Can I meet the celebrity before the event?",
      answer: "Pre-event meetings can often be arranged depending on the celebrity's schedule and preferences. We'll work with you to coordinate any meet-and-greet opportunities as part of the booking process.",
    },
    {
      question: "What if a celebrity cancels last minute?",
      answer: "While rare, cancellations can happen. We have a comprehensive backup system and will work immediately to find a suitable replacement or provide full refunds according to our cancellation policy.",
    },
    {
      question: "What is your refund policy?",
      answer: "We offer full refunds for cancellations made more than 30 days before the event. Cancellations within 30 days are subject to a 25% fee, while cancellations within 7 days are non-refundable. Force majeure situations are handled on a case-by-case basis.",
    },
  ];

  // ---------- fetch celebrities (kept same pattern you use) ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCelebs(true);
      try {
        const baseQuery = CelebrityQuerySchema.partial().parse({
          page: 1,
          limit: 24,
          search: dSearch || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
        });
        const res = await CelebritiesApi.list(baseQuery);
        let list: Celebrity[] = res?.items || [];

        // local price filter
        if (selectedPriceRange !== "all") {
          if (selectedPriceRange === "0-50000") {
            list = list.filter((x) => (x.basePrice || 0) < 50000);
          } else if (selectedPriceRange === "50000-100000") {
            list = list.filter((x) => (x.basePrice || 0) >= 50000 && (x.basePrice || 0) <= 100000);
          } else if (selectedPriceRange === "100000-200000") {
            list = list.filter((x) => (x.basePrice || 0) >= 100000 && (x.basePrice || 0) <= 200000);
          } else if (selectedPriceRange === "200000+") {
            list = list.filter((x) => (x.basePrice || 0) >= 200000);
          }
        }

        // local availability filter
        if (selectedAvailability !== "all") {
          list = list.filter((x) => (x.availability || "Available") === selectedAvailability);
        }

        // local sort
        list.sort((a, b) => {
          switch (sortBy) {
            case "price-low":
              return (a.basePrice || 0) - (b.basePrice || 0);
            case "price-high":
              return (b.basePrice || 0) - (a.basePrice || 0);
            case "rating":
              return (b.rating || 0) - (a.rating || 0);
            case "name":
              return (a.name || "").localeCompare(b.name || "");
            case "popularity":
            default:
              return (b.bookings || 0) - (a.bookings || 0);
          }
        });

        if (mounted) setCelebrities(list);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to load celebrities");
        if (mounted) setCelebrities([]);
      } finally {
        if (mounted) setLoadingCelebs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dSearch, selectedCategory, selectedPriceRange, selectedAvailability, sortBy]);

  // ---------- fetch events (replaces sample data, keeps your design) ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingEvents(true);
      try {
        const q = EventQuerySchema.partial().parse({
          page: 1,
          limit: 18,
          search: undefined, // hook up if you later add event search field
          isActive: true,
        });
        const res = await EventsApi.list(q);
        const list = (res?.items || []).filter(Boolean);
        if (mounted) {
          setEvents(list);
          setCurrentEventIndex(0);
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to load events");
        if (mounted) setEvents([]);
      } finally {
        if (mounted) setLoadingEvents(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------- hero auto-rotate ----------
  useEffect(() => {
    const interval = setInterval(() => {
      setIsImageTransitioning(true);
      setTimeout(() => {
        setCurrentCarouselIndex((prev) => (prev + 1) % heroCelebrities.length);
        setIsImageTransitioning(false);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ---------- events carousel: responsive items per view + auto-rotate ----------
  const computeItemsPerView = () => {
    if (typeof window === "undefined") return 3;
    const w = window.innerWidth;
    if (w < 640) return 1;       // <sm
    if (w < 1024) return 2;      // sm–lg
    return 3;                    // lg+
  };

  useEffect(() => {
    const handler = () => setItemsPerView(computeItemsPerView());
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const maxStartIndex = Math.max(0, events.length - itemsPerView);
  const pagesCount = Math.max(1, maxStartIndex + 1);

  const goToEventIndex = (idx: number) => {
    const clamped = ((idx % pagesCount) + pagesCount) % pagesCount;
    setCurrentEventIndex(clamped);
  };

  // auto-rotate with cleanup
  useEffect(() => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    autoRotateRef.current = setInterval(() => {
      goToEventIndex(currentEventIndex + 1);
    }, 5000);
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, itemsPerView, currentEventIndex]);

  // pause on hover (professional feel)
  const carouselWrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = carouselWrapRef.current;
    if (!el) return;
    const pause = () => { if (autoRotateRef.current) clearInterval(autoRotateRef.current); };
    const resume = () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
      autoRotateRef.current = setInterval(() => {
        goToEventIndex(currentEventIndex + 1);
      }, 5000);
    };
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => {
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length, itemsPerView]);

  // scroll & section observers (kept)
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const statsObserver = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStatsVisible(true)),
      { threshold: 0.3 }
    );
    const el = document.getElementById("stats-section");
    if (el) statsObserver.observe(el);
    return () => { if (el) statsObserver.unobserve(el); };
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            setVisibleSections((prev) => new Set(prev).add((entry.target as HTMLElement).id));
          }
        }),
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-scroll-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const filteredCelebrities = useMemo(() => celebrities, [celebrities]);
  const hasAnyCelebs = (celebrities?.length || 0) > 0;
  const hasSearchValue = dSearch.trim().length > 0;
  const hasSearchResults = filteredCelebrities.length > 0;

  const hero = heroCelebrities[currentCarouselIndex];

  // ----- event helpers for UI mapping (no design change) -----
  const calcSpotsLeft = (ev: Event) => {
    if (!ev?.ticketTypes?.length) return 0;
    return ev.ticketTypes.reduce((acc, t: any) => {
      const total = Number(t?.total || 0);
      const sold = Number(t?.sold || 0);
      return acc + Math.max(0, total - sold);
    }, 0);
  };
  const firstTicketTypeName = (ev: Event) => ev?.ticketTypes?.[0]?.name || ev?.category || "Event";

  // translateX percent per page
  const translatePercent = currentEventIndex * (100 / itemsPerView);

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-zinc-100">
      <Header />

      {/* HERO (unchanged design) */}
      <div className="relative isolate pt-14 mt-10">
        <section className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 items-stretch justify-center gap-x-3">
          <div
            className="w-full py-16 sm:py-24 lg:py-11.5 rounded-xl px-4 sm:px-10 h-full flex flex-col justify-center"
            data-scroll-animate
            id="hero-text"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-emerald-900 sm:text-[5.3rem] leading-tight">
                YOUR <span className="font-black text-amber-600"> #1 </span> CELEBRITY BOOKING PLATFORM
              </h1>
              <p className="mt-3 text-base sm:text-lg text-pretty text-zinc-500">
                Connect with A-list celebrities, musicians, and influencers for your next unforgettable event. From intimate meet-and-greets to grand galas, we make celebrity bookings seamless, secure, and extraordinary.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-x-3 gap-y-3">
                <a
                  href="#"
                  className="rounded-md bg-emerald-800 px-6 sm:px-8 py-2.5 text-sm font-semibold text-zinc-100 shadow-xs hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Start Booking Now.
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

          {/* Right: hero portrait + floating stats */}
          <div
            className={`relative w-full h-80 sm:h-96 lg:h-[38rem] flex items-center justify-center ${isImageTransitioning ? "fade-out-left" : "fade-in-right"}`}
            data-scroll-animate
            id="hero-image"
          >
            <div className="relative z-10">
              <div className="max-w-xs sm:max-w-sm lg:max-w-lg h-full rounded-full overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
                <img
                  src={hero?.image || "/placeholder.svg"}
                  alt={hero?.name || "Featured celebrity"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </div>

            <div className="absolute top-4 sm:top-14 left-2 sm:left-8 animate-float bg-amber-900/40 backdrop-blur-md rounded-xl shadow-xl p-3 sm:p-4 border border-white/20 hover:scale-105 transition-transform duration-300 z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="size-4 sm:size-5 text-amber-600 fill-current" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-zinc-100">{hero?.rating ?? "—"}</div>
                  <div className="text-xs text-zinc-200">Rating</div>
                </div>
              </div>
            </div>

            <div className="absolute top-12 sm:top-24 right-2 sm:right-16 animate-float-delayed-1 bg-emerald-800/40 backdrop-blur-md rounded-xl shadow-xl p-3 sm:p-4 border border-white/20 hover:scale-105 transition-transform duration-300 z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="size-4 sm:size-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-zinc-100">{formatBookings(hero?.bookings)}</div>
                  <div className="text-xs text-zinc-200">Bookings</div>
                </div>
              </div>
            </div>

            <div
              className={`absolute bottom-12 sm:bottom-29 left-2 sm:left-8 animate-float-delayed-2 ${getAvailabilityColor(
                hero?.availability
              )} backdrop-blur-md rounded-xl shadow-xl p-3 sm:p-4 border border-white/20 hover:scale-105 transition-transform duration-300 z-20`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className={`w-3 h-3 ${getAvailabilityDotColor(hero?.availability)} rounded-full`} />
                </div>
                <div>
                  <div className="text-base sm:text-lg text-zinc-100">{hero?.availability || "Available"}</div>
                  <div className="text-xs text-zinc-200">Status</div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-22 right-2 sm:right-8 animate-float-delayed-3 bg-purple-800/40 backdrop-blur-md rounded-xl shadow-xl p-3 sm:p-4 border border-white/20 hover:scale-105 transition-transform duration-300 z-20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="size-4 sm:size-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-zinc-100">{formatPrice(hero?.basePrice)}</div>
                  <div className="text-xs text-zinc-200">Starting</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners (unchanged) */}
        <div className="mt-14 opacity-70 w-full mx-auto overflow-hidden">
          <h4 className="text-xs border mb-6 w-fit px-2 py-1 bg-zinc-50 border-zinc-400/50 rounded-full mx-auto font-semibold text-zinc-400">
            TRUSTED PARTNERS
          </h4>
          <div className="flex gap-x-14 mt-5 items-center animate-scroll">
            <img src="/partner1.png" alt="Partner 1" className="h-fit w-[5rem] flex-shrink-0" width={40} />
            <img src="/partner2.png" alt="Partner 2" className="h-fit w-[5rem] flex-shrink-0" />
            <img src="/partner3.png" alt="Partner 3" className="h-fit w-[5rem] flex-shrink-0" />
            <img src="/partner1.png" alt="Partner 4" className="h-fit w-[5rem] flex-shrink-0" />
            <img src="/partner2.png" alt="Partner 5" className="h-fit w-[5rem] flex-shrink-0" />
            <img src="/partner3.png" alt="Partner 6" className="h-fit w-[5rem] flex-shrink-0" />
            <img src="/partner1.png" alt="Partner 1" className="h-fit w-[8rem] flex-shrink-0" width={40} />
            <img src="/partner2.png" alt="Partner 2" className="h-fit w-[8rem] flex-shrink-0" />
            <img src="/partner3.png" alt="Partner 3" className="h-fit w-[8rem] flex-shrink-0" />
            <img src="/partner1.png" alt="Partner 4" className="h-fit w-[8rem] flex-shrink-0" />
            <img src="/partner2.png" alt="Partner 5" className="h-fit w-[8rem] flex-shrink-0" />
            <img src="/partner3.png" alt="Partner 6" className="h-fit w-[8rem] flex-shrink-0" />
          </div>
        </div>

        {/* Events (wired to API; design preserved) */}
        <section className="py-12 sm:py-15 mt-10 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto" data-scroll-animate id="events-header">
              <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full mx-auto font-semibold text-emerald-600 mb-6">
                UPCOMING EVENTS
              </h4>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-3">
                Exclusive Celebrity Events <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">You Can Attend</span>
              </h2>
              <p className="text-sm sm:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                Join intimate meet & greets, exclusive workshops, and private events with your favorite celebrities. Limited spots available for these once-in-a-lifetime experiences.
              </p>
            </div>

            <div className="relative overflow-hidden" ref={carouselWrapRef}>
              {/* track */}
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${translatePercent}%)` }}
              >
                {loadingEvents && Array.from({ length: itemsPerView }).map((_, i) => (
                  <div key={`ske-${i}`} className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-2 sm:px-3" data-scroll-animate>
                    <div className="group bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                      <div className="relative h-40 sm:h-48">
                        <div className="absolute inset-0 animate-pulse bg-zinc-100" />
                      </div>
                      <div className="p-6">
                        <div className="h-5 w-3/4 bg-zinc-100 rounded mb-2 animate-pulse" />
                        <div className="h-4 w-1/3 bg-zinc-100 rounded mb-4 animate-pulse" />
                        <div className="space-y-2 mb-4">
                          <div className="h-4 w-2/3 bg-zinc-100 rounded animate-pulse" />
                          <div className="h-4 w-1/2 bg-zinc-100 rounded animate-pulse" />
                          <div className="h-4 w-1/4 bg-zinc-100 rounded animate-pulse" />
                        </div>
                        <div className="h-9 w-full bg-zinc-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}

                {!loadingEvents && events.map((event) => {
                  const img = event.coverImage || event.image || "/placeholder.svg";
                  const when = `${event.date} at ${event.time}`;
                  const where = event.location || "TBA";
                  const starting = formatPrice(event.basePrice);
                  const availLabel = event.availability || "Available";
                  const availClass = badgeColorOf(availLabel);
                  const spotsLeft = calcSpotsLeft(event);
                  const typeLabel = firstTicketTypeName(event);

                  return (
                    <div key={event._id} className="w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-2 sm:px-3" data-scroll-animate>
                      <div className="group bg-zinc-50 border border-zinc-200 rounded-xl hover:border-emerald-300 transition-all duration-300">
                        <div className="relative h-40 sm:h-48 overflow-hidden">
                          <img src={img} alt={event.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium border ${availClass}`}>{availLabel}</span>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-black/70 text-white rounded">{typeLabel}</span>
                          </div>
                        </div>

                        <div className="p-4 sm:p-6">
                          <h3 className="text-base sm:text-lg font-semibold text-zinc-900 mb-1">{event.title}</h3>
                          <p className="text-emerald-600 text-sm font-medium mb-3">{event.category}</p>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                              <Calendar className="size-4 text-emerald-600 fill-current flex-shrink-0" />
                              <span>{when}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                              <MapPin className="size-4 text-emerald-600 fill-current flex-shrink-0" />
                              <span>{where}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                              <DollarSign className="size-4 text-emerald-600 fill-current flex-shrink-0" />
                              <span className="font-semibold text-emerald-600">{starting}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs sm:text-sm text-zinc-500">
                              {spotsLeft > 0 ? <span>{spotsLeft} spots left</span> : <span className="text-red-500">Sold Out</span>}
                            </div>
                            <button
                              className={`text-xs sm:text-sm font-medium transition-colors px-3 sm:px-4 py-2 rounded ${spotsLeft > 0 ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-zinc-200 text-zinc-500 cursor-not-allowed"}`}
                              disabled={spotsLeft === 0}
                              onClick={() => {
                                if (spotsLeft > 0) {
                                  toast.success("Proceed to booking flow");
                                  // route or open modal when your booking is ready:
                                  // router.push(`/events/${event.slug}`) // if/when details page exists
                                }
                              }}
                            >
                              {spotsLeft > 0 ? "Book Now" : "Sold Out"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* dots */}
              <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                {Array.from({ length: pagesCount }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToEventIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentEventIndex ? "bg-emerald-600 w-6" : "bg-zinc-300 hover:bg-zinc-400"}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* nav buttons (unchanged look) */}
              <button
                onClick={() => goToEventIndex(currentEventIndex - 1)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center hover:border-emerald-300 transition-colors"
                aria-label="Previous"
              >
                <ChevronRight className="size-4 sm:size-5 text-zinc-600 rotate-180" />
              </button>
              <button
                onClick={() => goToEventIndex(currentEventIndex + 1)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center hover:border-emerald-300 transition-colors"
                aria-label="Next"
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

      {/* WHY + ABOUT (unchanged) */}
      <section className="pt-12 sm:pt-20 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl lg:text-center" data-scroll-animate id="why-section">
            <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-pretty text-emerald-900 lg:text-balance">
              Why We're the<span className="text-amber-600"> #1 Choice </span> for Celebrity Bookings
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-700">
              We've revolutionized the celebrity booking industry by combining cutting-edge technology with personalized service. Our
              platform is trusted by thousands of event planners, corporations, and individuals worldwide.
            </p>
          </div>
          <div className="mt-14 max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row items-center gap-7">
              <div className="border p-2.5 mx-auto rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group w/full lg:w-auto" data-scroll-animate>
                <Image src="/mic.svg" alt="Verified Talent" width={150} height={150} className="size-24 sm:size-30 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="rounded-xl mt-5 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-zinc-50 p-3 group-hover:border-emerald-200/50 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-lg sm:text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Verified Talent Network
                  </h3>
                  <p className="text-zinc-600 text-xs sm:text-sm group-hover:text-zinc-700 transition-colors duration-300">
                    Every celebrity on our platform is verified and authenticated, ensuring you're booking with real talent.
                  </p>
                </div>
              </div>

              <div className="border p-2.5 rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group w/full lg:w-auto" data-scroll-animate>
                <Image src="/global.svg" alt="Global Reach" width={160} height={150} className="w-24 sm:w-30 h-24 sm:h-30 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="rounded-xl mt-5 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-white p-3 group-hover:border-emerald-200 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-lg sm:text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Global Reach
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-sm group-hover:text-zinc-700 transition-colors duration-300">
                    From Hollywood to Bollywood, we connect you with celebrities from around the world for your events securely and reliably.
                  </p>
                </div>
              </div>

              <div className="border p-2.5 mx-auto rounded-2xl bg-zinc-100/60 hover:bg-emerald-50/50 hover:border-emerald-200/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group w/full lg:w-auto" data-scroll-animate>
                <Image src="/check.svg" alt="Secure" width={150} height={150} className="w-24 sm:w-30 h-24 sm:h-30 mx-auto group-hover:scale-110 transition-transform duration-300" />
                <div className="rounded-xl mt-6 text-center border border-zinc-200 shadow-lg shadow-zinc-200 bg-white p-3 group-hover:border-emerald-200 group-hover:shadow-emerald-100 transition-all duration-300">
                  <h3 className="font-bold text-lg sm:text-xl text-emerald-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">
                    Secure & Reliable
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-sm group-hover:text-zinc-700 transition-colors duration-300">
                    Our platform is secure and reliable, ensuring you're booking with real talent and getting the best service possible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT (unchanged) */}
      <section className="bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div data-scroll-animate id="about-content">
              <div className="mb-8">
                <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 to-amber-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6">
                  ABOUT Premier Talent Agency
                </h4>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-6">
                  Where Dreams Meet <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Celebrity Reality</span>
                </h2>
                <p className="text-sm sm:text-base text-zinc-500 mb-3">
                  Founded in 2020, Premier Talent Agency has revolutionized the celebrity booking industry by creating a seamless, secure, and
                  transparent platform that connects fans with their favorite stars. We've facilitated over 10,000 successful bookings across
                  50+ countries, making once-in-a-lifetime experiences accessible to everyone.
                </p>
                <p className="text-sm sm:text-base text-zinc-500 mb-8">
                  Our mission is simple: to democratize access to celebrity talent while ensuring every interaction is authentic, secure, and
                  memorable. Whether you're planning a corporate event, private party, or special occasion, we make the impossible possible.
                </p>
              </div>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-100 backdrop-blur-sm border border-zinc-100/50 hover:border-emerald-200/50 transition-all duration-300">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Star className="size-6 sm:size-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2 text-base sm:text-lg">Verified Talent Network</h3>
                    <p className="text-zinc-600 text-xs sm:text-sm">
                      Every celebrity on our platform undergoes rigorous verification and authentication processes. We work directly with talent
                      agencies, managers, and the celebrities themselves to ensure authenticity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-zinc-100/50 hover:border-emerald-200/50 transition-all duration-300">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <TrendingUp className="size-6 sm:size-7 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2 text-base sm:text-lg">Global Reach & Local Expertise</h3>
                    <p className="text-zinc-600 text-xs sm:text-sm">
                      From Hollywood to Bollywood, we have established partnerships with talent agencies worldwide. Our local teams understand
                      cultural nuances and event requirements in each market.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 sm:px-10 py-4 sm:py-5 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base">
                  Our Story
                  <ChevronRight className="size-4 ml-2" />
                </Button>
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600 px-8 sm:px-10 py-4 sm:py-5 transition-all duration-300 text-sm sm:text-base bg-transparent">
                  Meet Our Team
                </Button>
              </div>
            </div>

            <div className="relative" data-scroll-animate id="about-image">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="/hollywood-red-carpet.jpg" alt="Celebrity event" className="w-full h-64 sm:h-96 lg:h-[700px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8">
                  <h3 className="text-white font-bold text-xl sm:text-3xl mb-2 sm:mb-3">Making Dreams Come True</h3>
                  <p className="text-white/90 text-xs sm:text-sm max-w-md">
                    Join thousands of satisfied clients who've created unforgettable moments with their favorite celebrities. From intimate
                    gatherings to grand galas, we make every event extraordinary.
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-zinc-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 sm:w-14 h-10 sm:h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <Star className="size-5 sm:size-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-emerald-900">98%</div>
                    <div className="text-xs sm:text-sm text-zinc-500 font-medium">Client Satisfaction</div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-zinc-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 sm:w-14 h-10 sm:h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <TrendingUp className="size-5 sm:size-7 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-amber-600">10K+</div>
                    <div className="text-xs sm:text-sm text-zinc-500 font-medium">Events Booked</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CELEBRITIES (unchanged, only data is dynamic) */}
      {hasAnyCelebs && (
        <section>
          <div className="bg-white border py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-2xl lg:text-center" data-scroll-animate id="celebrities-header">
                <h4 className="text-xs border w-fit px-2 py-1 bg-amber-50/50 border-amber-500/50 rounded-full mx-auto font-semibold text-amber-600">
                  CELEBRITIES
                </h4>
                <h2 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-pretty text-emerald-900 lg:text-balance">
                  Simplifying access to your favorite <span className="text-amber-600">celebrities</span>, everyday.
                </h2>
                <p className="mt-3 text-xs sm:text-sm text-gray-500">
                  Search through the thousands of acts we work with to find the perfect talent for your event. If you don't find who you are
                  looking for, our booking agents will be happy to get you pricing and availability for any celebrity talent in the industry.
                </p>
              </div>

              <div className="mt-14 max-w-7xl mx-auto space-y-8">
                <div className="space-y-6">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-900">All Celebrities</h3>
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="relative w-full lg:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
                        <Input
                          placeholder="Search celebrities..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full lg:min-w-2xl"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

                        <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
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

                        <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
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

                    {/* search empty state */}
                    {!loadingCelebs && hasSearchValue && !hasSearchResults && (
                      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                        <Info className="size-4 mt-0.5" />
                        <p className="text-sm">
                          The celebrity you searched for <span className="font-semibold">“{dSearch}”</span> does not exist.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {loadingCelebs &&
                    Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden py-0 border-0 bg-white">
                        <div className="relative aspect-square rounded-xl overflow-hidden">
                          <div className="absolute inset-0 animate-pulse bg-zinc-100" />
                        </div>
                      </Card>
                    ))}

                  {!loadingCelebs &&
                    hasSearchResults &&
                    filteredCelebrities.map((celebrity, index) => {
                      const isBlur = index >= 4;
                      return (
                        <Card
                          key={celebrity._id || `${celebrity.name}-${index}`}
                          className={`relative overflow-hidden py-0 border-0 group bg-white transition-all duration-300 hover:scale-[1.02] ${isBlur ? "pointer-events-none" : "hover:border-emerald-900 cursor-pointer"}`}
                          data-scroll-animate
                        >
                          <div className="relative aspect-square rounded-xl overflow-hidden">
                            <img
                              src={celebrity.image || "/placeholder.svg"}
                              alt={celebrity.name}
                              className={`absolute inset-0 w-full h-full object-cover border border-zinc-200 object-center ${isBlur ? "opacity-70" : ""}`}
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
                              <h4 className="text-white font-bold text-sm mb-1 truncate">{celebrity.name}</h4>
                              <p className="text-white/80 text-xs mb-1">{celebrity.category}</p>
                              <div className="flex items-center gap-1 text-white/90 text-xs">
                                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                                <span>{celebrity.rating ?? "—"}</span>
                                <span>•</span>
                                <span>{formatPrice(celebrity.basePrice)}</span>
                              </div>
                            </div>

                            {isBlur && <div className="absolute inset-0 bg-white/0 backdrop-blur-[2px]" />}
                          </div>
                        </Card>
                      );
                    })}
                </div>

                {!loadingCelebs && hasSearchResults && filteredCelebrities.length > 0 && (
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => (window.location.href = "/bookings")}
                      className="border-emerald-600 bg-emerald-800 text-zinc-100 hover:bg-emerald-700 hover:text-white transition-all duration-300 px-6 sm:px-8 py-2 sm:py-3 rounded-full shadow-xl shadow-emerald-600/10 drop-shadow-2xl hover:shadow-xl text-sm sm:text-base"
                    >
                      View All Celebrities
                      <ChevronRight className="size-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA + FAQ (unchanged) */}
      <section
        className="mt-10 bg-gradient-to-t from-emerald-700 to-emerald-800 py-12 sm:py-15 mb-10 max-w-7xl mx-auto rounded-2xl relative overflow-hidden"
        data-scroll-animate
        id="cta-section"
      >
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
                Ready to Book Your <span className="text-amber-300">Dream Celebrity?</span>
              </h2>
              <p className="text-sm sm:text-base text-emerald-100 max-w-3xl mx-auto leading-relaxed">
                Join thousands of satisfied clients who've made their events unforgettable. Start your celebrity booking journey today and
                create memories that last a lifetime.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 sm:px-12 py-4 sm:py-5.5 text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 w-full sm:w-auto" onClick={() => (window.location.href = "/bookings")}>
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

      <section className="py-16 sm:py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-start">
            <div className="space-y-8" data-scroll-animate id="faq-header">
              <div>
                <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6">
                  FREQUENTLY ASKED QUESTIONS
                </h4>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-6">
                  Everything You Need to Know
                </h2>
                <p className="text-sm sm:text-base text-zinc-500 max-w-md">
                  Get answers to the most common questions about celebrity bookings, pricing, and our services. Can't find what you're
                  looking for? Our support team is here to help.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserIcon className="size-5 sm:size-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-sm sm:text-base">Live Chat Support</h3>
                      <p className="text-xs sm:text-sm text-zinc-600">Get instant answers 24/7</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="size-5 sm:size-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-sm sm:text-base">Schedule a Call</h3>
                      <p className="text-xs sm:text-sm text-zinc-600">Book a consultation with our experts</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-emerald-100/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="size-5 sm:size-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-900 text-sm sm:text-base">Email Support</h3>
                      <p className="text-xs sm:text-sm text-zinc-600">Detailed responses within 2 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3" data-scroll-animate id="faq-items">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-white/40 backdrop-blur-sm rounded-lg border border-emerald-100/30 overflow-hidden hover:bg-white/60 transition-all duration-300">
                  <button
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-emerald-50/30 transition-colors duration-200"
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  >
                    <h3 className="text-sm sm:text-base font-medium text-emerald-900 pr-4 leading-snug">{faq.question}</h3>
                    <ChevronDown className={`size-4 text-emerald-600 transition-transform duration-200 flex-shrink-0 ${openFAQ === index ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFAQ === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-5">
                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />

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
