"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type AuthStep =
  | "login"
  | "signup"
  | "verify-2fa"
  | "forgot-password"
  | "reset-password"
  | "password-reset-success";

interface AuthContextType {
  currentStep: AuthStep;
  setCurrentStep: (step: AuthStep) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  resetToken: string;
  setResetToken: (token: string) => void;
  resetAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");
  const [userEmail, setUserEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const resetAuth = () => {
    setCurrentStep("login");
    setUserEmail("");
    setResetToken("");
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
        resetAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
