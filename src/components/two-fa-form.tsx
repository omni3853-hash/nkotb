"use client";

import { useState, useRef, useEffect } from "react";
import { Shield, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function TwoFAForm() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setCurrentStep, userEmail } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple characters

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleResendCode = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsResending(false);
    setTimeLeft(60);
    setOtp(["", "", "", "", "", ""]);
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const handleVerify = async () => {
    if (!isOtpComplete) return;

    // Simulate verification API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, redirect to dashboard or next step
    console.log("Verification successful!");
  };

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

      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => setCurrentStep("signup")}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to signup
        </button>
      </div>

      {/* Icon and Heading */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-emerald-900 mb-2">
          Verify Your Account
        </h1>
        <p className="text-sm text-gray-600">
          We've sent a 6-digit verification code to{" "}
          <span className="font-semibold text-emerald-900">
            {userEmail || "your email address"}
          </span>
          . Please enter it below to complete your registration.
        </p>
      </div>

      {/* OTP Input Fields */}
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

      {/* Resend Code Section */}
      <div className="mb-6 text-center">
        {timeLeft > 0 ? (
          <p className="text-sm text-gray-600">
            Resend code in{" "}
            <span className="font-semibold text-emerald-900">{timeLeft}s</span>
          </p>
        ) : (
          <button
            onClick={handleResendCode}
            disabled={isResending}
            className="text-sm text-emerald-900 hover:text-emerald-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {isResending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend verification code"
            )}
          </button>
        )}
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isOtpComplete}
      >
        Verify Account
      </Button>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Didn't receive the code? Check your spam folder or{" "}
          <button className="text-emerald-900 hover:underline font-medium">
            contact support
          </button>
        </p>
      </div>
    </div>
  );
}
