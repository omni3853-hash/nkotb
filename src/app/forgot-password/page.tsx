"use client";

import { AuthProvider } from "@/contexts/auth-context";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { HeroSection } from "@/components/hero-section";

export default function ForgotPasswordPage() {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-gradient-to-r from-white via-white to-zinc-100">
        {/* Left side - Auth form */}
        <div className="w-1/2 flex items-center justify-center p-10">
          <ForgotPasswordForm />
        </div>

        {/* Right side - Hero section */}
        <div className="w-1/2 bg-emerald-900 rounded-3xl m-4 flex items-center justify-center overflow-hidden">
          <HeroSection />
        </div>
      </div>
    </AuthProvider>
  );
}
