"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { DonationsApi } from "@/api/donation.api";
import { UserPaymentMethodsApi } from "@/api/payment-methods.api";
import {
    CreateDonationSchema,
    type CreateDonationFormData,
} from "@/utils/schemas/schemas";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

// -----------------------------------------------------------------------------
// Shared nav
// -----------------------------------------------------------------------------

const navLinks = [
    { label: "About", href: "/remember-betty/about" },
    { label: "Donate", href: "/remember-betty/donate" },
    { label: "Need Help", href: "/remember-betty/application" },
    { label: "Volunteer", href: "/remember-betty/volunteer" },
    { label: "Gallery", href: "/remember-betty/gallery" },
];

// -----------------------------------------------------------------------------
// Form schema – extend CreateDonationSchema for UI-only validations
// -----------------------------------------------------------------------------

const DonationFormSchema = CreateDonationSchema.omit({
    paymentMethodId: true,
    proofOfPayment: true,
}).extend({
    paymentMethodId: z.string().min(1, "Please select a payment method."),
    proofOfPayment: z.string().min(1, "Please upload your payment receipt."),
});

type DonationFormData = z.infer<typeof DonationFormSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const DonatePage: React.FC = () => {
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [methodsError, setMethodsError] = useState<string | null>(null);

    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [selectedPreset, setSelectedPreset] = useState<number | "custom" | null>(
        null,
    );

    const presetAmounts = [25, 50, 100, 250, 500, 1000];

    const pathname = usePathname();

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
    } = useForm<DonationFormData>({
        resolver: zodResolver(DonationFormSchema) as any,
        mode: "onChange",
        defaultValues: {
            donorName: "",
            donorEmail: "",
            donorPhone: "",
            amount: 0,
            frequency: "ONE_TIME" as any,
            dedicatedTo: "",
            isAnonymous: false,
            paymentMethodId: "",
            proofOfPayment: "",
            notes: "",
        },
    });

    const amount = watch("amount");
    const paymentMethodId = watch("paymentMethodId");
    const isAnonymous = watch("isAnonymous");

    const selectedMethod = paymentMethods.find(
        (m) => m._id === paymentMethodId,
    );

    const donationAmount = amount && amount > 0 ? amount : 0;
    const methodFeeRate =
        typeof selectedMethod?.fee === "number" ? selectedMethod.fee : 0;
    const methodFeeAmount =
        donationAmount > 0 && methodFeeRate > 0
            ? (donationAmount * methodFeeRate) / 100
            : 0;
    const finalAmountToPay = donationAmount + methodFeeAmount;

    // -------------------------------------------------------------------------
    // Fetch payment methods
    // -------------------------------------------------------------------------

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
                if (mounted)
                    setMethodsError(
                        "Unable to load donation payment methods at the moment.",
                    );
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
    // Helpers
    // -------------------------------------------------------------------------

    const handlePresetClick = (value: number) => {
        setSelectedPreset(value);
        setValue("amount", value, { shouldValidate: true });
    };

    const handleCustomAmountClick = () => {
        setSelectedPreset("custom");
        setValue("amount", 0, { shouldValidate: false });
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

    const getMethodLabel = (method: any) => {
        if (!method) return "Payment Method";
        switch (method.type) {
            case "BANK_ACCOUNT":
                return "Bank Transfer";
            case "CRYPTO_WALLET":
                return "Crypto Wallet";
            case "MOBILE_PAYMENT":
                return "Mobile Payment";
            default:
                return "Payment Method";
        }
    };

    // -------------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------------

    const onSubmit = async (values: DonationFormData) => {
        setSubmitSuccess(false);

        if (!selectedMethod) {
            toast.error("Please select a payment method.");
            return;
        }

        if (!values.amount || values.amount <= 0) {
            toast.error("Please select or enter a valid donation amount.");
            return;
        }

        try {
            const payload: CreateDonationFormData = {
                ...values,
                paymentMethodId: values.paymentMethodId || undefined,
                proofOfPayment: values.proofOfPayment || undefined,
            };

            await DonationsApi.create(payload);

            setSubmitSuccess(true);
            toast.success(
                "Thank you for your donation! We've received your submission.",
            );

            reset({
                donorName: "",
                donorEmail: "",
                donorPhone: "",
                amount: 0,
                frequency: "ONE_TIME" as any,
                dedicatedTo: "",
                isAnonymous: false,
                paymentMethodId: "",
                proofOfPayment: "",
                notes: "",
            });
            setSelectedPreset(null);
            setUploadError(null);
            setUploadProgress(null);
        } catch (error: any) {
            console.error(error);
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to submit donation. Please try again.";
            toast.error(msg);
        }
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header2 />

            {/* Remember Betty sub-navigation under header */}
            <section className="border-y border-pink-100 bg-white/90 backdrop-blur-sm">
                <div className="max-w-6xl mx-auto px-4">
                    <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-3 text-[11px] md:text-xs tracking-[0.25em] uppercase">
                        {navLinks.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`pb-2 border-b-2 transition-colors ${isActive
                                            ? "border-pink-600 text-pink-700"
                                            : "border-transparent text-pink-500 hover:text-pink-700 hover:border-pink-400"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </section>

            <main className="flex-1 bg-white">
                {/* Hero Banner */}
                <section className="bg-gradient-to-r from-pink-500 to-pink-300 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-block bg-white p-4 rounded-full mb-6">
                            <img
                                src="/betty-hero.webp"
                                alt="Remember Betty"
                                className="w-24 h-24"
                            />
                        </div>
                        <h1 className="text-5xl font-black mb-4">DONATE</h1>
                        <p className="text-xl max-w-3xl mx-auto font-medium">
                            Remember Betty&apos;s mission is to help minimize the
                            financial burden associated with breast cancer for
                            patients &amp; survivors by providing direct financial
                            support to them in the form of grants so that they can
                            focus on recovery &amp; quality of life.
                        </p>
                        <p className="text-lg mt-4 italic">
                            Thank you for supporting the Remember Betty Foundation!
                        </p>
                        <p className="text-sm mt-2">
                            All donations to Remember Betty are tax deductible to
                            the extent permitted by law. Tax ID available upon
                            request.
                        </p>
                    </div>
                </section>

                {/* Donation Card */}
                <section className="py-12 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Card className="border-2 border-zinc-200 rounded-2xl shadow-sm">
                            <CardHeader className="border-b border-zinc-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <CardTitle className="text-2xl font-bold">
                                            Make a Donation
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Step 1 — Choose your amount · Step 2 — Add
                                            your details &amp; pick a payment method ·
                                            Step 3 — Upload proof &amp; submit
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-8">
                                {/* Success notice */}
                                {submitSuccess && (
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-4">
                                        Your donation has been received. Thank you
                                        for helping Remember Betty support patients
                                        and survivors. 💗
                                    </div>
                                )}

                                {/* Steps summary */}
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
                                    <span>
                                        <span className="font-semibold">Step 1:</span>{" "}
                                        Amount &amp; frequency
                                    </span>
                                    <span>
                                        <span className="font-semibold">Step 2:</span>{" "}
                                        Your details &amp; dedication
                                    </span>
                                    <span>
                                        <span className="font-semibold">Step 3:</span>{" "}
                                        Payment method &amp; proof
                                    </span>
                                </div>

                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-8"
                                >
                                    {/* STEP 1 – Amount & Frequency */}
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                                            Step 1 · Donation Amount &amp; Frequency
                                        </h3>

                                        {/* Amount presets */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold">
                                                Select an amount
                                            </Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {presetAmounts.map((amt) => (
                                                    <button
                                                        key={amt}
                                                        type="button"
                                                        onClick={() =>
                                                            handlePresetClick(amt)
                                                        }
                                                        className={`py-3 px-4 text-center rounded-lg text-sm font-semibold border transition-all ${selectedPreset === amt
                                                                ? "bg-pink-600 text-white border-pink-600"
                                                                : "bg-pink-50 text-gray-900 border-pink-100 hover:bg-pink-100"
                                                            }`}
                                                    >
                                                        ${amt}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handleCustomAmountClick}
                                                className={`w-full mt-3 py-3 px-4 rounded-lg text-sm font-semibold border transition-all ${selectedPreset === "custom"
                                                        ? "bg-gray-900 text-white border-gray-900"
                                                        : "bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100"
                                                    }`}
                                            >
                                                Enter a custom amount
                                            </button>

                                            {selectedPreset === "custom" && (
                                                <div className="mt-3 space-y-1">
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        step="0.01"
                                                        placeholder="Enter amount"
                                                        {...register("amount", {
                                                            valueAsNumber: true,
                                                        })}
                                                        aria-invalid={!!errors.amount}
                                                    />
                                                    {errors.amount && (
                                                        <p className="text-xs text-red-600">
                                                            {errors.amount.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {selectedPreset !== "custom" && (
                                                <>
                                                    <input
                                                        type="hidden"
                                                        {...register("amount", {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                    {errors.amount && (
                                                        <p className="text-xs text-red-600 mt-1">
                                                            {errors.amount.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Frequency */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="frequency"
                                                className="text-sm font-semibold"
                                            >
                                                Frequency
                                            </Label>
                                            <select
                                                id="frequency"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                                {...register("frequency")}
                                            >
                                                <option value="ONE_TIME">
                                                    One Time
                                                </option>
                                                <option value="MONTHLY">
                                                    Monthly
                                                </option>
                                                <option value="QUARTERLY">
                                                    Quarterly
                                                </option>
                                                <option value="YEARLY">
                                                    Yearly
                                                </option>
                                            </select>
                                        </div>
                                    </section>

                                    {/* STEP 2 – Donor details & dedication */}
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                                            Step 2 · Your Details &amp; Dedication
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="donorName">
                                                    Full Name *
                                                </Label>
                                                <Input
                                                    id="donorName"
                                                    placeholder="Jane Doe"
                                                    {...register("donorName")}
                                                    aria-invalid={
                                                        !!errors.donorName
                                                    }
                                                />
                                                {errors.donorName && (
                                                    <p className="text-xs text-red-600">
                                                        {
                                                            errors.donorName
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="donorEmail">
                                                    Email *
                                                </Label>
                                                <Input
                                                    id="donorEmail"
                                                    type="email"
                                                    placeholder="jane@example.com"
                                                    {...register("donorEmail")}
                                                    aria-invalid={
                                                        !!errors.donorEmail
                                                    }
                                                />
                                                {errors.donorEmail && (
                                                    <p className="text-xs text-red-600">
                                                        {
                                                            errors.donorEmail
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="donorPhone">
                                                    Phone (optional)
                                                </Label>
                                                <Input
                                                    id="donorPhone"
                                                    type="tel"
                                                    placeholder="+1 000 000 0000"
                                                    {...register("donorPhone")}
                                                    aria-invalid={
                                                        !!errors.donorPhone
                                                    }
                                                />
                                                {errors.donorPhone && (
                                                    <p className="text-xs text-red-600">
                                                        {
                                                            errors.donorPhone
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="dedicatedTo">
                                                    Dedicate my donation to
                                                    (optional)
                                                </Label>
                                                <Input
                                                    id="dedicatedTo"
                                                    placeholder="Name of the person you’re honoring"
                                                    {...register("dedicatedTo")}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    id="isAnonymous"
                                                    type="checkbox"
                                                    className="w-4 h-4"
                                                    {...register("isAnonymous")}
                                                />
                                                <Label
                                                    htmlFor="isAnonymous"
                                                    className="text-sm font-semibold"
                                                >
                                                    Make this donation anonymous
                                                </Label>
                                            </div>
                                            {isAnonymous && (
                                                <p className="text-xs text-gray-500">
                                                    If selected, your name will
                                                    not appear in any public
                                                    donor listings.
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes">
                                                Additional Notes (optional)
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                rows={3}
                                                placeholder="Any additional comments or instructions for the foundation..."
                                                {...register("notes")}
                                                aria-invalid={!!errors.notes}
                                            />
                                            {errors.notes && (
                                                <p className="text-xs text-red-600">
                                                    {errors.notes.message}
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    {/* STEP 3 – Payment method & proof */}
                                    <section className="space-y-4">
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                                            Step 3 · Payment Method &amp; Proof
                                        </h3>

                                        {/* Payment methods */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-sm font-semibold">
                                                    Payment Method *
                                                </Label>
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
                                                        No payment methods are
                                                        currently available.
                                                        Please contact support
                                                        for help completing your
                                                        donation.
                                                    </p>
                                                )}

                                            {!loadingMethods &&
                                                paymentMethods.length > 0 && (
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {paymentMethods.map(
                                                            (method) => {
                                                                const isSelected =
                                                                    paymentMethodId ===
                                                                    method._id;
                                                                const label =
                                                                    getMethodLabel(
                                                                        method,
                                                                    );

                                                                return (
                                                                    <button
                                                                        key={
                                                                            method._id
                                                                        }
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setValue(
                                                                                "paymentMethodId",
                                                                                method._id,
                                                                                {
                                                                                    shouldValidate:
                                                                                        true,
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
                                                                                        {
                                                                                            label
                                                                                        }
                                                                                    </span>
                                                                                    {method.isDefault && (
                                                                                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-black text-white uppercase tracking-wide">
                                                                                            Default
                                                                                        </span>
                                                                                    )}
                                                                                </div>

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
                                                                                                    Acct
                                                                                                    Name:{" "}
                                                                                                    {
                                                                                                        method.accountName
                                                                                                    }
                                                                                                </div>
                                                                                            )}
                                                                                            {method.accountNumber && (
                                                                                                <div>
                                                                                                    Acct
                                                                                                    Number:{" "}
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
                                                                                        method.fee >
                                                                                        0 && (
                                                                                            <span>
                                                                                                {" "}
                                                                                                •
                                                                                                Fee:{" "}
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
                                                            },
                                                        )}
                                                    </div>
                                                )}

                                            {errors.paymentMethodId && (
                                                <p className="mt-1 text-xs text-red-600">
                                                    {
                                                        errors.paymentMethodId
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* Proof + Amount breakdown */}
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
                                                        {
                                                            errors.proofOfPayment
                                                                .message
                                                        }
                                                    </p>
                                                )}
                                                {watch("proofOfPayment") &&
                                                    !errors.proofOfPayment && (
                                                        <p className="mt-1 text-xs text-green-600">
                                                            Proof uploaded. You can
                                                            upload again to replace
                                                            it.
                                                        </p>
                                                    )}
                                            </div>

                                            {/* Amount breakdown */}
                                            <div className="space-y-2">
                                                <Label>Amount Breakdown</Label>
                                                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-xs sm:text-sm space-y-1">
                                                    <div className="flex justify-between">
                                                        <span>Donation amount</span>
                                                        <span className="font-semibold">
                                                            $
                                                            {donationAmount
                                                                .toFixed(2)
                                                                .toString()}
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
                                                            $
                                                            {methodFeeAmount
                                                                .toFixed(2)
                                                                .toString()}
                                                        </span>
                                                    </div>
                                                    <div className="border-t border-dashed border-zinc-300 my-1" />
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold">
                                                            Total to pay
                                                        </span>
                                                        <span className="font-bold">
                                                            $
                                                            {finalAmountToPay
                                                                .toFixed(2)
                                                                .toString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-zinc-500">
                                                    This is the exact amount you
                                                    should transfer using the
                                                    selected payment method before
                                                    submitting this form.
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Confirm */}
                                    <section className="border-t border-zinc-200 pt-4 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-zinc-500">
                                            <span>
                                                By submitting, you confirm you have
                                                already made payment using the
                                                selected method and the details
                                                above are correct.
                                            </span>
                                            <span>
                                                Total:{" "}
                                                <span className="font-semibold">
                                                    $
                                                    {finalAmountToPay
                                                        .toFixed(2)
                                                        .toString()}
                                                </span>
                                            </span>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={
                                                    isSubmitting || !isValid
                                                }
                                            >
                                                {isSubmitting
                                                    ? "Processing..."
                                                    : "Submit Donation"}
                                            </Button>
                                        </div>
                                    </section>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>

            {/* Bottom strip: socials + mission text */}
            <section className="bg-black text-pink-200 py-6 md:py-8">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    {/* Social icons */}
                    <div className="flex items-center justify-center md:justify-start gap-5 text-2xl text-white">
                        <Link
                            href="https://www.instagram.com/rememberbetty/"
                            aria-label="Remember Betty on Instagram"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-pink-300 transition-colors"
                        >
                            <FaInstagram />
                        </Link>
                        <Link
                            href="https://x.com/rememberbetty"
                            aria-label="Remember Betty on X"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-pink-300 transition-colors"
                        >
                            <FaXTwitter />
                        </Link>
                        <Link
                            href="https://web.facebook.com/rememberbetty"
                            aria-label="Remember Betty on Facebook"
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-pink-300 transition-colors"
                        >
                            <FaFacebookF />
                        </Link>
                    </div>

                    <div className="flex-1 flex flex-col items-center md:items-end gap-3 text-center md:text-right">
                        <p className="max-w-xl text-[11px] md:text-xs leading-relaxed">
                            We are a 501(c)3 tax exempt organization whose mission is to help
                            minimize the financial burden associated with breast cancer for
                            patients and survivors so that they can focus on recovery &amp;
                            quality of life.
                        </p>
                    </div>
                </div>
            </section>

            <Footer2 />
        </div>
    );
};

export default DonatePage;
