"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import {
  validateResetPasswordForm,
  type ResetPasswordFormData,
} from "@/lib/validation";
import { toast } from "sonner";

export function ResetPasswordForm() {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setCurrentStep, userEmail } = useAuth();

  const handleInputChange = (
    field: keyof ResetPasswordFormData,
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
    const validation = validateResetPasswordForm(formData);
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

      // Simulate password reset success/failure
      const isSuccess = Math.random() > 0.1; // 90% success rate for demo

      if (isSuccess) {
        toast.success("Password reset successfully!");
        setCurrentStep("password-reset-success");
      } else {
        toast.error("Failed to reset password. Please try again.");
        setErrors({
          password: "Failed to reset password. Please try again.",
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setCurrentStep("login");
  };

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
        Reset Password
      </h1>
      <p className="text-sm text-gray-600 mb-8">
        Enter your new password below
      </p>

      {/* Password field */}
      <div className="mb-3">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`w-full pl-10 pr-10 py-3 text-[14px] border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-emerald-900"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.password}</span>
          </div>
        )}
      </div>

      {/* Confirm Password field */}
      <div className="mb-6">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            className={`w-full pl-10 pr-10 py-3 text-[14px] border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-emerald-900"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.confirmPassword}</span>
          </div>
        )}
      </div>

      {/* Password requirements */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 mb-2 font-medium">
          Password requirements:
        </p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• One uppercase letter</li>
          <li>• One lowercase letter</li>
          <li>• One number</li>
        </ul>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Resetting..." : "Reset Password"}
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
