"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FeaturedEventsCarousel } from "@/components/featured-events-carousel";
import { RecentTransactionsTable } from "@/components/recent-transactions-table";
import { OnboardingModal } from "@/components/onboarding-modal";
import {
  MapPin,
  PlusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import {
  CalendarIcon,
  UsersIcon,
  DollarSignIcon,
  ActivityIcon,
  ArrowUpRightIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  TicketIcon,
  CreditCardIcon,
  CheckCircle2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import data from "./data.json";
import { Button } from "@/components/ui/button";
import { MdContactless } from "react-icons/md";
import { BiSolidUserCircle } from "react-icons/bi";
import { BiSolidCheckCircle } from "react-icons/bi";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { useState, useEffect } from "react";

export default function Page() {
  const [activities] = useState([
    "John just booked Taylor Swift for a private concert",
    "Sarah purchased VIP tickets to Summer Music Festival",
    "Mike completed booking with Keanu Reeves",
    "Emma added $5,000 to her balance",
    "David saved Beyoncé to favorites",
    "Lisa booked Dwayne Johnson for a meet & greet",
    "Tom upgraded to Premium membership",
    "Anna purchased tickets to Tech Conference 2025",
    "Chris booked a video message from Chris Hemsworth",
    "Sophie joined the platform - Welcome!",
  ]);

  const [marqueePosition, setMarqueePosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarqueePosition((prev) => (prev <= -50 ? 0 : prev - 0.1));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  const [liveBookings, setLiveBookings] = useState(1247);
  const [activeUsers, setActiveUsers] = useState(8934);
  const [revenue, setRevenue] = useState(125840);
  const quickStats = [
    {
      label: "Total Bookings",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: TicketIcon,
    },
    {
      label: "Total Spent",
      value: "$87,500",
      change: "+8%",
      trend: "up",
      icon: DollarSignIcon,
    },
    {
      label: "Upcoming Events",
      value: "3",
      change: "0%",
      trend: "neutral",
      icon: CalendarIcon,
    },
    {
      label: "Saved Celebrities",
      value: "12",
      change: "+4",
      trend: "up",
      icon: StarIcon,
    },
  ];
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding (in a real app, this would check localStorage or API)
    const hasCompletedOnboarding = localStorage.getItem("onboarding-completed");
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("onboarding-completed", "true");
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div
          className={`flex flex-1 flex-col bg-zinc-100 transition-all duration-300 ${
            showOnboarding ? "onboarding-blur" : ""
          }`}
        >
          <div className="@container/main flex flex-1 flex-col gap-2 px-2 sm:px-3">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DynamicPageHeader
                title={
                  <>
                    <span className="text-zinc-500">Hello</span> John,
                  </>
                }
                subtitle="Today is Sunday, 10th October 2025"
                actionButton={{
                  text: "Add Balance",
                  icon: <PlusIcon className="size-4" />,
                }}
              />
              <div className="px-2 sm:px-4 lg:px-6">
                <div className="rounded-xl bg-white p-3 sm:p-4 overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs sm:text-sm text-zinc-600">
                        LIVE ACTIVITY
                      </span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div
                        className="flex gap-4 sm:gap-6 lg:gap-8 whitespace-nowrap"
                        style={{
                          transform: `translateX(${marqueePosition}%)`,
                          transition: "transform 0.02s linear",
                        }}
                      >
                        {[...activities, ...activities].map(
                          (activity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 sm:gap-2"
                            >
                              <ActivityIcon className="size-3 sm:size-4 text-emerald-900 shrink-0" />
                              <span className="text-xs sm:text-sm text-zinc-900">
                                {activity}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row mt-5 px-2 sm:px-4 lg:px-6 gap-4 lg:gap-3">
                <div className="w-full lg:min-w-lg border rounded-[22px] pb-4 pt-4 px-4 bg-zinc-900 flex flex-col justify-between">
                  <div className="flex  gap-x-2 justify-between">
                    <span className="text-emerald-300 h-fit bg-emerald-700/20 border border-emerald-300/20   text-[13px] w-fit rounded-full px-3 py-1 ">
                      PREMIUM MEMBER
                    </span>

                    <MdContactless className="text-zinc-500 text-5xl" />
                  </div>

                  <div className="px-2 mt-7">
                    <h2 className="text-zinc-300 text-xl sm:text-2xl lg:text-3xl font-bold break-all">
                      564-342-712-TRVSCTT
                    </h2>
                  </div>
                  <div className="flex items-center gap-x-4 sm:gap-x-8 lg:gap-x-14 mt-5">
                    <div className="px-2 flex-1">
                      <p className="text-zinc-500 text-xs">CARD HOLDER</p>
                      <h2 className="text-zinc-300 text-lg sm:text-2xl lg:text-3xl font-bold">
                        Robert Brown
                      </h2>
                    </div>

                    <div className="flex-shrink-0">
                      <p className="text-zinc-500 text-xs">EXPIRY</p>
                      <h2 className="text-zinc-300 text-lg sm:text-2xl lg:text-3xl font-bold">
                        12/27
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
                    <div className="px-2">
                      <p className="text-zinc-500 text-[13px]">BALANCE</p>
                      <h2 className="text-zinc-100 text-2xl sm:text-3xl lg:text-4xl font-bold">
                        $10,250.00
                      </h2>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-zinc-700/50 to-zinc-800/70 py-3 sm:py-5 px-6 sm:px-8 rounded-full text-zinc-100 text-[13px] flex items-center gap-2 w-full sm:w-auto"
                    >
                      <PlusIcon className="size-4" />
                      <span>Add Balance</span>
                    </Button>
                  </div>
                </div>

                <div className="w-full border-2 border-emerald-900 rounded-2xl bg-emerald-900 py-4 px-4 sm:px-6 flex flex-col justify-between">
                  <div>
                    <Badge className="bg-emerald-800 text-zinc-100 border-2 border-emerald-700 hover:bg-emerald-800 text-xs mb-4 sm:mb-6">
                      MEMBERSHIP STATUS
                    </Badge>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-zinc-100 mb-3 sm:mb-4">
                      Premium Active
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-100 mb-4 sm:mb-6">
                      Your premium membership gives you access to exclusive
                      celebrity bookings and priority support.
                    </p>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 text-zinc-100">
                      <CheckCircle2Icon className="size-3 sm:size-4" />
                      <span className="text-xs sm:text-sm">
                        Priority Booking
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-100">
                      <CheckCircle2Icon className="size-3 sm:size-4" />
                      <span className="text-xs sm:text-sm">
                        Exclusive Access
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-100">
                      <CheckCircle2Icon className="size-3 sm:size-4" />
                      <span className="text-xs sm:text-sm">24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-2 sm:px-4 lg:px-6">
                <div className="w-full rounded-2xl bg-white p-3 sm:p-4 lg:p-6 hover:border-emerald-900 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
                    <div className="relative w-full max-w-xs sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 rounded-xl overflow-hidden border-2 border-zinc-200 shrink-0 mx-auto lg:mx-0">
                      <img
                        src="/keanu-reeves-portrait.jpg"
                        alt="Keanu Reeves"
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-emerald-900 text-emerald-100 border-2 border-emerald-700 text-xs">
                        CONFIRMED
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900 mb-1 truncate">
                            Keanu Reeves
                          </h3>
                          <p className="text-xs sm:text-sm text-zinc-600">
                            MEET & GREET BOOKING
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-zinc-500 mb-1">
                            BOOKING PRICE
                          </p>
                          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900">
                            $5,000
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="size-3 sm:size-4 text-emerald-900 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-zinc-500">DATE</p>
                            <p className="text-xs sm:text-sm font-medium text-zinc-900 truncate">
                              Oct 15, 2025
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="size-3 sm:size-4 text-emerald-900 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-zinc-500">TIME</p>
                            <p className="text-xs sm:text-sm font-medium text-zinc-900 truncate">
                              2:00 PM
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                          <MapPinIcon className="size-3 sm:size-4 text-emerald-900 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-zinc-500">LOCATION</p>
                            <p className="text-xs sm:text-sm font-medium text-zinc-900 truncate">
                              Los Angeles, CA
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex mt-6 sm:mt-9 flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button className="flex-1 bg-emerald-900 hover:bg-emerald-800 py-4 sm:py-6 text-zinc-100 rounded-lg text-xs sm:text-sm">
                          View Booking Details
                        </Button>
                        <Button
                          variant="outline"
                          className="hover:border-emerald-900 text-emerald-900 rounded-lg py-4 sm:py-6 bg-transparent text-xs sm:text-sm"
                        >
                          Contact Support
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-2 sm:px-4 lg:px-6 flex flex-col lg:flex-row gap-4 lg:gap-7">
                <FeaturedEventsCarousel />
                <RecentTransactionsTable />
              </div>

              <div className="px-2 sm:px-4 lg:px-6"></div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </SidebarProvider>
  );
}
