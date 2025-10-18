"use client";

import { useState } from "react";
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  validateForgotPasswordForm,
  type ForgotPasswordFormData,
} from "@/lib/validation";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { setCurrentStep, setUserEmail } = useAuth();

  const handleInputChange = (
    field: keyof ForgotPasswordFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validation = validateForgotPasswordForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate email sending success/failure
      const isSuccess = Math.random() > 0.1; // 90% success rate for demo

      if (isSuccess) {
        setIsEmailSent(true);
        setUserEmail(formData.email);
        toast.success("Password reset email sent successfully!");
      } else {
        toast.error("Failed to send reset email. Please try again.");
        setErrors({
          email: "Failed to send reset email. Please try again.",
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Forgot password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setCurrentStep("login");
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Reset email sent again!");
    } catch (error) {
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-semibold text-2xl text-black">Logo</span>
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">
            Check Your Email
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            We've sent a password reset link to
          </p>
          <p className="text-sm font-medium text-gray-900 mb-6">
            {formData.email}
          </p>
          <p className="text-xs text-gray-500 mb-8">
            Didn't receive the email? Check your spam folder or try again.
          </p>
        </div>

        {/* Resend Button */}
        <Button
          type="button"
          onClick={handleResendEmail}
          disabled={isLoading}
          className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Sending..." : "Resend Email"}
        </Button>

        {/* Back to Login */}
        <Button
          type="button"
          onClick={handleBackToLogin}
          className="w-full bg-zinc-200 hover:bg-zinc-200/70 text-zinc-700 font-semibold py-6 rounded-lg"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-2xl text-black">Logo</span>
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-emerald-900 mb-2">
        Forgot Password?
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        No worries, we'll send you reset instructions.
      </p>

      {/* Email field */}
      <div className="mb-6">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="email"
            placeholder="john@doe@gmail.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-[14px] border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-emerald-900"
            }`}
          />
        </div>
        {errors.email && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.email}</span>
          </div>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Sending..." : "Send Reset Link"}
      </Button>

      {/* Back to Login */}
      <Button
        type="button"
        onClick={handleBackToLogin}
        className="w-full bg-zinc-200 hover:bg-zinc-200/70 text-zinc-700 font-semibold py-6 rounded-lg flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </Button>
    </form>
  );
}
