"use client";

import { useState } from "react";
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RequestResetFormData, RequestResetSchema } from "@/utils/schemas/schemas";
import { AuthApi } from "@/api/auth.api";

export function ForgotPasswordForm() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { setCurrentStep, setUserEmail } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RequestResetFormData>({
    resolver: zodResolver(RequestResetSchema),
    defaultValues: { email: "" },
  });

  const email = watch("email");

  const onSubmit = async (values: RequestResetFormData) => {
    try {
      await AuthApi.requestPasswordReset(values);
      setUserEmail(values.email);
      setIsEmailSent(true);
      toast.success("Password reset email sent successfully");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.response?.message || "Failed to send reset email";
      setError("email", { message: msg });
      toast.error(msg);
    }
  };

  const handleResendEmail = async () => {
    try {
      await AuthApi.requestPasswordReset({ email });
      toast.success("Reset email sent again");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || err?.response?.message || "Failed to resend email";
      toast.error(msg);
    }
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-sm">
        <div className="mb-12">
          <div className="flex items-center gap-2">
            <img
              alt="Premier Talent Agency Logo"
              src="/logo.png"
              className="h-10 w-auto"
            />
            <span className="font-semibold text-2xl text-black">Premier Talent Agency</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Check Your Email</h1>
          <p className="text-sm text-gray-600 mb-4">We've sent a password reset link to</p>
          <p className="text-sm font-medium text-gray-900 mb-6">{email}</p>
          <p className="text-xs text-gray-500 mb-8">Didn't receive the email? Check your spam folder or try again.</p>
        </div>

        <Button
          type="button"
          onClick={handleResendEmail}
          disabled={isSubmitting}
          className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Sending..." : "Resend Email"}
        </Button>

        <Button
          type="button"
          onClick={() => setCurrentStep("login")}
          className="w-full bg-zinc-200 hover:bg-zinc-200/70 text-zinc-700 font-semibold py-6 rounded-lg"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
      <div className="mb-12">
        <div className="flex items-center gap-2">
          <img
            alt="Premier Talent Agency Logo"
            src="/logo.png"
            className="h-10 w-auto"
          />
          <span className="font-semibold text-2xl text-black">Premier Talent Agency</span>
        </div>
      </div>

      <h1 className="text-4xl font-bold text-emerald-900 mb-2">Forgot Password?</h1>
      <p className="text-sm text-gray-600 mb-8">No worries, we'll send you reset instructions.</p>

      <div className="mb-6">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="email"
            placeholder="john@doe@gmail.com"
            {...register("email")}
            className={`w-full pl-10 pr-4 py-3 text-[14px] border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-emerald-900"
              }`}
          />
        </div>
        {errors.email?.message && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.email.message}</span>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>

      <Button
        type="button"
        onClick={() => setCurrentStep("login")}
        className="w-full bg-zinc-200 hover:bg-zinc-200/70 text-zinc-700 font-semibold py-6 rounded-lg flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Button>
    </form>
  );
}
