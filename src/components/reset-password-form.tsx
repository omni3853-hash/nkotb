"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { ResetPasswordFormData, ResetPasswordSchema } from "@/utils/schemas/schemas";
import { AuthApi } from "@/api/auth.api";

type UIForm = { password: string; confirmPassword: string };

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setCurrentStep, userEmail, resetToken } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UIForm>({
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: UIForm) => {
    if (!values.password || values.password.length < 6) {
      setError("password", { message: "Password must be at least 6 characters" });
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    try {
      const dto: ResetPasswordFormData = {
        email: userEmail,
        otp: resetToken,
        newPassword: values.password,
      };
      ResetPasswordSchema.parse(dto);
      await AuthApi.resetPassword(dto);
      toast.success("Password reset successfully");
      setCurrentStep("password-reset-success");
    } catch (err: any) {
      console.log(err)
      const msg =
        err?.response?.data?.message || err?.response?.message || "Failed to reset password";
      toast.error(msg);
      setError("password", { message: msg });
    }
  };

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

      <h1 className="text-4xl font-bold text-emerald-900 mb-2">Reset Password</h1>
      <p className="text-sm text-gray-600 mb-8">Enter your new password below</p>

      <div className="mb-3">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="New password"
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

      <div className="mb-6">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            {...register("confirmPassword")}
            className={`w-full pl-10 pr-10 py-3 text-[14px] border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-emerald-900"
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

      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 mb-2 font-medium">Password requirements:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• One uppercase letter</li>
          <li>• One lowercase letter</li>
          <li>• One number</li>
        </ul>
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        loadingText="Resetting…"
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reset Password
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
