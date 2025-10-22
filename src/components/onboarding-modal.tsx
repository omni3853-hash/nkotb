"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Shield,
  CreditCard,
  Copy,
  Star,
  Users,
  Zap,
  Crown,
  Smartphone,
  Building2,
  DollarSign,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MembershipPlanDto } from "@/api/admin-membership.client";
import type { IPaymentMethod } from "@/lib/models/payment-method.model";
import { AccountType } from "@/lib/enums/account.enum";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";

// Extended (non-breaking) fields we read from payment methods if available:
// - fee?: number (percent)
// - exchangeRateUsd?: number (USD per 1 crypto unit)

type OnboardingStep = "welcome" | "terms" | "plan" | "payment" | "success";

export interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  plans: MembershipPlanDto[];
  paymentMethods?: IPaymentMethod[];
  onCreate?: (dto: {
    planId: string;
    paymentMethodId?: string;
    proofOfPayment?: string; // URL
    autoRenew?: boolean;
    amount?: number; // USD amount captured
  }) => Promise<any>;
}

export function OnboardingModal({
  isOpen,
  onComplete,
  plans = [],
  paymentMethods = [],
  onCreate,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // plan + method selections
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);
  const selectedPlan = useMemo(
    () => plans.find((p) => String(p._id) === String(selectedPlanId)),
    [plans, selectedPlanId]
  );

  const [selectedMethodId, setSelectedMethodId] = useState<string | undefined>(undefined);
  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => String(m._id) === String(selectedMethodId)),
    [paymentMethods, selectedMethodId]
  );

  // proof upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPct, setUploadPct] = useState<number>(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [autoRenew, setAutoRenew] = useState(false);

  // payment confirmations
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // crypto exchange rate (USD per 1 unit) – try to read from method, allow override
  const defaultRateFromMethod = (selectedMethod as any)?.exchangeRateUsd as number | undefined;
  const [rateUsd, setRateUsd] = useState<number | "">(defaultRateFromMethod ?? "");

  const steps = [
    { id: "welcome", title: "Welcome", icon: Star },
    { id: "terms", title: "Terms", icon: Shield },
    { id: "plan", title: "Choose Plan", icon: Crown },
    { id: "payment", title: "Payment", icon: CreditCard },
    { id: "success", title: "Complete", icon: CheckCircle },
  ] as const;

  const crypto = useMemo(() => paymentMethods.filter((m) => m.type === AccountType.CRYPTO_WALLET), [paymentMethods]);
  const bank = useMemo(() => paymentMethods.filter((m) => m.type === AccountType.BANK_ACCOUNT), [paymentMethods]);
  const mobile = useMemo(() => paymentMethods.filter((m) => m.type === AccountType.MOBILE_PAYMENT), [paymentMethods]);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  async function ensureUploaded(): Promise<string> {
    if (!uploadedFile) throw new Error("Please attach a proof of payment file.");
    if (uploadedUrl) return uploadedUrl; // already uploaded

    setUploading(true);
    setUploadPct(0);
    try {
      const { url } = await uploadToCloudinary(uploadedFile, {
        onProgress: (pct) => setUploadPct(pct),
      });
      setUploadedUrl(url);
      toast.success("Proof uploaded");
      return url;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload proof");
      throw err;
    } finally {
      setUploading(false);
    }
  }

  // ---------- pricing helpers (USD & crypto conversions with fee) ----------
  const planPriceUsd = selectedPlan?.price ?? 0;
  const feePct = (selectedMethod as any)?.fee ?? 0;
  const usdTotal = useMemo(() => +(planPriceUsd * (1 + (feePct || 0) / 100)).toFixed(2), [planPriceUsd, feePct]);

  const isCrypto = selectedMethod?.type === AccountType.CRYPTO_WALLET;
  const effectiveRate = isCrypto ? Number(rateUsd || 0) : 0;
  const cryptoAmount = useMemo(() => {
    if (!isCrypto || !usdTotal || !effectiveRate) return 0;
    return +(usdTotal / effectiveRate).toFixed(6);
  }, [isCrypto, usdTotal, effectiveRate]);

  function handleNext() {
    switch (currentStep) {
      case "welcome":
        setCurrentStep("terms");
        break;
      case "terms":
        if (termsAccepted) setCurrentStep("plan");
        break;
      case "plan":
        if (selectedPlanId) setCurrentStep("payment");
        break;
      case "payment":
        void completeCreate();
        break;
      case "success":
        onComplete();
        break;
    }
  }

  async function completeCreate() {
    if (!selectedPlanId || !onCreate) return;
    if (!selectedMethodId) {
      toast.message("Select a payment method.");
      return;
    }
    if (!paymentConfirmed) {
      toast.message("Please confirm you’ve sent the payment and attached a proof.");
      return;
    }
    try {
      setCreating(true);
      const proofUrl = await ensureUploaded();
      await onCreate({
        planId: selectedPlanId,
        paymentMethodId: selectedMethodId,
        proofOfPayment: proofUrl,
        autoRenew,
        amount: usdTotal,
      });
      setCurrentStep("success");
    } finally {
      setCreating(false);
    }
  }

  function handleBack() {
    switch (currentStep) {
      case "terms":
        setCurrentStep("welcome");
        break;
      case "plan":
        setCurrentStep("terms");
        break;
      case "payment":
        setCurrentStep("plan");
        break;
      case "success":
        setCurrentStep("payment");
        break;
    }
  }

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case "welcome":
        return true;
      case "terms":
        return termsAccepted;
      case "plan":
        return !!selectedPlanId;
      case "payment": {
        const hasProof = uploadedFile || uploadedUrl;
        const hasMethod = !!selectedMethodId;
        const cryptoOk = !isCrypto || (!!effectiveRate && effectiveRate > 0);
        return !!selectedPlanId && hasMethod && hasProof && paymentConfirmed && cryptoOk && !creating && !uploading;
      }
      case "success":
        return true;
    }
  }, [
    currentStep,
    termsAccepted,
    selectedPlanId,
    selectedMethodId,
    uploadedFile,
    uploadedUrl,
    paymentConfirmed,
    creating,
    uploading,
    isCrypto,
    effectiveRate,
  ]);

  function getButtonText() {
    switch (currentStep) {
      case "welcome":
        return "Get Started";
      case "terms":
        return "Accept & Continue";
      case "plan":
        return "Continue";
      case "payment":
        return creating ? "Activating…" : uploading ? `Uploading… ${uploadPct}%` : "Complete Payment";
      case "success":
        return "Start Booking";
    }
  }

  // ---------- Renders ----------
  function renderPlanGrid() {
    if (!plans.length) {
      return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          No plans available right now. Please contact support.
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {plans.map((p) => {
          const selected = String(selectedPlanId) === String(p._id);
          return (
            <button
              key={String(p._id)}
              onClick={() => setSelectedPlanId(String(p._id))}
              className={cn(
                "text-left p-4 rounded-lg border-2 transition-all duration-200",
                selected ? "border-emerald-600 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{p.description || "Membership plan"}</div>
                </div>
                {p.popular && <Badge className="bg-emerald-600">Popular</Badge>}
              </div>
              <div className="mt-3">
                <Badge className="bg-emerald-700">
                  {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(p.price)}
                  {p.period ? `/${p.period.toLowerCase()}` : ""}
                </Badge>
              </div>
              {p.features?.length ? (
                <ul className="mt-3 space-y-1 text-xs text-gray-600 list-disc list-inside">
                  {p.features.slice(0, 3).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  function renderPaymentMethods() {
    return (
      <div className="space-y-6">
        {/* Crypto */}
        {crypto.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-orange-600" /> Cryptocurrency
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {crypto.map((m) => {
                const selected = String(selectedMethodId) === String(m._id);
                return (
                  <button
                    key={String(m._id)}
                    onClick={() => {
                      setSelectedMethodId(String(m._id));
                      // preset rate field if present
                      const r = (m as any)?.exchangeRateUsd;
                      setRateUsd(typeof r === "number" ? r : "");
                    }}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      selected ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">
                        {(m as any).cryptocurrency || "Crypto"} {m?.network ? `(${(m as any).network})` : ""}
                      </div>
                      {(m as any).isDefault && <Badge className="bg-emerald-600">Default</Badge>}
                    </div>
                    {m && (m as any).walletAddress && (
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-white p-2 rounded border text-sm font-mono">
                          {(m as any).walletAddress}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard((m as any).walletAddress);
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {(m as any).fee ? <p className="text-xs text-gray-500 mt-1">Fee: {(m as any).fee}%</p> : null}
                    {(m as any).exchangeRateUsd ? (
                      <p className="text-xs text-gray-500">Rate: ${(m as any).exchangeRateUsd} / 1 unit</p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bank */}
        {bank.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Bank Transfer
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bank.map((m) => {
                const selected = String(selectedMethodId) === String(m._id);
                return (
                  <button
                    key={String(m._id)}
                    onClick={() => setSelectedMethodId(String(m._id))}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      selected ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="font-medium text-gray-900">{(m as any).bankName}</div>
                    <div className="text-xs text-gray-600">Acct Name: {(m as any).accountName ?? "—"}</div>
                    <div className="text-xs text-gray-600">Acct No: {(m as any).accountNumber ?? "—"}</div>
                    <div className="text-xs text-gray-600">Routing: {(m as any).routingNumber ?? "—"}</div>
                    {(m as any).swiftCode && <div className="text-xs text-gray-600">SWIFT: {(m as any).swiftCode}</div>}
                    {(m as any).processingTime && <div className="text-xs text-gray-500 mt-1">Processing: {(m as any).processingTime}</div>}
                    {(m as any).fee ? <div className="text-xs text-gray-500">Fee: {(m as any).fee}%</div> : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile */}
        {mobile.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-medium text-gray-900 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-600" /> Mobile Payments
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mobile.map((m) => {
                const selected = String(selectedMethodId) === String(m._id);
                return (
                  <button
                    key={String(m._id)}
                    onClick={() => setSelectedMethodId(String(m._id))}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      selected ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="font-medium text-gray-900">{(m as any).provider}</div>
                    <div className="text-xs text-gray-600">Handle: {(m as any).handle ?? (m as any).email ?? "—"}</div>
                    {(m as any).processingTime && <div className="text-xs text-gray-500 mt-1">Processing: {(m as any).processingTime}</div>}
                    {(m as any).fee ? <div className="text-xs text-gray-500">Fee: {(m as any).fee}%</div> : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {paymentMethods.length === 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            No active payment methods available. Please contact support.
          </div>
        )}
      </div>
    );
  }

  function renderPaymentSummary() {
    if (!selectedPlan) return null;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-sm text-gray-600">Plan Price</div>
          <div className="text-sm font-medium text-gray-900">
            {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(planPriceUsd)}
          </div>

          <div className="text-sm text-gray-600">Fee</div>
          <div className="text-sm font-medium text-gray-900">{feePct ? `${feePct}%` : "—"}</div>

          <div className="text-sm text-gray-600">Total (USD)</div>
          <div className="text-sm font-semibold text-gray-900">
            {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(usdTotal)}
          </div>
        </div>

        {isCrypto ? (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm text-gray-700">Rate (USD per 1 {((selectedMethod as any)?.cryptocurrency) || "unit"})</label>
              <input
                type="number"
                step="0.00000001"
                min="0"
                value={rateUsd}
                onChange={(e) => setRateUsd(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-40 border rounded px-2 py-1 text-sm"
                placeholder="e.g. 65000"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">Amount to Send</div>
              <div className="text-sm font-semibold text-gray-900">
                {cryptoAmount || !effectiveRate ? "—" : cryptoAmount} {((selectedMethod as any)?.cryptocurrency) || ""}
              </div>
            </div>
            {((selectedMethod as any)?.walletAddress) ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white p-2 rounded border text-sm font-mono overflow-x-auto">
                  {(selectedMethod as any).walletAddress}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard((selectedMethod as any).walletAddress)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            ) : null}
            <p className="text-xs text-gray-600">
              Double-check the network {(selectedMethod as any)?.network ? `(${(selectedMethod as any).network})` : ""} before sending.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to premiertalentagency!</h2>
              <p className="text-gray-600 text-lg">Your premium booking platform for exclusive experiences</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg">
                <Users className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Premium Access</h3>
                <p className="text-sm text-gray-600 text-center">Exclusive bookings with top celebrities</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg">
                <Zap className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Instant Booking</h3>
                <p className="text-sm text-gray-600 text-center">Quick and secure booking process</p>
              </div>
              <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg">
                <Shield className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Secure Platform</h3>
                <p className="text-sm text-gray-600 text-center">Your data and payments are protected</p>
              </div>
            </div>
          </div>
        );

      case "terms":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Terms & Conditions</h2>
              <p className="text-gray-600">Please review and accept our terms to continue</p>
            </div>

            <Card className="max-h-64 overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">Service Agreement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Service Description</h4>
                  <p>premiertalentagency provides a platform for booking exclusive experiences with verified celebrities and public figures.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2. User Responsibilities</h4>
                  <p>Users must provide accurate information and respect the privacy and time of booked celebrities.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">3. Payment Terms</h4>
                  <p>All payments are processed securely. Refunds are subject to our cancellation policy.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">4. Privacy Policy</h4>
                  <p>We protect your personal information and only share it as necessary for service delivery.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">5. Limitation of Liability</h4>
                  <p>premiertalentagency acts as an intermediary platform and is not responsible for celebrity availability or behavior.</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(!!c)} />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I have read and agree to the Terms & Conditions and Privacy Policy
              </label>
            </div>
          </div>
        );

      case "plan":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Membership</h2>
              <p className="text-gray-600">Select a plan to see the exact amount to pay</p>
            </div>
            {renderPlanGrid()}
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Make Your Payment</h2>
              <p className="text-gray-600">Pick a method and follow the instructions</p>
            </div>

            {/* Plan summary header */}
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-emerald-50">
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedPlan?.name ?? "Membership"}</span>
                  <Badge className="bg-emerald-600">
                    {selectedPlan
                      ? `${new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(selectedPlan.price)}${selectedPlan.period ? `/${selectedPlan.period.toLowerCase()}` : ""}`
                      : "—"}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {selectedPlan?.description ?? "Unlimited access to exclusive celebrity bookings"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Methods */}
                {renderPaymentMethods()}

                {/* Summary */}
                {renderPaymentSummary()}

                {/* Auto-renew */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-renew" checked={autoRenew} onCheckedChange={(c) => setAutoRenew(!!c)} />
                  <label htmlFor="auto-renew" className="text-sm text-gray-600">
                    Enable auto-renew
                  </label>
                </div>

                {/* Note */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium text-yellow-800">Important:</p>
                    <p>
                      Include your email or user ID in the payment memo where applicable. Upload a proof of payment below to speed up verification.
                    </p>
                  </div>
                </div>

                {/* Proof upload with progress */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900">
                    Proof of Payment <span className="text-red-500">*</span>
                  </h5>

                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                      uploadedUrl
                        ? "border-emerald-300 bg-emerald-50"
                        : uploadedFile
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 hover:border-emerald-400"
                    )}
                  >
                    <input
                      type="file"
                      id="payment-proof"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadedFile(file);
                        setUploadedUrl(null);
                        setUploadPct(0);
                      }}
                      className="hidden"
                      disabled={uploading || creating}
                    />
                    <label htmlFor="payment-proof" className={cn("cursor-pointer", (uploading || creating) && "pointer-events-none opacity-60")}>
                      {uploadedUrl ? (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Uploaded</p>
                            <p className="text-sm text-gray-500 break-all">{uploadedUrl}</p>
                            <p className="text-xs text-gray-500">Click to replace file</p>
                          </div>
                        </div>
                      ) : uploadedFile ? (
                        <div className="space-y-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                            <p className="text-sm text-gray-500">Click to change file</p>
                          </div>

                          {uploading && (
                            <div className="w-full max-w-sm mx-auto">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-2 bg-emerald-600" style={{ width: `${uploadPct}%` }} />
                              </div>
                              <p className="text-xs text-gray-500 mt-2">{uploadPct}%</p>
                            </div>
                          )}

                          {!uploading && !uploadedUrl && (
                            <div className="mt-2">
                              <Button
                                size="sm"
                                className="bg-emerald-900 hover:bg-emerald-800"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  try {
                                    await ensureUploaded();
                                  } catch {
                                    /* toast handled */
                                  }
                                }}
                              >
                                Upload Proof
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Upload proof of payment</p>
                            <p className="text-sm text-gray-500">Screenshot, receipt, or transaction confirmation</p>
                            <p className="text-xs text-gray-400">PNG, JPG, PDF up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Confirmation */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-confirm"
                    checked={paymentConfirmed}
                    onCheckedChange={(c) => setPaymentConfirmed(!!c)}
                    disabled={creating || uploading}
                  />
                  <label htmlFor="payment-confirm" className="text-sm text-gray-600">
                    I have sent the payment and uploaded proof of payment
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Premium!</h2>
              <p className="text-gray-600 text-lg">Your membership has been activated successfully</p>
            </div>

            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="w-6 h-6 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">Premium Member</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">Unlimited</div>
                      <div className="text-gray-600">Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">24/7</div>
                      <div className="text-gray-600">Support</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">Priority</div>
                      <div className="text-gray-600">Access</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">Exclusive</div>
                      <div className="text-gray-600">Events</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500">
              You can now start booking exclusive experiences with your favorite celebrities!
            </div>
          </div>
        );
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { /* locked while onboarding is required */ }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-5xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                {steps.map((step, index) => {
                  const Icon = step.icon as any;
                  const isActive = step.id === currentStep;
                  const isCompleted = steps.findIndex((s) => s.id === currentStep) > steps.findIndex((s) => s.id === step.id);
                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                          isActive && "bg-emerald-600 border-emerald-600 text-white",
                          isCompleted && "bg-green-500 border-green-500 text-white",
                          !isActive && !isCompleted && "bg-gray-100 border-gray-300 text-gray-500"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < steps.length - 1 && (
                        <div className={cn("w-8 h-0.5 mx-2", isCompleted ? "bg-green-500" : "bg-gray-300")} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-sm text-gray-500">
                Step {steps.findIndex((s) => s.id === currentStep) + 1} of {steps.length}:{" "}
                {steps.find((s) => s.id === currentStep)?.title}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">{renderStepContent()}</div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === "welcome" || creating || uploading}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-emerald-900 hover:bg-emerald-800 text-zinc-100"
            >
              {getButtonText()}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
