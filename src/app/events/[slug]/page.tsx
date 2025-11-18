"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";

import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";

import {
    CreateOfflineTicketSchema,
    type CreateOfflineTicketFormData,
} from "@/utils/schemas/schemas";
import { Event, EventsApi } from "@/api/events.api";
import { UserPaymentMethodsApi } from "@/api/payment-methods.api";
import { TicketsApi } from "@/api/tickets.api";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatDate(value: string | Date | null | undefined) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatTime(value: string | undefined) {
    if (!value) return "";
    if (/^\d{1,2}:\d{2}/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// -----------------------------------------------------------------------------
// Form schema – built from CreateOfflineTicketSchema
// -----------------------------------------------------------------------------

const PurchaseTicketSchema = CreateOfflineTicketSchema.extend({
    // Make notes truly optional for this UI flow
    notes: z
        .string()
        .max(1000, "Notes should be at most 1000 characters.")
        .optional(),
    paymentMethodId: z.string().min(1, "Please select a payment method."),
    proofOfPayment: z.string().min(1, "Please upload your payment receipt."),
})
    .omit({
        event: true,
        ticketTypeId: true,
        paidAmount: true, // derived, not user-entered
    })
    .strict();

type PurchaseTicketFormData = z.infer<typeof PurchaseTicketSchema>;

// Relaxed ticket type
type TicketType = Event["ticketTypes"][number] & {
    _id?: string;
    id?: string;
    name?: string;
    label?: string;
    price?: number;
    description?: string;
};

// Simple summary type for success screen
type OrderSummary = {
    ticketName: string;
    quantity: number;
    amount: number;
    paymentLabel: string;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const EventDetailsPage: React.FC = () => {
    const params = useParams();
    const slug = (params?.slug as string) || "";

    const [event, setEvent] = useState<Event | null>(null);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [eventError, setEventError] = useState<string | null>(null);

    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [methodsError, setMethodsError] = useState<string | null>(null);

    // full-page purchase mode
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [selectedTicketType, setSelectedTicketType] =
        useState<TicketType | null>(null);

    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);
    const [lastOrderSummary, setLastOrderSummary] =
        useState<OrderSummary | null>(null);

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // React Hook Form
    // -------------------------------------------------------------------------

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting, isValid },
    } = useForm<PurchaseTicketFormData>({
        resolver: zodResolver(PurchaseTicketSchema),
        mode: "onChange",
        defaultValues: {
            buyerFullName: "",
            buyerEmail: "",
            buyerPhone: "",
            quantity: 1,
            notes: "",
            paymentMethodId: "",
            proofOfPayment: "",
        },
    });

    const quantity = watch("quantity");
    const paymentMethodId = watch("paymentMethodId");

    const selectedMethod = paymentMethods.find(
        (m) => m._id === paymentMethodId,
    );

    // helpers to calculate amounts
    const getTicketDisplayName = (t: TicketType) =>
        t.name || t.label || "Ticket";

    const getTicketPrice = (t: TicketType, fallback: number) =>
        typeof t.price === "number" ? t.price : fallback;

    const unitPrice =
        event && selectedTicketType
            ? getTicketPrice(selectedTicketType, event.basePrice)
            : 0;

    const ticketsQty = quantity && quantity > 0 ? quantity : 1;
    const ticketsTotal = unitPrice * ticketsQty;

    const methodFeeRate =
        typeof selectedMethod?.fee === "number" ? selectedMethod.fee : 0;
    const methodFeeAmount =
        ticketsTotal > 0 && methodFeeRate > 0
            ? (ticketsTotal * methodFeeRate) / 100
            : 0;

    const finalAmountToPay = ticketsTotal + methodFeeAmount;

    // -------------------------------------------------------------------------
    // Data fetching
    // -------------------------------------------------------------------------

    // Event
    useEffect(() => {
        if (!slug) return;
        let mounted = true;

        const fetchEvent = async () => {
            try {
                setLoadingEvent(true);
                setEventError(null);
                const data = await EventsApi.getBySlug(slug);
                if (!mounted) return;

                if (!data.isActive) {
                    setEventError("This event is no longer available.");
                    setEvent(null);
                } else {
                    setEvent(data);
                }
            } catch (err) {
                console.error(err);
                if (mounted) setEventError("Unable to load event details.");
            } finally {
                if (mounted) setLoadingEvent(false);
            }
        };

        fetchEvent();
        return () => {
            mounted = false;
        };
    }, [slug]);

    // Payment methods
    useEffect(() => {
        let mounted = true;

        const fetchMethods = async () => {
            try {
                setLoadingMethods(true);
                setMethodsError(null);

                const res = await UserPaymentMethodsApi.listActive({});
                if (!mounted) return;
                setPaymentMethods(res.items || []);
            } catch (err) {
                console.error(err);
                if (mounted) setMethodsError("Unable to load payment methods.");
            } finally {
                if (mounted) setLoadingMethods(false);
            }
        };

        fetchMethods();
        return () => {
            mounted = false;
        };
    }, []);

    // -------------------------------------------------------------------------
    // UI actions
    // -------------------------------------------------------------------------

    const startPurchase = (ticketType: TicketType) => {
        setSelectedTicketType(ticketType);
        setSubmitError(null);
        setSubmitSuccess(false);
        setShowSuccessScreen(false);
        setLastOrderSummary(null);
        setUploadError(null);
        setUploadProgress(null);

        reset({
            buyerFullName: "",
            buyerEmail: "",
            buyerPhone: "",
            quantity: 1,
            notes: "",
            paymentMethodId: "",
            proofOfPayment: "",
        });

        setIsPurchasing(true);
    };

    const goBackToDetails = () => {
        if (isSubmitting) return;
        setIsPurchasing(false);
        setShowSuccessScreen(false);
        setSelectedTicketType(null);
        setSubmitSuccess(false);
        setLastOrderSummary(null);
    };

    const handleProofFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadError(null);
            setUploadProgress(0);
            const res = await uploadToCloudinary(file, {
                onProgress: (pct) => setUploadProgress(pct),
            });

            setValue("proofOfPayment", res.url, { shouldValidate: true });
        } catch (err) {
            console.error(err);
            setUploadError(
                "Failed to upload proof of payment. Please try again.",
            );
        } finally {
            setUploadProgress(null);
        }
    };

    // -------------------------------------------------------------------------
    // Submit handler
    // -------------------------------------------------------------------------

    const onSubmit = async (values: PurchaseTicketFormData) => {
        if (!event || !selectedTicketType) return;

        const ticketTypeId =
            (selectedTicketType as any)._id ||
            (selectedTicketType as any).id ||
            "";
        if (!ticketTypeId) {
            setSubmitError(
                "Ticket type is missing. Please refresh and try again.",
            );
            return;
        }

        if (!selectedMethod) {
            setSubmitError("Please select a payment method.");
            return;
        }

        // Derive amount to pay FROM ticket price, quantity, and payment method fee.
        const safeQty = values.quantity && values.quantity > 0 ? values.quantity : 1;
        const unit = getTicketPrice(selectedTicketType, event.basePrice);
        const baseTotal = unit * safeQty;
        const feeRate =
            typeof selectedMethod.fee === "number" ? selectedMethod.fee : 0;
        const fee = feeRate > 0 ? (baseTotal * feeRate) / 100 : 0;
        const paidAmount = baseTotal + fee;

        try {
            setSubmitError(null);
            setSubmitSuccess(false);

            const payload: CreateOfflineTicketFormData = {
                ...(values as any),
                event: String(event._id),
                ticketTypeId,
                paidAmount,
            } as CreateOfflineTicketFormData;

            await TicketsApi.createOffline(payload);

            setSubmitSuccess(true);
            setShowSuccessScreen(true);

            const methodLabel =
                selectedMethod.type === "BANK_ACCOUNT"
                    ? "Bank Transfer"
                    : selectedMethod.type === "CRYPTO_WALLET"
                        ? "Crypto Wallet"
                        : selectedMethod.type === "MOBILE_PAYMENT"
                            ? "Mobile Payment"
                            : "Payment";

            setLastOrderSummary({
                ticketName: getTicketDisplayName(selectedTicketType),
                quantity: safeQty,
                amount: paidAmount,
                paymentLabel: methodLabel,
            });
        } catch (err) {
            console.error(err);
            setSubmitError(
                "Unable to submit your ticket order. Please check your details and try again.",
            );
        }
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header2 />

            <main className="flex-1 py-10 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back link */}
                    <div className="mb-6">
                        <Link
                            href="/events"
                            className="text-sm font-semibold text-gray-600 hover:text-black"
                        >
                            ← Back to Events
                        </Link>
                    </div>

                    {/* Loading */}
                    {loadingEvent && (
                        <div className="animate-pulse space-y-6">
                            <div className="h-8 w-2/3 bg-gray-200 rounded" />
                            <div className="h-4 w-1/3 bg-gray-200 rounded" />
                            <div className="h-80 w-full bg-gray-200 rounded-lg" />
                            <div className="h-4 w-full bg-gray-200 rounded" />
                            <div className="h-4 w-5/6 bg-gray-200 rounded" />
                        </div>
                    )}

                    {/* Error */}
                    {!loadingEvent && eventError && (
                        <div className="py-12 text-center text-red-500 text-lg">
                            {eventError}
                        </div>
                    )}

                    {/* Event content */}
                    {!loadingEvent && !eventError && event && (
                        <>
                            {/* Header (always visible) */}
                            <header className="space-y-3 mb-6">
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                                    {event.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                    <span>{formatDate(event.date)}</span>
                                    {event.time && (
                                        <>
                                            <span>•</span>
                                            <span>{formatTime(event.time)}</span>
                                        </>
                                    )}
                                    {event.location && (
                                        <>
                                            <span>•</span>
                                            <span className="font-semibold">
                                                {event.location}
                                            </span>
                                        </>
                                    )}
                                    {event.availability && (
                                        <>
                                            <span>•</span>
                                            <span className="uppercase tracking-wide text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                                                {event.availability}
                                            </span>
                                        </>
                                    )}
                                </div>
                                {event.category && (
                                    <div className="text-xs uppercase tracking-wide text-gray-500 mt-1">
                                        {event.category}
                                    </div>
                                )}
                                {event.tags && event.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {event.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs uppercase tracking-wide bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </header>

                            {/* FULL-PAGE PURCHASE MODE */}
                            {isPurchasing && selectedTicketType ? (
                                <section className="mt-6 mb-16">
                                    <Card className="border-2 border-zinc-200 rounded-2xl shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-zinc-100">
                                            <div>
                                                <CardTitle className="text-xl sm:text-2xl font-bold">
                                                    {showSuccessScreen
                                                        ? "Ticket Purchase"
                                                        : "Complete Your Ticket Order"}
                                                </CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {event.title} —{" "}
                                                    {getTicketDisplayName(selectedTicketType)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={goBackToDetails}
                                                disabled={isSubmitting}
                                            >
                                                ← Back to event
                                            </Button>
                                        </CardHeader>

                                        <CardContent className="pt-6 space-y-6">
                                            {/* SUCCESS SCREEN */}
                                            {showSuccessScreen &&
                                                submitSuccess &&
                                                lastOrderSummary ? (
                                                <div className="flex flex-col items-center gap-4 py-6">
                                                    <div className="rounded-full bg-emerald-50 border border-emerald-200 p-4">
                                                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                                                    </div>
                                                    <div className="text-center space-y-2">
                                                        <h2 className="text-2xl font-bold text-gray-900">
                                                            Ticket purchase confirmed 🎉
                                                        </h2>
                                                        <p className="text-sm text-gray-600 max-w-md">
                                                            Your ticket has been successfully booked. A
                                                            confirmation has been recorded with your details.
                                                        </p>
                                                    </div>

                                                    <div className="w-full max-w-md mt-2">
                                                        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm space-y-1">
                                                            <div className="flex justify-between">
                                                                <span className="text-zinc-500">Ticket</span>
                                                                <span className="font-semibold">
                                                                    {lastOrderSummary.ticketName}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-zinc-500">Quantity</span>
                                                                <span className="font-semibold">
                                                                    {lastOrderSummary.quantity}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-zinc-500">
                                                                    Payment method
                                                                </span>
                                                                <span className="font-semibold">
                                                                    {lastOrderSummary.paymentLabel}
                                                                </span>
                                                            </div>
                                                            <div className="border-t border-dashed border-zinc-300 my-1" />
                                                            <div className="flex justify-between">
                                                                <span className="font-semibold">
                                                                    Total paid
                                                                </span>
                                                                <span className="font-bold">
                                                                    ${lastOrderSummary.amount.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                                        <Button onClick={goBackToDetails}>
                                                            Back to event details
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                // Reset state but stay in purchase mode
                                                                setShowSuccessScreen(false);
                                                                setSubmitSuccess(false);
                                                                setLastOrderSummary(null);
                                                                reset({
                                                                    buyerFullName: "",
                                                                    buyerEmail: "",
                                                                    buyerPhone: "",
                                                                    quantity: 1,
                                                                    notes: "",
                                                                    paymentMethodId: "",
                                                                    proofOfPayment: "",
                                                                });
                                                            }}
                                                        >
                                                            Purchase another ticket
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Steps summary */}
                                                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
                                                        <span>
                                                            <span className="font-semibold">Step 1:</span>{" "}
                                                            Your details
                                                        </span>
                                                        <span>
                                                            <span className="font-semibold">Step 2:</span>{" "}
                                                            Pay using any method & upload proof
                                                        </span>
                                                        <span>
                                                            <span className="font-semibold">Step 3:</span>{" "}
                                                            Submit to confirm your ticket
                                                        </span>
                                                    </div>

                                                    {/* Form */}
                                                    <form
                                                        onSubmit={handleSubmit(onSubmit)}
                                                        className="space-y-8"
                                                    >
                                                        {/* STEP 1 – Buyer details */}
                                                        <div className="space-y-4">
                                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                                                                Step 1 · Your Details
                                                            </h3>

                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="buyerFullName">
                                                                        Full Name *
                                                                    </Label>
                                                                    <Input
                                                                        id="buyerFullName"
                                                                        placeholder="Jane Doe"
                                                                        {...register("buyerFullName")}
                                                                        aria-invalid={!!errors.buyerFullName}
                                                                    />
                                                                    {errors.buyerFullName && (
                                                                        <p className="text-xs text-red-600">
                                                                            {errors.buyerFullName.message}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="buyerEmail">Email *</Label>
                                                                    <Input
                                                                        id="buyerEmail"
                                                                        type="email"
                                                                        placeholder="jane@example.com"
                                                                        {...register("buyerEmail")}
                                                                        aria-invalid={!!errors.buyerEmail}
                                                                    />
                                                                    {errors.buyerEmail && (
                                                                        <p className="text-xs text-red-600">
                                                                            {errors.buyerEmail.message}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="buyerPhone">
                                                                        Phone (optional)
                                                                    </Label>
                                                                    <Input
                                                                        id="buyerPhone"
                                                                        type="tel"
                                                                        placeholder="+234 000 000 0000"
                                                                        {...register("buyerPhone")}
                                                                        aria-invalid={!!errors.buyerPhone}
                                                                    />
                                                                    {errors.buyerPhone && (
                                                                        <p className="text-xs text-red-600">
                                                                            {errors.buyerPhone.message}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="quantity">Quantity *</Label>
                                                                    <Input
                                                                        id="quantity"
                                                                        type="number"
                                                                        min={1}
                                                                        {...register("quantity", {
                                                                            valueAsNumber: true,
                                                                        })}
                                                                        aria-invalid={!!errors.quantity}
                                                                    />
                                                                    {errors.quantity && (
                                                                        <p className="text-xs text-red-600">
                                                                            {errors.quantity.message}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Order summary */}
                                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-gray-700">
                                                                <div className="bg-zinc-50 rounded-lg border border-zinc-200 px-3 py-2">
                                                                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                                                                        Ticket
                                                                    </p>
                                                                    <p className="font-semibold">
                                                                        {getTicketDisplayName(selectedTicketType)}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-zinc-50 rounded-lg border border-zinc-200 px-3 py-2">
                                                                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                                                                        Unit Price
                                                                    </p>
                                                                    <p className="font-semibold">
                                                                        ${unitPrice.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-zinc-50 rounded-lg border border-zinc-200 px-3 py-2">
                                                                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                                                                        Ticket Subtotal
                                                                    </p>
                                                                    <p className="font-semibold">
                                                                        ${ticketsTotal.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Notes */}
                                                        <div className="space-y-2">
                                                            <Label htmlFor="notes">
                                                                Notes (optional, for organiser)
                                                            </Label>
                                                            <Textarea
                                                                id="notes"
                                                                rows={3}
                                                                placeholder="Any special requests or information for the organiser..."
                                                                {...register("notes")}
                                                                aria-invalid={!!errors.notes}
                                                            />
                                                            {errors.notes && (
                                                                <p className="text-xs text-red-600">
                                                                    {errors.notes.message}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* STEP 2 – Payment */}
                                                        <div className="space-y-4">
                                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                                                                Step 2 · Payment & Proof
                                                            </h3>

                                                            {/* Payment method */}
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <Label>Payment Method *</Label>
                                                                    {loadingMethods && (
                                                                        <span className="text-[10px] text-zinc-400">
                                                                            Loading methods...
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {methodsError && (
                                                                    <p className="text-xs text-red-600">
                                                                        {methodsError}
                                                                    </p>
                                                                )}

                                                                {!loadingMethods &&
                                                                    !methodsError &&
                                                                    paymentMethods.length === 0 && (
                                                                        <p className="text-xs text-zinc-500">
                                                                            No payment methods are currently
                                                                            available. Please contact support after
                                                                            submitting your request.
                                                                        </p>
                                                                    )}

                                                                {!loadingMethods &&
                                                                    paymentMethods.length > 0 && (
                                                                        <div className="grid grid-cols-1 gap-3">
                                                                            {paymentMethods.map((method) => {
                                                                                const isSelected =
                                                                                    paymentMethodId === method._id;
                                                                                const label =
                                                                                    method.type === "BANK_ACCOUNT"
                                                                                        ? "Bank Transfer"
                                                                                        : method.type ===
                                                                                            "CRYPTO_WALLET"
                                                                                            ? "Crypto Wallet"
                                                                                            : method.type ===
                                                                                                "MOBILE_PAYMENT"
                                                                                                ? "Mobile Payment"
                                                                                                : "Payment Method";

                                                                                return (
                                                                                    <button
                                                                                        key={method._id}
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            setValue(
                                                                                                "paymentMethodId",
                                                                                                method._id,
                                                                                                {
                                                                                                    shouldValidate: true,
                                                                                                },
                                                                                            )
                                                                                        }
                                                                                        className={`w-full text-left rounded-lg border px-3 py-3 text-xs sm:text-sm transition-colors ${isSelected
                                                                                            ? "border-black bg-zinc-50"
                                                                                            : "border-zinc-200 hover:border-zinc-300"
                                                                                            }`}
                                                                                    >
                                                                                        <div className="flex items-start gap-3">
                                                                                            <div className="mt-1">
                                                                                                <div
                                                                                                    className={`h-3 w-3 rounded-full border ${isSelected
                                                                                                        ? "bg-black border-black"
                                                                                                        : "border-zinc-400"
                                                                                                        }`}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="space-y-1">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className="font-semibold">
                                                                                                        {label}
                                                                                                    </span>
                                                                                                    {method.isDefault && (
                                                                                                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-black text-white uppercase tracking-wide">
                                                                                                            Default
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>

                                                                                                {/* Details by type */}
                                                                                                {method.type ===
                                                                                                    "BANK_ACCOUNT" && (
                                                                                                        <div className="text-zinc-700 space-y-0.5">
                                                                                                            {method.bankName && (
                                                                                                                <div>
                                                                                                                    {
                                                                                                                        method.bankName
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {method.accountName && (
                                                                                                                <div>
                                                                                                                    Acct Name:{" "}
                                                                                                                    {
                                                                                                                        method.accountName
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {method.accountNumber && (
                                                                                                                <div>
                                                                                                                    Acct Number:{" "}
                                                                                                                    {
                                                                                                                        method.accountNumber
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    )}

                                                                                                {method.type ===
                                                                                                    "CRYPTO_WALLET" && (
                                                                                                        <div className="text-zinc-700 space-y-0.5">
                                                                                                            {method.cryptocurrency && (
                                                                                                                <div>
                                                                                                                    Asset:{" "}
                                                                                                                    {
                                                                                                                        method.cryptocurrency
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {method.network && (
                                                                                                                <div>
                                                                                                                    Network:{" "}
                                                                                                                    {
                                                                                                                        method.network
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {method.walletAddress && (
                                                                                                                <div className="break-all">
                                                                                                                    Address:{" "}
                                                                                                                    {
                                                                                                                        method.walletAddress
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    )}

                                                                                                {method.type ===
                                                                                                    "MOBILE_PAYMENT" && (
                                                                                                        <div className="text-zinc-700 space-y-0.5">
                                                                                                            {method.provider && (
                                                                                                                <div>
                                                                                                                    Provider:{" "}
                                                                                                                    {
                                                                                                                        method.provider
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {method.handle && (
                                                                                                                <div>
                                                                                                                    Handle:{" "}
                                                                                                                    {
                                                                                                                        method.handle
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {method.email && (
                                                                                                                <div>
                                                                                                                    Email:{" "}
                                                                                                                    {
                                                                                                                        method.email
                                                                                                                    }
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    )}

                                                                                                <div className="text-zinc-500 text-[11px]">
                                                                                                    {method.processingTime && (
                                                                                                        <span>
                                                                                                            Processing:{" "}
                                                                                                            {
                                                                                                                method.processingTime
                                                                                                            }
                                                                                                        </span>
                                                                                                    )}
                                                                                                    {typeof method.fee ===
                                                                                                        "number" &&
                                                                                                        method.fee > 0 && (
                                                                                                            <span>
                                                                                                                {" "}
                                                                                                                • Fee:{" "}
                                                                                                                {
                                                                                                                    method.fee
                                                                                                                }
                                                                                                                %
                                                                                                            </span>
                                                                                                        )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}

                                                                {errors.paymentMethodId && (
                                                                    <p className="mt-1 text-xs text-red-600">
                                                                        {errors.paymentMethodId.message}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* Proof of payment + amount breakdown */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="proofFile">
                                                                        Proof of Payment *
                                                                    </Label>
                                                                    <Input
                                                                        id="proofFile"
                                                                        type="file"
                                                                        accept="image/*"
                                                                        onChange={handleProofFileChange}
                                                                    />
                                                                    {uploadProgress !== null && (
                                                                        <div className="mt-1 h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                                                            <div
                                                                                className="h-2 bg-black transition-all"
                                                                                style={{
                                                                                    width: `${uploadProgress}%`,
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {uploadError && (
                                                                        <p className="mt-1 text-xs text-red-600">
                                                                            {uploadError}
                                                                        </p>
                                                                    )}
                                                                    {errors.proofOfPayment && (
                                                                        <p className="mt-1 text-xs text-red-600">
                                                                            {errors.proofOfPayment.message}
                                                                        </p>
                                                                    )}
                                                                    {watch("proofOfPayment") &&
                                                                        !errors.proofOfPayment && (
                                                                            <p className="mt-1 text-xs text-green-600">
                                                                                Proof uploaded. You can upload again to
                                                                                replace it.
                                                                            </p>
                                                                        )}
                                                                </div>

                                                                {/* Amount breakdown (read-only, derived) */}
                                                                <div className="space-y-2">
                                                                    <Label>Amount Breakdown</Label>
                                                                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs sm:text-sm space-y-1">
                                                                        <div className="flex justify-between">
                                                                            <span>Ticket subtotal</span>
                                                                            <span className="font-semibold">
                                                                                ${ticketsTotal.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span>
                                                                                Payment fee{" "}
                                                                                {methodFeeRate > 0
                                                                                    ? `(${methodFeeRate}%)`
                                                                                    : ""}
                                                                            </span>
                                                                            <span className="font-semibold">
                                                                                ${methodFeeAmount.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="border-t border-dashed border-zinc-300 my-1" />
                                                                        <div className="flex justify-between text-sm">
                                                                            <span className="font-semibold">
                                                                                Total to pay
                                                                            </span>
                                                                            <span className="font-bold">
                                                                                ${finalAmountToPay.toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-[11px] text-zinc-500">
                                                                        This is the exact amount you should transfer
                                                                        using the selected payment method.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* STEP 3 – Confirm */}
                                                        <div className="border-t border-zinc-200 pt-4 space-y-3">
                                                            {submitError && (
                                                                <p className="text-sm text-red-600">
                                                                    {submitError}
                                                                </p>
                                                            )}

                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-zinc-500">
                                                                <span>
                                                                    By submitting, you confirm you have already
                                                                    made payment using the selected method.
                                                                </span>
                                                                <span>
                                                                    Total:{" "}
                                                                    <span className="font-semibold">
                                                                        ${finalAmountToPay.toFixed(2)}
                                                                    </span>
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-3 gap-3">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    onClick={goBackToDetails}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    type="submit"
                                                                    disabled={isSubmitting || !isValid}
                                                                >
                                                                    {isSubmitting
                                                                        ? "Processing..."
                                                                        : "Confirm Purchase"}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </section>
                            ) : (
                                <>
                                    {/* NORMAL VIEW – hero + description + tickets */}
                                    {(event.coverImage || event.image) && (
                                        <div className="mb-8">
                                            <img
                                                src={event.coverImage || (event.image as string)}
                                                alt={event.title}
                                                className="w-full max-h-[420px] object-cover rounded-lg shadow-md"
                                            />
                                        </div>
                                    )}

                                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
                                        {/* About */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <h2 className="text-xl font-bold tracking-tight">
                                                About this event
                                            </h2>
                                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                                {event.description}
                                            </p>
                                        </div>

                                        {/* Quick info */}
                                        <Card className="bg-gray-50 border border-gray-200 rounded-lg">
                                            <CardHeader>
                                                <CardTitle className="text-sm font-bold uppercase tracking-wide text-gray-700">
                                                    Event Details
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2 text-sm text-gray-700">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Date</span>
                                                    <span>{formatDate(event.date)}</span>
                                                </div>
                                                {event.time && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Time</span>
                                                        <span>{formatTime(event.time)}</span>
                                                    </div>
                                                )}
                                                {event.location && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Location</span>
                                                        <span className="text-right">
                                                            {event.location}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="font-medium">Base Price</span>
                                                    <span>${event.basePrice.toFixed(2)}</span>
                                                </div>
                                                {event.featured && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Featured</span>
                                                        <span>Yes</span>
                                                    </div>
                                                )}
                                                {event.trending && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Trending</span>
                                                        <span>Yes</span>
                                                    </div>
                                                )}
                                                {event.verified && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Verified</span>
                                                        <span>Yes</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </section>

                                    {/* Tickets */}
                                    <section className="mb-16">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                                            <h2 className="text-2xl font-bold tracking-tight">
                                                Tickets
                                            </h2>
                                            <p className="text-sm text-gray-500">
                                                Step 1 — Choose a ticket · Step 2 — Pay & upload
                                                receipt · Step 3 — Submit to confirm your ticket
                                            </p>
                                        </div>

                                        {(!event.ticketTypes ||
                                            event.ticketTypes.length === 0) && (
                                                <p className="text-gray-500">
                                                    Ticket information is not available yet. Please check
                                                    back later.
                                                </p>
                                            )}

                                        {event.ticketTypes &&
                                            event.ticketTypes.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {event.ticketTypes.map((ticket, index) => {
                                                        const t = ticket as TicketType;
                                                        const displayName = getTicketDisplayName(t);
                                                        const price = getTicketPrice(
                                                            t,
                                                            event.basePrice,
                                                        );

                                                        return (
                                                            <Card
                                                                key={(t as any)._id || index}
                                                                className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                                                            >
                                                                <CardContent className="pt-5 pb-4 space-y-2">
                                                                    <h3 className="text-lg font-semibold">
                                                                        {displayName}
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500">
                                                                        From{" "}
                                                                        <span className="font-bold">
                                                                            ${Number(price).toFixed(2)}
                                                                        </span>
                                                                    </p>
                                                                    {t.description && (
                                                                        <p className="text-sm text-gray-600">
                                                                            {t.description}
                                                                        </p>
                                                                    )}
                                                                </CardContent>
                                                                <div className="px-5 pb-5">
                                                                    <Button
                                                                        className="w-full bg-black text-white"
                                                                        onClick={() => startPurchase(t)}
                                                                    >
                                                                        Purchase Ticket
                                                                    </Button>
                                                                </div>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                    </section>
                                </>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer2 />
        </div>
    );
};

export default EventDetailsPage;
