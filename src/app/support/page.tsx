"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageSquare, Phone, ArrowLeft } from "lucide-react";

import { Header2 } from "@/components/header2";
import { Footer2 } from "@/components/footer2";

import {
    CreateSupportTicketSchema,
    type CreateSupportTicketFormData,
} from "@/utils/schemas/schemas";
import { SupportApi } from "@/api/support.api";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SupportPage: React.FC = () => {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [createdTicket, setCreatedTicket] =
        useState<Awaited<ReturnType<typeof SupportApi.create>> | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateSupportTicketFormData>({
        resolver: zodResolver(CreateSupportTicketSchema),
        mode: "onChange",
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
            // priority is optional, we leave it undefined by default
        },
    });

    const onSubmit = async (values: CreateSupportTicketFormData) => {
        try {
            setSubmitError(null);
            const ticket = await SupportApi.create(values);
            setCreatedTicket(ticket);
        } catch (err: any) {
            console.error(err);
            const apiMsg =
                err?.response?.data?.message ||
                err?.message ||
                "Unable to send your message. Please try again.";
            setSubmitError(apiMsg);
        }
    };

    const handleCreateAnother = () => {
        setCreatedTicket(null);
        setSubmitError(null);
        reset({
            fullName: "",
            email: "",
            phone: "",
            subject: "",
            message: "",
        });
    };

    const goBack = () => {
        if (typeof window !== "undefined") {
            window.history.back();
        }
    };

    const goHome = () => {
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Header2 />

            <main className="flex-1 bg-white py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={goBack}
                            className="mb-3 text-gray-600 hover:text-black px-0"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
                            Contact Support
                        </h1>
                        <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl">
                            Having trouble with an event, tickets, or your account? Send us a
                            message and our support team will get back to you as soon as
                            possible.
                        </p>
                    </div>

                    {/* SUCCESS VIEW */}
                    {createdTicket ? (
                        <Card className="border-2 border-emerald-200 rounded-2xl shadow-sm">
                            <CardHeader className="border-b border-emerald-100 pb-4">
                                <CardTitle className="flex items-center gap-3 text-emerald-900">
                                    <div className="rounded-full bg-emerald-50 border border-emerald-200 p-2">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    Message sent to support
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <p className="text-sm text-gray-700">
                                    Thank you for reaching out. We will get back to you as soon as possible.
                                </p>

                                <p className="text-xs text-gray-500">
                                    You&apos;ll receive updates and replies at{" "}
                                    <span className="font-medium">
                                        {createdTicket.contact.email}
                                    </span>
                                    . Please keep an eye on your inbox.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button type="button" onClick={handleCreateAnother}>
                                        Send another message
                                    </Button>
                                    <Button type="button" variant="outline" onClick={goHome}>
                                        Go to homepage
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        // FORM VIEW
                        <Card className="border-2 border-zinc-200 rounded-2xl shadow-sm">
                            <CardHeader className="border-b border-zinc-100 pb-4">
                                <CardTitle className="flex items-center gap-3">
                                    <div className="rounded-full bg-zinc-50 border border-zinc-200 p-2">
                                        <Mail className="h-5 w-5 text-zinc-700" />
                                    </div>
                                    Send a support message
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="pt-6">
                                {submitError && (
                                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {submitError}
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-6"
                                    noValidate
                                >
                                    {/* Contact details */}
                                    <div className="space-y-4">
                                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                                            Your contact details
                                        </h2>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">Full name *</Label>
                                                <Input
                                                    id="fullName"
                                                    placeholder="Jane Doe"
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
                                                <Label htmlFor="email">Email *</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="jane@example.com"
                                                    {...register("email")}
                                                    aria-invalid={!!errors.email}
                                                />
                                                {errors.email && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.email.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2 sm:col-span-2">
                                                <Label htmlFor="phone">
                                                    Phone (optional, for quicker contact)
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="h-4 w-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                                    <Input
                                                        id="phone"
                                                        placeholder="+234 000 000 0000"
                                                        className="pl-9"
                                                        {...register("phone")}
                                                        aria-invalid={!!errors.phone}
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="text-xs text-red-600">
                                                        {errors.phone.message as string}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message details */}
                                    <div className="space-y-4">
                                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                                            Your message
                                        </h2>

                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject *</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Tell us briefly what you need help with"
                                                {...register("subject")}
                                                aria-invalid={!!errors.subject}
                                            />
                                            {errors.subject && (
                                                <p className="text-xs text-red-600">
                                                    {errors.subject.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message *</Label>
                                            <Textarea
                                                id="message"
                                                rows={5}
                                                placeholder="Please describe the issue, including any relevant order IDs, event names, or screenshots."
                                                {...register("message")}
                                                aria-invalid={!!errors.message}
                                            />
                                            {errors.message && (
                                                <p className="text-xs text-red-600">
                                                    {errors.message.message}
                                                </p>
                                            )}
                                            <p className="text-[11px] text-gray-500">
                                                The more detail you provide, the faster we can help you.
                                            </p>
                                        </div>

                                        {/* Priority is already supported by the schema (optional).
                                            You can wire in a Select for SupportPriority later if desired. */}
                                    </div>

                                    {/* Submit actions */}
                                    <div className="border-t border-zinc-200 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <p className="text-xs text-gray-500 max-w-sm">
                                            By submitting, you agree that we may contact you using
                                            the details provided to resolve your request.
                                        </p>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto"
                                        >
                                            {isSubmitting ? "Sending…" : "Send message to support"}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            <Footer2 />
        </div>
    );
};

export default SupportPage;