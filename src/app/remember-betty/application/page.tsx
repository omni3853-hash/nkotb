"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";

import { AssistanceApplicationsApi } from "@/api/application.api";
import {
    CreateAssistanceApplicationFormData,
    CreateAssistanceApplicationSchema,
} from "@/utils/schemas/schemas";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { TiChevronLeft } from "react-icons/ti";

const navLinks = [
    { label: "About", href: "/remember-betty/about" },
    { label: "Donate", href: "/remember-betty/donate" },
    { label: "Need Help", href: "/remember-betty/application" },
    { label: "Volunteer", href: "/remember-betty/volunteer" },
    { label: "Gallery", href: "/remember-betty/gallery" },
];

const ApplicationPage: React.FC = () => {
    const [step, setStep] = useState<"info" | "form">("info");
    const pathname = usePathname();

    // Upload state (per document)
    const [applicationUploadProgress, setApplicationUploadProgress] = useState<number | null>(null);
    const [applicationUploadError, setApplicationUploadError] = useState<string | null>(null);

    const [diagnosisUploadProgress, setDiagnosisUploadProgress] = useState<number | null>(null);
    const [diagnosisUploadError, setDiagnosisUploadError] = useState<string | null>(null);

    const [personalUploadProgress, setPersonalUploadProgress] = useState<number | null>(null);
    const [personalUploadError, setPersonalUploadError] = useState<string | null>(null);

    const [submitError, setSubmitError] = useState<string | null>(null);

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
    } = useForm<CreateAssistanceApplicationFormData>({
        // FIX: cast resolver to any to avoid type mismatch between RHF and @hookform/resolvers
        resolver: zodResolver(CreateAssistanceApplicationSchema) as any,
        mode: "onChange",
        defaultValues: {
            applicantName: "",
            applicantEmail: "",
            applicantPhone: "",
            mailingAddress: "",
            birthDate: "",
            ssnLast4: "",
            diagnosisDate: "",
            diagnosisDescription: "",
            monthlyIncome: 0,
            isEmployed: false,
            inActiveTreatment: false,
            socialWorkerName: "",
            socialWorkerFacility: "",
            applicationPdfUrl: "",
            diagnosisLetterUrl: "",
            personalStatementUrl: "",
        },
    });

    const applicationPdfUrl = watch("applicationPdfUrl");
    const diagnosisLetterUrl = watch("diagnosisLetterUrl");
    const personalStatementUrl = watch("personalStatementUrl");

    // -------------------------------------------------------------------------
    // Upload handlers – Cloudinary
    // -------------------------------------------------------------------------

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        targetField: keyof CreateAssistanceApplicationFormData,
        setProgress: (v: number | null) => void,
        setError: (v: string | null) => void,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setError(null);
            setProgress(0);
            const res = await uploadToCloudinary(file, {
                onProgress: (pct) => setProgress(pct),
            });

            setValue(targetField, res.url, { shouldValidate: true });
        } catch (err) {
            console.error(err);
            setError("Failed to upload file. Please try again.");
        } finally {
            setProgress(null);
        }
    };

    const handleApplicationFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFileUpload(
            e,
            "applicationPdfUrl",
            setApplicationUploadProgress,
            setApplicationUploadError,
        );

    const handleDiagnosisFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFileUpload(
            e,
            "diagnosisLetterUrl",
            setDiagnosisUploadProgress,
            setDiagnosisUploadError,
        );

    const handlePersonalFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFileUpload(
            e,
            "personalStatementUrl",
            setPersonalUploadProgress,
            setPersonalUploadError,
        );

    // -------------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------------

    const onSubmit = async (values: CreateAssistanceApplicationFormData) => {
        setSubmitError(null);

        try {
            await AssistanceApplicationsApi.create(values);

            toast.success(
                "Application submitted successfully! We will review it and get back to you.",
            );

            reset({
                applicantName: "",
                applicantEmail: "",
                applicantPhone: "",
                mailingAddress: "",
                birthDate: "",
                ssnLast4: "",
                diagnosisDate: "",
                diagnosisDescription: "",
                monthlyIncome: 0,
                isEmployed: false,
                inActiveTreatment: false,
                socialWorkerName: "",
                socialWorkerFacility: "",
                applicationPdfUrl: "",
                diagnosisLetterUrl: "",
                personalStatementUrl: "",
            });

            setStep("info");
        } catch (error: any) {
            console.error(error);
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to submit application. Please try again.";
            setSubmitError(msg);
            toast.error(msg);
        }
    };

    // -------------------------------------------------------------------------
    // INFO STEP
    // -------------------------------------------------------------------------

    if (step === "info") {
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

                <main className="flex-1">
                    {/* Hero */}
                    <section className="bg-gradient-to-r from-pink-500 to-pink-300 text-white py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h1 className="text-5xl font-black mb-4">NEED HELP?</h1>
                            <p className="text-xl max-w-3xl mx-auto font-medium">
                                The financial burden caused by breast cancer can be overwhelming for
                                patients and survivors. Apply for assistance with the Remember Betty
                                Foundation.
                            </p>
                        </div>
                    </section>

                    {/* Information */}
                    <section className="py-16 bg-white">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                            <Card className="bg-pink-50 border border-pink-100">
                                <CardHeader>
                                    <CardTitle className="text-3xl font-black">
                                        WE ARE HERE TO HELP.
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-lg">
                                    <p>
                                        To apply for assistance with the Remember Betty Foundation,
                                        only a small amount of paperwork is required:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-2 ml-4">
                                        <li className="font-bold">GRANT APPLICATION</li>
                                        <li className="font-bold">LETTER OF DIAGNOSIS</li>
                                        <li className="font-bold">PERSONAL NOTE</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card className="bg-yellow-50 border-2 border-yellow-400">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-black text-yellow-900">
                                        IMPORTANT INFORMATION
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-gray-800 text-sm sm:text-base">
                                        <li>
                                            • Applications are only accepted from the{" "}
                                            <strong>1st – 7th of each month</strong>.
                                        </li>
                                        <li>
                                            • Applications are only considered for the month in which
                                            they are received and will not be retained for future
                                            review.
                                        </li>
                                        <li>
                                            • Applications must be <strong>8 pages or less</strong>, or
                                            they will not be considered.
                                        </li>
                                        <li>
                                            • Applications MUST be signed by the applicant ONLY. Social
                                            workers, family members, or other third-party signatures
                                            will NOT be considered.
                                        </li>
                                        <li>
                                            • You do NOT need to be in active treatment to be
                                            considered for assistance.
                                        </li>
                                        <li>
                                            • Applications will be reviewed no later than the{" "}
                                            <strong>17th of each month</strong>.
                                        </li>
                                        <li>
                                            • Assistance will be distributed by the end of the month
                                            for grant recipients.
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="bg-gray-50 border border-gray-200">
                                <CardContent>
                                    <p className="text-lg text-gray-700">
                                        <strong>Please note:</strong> Remember Betty receives, on
                                        average, upwards of 250 applications per month. Our current
                                        funding allows us to accept between 5 – 7 applicants, per
                                        month, to assist. While we would love to assist every
                                        applicant who qualifies, it is simply not within our power to
                                        do so at this time.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-green-50 border-2 border-green-400">
                                <CardHeader>
                                    <CardTitle className="text-2xl font-black text-green-900">
                                        GRANT AMOUNTS
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg text-gray-800">
                                        Grants are given in the amounts of{" "}
                                        <strong>$500 to $1,000</strong>, per recipient, based on need
                                        and funding available.
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="text-center">
                                <Button
                                    onClick={() => setStep("form")}
                                    className="bg-pink-600 hover:bg-pink-700 text-white py-4 px-12 font-black uppercase text-xl tracking-wider rounded-full transition-all"
                                >
                                    Proceed to Application
                                </Button>
                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-gray-600 mb-4">
                                    For additional information or questions, please contact:
                                </p>
                                <a
                                    href="mailto:bethany@rememberbetty.com"
                                    className="text-pink-600 font-bold text-lg hover:underline"
                                >
                                    bethany@rememberbetty.com
                                </a>
                            </div>
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
    }

    // -------------------------------------------------------------------------
    // FORM STEP
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

            <main className="flex-1">
                <section className="py-16 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                        <Button
                            variant="link"
                            onClick={() => setStep("info")}
                            className="px-0 text-pink-600 font-bold hover:underline"
                        >
                            ← Back to Information
                        </Button>

                        <Card className="border-2 border-zinc-200 rounded-2xl shadow-sm">
                            <CardHeader className="border-b border-zinc-100">
                                <div className="space-y-2">
                                    <CardTitle className="text-3xl font-black">
                                        Application for Assistance
                                    </CardTitle>
                                    <p className="text-sm text-gray-500">
                                        Step 1 — Your details · Step 2 — Diagnosis & finances · Step 3 —
                                        Upload documents & submit
                                    </p>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-8">
                                {/* Steps summary */}
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
                                    <span>
                                        <span className="font-semibold">Step 1:</span> Personal
                                        information
                                    </span>
                                    <span>
                                        <span className="font-semibold">Step 2:</span> Diagnosis &amp;
                                        financial details
                                    </span>
                                    <span>
                                        <span className="font-semibold">Step 3:</span> Upload required
                                        documents &amp; submit
                                    </span>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                    {/* Personal Information */}
                                    <section className="bg-gray-50 rounded-lg p-6 space-y-4">
                                        <h2 className="text-2xl font-black">
                                            Personal Information
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="applicantName">Full Name *</Label>
                                                <Input
                                                    id="applicantName"
                                                    placeholder="Full Name"
                                                    {...register("applicantName")}
                                                    aria-invalid={!!errors.applicantName}
                                                />
                                                {errors.applicantName && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.applicantName.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="applicantEmail">
                                                    Email Address *
                                                </Label>
                                                <Input
                                                    id="applicantEmail"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    {...register("applicantEmail")}
                                                    aria-invalid={!!errors.applicantEmail}
                                                />
                                                {errors.applicantEmail && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.applicantEmail.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="applicantPhone">
                                                    Phone Number (optional)
                                                </Label>
                                                <Input
                                                    id="applicantPhone"
                                                    type="tel"
                                                    placeholder="+1 000 000 0000"
                                                    {...register("applicantPhone")}
                                                    aria-invalid={!!errors.applicantPhone}
                                                />
                                                {errors.applicantPhone && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.applicantPhone.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="mailingAddress">
                                                    Complete Mailing Address (including City, State
                                                    and Zip Code) *
                                                </Label>
                                                <Textarea
                                                    id="mailingAddress"
                                                    rows={3}
                                                    {...register("mailingAddress")}
                                                    aria-invalid={!!errors.mailingAddress}
                                                />
                                                {errors.mailingAddress && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.mailingAddress.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="birthDate">Birth Date *</Label>
                                                    <Input
                                                        id="birthDate"
                                                        type="date"
                                                        {...register("birthDate")}
                                                        aria-invalid={!!errors.birthDate}
                                                    />
                                                    {errors.birthDate && (
                                                        <p className="text-xs text-red-600">
                                                            {errors.birthDate.message}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="ssnLast4">
                                                        Last 4 Digits of SSN *
                                                    </Label>
                                                    <Input
                                                        id="ssnLast4"
                                                        maxLength={4}
                                                        placeholder="XXXX"
                                                        {...register("ssnLast4")}
                                                        aria-invalid={!!errors.ssnLast4}
                                                    />
                                                    {errors.ssnLast4 && (
                                                        <p className="text-xs text-red-600">
                                                            {errors.ssnLast4.message}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Diagnosis Information */}
                                    <section className="bg-gray-50 rounded-lg p-6 space-y-4">
                                        <h2 className="text-2xl font-black">
                                            Diagnosis Information
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="diagnosisDate">
                                                    Date of Diagnosis *
                                                </Label>
                                                <Input
                                                    id="diagnosisDate"
                                                    type="date"
                                                    {...register("diagnosisDate")}
                                                    aria-invalid={!!errors.diagnosisDate}
                                                />
                                                {errors.diagnosisDate && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.diagnosisDate.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="diagnosisDescription">
                                                    Description of Diagnosis *
                                                </Label>
                                                <Textarea
                                                    id="diagnosisDescription"
                                                    rows={4}
                                                    placeholder="Include staging / oncotype information, such as triple negative, ER+, etc."
                                                    {...register("diagnosisDescription")}
                                                    aria-invalid={!!errors.diagnosisDescription}
                                                />
                                                {errors.diagnosisDescription && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.diagnosisDescription.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Financial & Employment */}
                                    <section className="bg-gray-50 rounded-lg p-6 space-y-4">
                                        <h2 className="text-2xl font-black">
                                            Financial & Employment Information
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="monthlyIncome">
                                                    Current Average Household Monthly Income *
                                                </Label>
                                                <Input
                                                    id="monthlyIncome"
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    placeholder="0"
                                                    {...register("monthlyIncome", {
                                                        valueAsNumber: true,
                                                    })}
                                                    aria-invalid={!!errors.monthlyIncome}
                                                />
                                                {errors.monthlyIncome && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.monthlyIncome.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                <div className="flex items-center">
                                                    <input
                                                        id="isEmployed"
                                                        type="checkbox"
                                                        className="w-5 h-5 mr-2"
                                                        {...register("isEmployed")}
                                                    />
                                                    <Label
                                                        htmlFor="isEmployed"
                                                        className="font-semibold text-sm"
                                                    >
                                                        Currently employed
                                                    </Label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        id="inActiveTreatment"
                                                        type="checkbox"
                                                        className="w-5 h-5 mr-2"
                                                        {...register("inActiveTreatment")}
                                                    />
                                                    <Label
                                                        htmlFor="inActiveTreatment"
                                                        className="font-semibold text-sm"
                                                    >
                                                        In active treatment
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Social Worker */}
                                    <section className="bg-gray-50 rounded-lg p-6 space-y-4">
                                        <h2 className="text-2xl font-black">
                                            Social Worker / Navigator (Optional)
                                        </h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="socialWorkerName">
                                                    Social Worker / Navigator Name
                                                </Label>
                                                <Input
                                                    id="socialWorkerName"
                                                    {...register("socialWorkerName")}
                                                    aria-invalid={!!errors.socialWorkerName}
                                                />
                                                {errors.socialWorkerName && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.socialWorkerName.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="socialWorkerFacility">
                                                    Facility or Hospital Name
                                                </Label>
                                                <Input
                                                    id="socialWorkerFacility"
                                                    {...register("socialWorkerFacility")}
                                                    aria-invalid={!!errors.socialWorkerFacility}
                                                />
                                                {errors.socialWorkerFacility && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.socialWorkerFacility.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Documents – Cloudinary uploads */}
                                    <section className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 space-y-4">
                                        <h2 className="text-2xl font-black">Required Documents</h2>
                                        <p className="text-sm text-gray-700">
                                            Please upload your documents (PDF preferred). After upload,
                                            we will store a secure URL with your application.
                                        </p>

                                        {/* Application PDF */}
                                        <div className="space-y-2">
                                            <Label htmlFor="applicationPdfFile">
                                                Grant Application (PDF) *
                                            </Label>
                                            <Input
                                                id="applicationPdfFile"
                                                type="file"
                                                accept="application/pdf,image/*"
                                                onChange={handleApplicationFileChange}
                                            />
                                            {applicationUploadProgress !== null && (
                                                <div className="mt-1 h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-2 bg-black transition-all"
                                                        style={{
                                                            width: `${applicationUploadProgress}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {applicationUploadError && (
                                                <p className="text-xs text-red-600">
                                                    {applicationUploadError}
                                                </p>
                                            )}
                                            {errors.applicationPdfUrl && (
                                                <p className="text-xs text-red-600">
                                                    {errors.applicationPdfUrl.message}
                                                </p>
                                            )}
                                            {applicationPdfUrl && !errors.applicationPdfUrl && (
                                                <p className="text-xs text-green-600">
                                                    Application uploaded. You can upload again to
                                                    replace it.
                                                </p>
                                            )}
                                        </div>

                                        {/* Diagnosis Letter */}
                                        <div className="space-y-2">
                                            <Label htmlFor="diagnosisLetterFile">
                                                Diagnosis Letter (PDF) *
                                            </Label>
                                            <Input
                                                id="diagnosisLetterFile"
                                                type="file"
                                                accept="application/pdf,image/*"
                                                onChange={handleDiagnosisFileChange}
                                            />
                                            {diagnosisUploadProgress !== null && (
                                                <div className="mt-1 h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-2 bg-black transition-all"
                                                        style={{
                                                            width: `${diagnosisUploadProgress}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {diagnosisUploadError && (
                                                <p className="text-xs text-red-600">
                                                    {diagnosisUploadError}
                                                </p>
                                            )}
                                            {errors.diagnosisLetterUrl && (
                                                <p className="text-xs text-red-600">
                                                    {errors.diagnosisLetterUrl.message}
                                                </p>
                                            )}
                                            {diagnosisLetterUrl && !errors.diagnosisLetterUrl && (
                                                <p className="text-xs text-green-600">
                                                    Diagnosis letter uploaded. You can upload again
                                                    to replace it.
                                                </p>
                                            )}
                                        </div>

                                        {/* Personal Statement */}
                                        <div className="space-y-2">
                                            <Label htmlFor="personalStatementFile">
                                                Personal Statement (Optional)
                                            </Label>
                                            <Input
                                                id="personalStatementFile"
                                                type="file"
                                                accept="application/pdf,image/*"
                                                onChange={handlePersonalFileChange}
                                            />
                                            {personalUploadProgress !== null && (
                                                <div className="mt-1 h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-2 bg-black transition-all"
                                                        style={{
                                                            width: `${personalUploadProgress}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {personalUploadError && (
                                                <p className="text-xs text-red-600">
                                                    {personalUploadError}
                                                </p>
                                            )}
                                            {errors.personalStatementUrl && (
                                                <p className="text-xs text-red-600">
                                                    {errors.personalStatementUrl.message}
                                                </p>
                                            )}
                                            {personalStatementUrl &&
                                                !errors.personalStatementUrl && (
                                                    <p className="text-xs text-green-600">
                                                        Personal statement uploaded. You can upload
                                                        again to replace it.
                                                    </p>
                                                )}
                                        </div>
                                    </section>

                                    {/* Confirm & Submit */}
                                    <section className="border-t border-zinc-200 pt-4 space-y-4">
                                        {submitError && (
                                            <p className="text-sm text-red-600">{submitError}</p>
                                        )}

                                        <p className="text-sm text-gray-600">
                                            By submitting this application, I confirm that all
                                            information provided is accurate and that I am the
                                            applicant.
                                        </p>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !isValid}
                                                className="bg-pink-600 hover:bg-pink-700 text-white px-10"
                                            >
                                                {isSubmitting
                                                    ? "Submitting..."
                                                    : "Submit Application"}
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

export default ApplicationPage;
