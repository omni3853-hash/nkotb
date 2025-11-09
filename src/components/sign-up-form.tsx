"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { SignupFormData, SignupSchema } from "@/utils/schemas/schemas";
import { AuthApi } from "@/api/auth.api";

type UIForm = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
};

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setCurrentStep, setUserEmail, setOtpMode } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UIForm>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onSubmit = async (values: UIForm) => {
    if (!values.fullName || values.fullName.trim().length < 2) {
      setError("fullName", { message: "Full name is required" });
      return;
    }
    if (!values.agreeToTerms) {
      setError("agreeToTerms", { message: "You must agree to terms and conditions" });
      return;
    }
    if (!values.password || values.password.length < 6) {
      setError("password", { message: "Password must be at least 6 characters" });
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    try {
      const payload: SignupFormData = {
        name: values.fullName,
        email: values.email,
        password: values.password,
      };
      SignupSchema.parse(payload);
      const res = await AuthApi.signup(payload);
      setUserEmail(values.email);
      if (res?.requiresEmailVerification) {
        setOtpMode("verify-email");
        setCurrentStep("verify-2fa");
        toast.success("Please verify your email to continue");
      } else {
        toast.success("Account created");
        setCurrentStep("login");
      }
    } catch (err: any) {
      console.log(err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.message ||
        err?.message ||
        "Could not create account";
      if (/email/i.test(String(msg))) setError("email", { message: msg });
      toast.error(msg);
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

      <h1 className="text-4xl font-bold text-emerald-900">Create Account</h1>
      <p className="text-sm text-gray-600 mb-8">Please enter your details to create an account</p>

      <div className="mb-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="John Doe"
            {...register("fullName")}
            className={`w-full pl-10 pr-4 py-3 text-[14px] border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${errors.fullName ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-emerald-900"
              }`}
          />
        </div>
        {errors.fullName?.message && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.fullName.message}</span>
          </div>
        )}
      </div>

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

      <div className="mb-3">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
            {...register("password")}
            className={`w-full pl-10 pr-10 py-3 border text-[14px] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-emerald-900"
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

      <div className="mb-6">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••"
            {...register("confirmPassword")}
            className={`w-full pl-10 pr-10 py-3 border text-[14px] rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-emerald-900"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword?.message && (
          <div className="flex items-center gap-1 mt-1 text-red-600 text-xs">
            <AlertCircle className="w-3 h-3" />
            <span>{errors.confirmPassword.message}</span>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-start">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            {...register("agreeToTerms")}
            className={`w-4 h-4 border rounded cursor-pointer mt-0.5 ${errors.agreeToTerms ? "border-red-500" : "border-gray-300"
              }`}
          />
          <label
            htmlFor="terms"
            className="ml-2 text-sm text-black font-medium cursor-pointer leading-5"
          >
            I agree to the{" "}
            <a href="#" className="text-emerald-900 hover:underline">Terms and Conditions</a>{" "}
            and{" "}
            <a href="#" className="text-emerald-900 hover:underline">Privacy Policy</a>
          </label>
        </div>
      </div>
      {errors.agreeToTerms?.message && (
        <div className="flex items-center gap-1 mb-4 text-red-600 text-xs">
          <AlertCircle className="w-3 h-3" />
          <span>{errors.agreeToTerms.message}</span>
        </div>
      )}

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Creating Account…"
        onClick={handleSubmit(onSubmit)}
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create Account
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
