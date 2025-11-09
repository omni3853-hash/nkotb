"use client";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { SignInForm } from "@/components/sign-in-form";
import { SignUpForm } from "@/components/sign-up-form";
import { TwoFAForm } from "@/components/two-fa-form";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { PasswordResetSuccess } from "@/components/password-reset-success";
import { HeroSection } from "@/components/hero-section";

function AuthContent() {
  const { currentStep } = useAuth();

  const renderAuthComponent = () => {
    switch (currentStep) {
      case "login":
        return <SignInForm />;
      case "signup":
        return <SignUpForm />;
      case "verify-2fa":
        return <TwoFAForm />;
      case "forgot-password":
        return <ForgotPasswordForm />;
      case "reset-password":
        return <ResetPasswordForm />;
      case "password-reset-success":
        return <PasswordResetSuccess />;
      default:
        return <SignInForm />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-r from-white via-white to-zinc-100">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-10 min-h-[50vh] lg:min-h-screen">
        {renderAuthComponent()}
      </div>

      {/* Right side - Hero section */}
      <div className="w-full lg:w-1/2 bg-emerald-900 rounded-none lg:rounded-3xl m-0 lg:m-4 flex items-center justify-center overflow-hidden min-h-[50vh] lg:min-h-auto">
        <HeroSection />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  );
}
