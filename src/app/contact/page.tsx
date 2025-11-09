"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { FaLock } from "react-icons/fa";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set()
  );

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

  // Intersection observer for scroll animations
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);

      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    }, 1500);
  };

  const contactCards = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email and we'll respond within 2 hours",
      details: "support@premiertalentagency.com",
      color: "from-emerald-100 to-emerald-200",
      textColor: "text-emerald-600",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our team during business hours",
      details: "+1 (555) 123-4567",
      color: "from-amber-100 to-amber-200",
      textColor: "text-amber-600",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come visit our headquarters",
      details: "123 Celebrity Lane, Los Angeles, CA 90001",
      color: "from-purple-100 to-purple-200",
      textColor: "text-purple-600",
    },
    {
      icon: Clock,
      title: "Business Hours",
      description: "We're available to help you",
      details: "Mon - Fri: 9:00 AM - 6:00 PM PST",
      color: "from-blue-100 to-blue-200",
      textColor: "text-blue-600",
    },
  ];

  return (
    <div className="bg-white">
      <Header />
      {/* Hero Section */}
      <section className="relative isolate pt-14 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div
            className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
            data-scroll-animate
            id="hero-section"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-emerald-900 mb-4 sm:mb-6">
              Get in <span className="text-amber-600">Touch</span> With Us
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Have questions about booking a celebrity? Need assistance with an
              event? Our dedicated team is here to help you create an
              unforgettable experience. Reach out to us today!
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16 sm:mb-20">
            {contactCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className="group"
                  data-scroll-animate
                  id={`contact-card-${index}`}
                >
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-emerald-100/50 hover:bg-white/80 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg h-full">
                    <div
                      className={`w-12 sm:w-14 h-12 sm:h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`size-6 sm:size-7 ${card.textColor}`} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-emerald-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 mb-4">
                      {card.description}
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-emerald-600">
                      {card.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Form and Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Contact Form */}
            <div data-scroll-animate id="contact-form-section">
              <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 rounded-2xl p-6 sm:p-8 lg:p-10 border border-emerald-100/50">
                <h2 className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-sm sm:text-base text-zinc-600 mb-8">
                  Fill out the form below and we'll get back to you as soon as
                  possible.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 sm:space-y-6"
                >
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-emerald-900 mb-2"
                    >
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 bg-white/50 focus:bg-white focus:border-emerald-400 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-emerald-900 mb-2"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 bg-white/50 focus:bg-white focus:border-emerald-400 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-emerald-900 mb-2"
                    >
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 bg-white/50 focus:bg-white focus:border-emerald-400 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-emerald-900 mb-2"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Celebrity Booking Inquiry"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 bg-white/50 focus:bg-white focus:border-emerald-400 focus:outline-none transition-all duration-300"
                    />
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-emerald-900 mb-2"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your event and what you're looking for..."
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-lg border border-emerald-200 bg-white/50 focus:bg-white focus:border-emerald-400 focus:outline-none transition-all duration-300 resize-none"
                    />
                  </div>

                  {/* Submit Status Messages */}
                  {submitStatus === "success" && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                      <CheckCircle className="size-5 text-emerald-600 flex-shrink-0" />
                      <p className="text-sm text-emerald-700">
                        Thank you! We've received your message and will get back
                        to you soon.
                      </p>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                      <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700">
                        Something went wrong. Please try again later.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="size-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Additional Info */}
            <div
              className="space-y-6 sm:space-y-8"
              data-scroll-animate
              id="contact-info-section"
            >
              {/* Response Time */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 sm:p-8 border border-amber-100/50">
                <h3 className="text-lg sm:text-xl font-bold text-amber-900 mb-3">
                  Response Time
                </h3>
                <p className="text-sm sm:text-base text-amber-800 mb-4">
                  We pride ourselves on quick response times. Here's what to
                  expect:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Email: 2 hours
                      </p>
                      <p className="text-xs text-amber-700">
                        During business hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Phone: Immediate
                      </p>
                      <p className="text-xs text-amber-700">
                        Mon-Fri, 9 AM - 6 PM PST
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">
                        Live Chat: 15 minutes
                      </p>
                      <p className="text-xs text-amber-700">
                        24/7 availability
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-emerald-700 to-emerald-800 rounded-2xl p-6 sm:p-8 text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-3">
                  Ready to Book?
                </h3>
                <p className="text-sm sm:text-base text-emerald-100 mb-6">
                  Browse our celebrity database and start planning your
                  unforgettable event today.
                </p>
                <Button className="w-full bg-white text-emerald-700 hover:bg-emerald-50 font-semibold transition-all duration-300">
                  Browse Celebrities
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <svg
            className="size-4 sm:size-5 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
