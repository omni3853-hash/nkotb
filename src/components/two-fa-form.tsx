"use client";

import { useState, useRef, useEffect, useContext } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { UserContext } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";
import { AuthApi } from "@/api/auth.api";

export function TwoFAForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setCurrentStep, userEmail, otpMode } = useAuth();
  const { login: setSession } = useContext(UserContext);
  const router = useRouter();

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value.replace(/\D/g, "");
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < pasted.length && i < 6; i++) next[i] = pasted[i];
    setOtp(next);
    const nextEmpty = next.findIndex((d) => d === "");
    const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  const resendPayload =
    otpMode === "login"
      ? { email: userEmail, type: "login" as const }
      : { email: userEmail, type: "verify-email" as const };

  const handleResendCode = async () => {
    try {
      setIsResending(true);
      await AuthApi.sendOtp(resendPayload);
      toast.message("Verification code sent");
      setTimeLeft(60);
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      console.log(err)
      const msg = err?.response?.data?.message || err?.response?.message || "Failed to resend code";
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every((d) => d !== "");

  const redirectByRole = (role?: string) => {
    if (role === "ADMIN") router.replace("/admin-dashboard");
    else router.replace("/user-dashboard");
  };

  const handleVerify = async () => {
    if (!isOtpComplete || !userEmail) return;
    const code = otp.join("");

    try {
      setIsVerifying(true);
      if (otpMode === "verify-email") {
        await AuthApi.verifyEmail({ email: userEmail, otp: code, type: "verify-email" });
        toast.success("Email verified. Please sign in.");
        setCurrentStep("login");
        return;
      }
      const data = await AuthApi.verifyLoginOtp({ email: userEmail, otp: code, type: "login" });
      if (data?.token && data?.user) {
        setSession({ token: data.token, user: data.user });
        toast.success("Login verified");
        redirectByRole(String(data.user.role));
      } else {
        toast.error("Unexpected response");
      }
    } catch (err: any) {
      console.log(err)
      const msg = err?.response?.data?.message || err?.response?.message || "Invalid or expired code";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

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

      <div className="mb-6">
        <button
          onClick={() => setCurrentStep(otpMode === "verify-email" ? "signup" : "login")}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">
          {otpMode === "login" ? "Verify Login" : "Verify Your Account"}
        </h1>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to{" "}
          <span className="font-semibold text-emerald-900">{userEmail || "your email address"}</span>. Enter it below.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-900 focus:border-transparent transition-all"
            />
          ))}
        </div>
      </div>

      <div className="mb-6 text-center">
        {timeLeft > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in <span className="font-semibold text-emerald-900">{timeLeft}s</span>
          </p>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendCode}
            isLoading={isResending}
            disabled={isResending}
            loadingText="Sending…"
            className="mx-auto"
          >
            Resend verification code
          </Button>
        )}
      </div>

      <Button
        onClick={handleVerify}
        isLoading={isVerifying}
        disabled={!isOtpComplete || isVerifying}
        loadingText="Verifying…"
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Verify
      </Button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Didn't receive the code? Check your spam folder or{" "}
          <button className="text-emerald-900 hover:underline font-medium">contact support</button>
        </p>
      </div>
    </div>
  );
}
