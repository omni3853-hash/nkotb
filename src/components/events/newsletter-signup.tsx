"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Bell,
  Calendar,
  Star,
  Gift,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Users,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";

const benefits = [
  {
    icon: Bell,
    title: "Early Access",
    description:
      "Be the first to know about new events and exclusive pre-sales",
  },
  {
    icon: Gift,
    title: "Exclusive Deals",
    description:
      "Get special discounts and offers only available to subscribers",
  },
  {
    icon: Star,
    title: "Personalized Recommendations",
    description: "Receive curated event suggestions based on your interests",
  },
  {
    icon: Calendar,
    title: "Event Reminders",
    description: "Never miss an event with smart notifications and reminders",
  },
];

const categories = [
  "Music",
  "Technology",
  "Art",
  "Food & Drink",
  "Entertainment",
  "Sports & Fitness",
  "Business",
  "Education",
];

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setEmailError("");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      setEmail("");
      setSelectedCategories([]);
    }, 2000);
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (isSubscribed) {
    return (
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-amber-50/20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-amber-50/30">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="size-10 text-emerald-600" />
              </div>

              <h2 className="text-3xl font-bold text-emerald-900 mb-4">
                Welcome to Our Community! 🎉
              </h2>

              <p className="text-lg text-zinc-600 mb-8 max-w-2xl mx-auto">
                Thank you for subscribing! You'll now receive personalized event
                recommendations, exclusive deals, and early access to the best
                events in your area.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="size-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-1">
                    Check Your Email
                  </h3>
                  <p className="text-sm text-zinc-600">
                    We've sent you a confirmation email
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="size-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-1">
                    Get Notifications
                  </h3>
                  <p className="text-sm text-zinc-600">
                    Stay updated with new events
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Gift className="size-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-1">
                    Exclusive Deals
                  </h3>
                  <p className="text-sm text-zinc-600">
                    Access to subscriber-only offers
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsSubscribed(false)}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                Subscribe Another Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-amber-50/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="mb-8">
              <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full font-semibold text-emerald-600 mb-6">
                STAY CONNECTED
              </h4>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-3">
                Never Miss an <br />
                <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                  Amazing Event
                </span>
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed">
                Join thousands of event enthusiasts who get personalized
                recommendations, exclusive deals, and early access to the best
                experiences in their city.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white/60 rounded-xl border border-zinc-200/50"
                  >
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <IconComponent className="size-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-zinc-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-900 mb-1">
                  10K+
                </div>
                <div className="text-sm text-zinc-600">Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-900 mb-1">
                  95%
                </div>
                <div className="text-sm text-zinc-600">Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-900 mb-1">
                  24/7
                </div>
                <div className="text-sm text-zinc-600">Updates</div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <Card className="border-2 border-emerald-900/20 bg-white shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="size-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-900 mb-2">
                    Join Our Newsletter
                  </h3>
                  <p className="text-zinc-600">
                    Get personalized event recommendations delivered to your
                    inbox
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-zinc-900 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-zinc-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError("");
                        }}
                        placeholder="Enter your email address"
                        className={`pl-10 ${
                          emailError ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-600 mt-1">{emailError}</p>
                    )}
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-3">
                      Event Categories (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={category}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() =>
                              handleCategoryToggle(category)
                            }
                          />
                          <label
                            htmlFor={category}
                            className="text-sm text-zinc-700 cursor-pointer"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      Select your interests to receive personalized
                      recommendations
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white py-3 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-5 mr-2" />
                        Subscribe Now
                        <ArrowRight className="size-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Privacy Note */}
                  <p className="text-xs text-zinc-500 text-center">
                    We respect your privacy. Unsubscribe at any time. No spam,
                    ever.
                  </p>
                </form>

                {/* Social Proof */}
                <div className="mt-8 pt-6 border-t border-zinc-200">
                  <div className="flex items-center justify-center gap-4 text-sm text-zinc-600">
                    <div className="flex items-center gap-1">
                      <Users className="size-4" />
                      <span>10,000+ subscribers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="size-4" />
                      <span>Growing daily</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="size-4" />
                      <span>Loved by users</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
