"use client";

import { useEffect, useMemo, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
// import { FeaturedEventsCarousel } from "@/components/featured-events-carousel";
// import { RecentTransactionsTable } from "@/components/recent-transactions-table";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  CalendarIcon,
  DollarSignIcon,
  ActivityIcon,
  ClockIcon,
  MapPinIcon,
  StarIcon,
  TicketIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { MdContactless } from "react-icons/md";
import { toast } from "sonner";

import { UsersApi } from "@/api/users.api";
import { UserPaymentMethodsApi } from "@/api/payment-methods.api";
import {
  UserMembershipsApi,
  type MembershipDto,
  type MembershipPlanDto,
} from "@/api/admin-membership.client";
import type { IUser } from "@/lib/models/user.model";
import { useRouter } from "next/navigation";

/* ----------------------------- helpers ----------------------------- */
export function fmtCurrency(
  n?: number,
  opts?: {
    currency?: string;       // e.g. "USD", "NGN", "GBP", "EUR"
    locale?: string;         // e.g. "en-US", "en-NG" (undefined = user locale)
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
) {
  const {
    currency = "USD",
    locale,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = opts ?? {};

  try {
    return (n ?? 0).toLocaleString(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });
  } catch {
    // Safe manual fallback with commas
    const value = Number.isFinite(n as number) ? (n as number) : 0;
    const frac = Math.max(minimumFractionDigits, 0);
    const [intPart, decPart] = value.toFixed(Math.min(Math.max(frac, 0), 20)).split(".");
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const symbol = currencySymbol(currency);
    return decPart ? `${symbol} " " ${withCommas}.${decPart}` : `${symbol}${withCommas}`;
  }
}

function currencySymbol(code: string): string {
  switch (code.toUpperCase()) {
    case "USD": return "$";
    case "EUR": return "€";
    case "GBP": return "£";
    case "JPY": return "¥";
    case "CNY": return "¥";
    case "CAD": return "CA$";
    case "AUD": return "A$";
    default: return "";
  }
}

function fmtDate(d?: string | Date) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
const toId = (v: unknown) => (v ? String(v) : "—");

function maskId(id?: string | null) {
  if (!id) return "—";
  const s = String(id);
  if (s.length <= 8) return s;
  return `${s.slice(0, 4)}••••${s.slice(-4)}`;
}

/* --------------------------- skeletons --------------------------- */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-200 ${className}`} />;
}

function CardsRowSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row mt-5 px-2 sm:px-4 lg:px-6 gap-4 lg:gap-3">
      <div className="w-full lg:min-w-lg border rounded-[22px] pb-4 pt-4 px-4 bg-zinc-900">
        <div className="flex justify-between">
          <SkeletonBlock className="h-7 w-32 bg-zinc-700/60" />
          <SkeletonBlock className="h-10 w-10 rounded-full bg-zinc-700/60" />
        </div>
        <SkeletonBlock className="h-8 w-3/4 mt-6 bg-zinc-700/60" />
        <div className="flex items-center gap-x-14 mt-5">
          <div className="flex-1">
            <SkeletonBlock className="h-4 w-20 bg-zinc-700/60" />
            <SkeletonBlock className="h-8 w-2/3 mt-2 bg-zinc-700/60" />
          </div>
          <div className="flex-shrink-0">
            <SkeletonBlock className="h-4 w-16 bg-zinc-700/60" />
            <SkeletonBlock className="h-8 w-20 mt-2 bg-zinc-700/60" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            <SkeletonBlock className="h-4 w-20 bg-zinc-700/60" />
            <SkeletonBlock className="h-9 w-32 mt-2 bg-zinc-700/60" />
          </div>
          <SkeletonBlock className="h-10 w-36 rounded-full bg-zinc-700/60" />
        </div>
      </div>

      <div className="w-full border-2 border-emerald-900 rounded-2xl bg-emerald-900 py-4 px-4 sm:px-6">
        <SkeletonBlock className="h-6 w-40 bg-emerald-800" />
        <SkeletonBlock className="h-10 w-3/4 mt-4 bg-emerald-800" />
        <SkeletonBlock className="h-4 w-full mt-3 bg-emerald-800" />
        <div className="space-y-3 mt-4">
          <SkeletonBlock className="h-5 w-48 bg-emerald-800" />
          <SkeletonBlock className="h-5 w-48 bg-emerald-800" />
          <SkeletonBlock className="h-5 w-48 bg-emerald-800" />
        </div>
      </div>
    </div>
  );
}

function CelebrityCardSkeleton() {
  return (
    <div className="px-2 sm:px-4 lg:px-6">
      <div className="w-full rounded-2xl bg-white p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <SkeletonBlock className="w-full max-w-xs sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
              <SkeletonBlock className="h-8 w-48" />
              <SkeletonBlock className="h-7 w-24" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-12 w-full" />
              <SkeletonBlock className="h-12 w-full" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <SkeletonBlock className="h-11 w-full sm:w-44" />
              <SkeletonBlock className="h-11 w-full sm:w-44" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomRowSkeleton() {
  return (
    <div className="px-2 sm:px-4 lg:px-6 flex flex-col lg:flex-row gap-4 lg:gap-7">
      <SkeletonBlock className="h-56 w-full lg:w-1/2" />
      <SkeletonBlock className="h-56 w-full lg:w-1/2" />
    </div>
  );
}

/* ============================== Page ============================== */
export default function Page() {
  // ticker
  const [activities] = useState([
    "John just reserved Taylor Swift for a private event",
    "Sarah purchased VIP tickets to Summer Music Festival",
    "Mike completed a reservation with Keanu Reeves",
    "Emma added $5,000 to her balance",
    "David saved Beyoncé to favorites",
    "Lisa reserved Dwayne Johnson for a meet & greet",
    "Tom upgraded to Premium membership",
    "Anna purchased tickets to Tech Conference 2025",
    "Chris reserved a video message from Chris Hemsworth",
    "Sophie joined the platform - Welcome!",
    "Olivia reserved Rihanna for a private listening party",
    "Liam purchased front-row seats to Fashion Week",
    "Noah upgraded to Platinum membership",
    "Ava saved Drake to favorites",
    "Ethan added $1,200 to his balance",
    "Mia completed a reservation with Zendaya",
    "Lucas purchased VIP lounge access for Comic Con",
    "Chloe referred a friend and earned a $25 bonus",
    "Mason redeemed a promo code for 15% off",
    "Lily reserved Ed Sheeran for a virtual serenade",
    "Jack left a 5-star review for last night’s gala",
    "Aria joined the platform - Welcome!",
    "Leo saved Billie Eilish to favorites",
    "Nora secured backstage passes for IndieFest",
    "Henry upgraded to Annual Premium",
    "Isla added $750 to her balance",
    "Daniel completed a reservation with Tom Holland",
    "Ruby purchased meet & greet access for Adele",
    "Samuel enabled two-factor authentication",
    "Maya created a new wishlist: “Dream Guests”",
    "Sebastian reserved a Q&A with Robert Downey Jr.",
    "Ella purchased early-bird tickets to Startup Summit",
    "Aiden unlocked the “Super Fan” badge",
    "Hannah saved Cristiano Ronaldo to favorites",
    "Caleb added $2,000 to his balance",
    "Audrey secured VIP access to Gaming Expo",
    "Nathan upgraded to Creator Pro",
    "Layla completed a reservation with Oprah",
    "Julian subscribed to event alerts",
    "Zara redeemed a $50 loyalty credit",
    "Isaac saved LeBron James to favorites",
    "Penelope purchased two VIP passes for Art Basel",
    "Gabriel reserved a live AMA with Elon Musk",
    "Stella added $300 to her balance",
    "Anthony upgraded to Business Plus",
    "Violet completed a reservation with Margot Robbie",
    "Dylan purchased backstage tour passes",
    "Harper saved Selena Gomez to favorites",
    "Owen won a giveaway for Festival Weekend",
    "Sadie reserved a private workshop with Gordon Ramsay",
    "Aaron purchased VIP meet & greet for BTS",
    "Emilia added $1,000 to her balance",
    "Ryan upgraded to Lifetime Premium",
    "Ivy saved Taylor Swift to favorites",
    "Justin completed a reservation with Chris Evans",
    "Sienna purchased early-entry for Wellness Retreat",
    "Parker enabled instant notifications",
    "Eliza reserved a virtual concert with The Weeknd",
    "Mateo added $650 to his balance",
    "Poppy saved Lionel Messi to favorites",
    "Jayden redeemed a seasonal discount",
    "Lucia upgraded to Family Plan",
    "Kai secured front-row for Esports Championship",
    "Naomi completed a reservation with Zendaya",
    "Felix purchased VIP yacht party tickets",
    "Clara saved Doja Cat to favorites",
    "Roman added $420 to his balance",
    "Nina unlocked the “Trendsetter” badge",
    "Ezra reserved a masterclass with Hans Zimmer",
    "Bianca purchased red-carpet access to Film Premiere",
    "Theo saved Beyoncé to favorites",
    "Iris completed a reservation with Jason Momoa",
    "Miles upgraded to Premier Concierge",
    "Quinn added $900 to their balance",
    "Hazel secured VIP suite for Championship Final",
    "Riley redeemed a referral reward",
    "Ada purchased backstage lounge for Jazz Night",
    "Brody saved Dua Lipa to favorites",
    "Mae reserved a photo session with Priyanka Chopra",
    "Kian upgraded to Team Workspace",
    "Freya added $560 to her balance",
    "Zayn completed a reservation with Keanu Reeves",
    "Luna purchased priority access to Charity Auction",
    "Jasper saved Zendaya to favorites",
    "Esme redeemed a 20% loyalty boost",
    "Archer reserved a cameo from Chris Hemsworth",
    "Skye purchased all-access for Tech Week",
    "Rowan added $1,350 to their balance",
    "Daisy upgraded to VIP+",
    "Kara completed a reservation with Tom Hiddleston",
    "Flynn saved Rihanna to favorites",
    "Milan secured meet & greet with Dwayne Johnson",
    "Tess purchased VIP terrace for Sunset Gala",
    "Omar added $480 to his balance",
    "Nova unlocked the “Early Bird” badge",
    "Ariel reserved a backstage Q&A with Adele",
    "Kylie purchased two VIP brunch passes",
    "Reid saved Billie Eilish to favorites",
    "Zoe completed a reservation with Chris Pratt",
    "Cody upgraded to Event Producer plan",
    "Serena added $2,500 to her balance",
    "Hugo redeemed a gift credit",
    "Mabel secured VIP balcony for Opera Night",
    "Atlas purchased platinum lounge for Startup Night"
  ]);
  const [marqueePosition, setMarqueePosition] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMarqueePosition((p) => (p <= -50 ? 0 : p - 0.1)), 20);
    return () => clearInterval(t);
  }, []);

  // data
  const [user, setUser] = useState<IUser | null>(null);
  const [myMemberships, setMyMemberships] = useState<MembershipDto[]>([]);
  const [currentMembership, setCurrentMembership] = useState<MembershipDto | null>(null);
  const [activeMethods, setActiveMethods] = useState<any[]>([]);
  const [plans, setPlans] = useState<MembershipPlanDto[]>([]);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null); // null = deciding
  const [bootstrapping, setBootstrapping] = useState(true);
  const router = useRouter()

  // derive plan name seamlessly from either planSnapshot or planId
  const planNameOf = (m?: MembershipDto | null) => {
    if (!m) return null;
    if (m.planSnapshot?.name) return m.planSnapshot.name;
    if (m.planId && typeof m.planId === "object" && (m.planId as any).name) {
      return (m.planId as any).name as string;
    }
    return "Membership";
  };

  const planPeriodOf = (m?: MembershipDto | null) => {
    if (!m) return null;
    if (m.planSnapshot?.period) return m.planSnapshot.period;
    return null;
  };

  const defaultPlan = useMemo(() => {
    if (!plans.length) return null;
    const popular = plans.find((p) => p.popular && p.isActive);
    return popular ?? plans.find((p) => p.isActive) ?? plans[0];
  }, [plans]);

  // QuickStats — only Total Spent is dynamic
  const quickStats = [
    { label: "Total Reservations", value: "24", change: "+12%", trend: "up", icon: TicketIcon },
    { label: "Total Spent", value: fmtCurrency((user as any)?.totalSpent), change: "+8%", trend: "up", icon: DollarSignIcon },
    { label: "Upcoming Events", value: "3", change: "0%", trend: "neutral", icon: CalendarIcon },
    { label: "Saved Celebrities", value: "12", change: "+4", trend: "up", icon: StarIcon },
  ];

  // load
  useEffect(() => {
    (async () => {
      try {
        setBootstrapping(true);

        // 1) user
        const me = await UsersApi.me();
        setUser(me);

        // 2) memberships (mine)
        const mine = await UserMembershipsApi.listMine({ page: 1, limit: 50 });
        const mineItems = mine.items ?? [];
        setMyMemberships(mineItems);

        // 3) current membership
        let matched: MembershipDto | null = null;
        if ((me as any).membership) {
          matched = mineItems.find((m) => String(m._id) === String((me as any).membership)) || null;
        } else {
          matched = mineItems.find((m) => m.status === "ACTIVE") || null;
        }
        setCurrentMembership(matched);

        // 4) payment methods
        const methods = await UserPaymentMethodsApi.listActive({ page: 1, limit: 50 });
        setActiveMethods(methods.items ?? []);

        // 5) public plans
        const planRes = await UserMembershipsApi.listPlans({ page: 1, limit: 10 });
        const activePlans = (planRes.items ?? []).filter((p) => p.isActive);
        setPlans(activePlans);

        // 6) decide onboarding (must choose a plan if no active membership)
        setShowOnboarding(!matched);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to load dashboard");
        // on error, don't block UI
        setShowOnboarding(false);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      const me = await UsersApi.me();
      setUser(me);
      const mine = await UserMembershipsApi.listMine({ page: 1, limit: 50 });
      const items = mine.items ?? [];
      setMyMemberships(items);
      const matched =
        (me as any).membership
          ? items.find((m) => String(m._id) === String((me as any).membership)) || null
          : items.find((m) => m.status === "ACTIVE") || null;
      setCurrentMembership(matched);
    } catch { /* noop */ }
    setShowOnboarding(false);
  };

  // derived display values
  const cardHolderName = useMemo(() => {
    if (!user) return "—";
    const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return full || (user as any).email || "—";
  }, [user]);

  const membershipLabel = useMemo(() => {
    const name = planNameOf(currentMembership);
    const period = planPeriodOf(currentMembership);
    return name ? `${name}${period ? ` • ${period}` : ""}` : "Guest";
  }, [currentMembership]);

  const expiryText = useMemo(
    () => (currentMembership ? fmtDate(currentMembership.expiresAt) : "—"),
    [currentMembership]
  );

  // Card “number”: membership id if active, else user id
  const cardPseudoNumber = useMemo(() => {
    if (currentMembership && currentMembership.status === "ACTIVE") {
      return toId(currentMembership._id);
    }
    return toId(user?._id);
  }, [currentMembership, user?._id]);

  // Right-card bullets — use real plan features or show membership facts
  const featureLines = useMemo(() => {
    const snap = currentMembership?.planSnapshot;
    const features = (snap?.features ?? []).filter(Boolean);
    if (features.length >= 3) {
      return features.slice(0, 3);
    }
    // fall back to informative lines without changing layout
    const autoRenew = currentMembership?.autoRenew ? "Auto-renew: ON" : "Auto-renew: OFF";
    const price =
      typeof currentMembership?.payment?.amount === "number"
        ? `Paid: ${fmtCurrency(currentMembership?.payment?.amount)}`
        : snap?.price
          ? `Plan Price: ${fmtCurrency(snap.price)}`
          : "Plan Price: —";
    return [autoRenew, price];
  }, [currentMembership]);

  const decidingOnboarding = showOnboarding === null || bootstrapping;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader isUser title="Dashboard" />
        <div className={`flex flex-1 flex-col bg-zinc-100 transition-all duration-300 ${decidingOnboarding ? "onboarding-blur" : ""}`}>
          <div className="@container/main flex flex-1 flex-col gap-2 px-2 sm:px-3">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DynamicPageHeader
                title={
                  <>
                    <span className="text-zinc-500">Hello</span>{" "}
                    {user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || (user as any).email : "—"},
                  </>
                }
                subtitle={new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                actionButton={{
                  text: "Add Balance",
                  icon: <PlusIcon className="size-4" />,
                  onClick: () => router.push("/user-dashboard/deposit")
                }}
              />

              {/* LIVE ACTIVITY */}
              <div className="px-2 sm:px-4 lg:px-6">
                <div className="rounded-xl bg-white p-3 sm:p-4 overflow-hidden">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs sm:text-sm text-zinc-600">LIVE ACTIVITY</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div
                        className="flex gap-4 sm:gap-6 lg:gap-8 whitespace-nowrap"
                        style={{ transform: `translateX(${marqueePosition}%)`, transition: "transform 0.02s linear" }}
                      >
                        {[...activities, ...activities].map((activity, index) => (
                          <div key={index} className="flex items-center gap-1 sm:gap-2">
                            <ActivityIcon className="size-3 sm:size-4 text-emerald-900 shrink-0" />
                            <span className="text-xs sm:text-sm text-zinc-900">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONTENT OR SKELETON */}
              {decidingOnboarding ? (
                <>
                  <CardsRowSkeleton />
                  <CelebrityCardSkeleton />
                  <BottomRowSkeleton />
                </>
              ) : (
                <>
                  {/* CARDS ROW */}
                  <div className="flex flex-col md:flex-row mt-5 px-2 sm:px-4 lg:px-6 gap-4 md:gap-3">
                    {/* Left card */}
                    <div className="w-full md:min-w-lg border rounded-[22px] pb-4 pt-4 px-3 sm:px-4 bg-zinc-900 flex flex-col justify-between">
                      <div className="flex gap-x-2 justify-between">
                        <span className="text-emerald-300 h-fit bg-emerald-700/20 border border-emerald-300/20 text-[13px] w-fit rounded-full px-3 py-1">
                          {membershipLabel}
                        </span>
                        <MdContactless className="text-zinc-500 text-5xl" />
                      </div>

                      <div className="px-2 mt-5 sm:mt-7">
                        <h2 className="text-zinc-300 text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold break-all">
                          {cardPseudoNumber}
                        </h2>
                      </div>

                      <div className="flex items-center gap-x-3 sm:gap-x-4 md:gap-x-8 lg:gap-x-14 mt-4 sm:mt-5">
                        <div className="px-2 flex-1 min-w-0">
                          <p className="text-zinc-500 text-xs">CARD HOLDER</p>
                          <h2 className="text-zinc-300 text-base sm:text-lg md:text-2xl lg:text-3xl font-bold truncate">{cardHolderName}</h2>
                        </div>

                        <div className="flex-shrink-0">
                          <p className="text-zinc-500 text-xs">EXPIRY</p>
                          <h2 className="text-zinc-300 text-base sm:text-lg md:text-2xl lg:text-3xl font-bold">
                            {currentMembership
                              ? new Date(currentMembership.expiresAt).toLocaleDateString(undefined, { month: "2-digit", year: "2-digit" })
                              : "—"}
                          </h2>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
                        <div className="px-2 min-w-0 flex-1">
                          <p className="text-zinc-500 text-[11px] sm:text-[13px]">BALANCE</p>
                          <h2 className="text-zinc-100 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold truncate">
                            {fmtCurrency((user as any)?.balance)}
                          </h2>
                        </div>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-zinc-700/50 to-zinc-800/70 py-2 sm:py-3 md:py-5 px-4 sm:px-6 md:px-8 rounded-full text-zinc-100 text-[11px] sm:text-[13px] flex items-center gap-2 w-full sm:w-auto shrink-0"
                          onClick={() => router.push("/user-dashboard/deposit")}
                        >
                          <PlusIcon className="size-3 sm:size-4" />
                          <span>Add Balance</span>
                        </Button>
                      </div>
                    </div>

                    {/* Right card */}
                    <div className="w-full border-2 border-emerald-900 rounded-2xl bg-emerald-900 py-3 sm:py-4 px-3 sm:px-4 md:px-6 flex flex-col justify-between">
                      <div>
                        <Badge className="bg-emerald-800 text-zinc-100 border-2 border-emerald-700 hover:bg-emerald-800 text-[10px] sm:text-xs mb-3 sm:mb-4 md:mb-6">
                          MEMBERSHIP STATUS
                        </Badge>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-zinc-100 mb-2 sm:mb-3 md:mb-4 break-words">
                          {currentMembership
                            ? `${planNameOf(currentMembership)} • ${currentMembership.status}`
                            : "No Membership"}
                        </p>
                        <p className="text-[10px] sm:text-xs md:text-sm text-zinc-100 mb-2 leading-relaxed">
                          {currentMembership
                            ? `Started: ${fmtDate(currentMembership.startedAt)} • Expires: ${fmtDate(currentMembership.expiresAt)}`
                            : "Activate a membership to access exclusive reservations and priority support."}
                        </p>
                      </div>

                      <div className="space-y-2 sm:space-y-3 mt-4">
                        {featureLines.map((line, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-zinc-100">
                            <CheckCircle2Icon className="size-3 sm:size-4" />
                            <span className="text-xs sm:text-sm">{line}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Celebrity highlight (unchanged visuals) */}
                  {/* <div className="px-2 sm:px-4 lg:px-6">
                    <div className="w-full rounded-2xl bg-white p-3 sm:p-4 lg:p-6 hover:border-emerald-900 transition-colors">
                      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
                        <div className="relative w-full max-w-xs sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 rounded-xl overflow-hidden border-2 border-zinc-200 shrink-0 mx-auto lg:mx-0">
                          <img src="/keanu-reeves-portrait.jpg" alt="Keanu Reeves" className="w-full h-full object-cover" />
                          <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-emerald-900 text-emerald-100 border-2 border-emerald-700 text-xs">
                            CONFIRMED
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900 mb-1 truncate">Keanu Reeves</h3>
                              <p className="text-xs sm:text-sm text-zinc-600">MEET & GREET BOOKING</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-xs text-zinc-500 mb-1">PRICE</p>
                              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-zinc-900">$5,000</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="size-3 sm:size-4 text-emerald-900 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-zinc-500">DATE</p>
                                <p className="text-xs sm:text-sm font-medium text-zinc-900 truncate">Oct 15, 2025</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClockIcon className="size-3 sm:size-4 text-emerald-900 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-zinc-500">TIME</p>
                                <p className="text-xs sm:text-sm font-medium text-zinc-900 truncate">2:00 PM</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                              <MapPinIcon className="size-3 sm:size-4 text-emerald-900 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-zinc-500">LOCATION</p>
                                <p className="text-xs sm:text-sm font-medium text-zinc-900 truncate">Los Angeles, CA</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex mt-6 sm:mt-9 flex-col sm:flex-row gap-2 sm:gap-3">
                            <Button className="flex-1 bg-emerald-900 hover:bg-emerald-800 py-4 sm:py-6 text-zinc-100 rounded-lg text-xs sm:text-sm">
                              View Reservation Details
                            </Button>
                            <Button variant="outline" className="hover:border-emerald-900 text-emerald-900 rounded-lg py-4 sm:py-6 bg-transparent text-xs sm:text-sm">
                              Contact Support
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* Keep these exactly as-is */}
                  {/* <div className="px-2 sm:px-4 lg:px-6 flex flex-col lg:flex-row gap-4 lg:gap-7">
                    <FeaturedEventsCarousel />
                    <RecentTransactionsTable />
                  </div> */}
                </>
              )}

              <div className="px-2 sm:px-4 lg:px-6" />
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* ONBOARDING — user must choose a plan */}
      <OnboardingModal
        isOpen={!!showOnboarding}
        onComplete={handleOnboardingComplete}
        plans={plans}
        paymentMethods={activeMethods}
        onCreate={async ({ planId, paymentMethodId, proofOfPayment, autoRenew, amount }) => {
          try {
            const payload = {
              planId,
              paymentMethodId,
              proofOfPayment,
              autoRenew: !!autoRenew,
              amount,
            };
            const created = await UserMembershipsApi.create(payload as any);
            toast.success("Membership created");
            await handleOnboardingComplete();
            return created;
          } catch (e: any) {
            toast.error(e?.response?.data?.message || e?.message || "Failed to create membership");
            throw e;
          }
        }}
      />
    </SidebarProvider>
  );
}
