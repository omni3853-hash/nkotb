"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { validateSignupForm, type SignupFormData } from "@/lib/validation";
import { toast } from "sonner";

export function SignUpForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setCurrentStep, setUserEmail } = useAuth();

  const handleInputChange = (
    field: keyof SignupFormData,
    value: string | boolean
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
    const validation = validateSignupForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please fix the errors below");
      return;
    }

    setIsCreating(true);
    setErrors({});

    try {
      // Simulate API call for account creation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate signup success/failure
      const isSuccess = Math.random() > 0.2; // 80% success rate for demo

      if (isSuccess) {
        toast.success(
          "Account created successfully! Please verify your email."
        );
        // Store user email and move to 2FA verification
        setUserEmail(formData.email);
        setCurrentStep("verify-2fa");
      } else {
        toast.error(
          "Email already exists. Please use a different email or try logging in."
        );
        setErrors({ email: "Email already exists" });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setIsCreating(false);
    }
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
      <h1 className="text-4xl font-bold text-emerald-900">Create Account</h1>
      <p className="text-sm text-gray-600 mb-8">
        Please enter your details to create an account
      </p>

      {/* Full Name field */}
      <div className="mb-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className={`w-full pl-10 pr-4 py-3 text-[14px] border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
              errors.fullName
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-200 focus:ring-emerald-900"
            }`}
          />
        </div>
        {errors.fullName && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.fullName}</span>
          </div>
        )}
      </div>

      {/* Email field */}
      <div className="mb-3">
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

      {/* Password field */}
      <div className="mb-3">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`w-full pl-10 pr-10 py-3 border text-[14px] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
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
            placeholder="••••••"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange("confirmPassword", e.target.value)
            }
            className={`w-full pl-10 pr-10 py-3 border text-[14px] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
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

      {/* Terms and conditions checkbox */}
      <div className="mb-6 flex items-start">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={formData.agreeToTerms}
            onChange={(e) =>
              handleInputChange("agreeToTerms", e.target.checked)
            }
            className={`w-4 h-4 border rounded cursor-pointer mt-0.5 ${
              errors.agreeToTerms ? "border-red-500" : "border-gray-300"
            }`}
          />
          <label
            htmlFor="terms"
            className="ml-2 text-sm text-black font-medium cursor-pointer leading-5"
          >
            I agree to the{" "}
            <a href="#" className="text-emerald-900 hover:underline">
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-emerald-900 hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>
      {errors.agreeToTerms && (
        <div className="flex items-center gap-1 mb-4 text-red-600 text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>{errors.agreeToTerms}</span>
        </div>
      )}

      {/* Sign up button */}
      <Button
        type="submit"
        disabled={isCreating}
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? "Creating Account..." : "Create Account"}
      </Button>
      <Button
        type="button"
        onClick={() => setCurrentStep("login")}
        className="w-full bg-zinc-200 hover:bg-zinc-200/70 text-zinc-700 font-semibold py-6 rounded-lg mb-6"
      >
        Already have an account? Sign in
      </Button>
    </form>
  );
}
