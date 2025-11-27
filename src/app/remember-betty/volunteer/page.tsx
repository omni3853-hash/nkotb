"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";

import {
    CreateVolunteerFormData,
    CreateVolunteerSchema,
} from "@/utils/schemas/schemas";
import { VolunteersApi } from "@/api/volunteer.api";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const navLinks = [
    { label: "About", href: "/remember-betty/about" },
    { label: "Donate", href: "/remember-betty/donate" },
    { label: "Need Help", href: "/remember-betty/application" },
    { label: "Volunteer", href: "/remember-betty/volunteer" },
    { label: "Gallery", href: "/remember-betty/gallery" },
];

const interestOptions = [
    "Fundraising Events",
    "Community Outreach",
    "Social Media",
    "Administrative Support",
    "Event Planning",
    "Marketing & Communications",
    "Grant Writing",
    "Other",
];

const VolunteerPage: React.FC = () => {
    const pathname = usePathname();
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
    } = useForm<CreateVolunteerFormData>({
        resolver: zodResolver(CreateVolunteerSchema),
        mode: "onChange",
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            interests: [],
            availability: "",
            notes: "",
        },
    });

    const selectedInterests = watch("interests") || [];

    const toggleInterest = (interest: string) => {
        const current = selectedInterests || [];
        const next = current.includes(interest)
            ? current.filter((i: string) => i !== interest)
            : [...current, interest];

        setValue("interests", next, { shouldValidate: true });
    };

    // -------------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------------

    const onSubmit = async (values: CreateVolunteerFormData) => {
        setSubmitError(null);

        try {
            await VolunteersApi.create(values);

            toast.success(
                "Thank you for your interest! We've received your volunteer application.",
            );

            reset({
                fullName: "",
                email: "",
                phone: "",
                interests: [],
                availability: "",
                notes: "",
            });
        } catch (error: any) {
            console.error(error);
            const msg =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to submit volunteer application. Please try again.";
            setSubmitError(msg);
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

            <main className="flex-1">
                {/* Hero */}
                <section className="bg-gradient-to-r from-pink-500 to-pink-300 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-5xl font-black mb-4">GET INVOLVED</h1>
                        <p className="text-xl max-w-3xl mx-auto font-medium">
                            The Remember Betty Foundation thrives on the work of its teams and
                            volunteers. Whether you&apos;re interested in starting a brand new
                            chapter, joining an existing one, getting involved as a corporate
                            sponsor, or simply volunteering within our organization - we&apos;d
                            love to have you!
                        </p>
                    </div>
                </section>

                {/* Volunteer Form */}
                <section className="py-16 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                        <div className="text-center">
                            <h2 className="text-4xl font-black mb-4">
                                JOIN OR START A TEAM
                            </h2>
                            <p className="text-xl text-gray-700">
                                Reach out to one of our active teams for more information on how
                                to join their fundraising efforts. Interested in starting your own
                                chapter, involving your business, or have additional questions?
                            </p>
                        </div>

                        <Card className="border-2 border-zinc-200 rounded-2xl shadow-sm">
                            <CardHeader className="border-b border-zinc-100">
                                <div className="space-y-2 text-center sm:text-left">
                                    <CardTitle className="text-2xl font-bold">
                                        Volunteer Application
                                    </CardTitle>
                                    <p className="text-sm text-gray-500">
                                        Step 1 — Your information · Step 2 — Areas of interest ·
                                        Step 3 — Availability &amp; additional notes
                                    </p>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6 space-y-8">
                                {/* Steps summary */}
                                <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
                                    <span>
                                        <span className="font-semibold">Step 1:</span> Your
                                        details
                                    </span>
                                    <span>
                                        <span className="font-semibold">Step 2:</span> Select
                                        interests
                                    </span>
                                    <span>
                                        <span className="font-semibold">Step 3:</span> Share your
                                        availability
                                    </span>
                                </div>

                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-8"
                                >
                                    {/* Personal Information */}
                                    <section className="bg-pink-50 rounded-lg p-6 space-y-4">
                                        <h3 className="text-2xl font-black">
                                            Your Information
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">
                                                    Full Name *
                                                </Label>
                                                <Input
                                                    id="fullName"
                                                    placeholder="Full Name"
                                                    {...register("fullName")}
                                                    aria-invalid={!!errors.fullName}
                                                />
                                                {errors.fullName && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.fullName.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Email Address *
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    {...register("email")}
                                                    aria-invalid={!!errors.email}
                                                />
                                                {errors.email && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.email.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">
                                                    Phone Number (optional)
                                                </Label>
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+1 000 000 0000"
                                                    {...register("phone")}
                                                    aria-invalid={!!errors.phone}
                                                />
                                                {errors.phone && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.phone.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* Interests */}
                                    <section className="bg-gray-50 rounded-lg p-6 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <h3 className="text-2xl font-black">
                                                Areas of Interest *
                                            </h3>
                                            {errors.interests && (
                                                <p className="text-xs text-red-600">
                                                    {errors.interests.message as string}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {interestOptions.map((option) => {
                                                const checked =
                                                    selectedInterests.includes(
                                                        option,
                                                    );
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleInterest(option)
                                                        }
                                                        className={`flex items-center justify-between w-full border rounded-lg px-4 py-3 text-sm text-left transition-colors ${checked
                                                            ? "border-pink-600 bg-pink-50"
                                                            : "border-gray-300 hover:border-pink-400"
                                                            }`}
                                                    >
                                                        <span>{option}</span>
                                                        <span
                                                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${checked
                                                                ? "bg-pink-600 border-pink-600"
                                                                : "border-gray-400"
                                                                }`}
                                                        >
                                                            {checked && (
                                                                <span className="h-2 w-2 rounded-full bg-white" />
                                                            )}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Hidden input so RHF knows about the field */}
                                        <input
                                            type="hidden"
                                            {...register("interests")}
                                        />
                                    </section>

                                    {/* Availability */}
                                    <section className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="availability">
                                                Availability (Optional)
                                            </Label>
                                            <Textarea
                                                id="availability"
                                                rows={3}
                                                placeholder="Let us know when you're available to help..."
                                                {...register("availability")}
                                                aria-invalid={
                                                    !!errors.availability
                                                }
                                            />
                                            {errors.availability && (
                                                <p className="text-xs text-red-600">
                                                    {errors.availability.message}
                                                </p>
                                            )}
                                        </div>
                                    </section>

                                    {/* Additional Notes */}
                                    <section className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">
                                                Additional Information
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                rows={5}
                                                placeholder="Tell us more about yourself, how you’d like to help, or any questions you have..."
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

                                    {/* Submit */}
                                    <section className="border-t border-zinc-200 pt-4 space-y-4">
                                        {submitError && (
                                            <p className="text-sm text-red-600">
                                                {submitError}
                                            </p>
                                        )}

                                        <div className="text-center">
                                            <p className="mb-4 text-gray-600 text-sm">
                                                By submitting this form, you
                                                confirm your interest in
                                                volunteering with the Remember
                                                Betty Foundation. Our team will
                                                review your details and get back
                                                to you.
                                            </p>
                                            <Button
                                                type="submit"
                                                disabled={
                                                    isSubmitting || !isValid
                                                }
                                                className="bg-pink-600 hover:bg-pink-700 text-white py-4 px-12 font-black uppercase text-xl tracking-wider rounded-full transition-all disabled:opacity-50"
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

                        {/* Contact Info */}
                        <Card className="bg-gray-50 border border-gray-200 mt-6">
                            <CardContent className="py-8 text-center space-y-3">
                                <h3 className="text-2xl font-black">
                                    Have Questions?
                                </h3>
                                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                                    For more information about volunteering or
                                    starting a chapter, please contact the
                                    Remember Betty team and we’ll be happy to
                                    guide you.
                                </p>
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
                            We are a 501(c)3 tax exempt organization whose
                            mission is to help minimize the financial burden
                            associated with breast cancer for patients and
                            survivors so that they can focus on recovery &amp;
                            quality of life.
                        </p>
                    </div>
                </div>
            </section>

            <Footer2 />
        </div>
    );
};

export default VolunteerPage;