"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  ChevronRight,
  Award,
  Globe,
  Zap,
  Heart,
  Shield,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Event Planner",
    company: "Elite Events Co.",
    rating: 5,
    text: "Premier Talent Agency made booking Taylor Swift for our corporate gala incredibly seamless. The entire process was transparent, professional, and the celebrity showed up exactly as promised. Highly recommend!",
    image: "/professional-woman-diverse.png",
    verified: true,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "CEO",
    company: "Tech Innovations Inc.",
    rating: 5,
    text: "We've used Premier Talent Agency for three major events now. Their team goes above and beyond to ensure everything is perfect. The quality of talent and professionalism is unmatched in the industry.",
    image: "/professional-man.jpg",
    verified: true,
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Wedding Planner",
    company: "Dream Weddings",
    rating: 5,
    text: "Getting a celebrity performer for our client's wedding was a dream come true thanks to Premier Talent Agency. The platform is user-friendly and the support team is incredibly responsive.",
    image: "/diverse-woman-smiling.png",
    verified: true,
  },
  {
    id: 4,
    name: "James Wilson",
    role: "Marketing Director",
    company: "Global Brands Ltd.",
    rating: 5,
    text: "The ROI on our celebrity endorsement campaign through Premier Talent Agency was phenomenal. Their expertise in matching the right talent to our brand was invaluable.",
    image: "/professional-man.png",
    verified: true,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    role: "Event Coordinator",
    company: "Premium Events",
    rating: 5,
    text: "Outstanding service from start to finish. Premier Talent Agency handled all the logistics, negotiations, and coordination. I could focus on other aspects of the event knowing everything was in expert hands.",
    image: "/professional-woman.png",
    verified: true,
  },
  {
    id: 6,
    name: "David Thompson",
    role: "Founder",
    company: "Entertainment Plus",
    rating: 5,
    text: "Premier Talent Agency has revolutionized how we book talent. The platform is secure, reliable, and the celebrity network is truly impressive. Best investment we've made for our business.",
    image: "/smiling-man.png",
    verified: true,
  },
];

const values = [
  {
    icon: Heart,
    title: "Authenticity",
    description:
      "We verify every celebrity and ensure genuine connections between talent and clients.",
  },
  {
    icon: Shield,
    title: "Security",
    description:
      "Your data and transactions are protected with enterprise-grade security measures.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Access to celebrities from around the world with local expertise in every market.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description:
      "Cutting-edge technology that makes celebrity bookings faster and easier than ever.",
  },
];

const milestones = [
  {
    year: "2020",
    title: "Founded",
    description:
      "Premier Talent Agency launches with vision to democratize celebrity access",
  },
  {
    year: "2021",
    title: "1K Bookings",
    description: "Reached 1,000 successful celebrity bookings milestone",
  },
  {
    year: "2022",
    title: "Global Expansion",
    description: "Expanded to 50+ countries with local teams",
  },
  {
    year: "2023",
    title: "10K Events",
    description: "Facilitated over 10,000 successful events worldwide",
  },
  {
    year: "2024",
    title: "Industry Leader",
    description: "Recognized as the #1 celebrity booking platform globally",
  },
];

const teamMembers = [
  {
    name: "Alexandra Sterling",
    role: "Founder & CEO",
    bio: "Former talent agent with 15+ years in entertainment industry",
    image: "/professional-woman-ceo.png",
  },
  {
    name: "Marcus Johnson",
    role: "Chief Technology Officer",
    bio: "Tech innovator with expertise in secure platforms and AI",
    image: "/professional-man-tech.png",
  },
  {
    name: "Priya Patel",
    role: "Head of Talent Relations",
    bio: "Celebrity manager with connections across Hollywood and beyond",
    image: "/professional-woman-talent.jpg",
  },
  {
    name: "James O'Brien",
    role: "VP of Operations",
    bio: "Operations expert ensuring seamless event execution",
    image: "/professional-man-operations.png",
  },
];

export default function AboutPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set()
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-zinc-100">
      <Header />

      {/* Hero Section */}
      <section className="pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div
          className="text-center max-w-3xl mx-auto"
          data-scroll-animate
          id="about-hero"
        >
          <h1 className="text-4xl sm:text-5xl md:text-5xl font-black text-emerald-900 mb-6">
            About <span className="text-amber-600">Premier Talent Agency</span>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 mb-8 leading-relaxed">
            We're on a mission to democratize access to celebrity talent and
            create unforgettable experiences for everyone.
          </p>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div data-scroll-animate id="story-content">
              <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6">
                OUR STORY
              </h4>
              <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold text-emerald-900 mb-6">
                From Vision to <span className="text-amber-600">Reality</span>
              </h2>
              <div className="space-y-4 text-zinc-600 mb-8">
                <p className="text-base sm:text-lg leading-relaxed">
                  Premier Talent Agency was founded in 2020 with a simple yet ambitious
                  vision: to make celebrity bookings accessible, transparent,
                  and hassle-free for everyone. Our founder, Alexandra Sterling,
                  spent 15 years in the entertainment industry and witnessed
                  firsthand how complicated and opaque the celebrity booking
                  process was.
                </p>
                <p className="text-base sm:text-lg leading-relaxed">
                  She realized there had to be a better way. A platform where
                  event planners, corporations, and individuals could browse
                  verified celebrities, see transparent pricing, and book talent
                  with confidence. That's how Premier Talent Agency was born.
                </p>
                <p className="text-base sm:text-lg leading-relaxed">
                  Today, we've facilitated over 10,000 successful bookings
                  across 50+ countries, connecting thousands of clients with
                  their favorite celebrities. But our journey is just beginning.
                  We're committed to continuously innovating and expanding our
                  platform to serve more people worldwide.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-6 text-base font-semibold">
                  Our Mission
                  <ChevronRight className="ml-2 size-5" />
                </Button>
                <Button
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-base font-semibold bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right - Image */}
            <div className="relative" data-scroll-animate id="story-image">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/modern-office-collaboration.png"
                  alt="Premier Talent Agency team"
                  className="w-full h-96 sm:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-2 sm:-bottom-4 md:-bottom-6 -left-1 sm:-left-2 md:-left-4 lg:-left-6 bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl p-2 sm:p-3 md:p-4 lg:p-6 border border-zinc-200/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm">
                    <Award className="size-5 sm:size-6 md:size-7 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-900">
                      4 Years
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-500 font-medium">
                      Industry Leading
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center max-w-3xl mx-auto mb-16"
            data-scroll-animate
            id="values-header"
          >
            <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6 mx-auto">
              OUR VALUES
            </h4>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-6">
              What Drives <span className="text-amber-600">Us</span>
            </h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              Our core values guide every decision we make and every interaction
              we have with our clients and partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-emerald-100/50 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  data-scroll-animate
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                    <Icon className="size-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center max-w-3xl mx-auto mb-16"
            data-scroll-animate
            id="milestones-header"
          >
            <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6 mx-auto">
              OUR JOURNEY
            </h4>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-6">
              Key <span className="text-amber-600">Milestones</span>
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-emerald-600 to-amber-600" />

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row gap-8 items-center ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                  data-scroll-animate
                >
                  {/* Content */}
                  <div className="flex-1 md:text-right">
                    <div className="bg-white rounded-2xl p-6 border border-emerald-100/50 hover:border-emerald-300 transition-all duration-300">
                      <div className="text-3xl font-bold text-amber-600 mb-2">
                        {milestone.year}
                      </div>
                      <h3 className="text-xl font-bold text-emerald-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-zinc-600">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="hidden md:flex w-12 h-12 bg-emerald-600 rounded-full border-4 border-white shadow-lg items-center justify-center flex-shrink-0">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>

                  {/* Empty space for layout */}
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center max-w-3xl mx-auto mb-16"
            data-scroll-animate
            id="team-header"
          >
            <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6 mx-auto">
              OUR TEAM
            </h4>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-6">
              Meet the <span className="text-amber-600">Experts</span>
            </h2>
            <p className="text-lg text-zinc-600">
              Our diverse team brings decades of combined experience in
              entertainment, technology, and event management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-emerald-100/50 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:scale-105"
                data-scroll-animate
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-emerald-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-semibold text-amber-600 mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-zinc-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center max-w-3xl mx-auto mb-16"
            data-scroll-animate
            id="reviews-header"
          >
            <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6 mx-auto">
              CLIENT TESTIMONIALS
            </h4>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-6">
              What Our Clients <span className="text-amber-600">Say</span>
            </h2>
            <p className="text-lg text-zinc-600">
              Don't just take our word for it. Hear from thousands of satisfied
              clients who've used Premier Talent Agency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl p-8 border border-emerald-100/50 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 hover:scale-105"
                data-scroll-animate
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="size-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-zinc-700 mb-6 leading-relaxed italic">
                  "{review.text}"
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-emerald-100/50">
                  <img
                    src={review.image || "/placeholder.svg"}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-emerald-900">
                        {review.name}
                      </h4>
                      {review.verified && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600">{review.role}</p>
                    <p className="text-xs text-zinc-500">{review.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-emerald-700 to-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div data-scroll-animate>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                10K+
              </div>
              <p className="text-emerald-100 text-sm sm:text-base">
                Events Booked
              </p>
            </div>
            <div data-scroll-animate>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                500+
              </div>
              <p className="text-emerald-100 text-sm sm:text-base">
                Celebrities
              </p>
            </div>
            <div data-scroll-animate>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                50+
              </div>
              <p className="text-emerald-100 text-sm sm:text-base">Countries</p>
            </div>
            <div data-scroll-animate>
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                4.9★
              </div>
              <p className="text-emerald-100 text-sm sm:text-base">
                Average Rating
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          data-scroll-animate
          id="cta-section"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-900 mb-6">
            Ready to Book Your{" "}
            <span className="text-amber-600">Dream Celebrity?</span>
          </h2>
          <p className="text-lg text-zinc-600 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients and create unforgettable moments
            with your favorite celebrities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 sm:px-12 py-6 text-base font-semibold">
              Browse Celebrities
              <ChevronRight className="ml-2 size-5" />
            </Button>
            <Button
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 sm:px-12 py-6 text-base font-semibold bg-transparent"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <ChevronRight className="size-4 sm:size-5 group-hover:scale-110 transition-transform duration-300 rotate-90" />
        </button>
      )}
    </div>
  );
}
