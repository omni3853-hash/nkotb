"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { validateLoginForm, type LoginFormData } from "@/lib/validation";
import { toast } from "sonner";

export function SignInForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setCurrentStep } = useAuth();

  const handleInputChange = (
    field: keyof LoginFormData,
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
    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please fix the errors below");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate login success/failure
      const isSuccess = Math.random() > 0.3; // 70% success rate for demo

      if (isSuccess) {
        toast.success("Login successful! Welcome back.");
        // In real app, redirect to dashboard
        console.log("Login successful:", formData);
      } else {
        toast.error("Invalid email or password. Please try again.");
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password",
        });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
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
      <h1 className="text-4xl font-bold text-emerald-900">Welcome Back</h1>
      <p className="text-sm text-gray-600 mb-8">
        Please enter log in details below
      </p>

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
      <div className="mb-6">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
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

      {/* Remember me checkbox */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            checked={formData.rememberMe}
            onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
            className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="ml-2 text-sm text-black font-medium cursor-pointer"
          >
            Remember me
          </label>
        </div>
        <button
          type="button"
          onClick={() => setCurrentStep("forgot-password")}
          className="text-sm text-gray-600 hover:underline"
        >
          Forgot Password
        </button>
      </div>

      {/* Sign in button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
      <Button
        type="button"
        onClick={() => setCurrentStep("signup")}
        className="w-full bg-zinc-200 hover:bg-zinc-200/70 text-zinc-700 font-semibold py-6 rounded-lg mb-6"
      >
        Don't have an account? Sign up
      </Button>
    </form>
  );
}
