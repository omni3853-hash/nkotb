"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  FaCrown,
  FaStar,
  FaCheck,
  FaTimes,
  FaCreditCard,
  FaTruck,
  FaShieldAlt,
  FaUsers,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UsersApi } from "@/api/users.api";
import {
  UserMembershipsApi,
  type MembershipDto,
  type MembershipPlanDto,
} from "@/api/admin-membership.client";
import {
  DeliveryOptionsApi,
  UserDeliveryRequestsApi,
  type DeliveryOptionDto,
} from "@/api/admin-membership.client";
import { AuthApi } from "@/api/auth.api";

import type { IUser } from "@/lib/models/user.model";
import type { CreateDeliveryRequestFormData } from "@/utils/schemas/schemas";

/* ----------------------------- utils ----------------------------- */
function fmtCurrency(
  n?: number,
  opts?: { currency?: string; locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
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
    const value = Number.isFinite(n as number) ? (n as number) : 0;
    const [i, d] = value.toFixed(Math.min(Math.max(minimumFractionDigits, 0), 20)).split(".");
    const withCommas = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const symbol = currency === "USD" ? "$" : "";
    return d ? `${symbol}${withCommas}.${d}` : `${symbol}${withCommas}`;
  }
}
const fmtDate = (d?: string | Date) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

/* -------------------------- form schemas -------------------------- */
const DeliveryFormSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(5),
  address: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(1),
  country: z.string().min(2),
  zipCode: z.string().min(2),
  specialInstructions: z.string().optional(),
  deliveryOptionId: z.string().min(1),
});
type DeliveryForm = z.infer<typeof DeliveryFormSchema>;

/* ============================== Page ============================== */
export default function MembershipPage() {
  /* ------------ boot data ------------ */
  const [user, setUser] = useState<IUser | null>(null);
  const [plans, setPlans] = useState<MembershipPlanDto[]>([]);
  const [mine, setMine] = useState<MembershipDto[]>([]);
  const [current, setCurrent] = useState<MembershipDto | null>(null);

  /* ------------ delivery options + modal state ------------ */
  const [options, setOptions] = useState<DeliveryOptionDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [needPassword, setNeedPassword] = useState(false);
  const [password, setPassword] = useState("");

  const [form, setForm] = useState<DeliveryForm>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    specialInstructions: "",
    deliveryOptionId: "",
  });

  /* ------------ load bootstrap ------------ */
  useEffect(() => {
    (async () => {
      try {
        const me = await UsersApi.me();
        setUser(me);

        // hydrate defaults from user profile
        setForm((prev) => ({
          ...prev,
          fullName: `${me.firstName ?? ""} ${me.lastName ?? ""}`.trim(),
          phone: me.phone || "",
          address: me.address?.street || "",
          city: me.address?.city || "",
          state: me.address?.state || "",
          country: me.address?.country || "",
          zipCode: me.address?.zipCode || "",
        }));

        const pl = await UserMembershipsApi.listPlans({ page: 1, limit: 12 });
        const activePlans = (pl.items ?? []).filter((p) => p.isActive);
        setPlans(activePlans);

        const my = await UserMembershipsApi.listMine({ page: 1, limit: 50 });
        const items = my.items ?? [];
        setMine(items);

        const active =
          (me as any).membership
            ? items.find((m) => String(m._id) === String((me as any).membership)) || null
            : items.find((m) => m.status === "ACTIVE") || null;

        setCurrent(active || null);

        const opt = await DeliveryOptionsApi.userList({ onlyActive: true, page: 1, limit: 50 });
        setOptions(opt.items ?? []);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "failed to load membership");
      }
    })();
  }, []);

  /* ------------ derived helpers ------------ */
  const planName = useMemo(() => {
    if (!current) return "No Membership";
    if (current.planSnapshot?.name) return current.planSnapshot.name;
    if (typeof current.planId === "object" && (current.planId as any).name) return (current.planId as any).name;
    return "Membership";
  }, [current]);

  const planPeriod = useMemo(() => {
    if (!current) return "";
    return current.planSnapshot?.period ?? "";
  }, [current]);

  const featureLines = useMemo(() => {
    const snap = current?.planSnapshot;
    const feats = (snap?.features ?? []).filter(Boolean);
    if (feats.length) return feats.slice(0, 3);
    const auto = current?.autoRenew ? "Auto-renew: ON" : "Auto-renew: OFF";
    const price =
      typeof current?.payment?.amount === "number"
        ? `Paid: ${fmtCurrency(current.payment.amount)}`
        : snap?.price
          ? `Plan Price: ${fmtCurrency(snap.price)}`
          : "Plan Price: —";
    return [auto, price];
  }, [current]);

  const selectedOption = useMemo(
    () => options.find((o) => o._id === form.deliveryOptionId) || null,
    [options, form.deliveryOptionId]
  );

  const balanceEnough = useMemo(() => {
    if (!user || !selectedOption) return true;
    return (user as any).balance >= selectedOption.price;
  }, [user, selectedOption]);

  /* ------------ actions ------------ */
  function setField<K extends keyof DeliveryForm>(key: K, value: DeliveryForm[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function submitDelivery() {
    const parsed = DeliveryFormSchema.safeParse(form);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || "please fill all required fields";
      toast.error(msg);
      return;
    }
    if (!selectedOption) {
      toast.error("select a delivery option");
      return;
    }

    // If balance is not enough, ask for password first
    if (!balanceEnough && !needPassword) {
      toast.error("Your balance is not sufficient for this delivery.");
      setNeedPassword(true);
      return;
    }

    // If we need a password, verify it
    if (!balanceEnough && needPassword) {
      if (!password.trim()) {
        toast.error("Please enter your password to continue.");
        return;
      }
      try {
        setVerifying(true);
        const res = await AuthApi.verifyCurrentPassword({ password });
        if (!res?.ok) {
          toast.error("Password is incorrect.");
          setVerifying(false);
          return;
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.message || e?.message || "Password verification failed");
        setVerifying(false);
        return;
      } finally {
        setVerifying(false);
      }
    }

    const payload: CreateDeliveryRequestFormData = {
      deliveryOption: selectedOption._id,
      deliveryAddress: {
        street: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        zipCode: form.zipCode,
      },
      specialInstruction: form.specialInstructions || undefined,
    };

    try {
      setSubmitting(true);
      const created = await UserDeliveryRequestsApi.create(payload);
      toast.success("Delivery request submitted");

      // optimistic balance deduction if price available
      if (selectedOption?.price && user) {
        setUser((u) => (u ? ({ ...u, balance: Math.max(0, (u as any).balance - selectedOption.price) } as any) : u));
      }

      // reset password state so they can request again
      setPassword("");
      setNeedPassword(false);

      // soft reset: keep address for convenience, only clear option + special note to allow multiple requests quickly
      setField("deliveryOptionId", "");
      setField("specialInstructions", "");

      // keep modal open to allow multiple deliveries, but you can close if you prefer:
      // setIsModalOpen(false);

      return created;
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to submit delivery request");
    } finally {
      setSubmitting(false);
    }
  }

  /* ============================== UI ============================== */
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col px-2 sm:px-3 bg-zinc-100">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Membership"
              subtitle="Choose the perfect membership plan and manage your card delivery"
              actionButton={{
                text: "View Billing",
                icon: <FaCreditCard className="w-4 h-4" />,
              }}
            />

            {/* ==== Current membership (NO upcoming bookings block) ==== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-7">
              <Card className="bg-white border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <FaCrown className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-emerald-900 text-sm sm:text-base">
                        Current Membership
                      </CardTitle>
                      <CardDescription className="text-emerald-700 text-xs sm:text-sm">
                        {current
                          ? `${planName}${planPeriod ? ` • ${planPeriod}` : ""}`
                          : "No active membership"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Benefits */}
                    <div className="bg-white/60 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FaStar className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-900">
                          {current ? "Your Benefits" : "Membership Benefits"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {featureLines.map((f, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {f}
                          </Badge>
                        ))}
                        {!featureLines.length && (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </div>
                    </div>

                    {/* Status Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-emerald-100/50">
                      <Badge
                        className={`${current?.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-zinc-200 text-zinc-800 border-zinc-300"
                          } w-fit`}
                      >
                        <FaCheckCircle className="w-3 h-3 mr-1" />
                        {current?.status ?? "INACTIVE"}
                      </Badge>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-emerald-600">
                          Started: {current ? fmtDate(current.startedAt) : "—"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Expires: {current ? fmtDate(current.expiresAt) : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ==== Delivery card (real options + balance + password flow) ==== */}
              <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FaTruck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-purple-900 text-sm sm:text-base">
                        Deliver Membership Card
                      </CardTitle>
                      <CardDescription className="text-purple-700 text-xs sm:text-sm">
                        Request a physical membership card to your address
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 justify-between h-full">
                  <p className="text-xs sm:text-sm text-purple-800">
                    Balance:{" "}
                    <strong>{fmtCurrency((user as any)?.balance)}</strong>
                  </p>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <FaTruck className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Request Delivery
                  </Button>

                  <Dialog open={isModalOpen} onOpenChange={(o) => {
                    setIsModalOpen(o);
                    if (!o) {
                      // soft reset transient states
                      setNeedPassword(false);
                      setPassword("");
                    }
                  }}>
                    <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl mx-2 sm:mx-4 md:mx-0 p-4 sm:p-6">
                      <DialogHeader className="pb-2">
                        <DialogTitle className="text-purple-900 text-base sm:text-lg font-bold flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <FaTruck className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                          </div>
                          <span className="text-sm sm:text-base">
                            Request Membership Card Delivery
                          </span>
                        </DialogTitle>
                        <DialogDescription className="text-purple-700 text-xs sm:text-sm">
                          Fill in your address and select a delivery option
                        </DialogDescription>
                      </DialogHeader>

                      {/* Address */}
                      <div className="space-y-4">
                        <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                          <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                            <FaUsers className="w-3 h-3" />
                            Contact & Address
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-purple-800">Full Name *</Label>
                              <Input
                                value={form.fullName}
                                onChange={(e) => setField("fullName", e.target.value)}
                                className="border-purple-200 focus:border-purple-500 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-purple-800">Phone *</Label>
                              <Input
                                value={form.phone}
                                onChange={(e) => setField("phone", e.target.value)}
                                className="border-purple-200 focus:border-purple-500 text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-3 mt-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-purple-800">Street Address *</Label>
                              <Input
                                value={form.address}
                                onChange={(e) => setField("address", e.target.value)}
                                className="border-purple-200 focus:border-purple-500 text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs text-purple-800">City *</Label>
                                <Input
                                  value={form.city}
                                  onChange={(e) => setField("city", e.target.value)}
                                  className="border-purple-200 focus:border-purple-500 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-purple-800">State *</Label>
                                <Input
                                  value={form.state}
                                  onChange={(e) => setField("state", e.target.value)}
                                  className="border-purple-200 focus:border-purple-500 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-purple-800">ZIP Code *</Label>
                                <Input
                                  value={form.zipCode}
                                  onChange={(e) => setField("zipCode", e.target.value)}
                                  className="border-purple-200 focus:border-purple-500 text-sm"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-purple-800">Country *</Label>
                              <Input
                                value={form.country}
                                onChange={(e) => setField("country", e.target.value)}
                                className="border-purple-200 focus:border-purple-500 text-sm"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs text-purple-800">Special Instructions</Label>
                              <Input
                                value={form.specialInstructions}
                                onChange={(e) => setField("specialInstructions", e.target.value)}
                                className="border-purple-200 focus:border-purple-500 text-sm"
                                placeholder="Any special delivery instructions (optional)"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Delivery option selection from API */}
                        <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                          <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                            Delivery Options
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {options.length === 0 && (
                              <p className="text-xs text-purple-700">No delivery options available.</p>
                            )}
                            {options.map((opt) => {
                              const selected = form.deliveryOptionId === opt._id;
                              return (
                                <div
                                  key={opt._id}
                                  onClick={() => setField("deliveryOptionId", opt._id)}
                                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selected ? "border-purple-600 bg-purple-600" : "border-purple-200 bg-white hover:border-purple-300"
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                      <p className={`text-sm font-medium ${selected ? "text-white" : "text-purple-900"} truncate`}>
                                        {opt.name}
                                      </p>
                                      <p className={`text-xs ${selected ? "text-purple-100" : "text-purple-700"} truncate`}>
                                        {opt.deliveryTime}
                                      </p>
                                    </div>
                                    <div className="text-right ml-2">
                                      <p className={`text-sm font-semibold ${selected ? "text-white" : "text-purple-900"}`}>
                                        {fmtCurrency(opt.price)}
                                      </p>
                                    </div>
                                  </div>
                                  {selected && (
                                    <p className={`mt-2 text-xs ${balanceEnough ? "text-green-100" : "text-amber-100"}`}>
                                      {balanceEnough
                                        ? "Your balance is sufficient."
                                        : "Balance not sufficient — password required to proceed."}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Password gate when insufficient */}
                          {needPassword && !balanceEnough && (
                            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                              <div className="flex items-start gap-2">
                                <FaExclamationTriangle className="mt-0.5 text-amber-600" />
                                <div className="flex-1">
                                  <p className="text-xs text-amber-800 mb-2">
                                    Your balance ({fmtCurrency((user as any)?.balance)}) is less than the selected delivery price{" "}
                                    ({fmtCurrency(selectedOption?.price)}). Enter your account password to authorize this request.
                                  </p>
                                  <Label className="text-xs text-amber-900">Password</Label>
                                  <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 border-amber-300 focus:border-amber-600 text-sm"
                                    placeholder="Enter your password to continue"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <DialogFooter className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-purple-300 text-purple-700"
                          onClick={() => {
                            setIsModalOpen(false);
                            setNeedPassword(false);
                            setPassword("");
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={submitDelivery}
                          disabled={submitting || verifying}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {submitting ? "Submitting..." : verifying ? "Verifying..." : "Submit Request"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            {/* ==== Plans (from API) ==== */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-7">
              {plans.map((tier) => {
                const isCurrent =
                  current &&
                  (current.planSnapshot?.name?.toLowerCase() === tier.name.toLowerCase() ||
                    (typeof current.planId === "object" && (current.planId as any)._id === tier._id) ||
                    (typeof current.planId === "string" && current.planId === tier._id));

                return (
                  <Card
                    key={tier._id}
                    className={`relative bg-white border-0 transition-all duration-200 hover:shadow-lg ${isCurrent ? "ring-2 ring-emerald-800/20 shadow-lg sm:scale-105" : "hover:shadow-md"
                      } ${tier.popular ? "bg-emerald-900 border-emerald-300" : ""}`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-emerald-500 text-white px-4 py-1">
                          <FaStar className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${tier.color || "bg-emerald-600"} mx-auto mb-3 flex items-center justify-center`}>
                        <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <CardTitle className={`text-lg sm:text-xl font-bold ${tier.popular ? "text-zinc-100" : "text-emerald-900"}`}>
                        {tier.name}
                      </CardTitle>
                      <CardDescription className={`text-xs sm:text-sm ${tier.popular ? "text-zinc-300" : "text-zinc-600"}`}>
                        {tier.description}
                      </CardDescription>
                      <div className="mt-3">
                        <span className={`text-2xl sm:text-3xl font-bold ${tier.popular ? "text-zinc-100" : "text-emerald-600"}`}>
                          {fmtCurrency(tier.price)}
                        </span>
                        <span className={`ml-1 text-xs sm:text-sm ${tier.popular ? "text-zinc-300" : "text-zinc-500"}`}>
                          /{tier.period.toLowerCase()}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h4 className={`font-medium flex items-center gap-2 text-xs sm:text-sm ${tier.popular ? "text-zinc-100" : "text-emerald-900"}`}>
                          <FaCheck className={`w-3 h-3 ${tier.popular ? "text-zinc-300" : "text-emerald-600"}`} />
                          What's Included
                        </h4>
                        <ul className="space-y-1.5">
                          {(tier.features ?? []).slice(0, 8).map((feature, idx) => (
                            <li
                              key={idx}
                              className={`flex items-start gap-2 text-xs ${tier.popular ? "text-zinc-200" : "text-zinc-700"}`}
                            >
                              <FaCheck className={`w-3 h-3 mt-0.5 flex-shrink-0 ${tier.popular ? "text-zinc-300" : "text-emerald-600"}`} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {!!(tier.limitations ?? []).length && (
                        <div className="space-y-2">
                          <h4 className={`font-medium flex items-center gap-2 text-xs sm:text-sm ${tier.popular ? "text-zinc-200" : "text-zinc-700"}`}>
                            <FaTimes className={`w-3 h-3 ${tier.popular ? "text-zinc-400" : "text-zinc-500"}`} />
                            Limitations
                          </h4>
                          <ul className="space-y-1.5">
                            {(tier.limitations ?? []).map((lim, idx) => (
                              <li
                                key={idx}
                                className={`flex items-start gap-2 text-xs ${tier.popular ? "text-zinc-300" : "text-zinc-500"}`}
                              >
                                <FaTimes className={`w-3 h-3 mt-0.5 flex-shrink-0 ${tier.popular ? "text-zinc-400" : "text-zinc-400"}`} />
                                {lim}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-3">
                        <Button
                          size="sm"
                          className={`w-full text-sm ${tier.popular
                              ? "bg-zinc-100 hover:bg-zinc-200 text-emerald-900"
                              : isCurrent
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-emerald-800 hover:bg-emerald-700 text-white"
                            }`}
                          onClick={async () => {
                            if (isCurrent) return;
                            try {
                              const created = await UserMembershipsApi.upgrade({
                                planId: tier._id,
                                autoRenew: true,
                                amount: tier.price,
                              } as any);
                              toast.success("Membership upgraded");
                              // refresh user/memberships
                              const me = await UsersApi.me();
                              setUser(me);
                              const my = await UserMembershipsApi.listMine({ page: 1, limit: 50 });
                              const items = my.items ?? [];
                              setMine(items);
                              const active =
                                (me as any).membership
                                  ? items.find((m) => String(m._id) === String((me as any).membership)) || null
                                  : items.find((m) => m.status === "ACTIVE") || null;
                              setCurrent(active || null);
                            } catch (e: any) {
                              toast.error(e?.response?.data?.message || e?.message || "failed to upgrade membership");
                            }
                          }}
                        >
                          {isCurrent ? "Current Plan" : "Choose Plan"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ==== Notes & Guidelines (kept) ==== */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <FaInfoCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-amber-900 text-sm sm:text-base">
                      Membership Guidelines & Notes
                    </CardTitle>
                    <CardDescription className="text-amber-700 text-xs sm:text-sm">
                      Important information about your membership
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-amber-900 flex items-center gap-2 text-sm sm:text-base">
                      <FaShieldAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                      Terms & Conditions
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-amber-800">
                      <li className="flex items-start gap-2">
                        <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Membership fees are billed in advance
                      </li>
                      <li className="flex items-start gap-2">
                        <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Cancellation requires 30 days’ notice
                      </li>
                      <li className="flex items-start gap-2">
                        <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Unused bookings do not roll over
                      </li>
                      <li className="flex items-start gap-2">
                        <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        All bookings subject to availability
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-amber-900 flex items-center gap-2 text-sm sm:text-base">
                      <FaExclamationTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Important Notes
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-amber-800">
                      <li className="flex items-start gap-2">
                        <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Activation is immediate upon payment
                      </li>
                      <li className="flex items-start gap-2">
                        <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Physical cards arrive in 5–7 business days
                      </li>
                      <li className="flex items-start gap-2">
                        <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Premium features unlock after first booking
                      </li>
                      <li className="flex items-start gap-2">
                        <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Contact support for any questions
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="opacity-0" />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
