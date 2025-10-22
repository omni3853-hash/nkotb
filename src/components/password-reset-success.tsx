"use client";

import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function PasswordResetSuccess() {
  const { resetAuth } = useAuth();

  return (
    <div className="w-full max-w-sm">
      <div className="mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-900 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="font-semibold text-2xl text-black">Logo</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-emerald-900 mb-4">Password Reset!</h1>
        <p className="text-sm text-gray-600 mb-2">Your password has been successfully reset.</p>
        <p className="text-sm text-gray-600 mb-8">You can now log in with your new password.</p>
      </div>

      <Button
        type="button"
        onClick={resetAuth}
        className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-6 rounded-lg flex items-center justify-center gap-2"
      >
        Continue to Login
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
