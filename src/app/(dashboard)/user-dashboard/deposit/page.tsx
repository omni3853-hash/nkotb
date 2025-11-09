"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Wallet as WalletIcon,
  Building2,
  Smartphone,
  Copy,
  Upload,
  CheckCircle,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Wallet,
  FileText,
  User as UserIcon,
} from "lucide-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import type { IPaymentMethod } from "@/lib/models/payment-method.model";
import { AccountType } from "@/lib/enums/account.enum";

import {
  CreateDepositSchema,
  type CreateDepositFormData,
  DepositQuerySchema,
  type DepositQuery,
} from "@/utils/schemas/schemas";

import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import { UserPaymentMethodsApi } from "@/api/payment-methods.api";
import { DepositDto, UserDepositsApi } from "@/api/transaction.api";

/** ------------------------------ Helpers -------------------------------- */
type Paginated<T> = { items: T[]; total: number; page: number; limit: number };

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied");
}

/** PaymentMethod helpers to handle populated/unpopulated shapes */
type PopulatedPaymentMethodLite = {
  _id: string;
  type?: "CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | string;
  last4?: string;
  brand?: string;
};

type MaybePM = string | PopulatedPaymentMethodLite | null | undefined;

function isPopulatedPM(pm: MaybePM): pm is PopulatedPaymentMethodLite {
  return !!pm && typeof pm !== "string";
}

function getPaymentMethodType(pm?: MaybePM): string | undefined {
  if (!pm) return undefined;
  if (isPopulatedPM(pm)) return pm.type?.toUpperCase();
  return undefined;
}

function getPaymentMethodLabel(pm?: MaybePM): string {
  if (!pm) return "Other";
  if (!isPopulatedPM(pm)) return "Other"; // id string only
  const rawType = (pm.type || "").toLowerCase();

  if (rawType === "card") {
    if (pm.brand && pm.last4) return `${pm.brand} •••• ${pm.last4}`;
    if (pm.brand) return pm.brand;
    if (pm.last4) return `Card •••• ${pm.last4}`;
    return "Card";
  }
  if (rawType === "bank_transfer") return "Bank transfer";
  if (rawType === "mobile_payment") return "Mobile payment";
  if (rawType === "crypto") return "Crypto";
  return pm.type || "Other";
}

function PaymentMethodBadge({ pm }: { pm: MaybePM }) {
  const pmType = getPaymentMethodType(pm);
  const isCrypto = (pmType || "").toLowerCase() === "crypto";
  const label = getPaymentMethodLabel(pm);

  if (isCrypto) {
    return (
      <Badge className="bg-orange-100 text-orange-900 border border-orange-200">
        <Wallet className="w-3 h-3 mr-1" />
        Crypto
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-100 text-green-900 border border-green-200">
      <Smartphone className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

/** Format helpers */
const fmtMoney = (n: number | string | undefined) => {
  const v = Number(n || 0);
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const fmtDateTime = (iso?: string) => (iso ? new Date(iso).toLocaleString() : "—");

/** ============================= Deposit Page ============================ */
export default function DepositPage() {
  /** ---------------------------- Payment methods ---------------------------- */
  const [methods, setMethods] = useState<IPaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [methodsErr, setMethodsErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingMethods(true);
        const res = await UserPaymentMethodsApi.listActive({ page: 1, limit: 100 });
        const items = (res as Paginated<IPaymentMethod>)?.items ?? [];
        if (mounted) setMethods(items);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || "Failed to load payment methods";
        setMethodsErr(msg);
        toast.error(msg);
      } finally {
        if (mounted) setLoadingMethods(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const cryptoMethods = useMemo(() => methods.filter((m) => m.type === AccountType.CRYPTO_WALLET), [methods]);
  const bankMethods = useMemo(() => methods.filter((m) => m.type === AccountType.BANK_ACCOUNT), [methods]);
  const mobileMethods = useMemo(() => methods.filter((m) => m.type === AccountType.MOBILE_PAYMENT), [methods]);

  /** ------------------------------- RHF Form -------------------------------- */
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDepositFormData>({
    resolver: zodResolver(CreateDepositSchema),
    defaultValues: {
      amount: undefined as unknown as number, // force the user to type
      paymentMethodId: "",
      proofOfPayment: "",
      notes: "", // required now
    } as any,
  });

  const selectedMethodId = watch("paymentMethodId");
  const amount = watch("amount");
  const notes = watch("notes")?.trim() || "";
  const selectedMethod = useMemo(
    () => methods.find((m) => String(m._id) === String(selectedMethodId)),
    [methods, selectedMethodId]
  );

  // Extended fields from payment methods (safe to read)
  const feePct: number = (selectedMethod as any)?.fee || 0;
  const cryptocurrency: string | undefined = (selectedMethod as any)?.cryptocurrency;
  const network: string | undefined = (selectedMethod as any)?.network;
  const walletAddress: string | undefined = (selectedMethod as any)?.walletAddress;
  const exchangeRateUsdFromMethod: number | undefined = (selectedMethod as any)?.exchangeRateUsd;

  const [rateUsd, setRateUsd] = useState<number | "">("");
  useEffect(() => {
    if (exchangeRateUsdFromMethod && !rateUsd) setRateUsd(exchangeRateUsdFromMethod);
  }, [exchangeRateUsdFromMethod]); // eslint-disable-line

  const isCrypto = selectedMethod?.type === AccountType.CRYPTO_WALLET;

  const totalDueUsd = useMemo(() => {
    const a = Number(amount || 0);
    if (!a) return 0;
    return +(a * (1 + (feePct || 0) / 100)).toFixed(2);
  }, [amount, feePct]);

  const cryptoQty = useMemo(() => {
    if (!isCrypto) return 0;
    const r = Number(rateUsd || 0);
    if (!r || !totalDueUsd) return 0;
    return +(totalDueUsd / r).toFixed(6);
  }, [isCrypto, totalDueUsd, rateUsd]);

  /** ------------------------------ Proof upload ----------------------------- */
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");

  async function doUpload() {
    if (!file) {
      toast.message("Attach a proof of payment file first.");
      return;
    }
    setUploading(true);
    setUploadPct(0);
    try {
      const { url } = await uploadToCloudinary(file, {
        onProgress: (pct) => setUploadPct(pct),
      });
      setUploadedUrl(url);
      setValue("proofOfPayment", url, { shouldValidate: true });
      toast.success("Proof of payment uploaded.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  /** ------------------------------ Create deposit --------------------------- */
  const [successOpen, setSuccessOpen] = useState(false);
  const canSubmit =
    !!selectedMethodId &&
    !!amount &&
    Number(amount) > 0 &&
    !!uploadedUrl &&
    !!notes && // disable until notes is filled
    !isSubmitting &&
    !uploading;

  async function onSubmit(values: CreateDepositFormData) {
    if (!uploadedUrl) {
      toast.message("Upload your proof of payment before submitting.");
      return;
    }
    try {
      const payload: CreateDepositFormData = {
        ...values,
        amount: Number(values.amount),
        paymentMethodId: selectedMethodId!,
        proofOfPayment: uploadedUrl,
        notes: values.notes.trim(),
      } as any;

      await UserDepositsApi.create(payload);
      toast.success("Deposit submitted. We’ll notify you once it’s confirmed.");
      setSuccessOpen(true);
      reset({
        amount: undefined as unknown as number,
        paymentMethodId: "",
        proofOfPayment: "",
        notes: "",
      } as any);
      setFile(null);
      setUploadedUrl("");
      setUploadPct(0);
      // refresh history
      void loadDeposits();
    } catch (err: any) {
      console.log(err);
      const msg = err?.response?.data?.message || err?.message || "Could not create deposit";
      toast.error(msg);
    }
  }

  /** ------------------------------- History --------------------------------- */
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [history, setHistory] = useState<DepositDto[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  async function loadDeposits(q: Partial<DepositQuery> = {}) {
    try {
      setLoadingHistory(true);
      const params = DepositQuerySchema.partial().parse({ page, limit, ...q });
      const res = await UserDepositsApi.listMine(params);
      const data = res as Paginated<DepositDto>;
      setHistory(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load deposits";
      toast.error(msg);
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    void loadDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  // Page-level aggregates (current page only; server-wide aggregates would need a dedicated endpoint)
  const pageCompletedTotal = useMemo(
    () => history.filter((h) => h.status === "COMPLETED").reduce((s, x) => s + Number(x.amount || 0), 0),
    [history]
  );
  const pagePendingTotal = useMemo(
    () => history.filter((h) => h.status === "PENDING").reduce((s, x) => s + Number(x.amount || 0), 0),
    [history]
  );

  /** --------------------------------- UI ----------------------------------- */
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-50">
          <div className="flex flex-1 flex-col gap-2 px-3">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DynamicPageHeader
                title="Deposit Funds"
                subtitle="Select a payment method, upload your proof, and submit your deposit. Review your deposit history anytime."
              />

              {/* ------------------------------ Tabs ------------------------------ */}
              <div className="px-4 lg:px-6">
                <Tabs defaultValue="make" className="w-full">
                  <TabsList>
                    <TabsTrigger value="make">Make Deposit</TabsTrigger>
                    <TabsTrigger value="history">Deposit History</TabsTrigger>
                  </TabsList>

                  {/* ========================= MAKE DEPOSIT ========================= */}
                  <TabsContent value="make" className="mt-4">
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-emerald-50/60 border-b">
                        <CardTitle className="flex items-center gap-2 text-emerald-900">
                          <ShieldCheck className="h-5 w-5" />
                          Secure Deposit
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        {/* Amount */}
                        <div className="mb-6">
                          <Label className="text-sm text-zinc-700">Amount (USD)</Label>
                          <div className="mt-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...register("amount", { valueAsNumber: true })}
                              className="h-12 text-lg font-semibold"
                            />
                            {errors.amount && (
                              <p className="mt-2 text-sm text-red-600">{String(errors.amount.message)}</p>
                            )}
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Payment Methods */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-zinc-900">Payment Method</h3>
                            {loadingMethods ? (
                              <span className="text-xs text-zinc-500">loading…</span>
                            ) : methodsErr ? (
                              <span className="text-xs text-red-600">{methodsErr}</span>
                            ) : null}
                          </div>

                          {methods.length === 0 && !loadingMethods ? (
                            <div className="p-4 rounded-lg border bg-blue-50 text-blue-700 text-sm">
                              No active payment methods available. Please contact support.
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Crypto */}
                              {cryptoMethods.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <WalletIcon className="h-4 w-4 text-orange-600" />
                                    <h4 className="text-sm font-semibold text-zinc-900">Cryptocurrency</h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {cryptoMethods.map((m) => {
                                      const selected = String(selectedMethodId) === String(m._id);
                                      return (
                                        <button
                                          key={String(m._id)}
                                          type="button"
                                          onClick={() => {
                                            setValue("paymentMethodId", String(m._id), { shouldValidate: true });
                                            const r = (m as any)?.exchangeRateUsd;
                                            setRateUsd(typeof r === "number" ? r : "");
                                          }}
                                          className={[
                                            "text-left p-4 rounded-lg border-2 transition-all duration-200",
                                            selected
                                              ? "border-emerald-600 bg-emerald-50"
                                              : "border-zinc-200 hover:border-zinc-300",
                                          ].join(" ")}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="font-medium text-zinc-900">
                                              {(m as any)?.cryptocurrency || "Crypto"}{" "}
                                              {m && (m as any)?.network ? `(${(m as any)?.network})` : ""}
                                            </div>
                                            {(m as any)?.isDefault && (
                                              <Badge className="bg-emerald-600 hover:bg-emerald-600">Default</Badge>
                                            )}
                                          </div>
                                          {m && (m as any)?.walletAddress && (
                                            <div className="mt-2 flex items-center gap-2">
                                              <code className="flex-1 bg-white p-2 rounded border text-xs font-mono">
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
                                                <Copy className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          )}
                                          {(m as any)?.fee ? (
                                            <p className="mt-2 text-xs text-zinc-500">Fee: {(m as any).fee}%</p>
                                          ) : null}
                                          {(m as any)?.exchangeRateUsd ? (
                                            <p className="text-xs text-zinc-500">
                                              Rate: ${(m as any).exchangeRateUsd} / 1 unit
                                            </p>
                                          ) : null}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Bank */}
                              {bankMethods.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                    <h4 className="text-sm font-semibold text-zinc-900">Bank Transfer</h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {bankMethods.map((m) => {
                                      const selected = String(selectedMethodId) === String(m._id);
                                      return (
                                        <button
                                          key={String(m._id)}
                                          type="button"
                                          onClick={() =>
                                            setValue("paymentMethodId", String(m._id), { shouldValidate: true })
                                          }
                                          className={[
                                            "text-left p-4 rounded-lg border-2 transition-all duration-200",
                                            selected
                                              ? "border-emerald-600 bg-emerald-50"
                                              : "border-zinc-200 hover:border-zinc-300",
                                          ].join(" ")}
                                        >
                                          <div className="font-medium text-zinc-900">
                                            {(m as any).bankName || "Bank Account"}
                                          </div>
                                          <p className="text-xs text-zinc-600">
                                            Acct Name: {(m as any).accountName ?? "—"}
                                          </p>
                                          <p className="text-xs text-zinc-600">
                                            Acct No: {(m as any).accountNumber ?? "—"}
                                          </p>
                                          {(m as any).routingNumber && (
                                            <p className="text-xs text-zinc-600">
                                              Routing: {(m as any).routingNumber}
                                            </p>
                                          )}
                                          {(m as any).swiftCode && (
                                            <p className="text-xs text-zinc-600">SWIFT: {(m as any).swiftCode}</p>
                                          )}
                                          {(m as any).processingTime && (
                                            <p className="mt-1 text-xs text-zinc-500">
                                              Processing: {(m as any).processingTime}
                                            </p>
                                          )}
                                          {(m as any).fee ? (
                                            <p className="text-xs text-zinc-500">Fee: {(m as any).fee}%</p>
                                          ) : null}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Mobile */}
                              {mobileMethods.length > 0 && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-emerald-600" />
                                    <h4 className="text-sm font-semibold text-zinc-900">Mobile Payments</h4>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {mobileMethods.map((m) => {
                                      const selected = String(selectedMethodId) === String(m._id);
                                      return (
                                        <button
                                          key={String(m._id)}
                                          type="button"
                                          onClick={() =>
                                            setValue("paymentMethodId", String(m._id), { shouldValidate: true })
                                          }
                                          className={[
                                            "text-left p-4 rounded-lg border-2 transition-all duration-200",
                                            selected
                                              ? "border-emerald-600 bg-emerald-50"
                                              : "border-zinc-200 hover:border-zinc-300",
                                          ].join(" ")}
                                        >
                                          <div className="font-medium text-zinc-900">
                                            {(m as any).provider || "Mobile Payment"}
                                          </div>
                                          <p className="text-xs text-zinc-600">
                                            Handle: {(m as any).handle ?? (m as any).email ?? "—"}
                                          </p>
                                          {(m as any).processingTime && (
                                            <p className="mt-1 text-xs text-zinc-500">
                                              Processing: {(m as any).processingTime}
                                            </p>
                                          )}
                                          {(m as any).fee ? (
                                            <p className="text-xs text-zinc-500">Fee: {(m as any).fee}%</p>
                                          ) : null}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {errors.paymentMethodId && (
                            <p className="text-sm text-red-600">{String(errors.paymentMethodId.message)}</p>
                          )}
                        </div>

                        {/* Notes (REQUIRED) */}
                        <Separator className="my-6" />
                        <div className="mb-2">
                          <Label className="text-sm text-zinc-700">
                            Notes <span className="text-red-600">*</span>
                          </Label>
                          <div className="mt-2">
                            <textarea
                              {...register("notes")}
                              maxLength={1000}
                              placeholder="Add any helpful details (e.g., payment reference, sender name, memo, intended purpose)…"
                              className="w-full min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-[11px] text-zinc-500">
                                Include reference or memo to speed up verification. Max 1000 characters.
                              </p>
                              <p className="text-[11px] text-zinc-400">{notes.length}/1000</p>
                            </div>
                            {errors.notes && (
                              <p className="mt-2 text-sm text-red-600">{String(errors.notes.message)}</p>
                            )}
                          </div>
                        </div>

                        {/* Summary + Proof */}
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border bg-zinc-50">
                            <h4 className="font-semibold text-zinc-900 mb-3">Payment Summary</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-600">Amount</span>
                                <span className="font-medium">${fmtMoney(amount)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-600">Fee</span>
                                <span className="font-medium">{feePct ? `${feePct}%` : "—"}</span>
                              </div>
                              <Separator />
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-700">Total to Pay</span>
                                <span className="font-semibold">${fmtMoney(totalDueUsd)}</span>
                              </div>
                            </div>

                            {isCrypto && (
                              <div className="mt-4 space-y-2 p-3 rounded-lg border bg-emerald-50">
                                <div className="flex items-center justify-between gap-2">
                                  <Label className="text-xs text-zinc-700">
                                    Rate (USD per 1 {cryptocurrency || "unit"})
                                  </Label>
                                  <Input
                                    type="number"
                                    step="0.00000001"
                                    value={rateUsd}
                                    onChange={(e) => setRateUsd(e.target.value === "" ? "" : Number(e.target.value))}
                                    className="h-8 w-40"
                                    placeholder="e.g. 65000"
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-zinc-600">You should send</span>
                                  <span className="text-sm font-semibold">
                                    {cryptoQty || !rateUsd ? "—" : cryptoQty} {cryptocurrency || ""}
                                  </span>
                                </div>
                                {walletAddress && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <code className="flex-1 bg-white p-2 rounded border text-xs font-mono overflow-x-auto">
                                      {walletAddress}
                                    </code>
                                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(walletAddress!)}>
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                                {network && (
                                  <p className="text-[11px] text-zinc-600 mt-1">
                                    Network: <span className="font-medium">{network}</span>
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Proof of Payment */}
                          <div className="p-4 rounded-lg border">
                            <h4 className="font-semibold text-zinc-900 mb-3">
                              Proof of Payment <span className="text-red-600">*</span>
                            </h4>

                            <div
                              className={[
                                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                                uploadedUrl
                                  ? "border-emerald-300 bg-emerald-50"
                                  : file
                                    ? "border-green-300 bg-green-50"
                                    : "border-zinc-300 hover:border-emerald-400",
                              ].join(" ")}
                            >
                              <input
                                id="proof"
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0] || null;
                                  setFile(f);
                                  setUploadedUrl("");
                                  setUploadPct(0);
                                  setValue("proofOfPayment", "", { shouldValidate: true });
                                }}
                                disabled={uploading || isSubmitting}
                              />
                              <label
                                htmlFor="proof"
                                className={[
                                  "cursor-pointer inline-flex flex-col items-center justify-center gap-2",
                                  (uploading || isSubmitting) && "pointer-events-none opacity-60",
                                ].join(" ")}
                              >
                                {uploadedUrl ? (
                                  <>
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-zinc-900">Uploaded</p>
                                      <p className="text-xs text-zinc-600 break-all">{uploadedUrl}</p>
                                      <p className="text-[11px] text-zinc-500 mt-1">Click to replace file</p>
                                    </div>
                                  </>
                                ) : file ? (
                                  <>
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                      <Upload className="w-6 h-6 text-emerald-700" />
                                    </div>
                                    <div className="text-center">
                                      <p className="font-medium text-zinc-900">{file.name}</p>
                                      <p className="text-xs text-zinc-600">Click to change file</p>
                                    </div>

                                    {uploading ? (
                                      <div className="w-full max-w-sm mx-auto mt-3">
                                        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                                          <div className="h-2 bg-emerald-600" style={{ width: `${uploadPct}%` }} />
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-2">{uploadPct}%</p>
                                      </div>
                                    ) : (
                                      <div className="mt-3">
                                        <Button
                                          type="button"
                                          size="sm"
                                          className="bg-emerald-900 hover:bg-emerald-800 text-white"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            void doUpload();
                                          }}
                                        >
                                          Upload Proof
                                        </Button>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                                      <Upload className="w-6 h-6 text-zinc-400" />
                                    </div>
                                    <div className="text-center">
                                      <p className="font-medium text-zinc-900">Upload proof of payment</p>
                                      <p className="text-xs text-zinc-600">
                                        Screenshot, receipt, or transaction PDF (max 10MB)
                                      </p>
                                    </div>
                                  </>
                                )}
                              </label>
                            </div>

                            {errors.proofOfPayment && (
                              <p className="mt-2 text-sm text-red-600">{String(errors.proofOfPayment.message)}</p>
                            )}

                            <p className="mt-3 text-[11px] text-zinc-500">
                              Tip: Include your email or user ID in the payment memo where applicable to speed up
                              verification.
                            </p>
                          </div>
                        </div>

                        {/* Submit */}
                        <div className="mt-6 flex items-center justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting || uploading}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                          <Button
                            className="bg-emerald-900 hover:bg-emerald-800 text-white"
                            disabled={!canSubmit}
                            onClick={handleSubmit(onSubmit)}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting…
                              </>
                            ) : (
                              <>
                                Submit Deposit
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ========================= DEPOSIT HISTORY ======================== */}
                  <TabsContent value="history" className="mt-4">
                    {/* Page aggregates (current page) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-xs text-zinc-500">Deposits on this page</div>
                          <div className="text-xl font-semibold text-zinc-900 mt-1">{history.length}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-xs text-zinc-500">Completed total (page)</div>
                          <div className="text-xl font-semibold text-emerald-900 mt-1">${fmtMoney(pageCompletedTotal)}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-xs text-zinc-500">Pending total (page)</div>
                          <div className="text-xl font-semibold text-amber-900 mt-1">${fmtMoney(pagePendingTotal)}</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Recent Deposits</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-zinc-50">
                              <tr className="text-left">
                                <th className="p-3">Date</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Method</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Credited</th>
                                <th className="p-3">User</th>
                                <th className="p-3">Processed By</th>
                                <th className="p-3">Notes</th>
                                <th className="p-3">Proof</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loadingHistory ? (
                                <tr>
                                  <td colSpan={9} className="p-6 text-center text-zinc-500">
                                    Loading…
                                  </td>
                                </tr>
                              ) : history.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="p-6 text-center text-zinc-500">
                                    No deposits yet.
                                  </td>
                                </tr>
                              ) : (
                                history.map((d) => {
                                  const pm = d.payment?.paymentMethod as MaybePM;
                                  const when = new Date(d.createdAt);
                                  const dateStr = when.toLocaleDateString();
                                  const timeStr = when.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                                  const user =
                                    typeof d.user === "string"
                                      ? undefined
                                      : (d.user as { firstName?: string; lastName?: string; email?: string });

                                  const processedBy =
                                    typeof d.processedBy === "string"
                                      ? undefined
                                      : (d.processedBy as { firstName?: string; lastName?: string; email?: string });

                                  return (
                                    <tr key={d._id} className="border-t align-top">
                                      <td className="p-3 whitespace-nowrap">
                                        <div className="font-medium text-zinc-900">{dateStr}</div>
                                        <div className="text-xs text-zinc-500">{timeStr}</div>
                                      </td>

                                      <td className="p-3 font-semibold text-emerald-900">
                                        ${fmtMoney(d.amount)}
                                      </td>

                                      <td className="p-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          <PaymentMethodBadge pm={pm} />
                                          <span className="text-xs text-zinc-600">{getPaymentMethodLabel(pm)}</span>
                                        </div>
                                      </td>

                                      <td className="p-3">
                                        <Badge
                                          className={[
                                            "text-xs",
                                            d.status === "COMPLETED"
                                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                              : d.status === "PENDING"
                                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                                : "bg-red-100 text-red-900 border border-red-300",
                                          ].join(" ")}
                                        >
                                          {d.status}
                                        </Badge>
                                      </td>

                                      <td className="p-3 whitespace-nowrap">
                                        {d.creditedAt ? (
                                          <span className="text-xs text-zinc-700">{fmtDateTime(d.creditedAt)}</span>
                                        ) : (
                                          <span className="text-xs text-zinc-400">—</span>
                                        )}
                                      </td>

                                      <td className="p-3">
                                        {user ? (
                                          <div className="text-xs text-zinc-700">
                                            <div className="flex items-center gap-1">
                                              <UserIcon className="w-3 h-3 text-zinc-500" />
                                              <span>
                                                {[user.firstName, user.lastName].filter(Boolean).join(" ") ||
                                                  user.email ||
                                                  "—"}
                                              </span>
                                            </div>
                                            {user.email && (
                                              <div className="text-zinc-500 break-all">{user.email}</div>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-xs text-zinc-400">—</span>
                                        )}
                                      </td>

                                      <td className="p-3">
                                        {processedBy ? (
                                          <div className="text-xs text-zinc-700">
                                            <div>
                                              {[processedBy.firstName, processedBy.lastName]
                                                .filter(Boolean)
                                                .join(" ") || processedBy.email || "—"}
                                            </div>
                                            {processedBy.email && (
                                              <div className="text-zinc-500 break-all">{processedBy.email}</div>
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-xs text-zinc-400">—</span>
                                        )}
                                      </td>

                                      <td className="p-3 max-w-[280px]">
                                        <div className="text-xs text-zinc-700 line-clamp-3">{d.notes || "—"}</div>
                                      </td>

                                      <td className="p-3 whitespace-nowrap">
                                        {d.payment?.amount || d.payment?.currency ? (
                                          <div className="text-[11px] text-zinc-500 mb-1">
                                            Snap: {d.payment?.currency ? `${d.payment.currency} ` : ""}
                                            {d.payment?.amount ? fmtMoney(d.payment.amount) : ""}
                                          </div>
                                        ) : null}
                                        {/** We stored proof url in Create; backend puts it in payment.proofOfPayment (snapshot).
                                             Some APIs also echo a top-level proof; show any url-looking string from notes/proof if present. */}
                                        {/* Strictly show a "View Proof" link when we can derive a URL from d.payment?.proofOfPayment or notes */}
                                        {"payment" in d &&
                                          (d as any)?.payment?.proofOfPayment &&
                                          typeof (d as any).payment.proofOfPayment === "string" ? (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 px-2 text-xs"
                                            asChild
                                          >
                                            <a
                                              href={(d as any).payment.proofOfPayment as string}
                                              target="_blank"
                                              rel="noreferrer"
                                            >
                                              <FileText className="w-3 h-3 mr-1" />
                                              View Proof
                                            </a>
                                          </Button>
                                        ) : (
                                          <span className="text-xs text-zinc-400">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between p-4 border-t">
                          <div className="text-xs text-zinc-600">
                            Page {page} of {totalPages} • {total} total
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPage((p) => Math.max(1, p - 1))}
                              disabled={page <= 1 || loadingHistory}
                            >
                              Prev
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                              disabled={page >= totalPages || loadingHistory}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
              Deposit Submitted
            </DialogTitle>
            <DialogDescription className="text-sm">
              Your deposit has been submitted with your proof of payment. You'll be credited once it's confirmed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setSuccessOpen(false)} className="w-full sm:w-auto">Okay</Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
