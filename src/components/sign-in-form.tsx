"use client";

import { useState, useContext } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserContext } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { LoginFormData, LoginSchema } from "@/utils/schemas/schemas";
import { AuthApi } from "@/api/auth.api";

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setCurrentStep, setUserEmail, setOtpMode } = useAuth();
  const { login: setSession } = useContext(UserContext);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormData) => {
    try {
      const data = await AuthApi.login(values);

      // Always store email for the next step
      setUserEmail(values.email);

      if (data.nextStep === "verify-email") {
        setOtpMode("verify-email");
        setCurrentStep("verify-2fa");
        toast.message(data.message || "Verify your email to continue.");
        return;
      }

      if (data.nextStep === "verify-login-otp") {
        setOtpMode("login");
        setCurrentStep("verify-2fa");
        toast.message(data.message || "Enter the 6-digit code sent to your email.");
        return;
      }

      toast.error("Unexpected login state");
    } catch (err: any) {
      console.log(err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.message ||
        "Invalid email or password";
      toast.error(msg);
      setError("email", { message: msg });
      setError("password", { message: msg });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm px-4 sm:px-0">
      <div className="mb-12">
        <div className="flex items-center gap-2">
          <img
            alt="Premier Talent Agency Logo"
            src="/logo.png"
            className="h-10 w-auto"
          />
          
        </div>
      </div>

      <h1 className="text-4xl font-bold text-emerald-900">Welcome Back</h1>
      <p className="text-sm text-gray-600 mb-8">Please enter log in details below</p>

      <div className="mb-3">
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

      <div className="mb-6">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
            {...register("password")}
            className={`w-full pl-10 pr-10 py-3 text-[14px] border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-emerald-900"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password?.message && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.password.message}</span>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <button type="button" onClick={() => setCurrentStep("forgot-password")} className="text-sm text-gray-600 hover:underline">
          Forgot Password
        </button>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Signing in…"
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sign in
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
