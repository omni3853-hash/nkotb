"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type AuthStep =
  | "login"
  | "signup"
  | "verify-2fa"
  | "forgot-password"
  | "reset-password"
  | "password-reset-success";

type OtpMode = "verify-email" | "login";

interface AuthContextType {
  currentStep: AuthStep;
  setCurrentStep: (step: AuthStep) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  resetToken: string;
  setResetToken: (token: string) => void;
  otpMode: OtpMode;
  setOtpMode: (m: OtpMode) => void;
  resetAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");
  const [userEmail, setUserEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otpMode, setOtpMode] = useState<OtpMode>("verify-email");

  const resetAuth = () => {
    setCurrentStep("login");
    setUserEmail("");
    setResetToken("");
    setOtpMode("verify-email");
  };

  return (
    <AuthContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        userEmail,
        setUserEmail,
        resetToken,
        setResetToken,
        otpMode,
        setOtpMode,
        resetAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
