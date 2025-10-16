"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Shield,
  CreditCard,
  Copy,
  ExternalLink,
  Star,
  Users,
  Zap,
  Crown,
  Smartphone,
  Building2,
  DollarSign,
  Upload,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

type OnboardingStep = "welcome" | "terms" | "payment" | "success";

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("crypto");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const steps = [
    { id: "welcome", title: "Welcome", icon: Star },
    { id: "terms", title: "Terms", icon: Shield },
    { id: "payment", title: "Payment", icon: CreditCard },
    { id: "success", title: "Complete", icon: CheckCircle },
  ];

  const handleNext = () => {
    switch (currentStep) {
      case "welcome":
        setCurrentStep("terms");
        break;
      case "terms":
        if (termsAccepted) {
          setCurrentStep("payment");
        }
        break;
      case "payment":
        setPaymentCompleted(true);
        setCurrentStep("success");
        break;
      case "success":
        onComplete();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case "terms":
        setCurrentStep("welcome");
        break;
      case "payment":
        setCurrentStep("terms");
        break;
      case "success":
        setCurrentStep("payment");
        break;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to CelBookings!
              </h2>
              <p className="text-gray-600 text-lg">
                Your premium booking platform for exclusive experiences
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg">
                <Users className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Premium Access</h3>
                <p className="text-sm text-gray-600 text-center">
                  Exclusive bookings with top celebrities
                </p>
              </div>
              <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg">
                <Zap className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Instant Booking</h3>
                <p className="text-sm text-gray-600 text-center">
                  Quick and secure booking process
                </p>
              </div>
              <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg">
                <Shield className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-semibold text-gray-900">Secure Platform</h3>
                <p className="text-sm text-gray-600 text-center">
                  Your data and payments are protected
                </p>
              </div>
            </div>
          </div>
        );

      case "terms":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Terms & Conditions
              </h2>
              <p className="text-gray-600">
                Please review and accept our terms to continue
              </p>
            </div>

            <Card className="max-h-64 overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-lg">Service Agreement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    1. Service Description
                  </h4>
                  <p>
                    CelBookings provides a platform for booking exclusive
                    experiences with verified celebrities and public figures.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    2. User Responsibilities
                  </h4>
                  <p>
                    Users must provide accurate information and respect the
                    privacy and time of booked celebrities.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    3. Payment Terms
                  </h4>
                  <p>
                    All payments are processed securely. Refunds are subject to
                    our cancellation policy.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    4. Privacy Policy
                  </h4>
                  <p>
                    We protect your personal information and only share it as
                    necessary for service delivery.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    5. Limitation of Liability
                  </h4>
                  <p>
                    CelBookings acts as an intermediary platform and is not
                    responsible for celebrity availability or behavior.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setTermsAccepted(checked as boolean)
                }
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I have read and agree to the Terms & Conditions and Privacy
                Policy
              </label>
            </div>
          </div>
        );

      case "payment":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Activate Your Membership
              </h2>
              <p className="text-gray-600">
                Choose your preferred payment method to unlock premium features
              </p>
            </div>

            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-emerald-50">
                <CardTitle className="flex items-center justify-between">
                  <span>Premium Membership</span>
                  <Badge className="bg-emerald-600">$299/month</Badge>
                </CardTitle>
                <CardDescription>
                  Unlimited access to exclusive celebrity bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-lg">
                    Choose Payment Method
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedPaymentMethod("crypto")}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                        selectedPaymentMethod === "crypto"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Cryptocurrency
                          </div>
                          <div className="text-xs text-gray-500">
                            Bitcoin, Ethereum, USDC
                          </div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedPaymentMethod("traditional")}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                        selectedPaymentMethod === "traditional"
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            Traditional
                          </div>
                          <div className="text-xs text-gray-500">
                            Zelle, Venmo, CashApp, PayPal
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Details */}
                {selectedPaymentMethod === "crypto" && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">
                      Cryptocurrency Payment
                    </h5>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Bitcoin (BTC)</span>
                          <Badge variant="outline" className="text-xs">
                            Recommended
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-white p-2 rounded border text-sm font-mono">
                            bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(
                                "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                              )
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Amount: 0.0045 BTC (~$299)
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Ethereum (ETH)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-white p-2 rounded border text-sm font-mono">
                            0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(
                                "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                              )
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Amount: 0.12 ETH (~$299)
                        </p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">USDC (ERC-20)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="flex-1 bg-white p-2 rounded border text-sm font-mono">
                            0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(
                                "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                              )
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Amount: 299 USDC
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPaymentMethod === "traditional" && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-gray-900">
                      Traditional Payment Methods
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">Zelle</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Send to: bookings@celbookings.com
                        </p>
                        <p className="text-xs text-gray-500">Amount: $299.00</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">Venmo</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          @CelBookings
                        </p>
                        <p className="text-xs text-gray-500">Amount: $299.00</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Smartphone className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="font-medium">CashApp</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          $CelBookings
                        </p>
                        <p className="text-xs text-gray-500">Amount: $299.00</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">PayPal</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          payments@celbookings.com
                        </p>
                        <p className="text-xs text-gray-500">Amount: $299.00</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-white">
                            i
                          </span>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">
                            Bank Transfer
                          </p>
                          <p className="text-blue-700">
                            For bank transfers, please contact support at
                            support@celbookings.com for account details.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">!</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">Important:</p>
                      <p className="text-yellow-700">
                        {selectedPaymentMethod === "crypto"
                          ? "Send the exact amount to the address above. Payments are processed within 10-30 minutes after confirmation."
                          : "Include your email address in the payment memo/note. Payments are processed within 1-2 business days."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proof of Payment Upload */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900">
                    Proof of Payment <span className="text-red-500">*</span>
                  </h5>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                      uploadedFile
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-emerald-400"
                    )}
                  >
                    <input
                      type="file"
                      id="payment-proof"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setUploadedFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                    <label htmlFor="payment-proof" className="cursor-pointer">
                      {uploadedFile ? (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {uploadedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Click to change file
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Upload proof of payment
                            </p>
                            <p className="text-sm text-gray-500">
                              Screenshot, receipt, or transaction confirmation
                            </p>
                            <p className="text-xs text-gray-400">
                              PNG, JPG, PDF up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-confirm"
                    checked={paymentCompleted}
                    onCheckedChange={(checked) =>
                      setPaymentCompleted(checked as boolean)
                    }
                  />
                  <label
                    htmlFor="payment-confirm"
                    className="text-sm text-gray-600"
                  >
                    I have sent the payment and uploaded proof of payment
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "success":
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to Premium!
              </h2>
              <p className="text-gray-600 text-lg">
                Your membership has been activated successfully
              </p>
            </div>

            <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="w-6 h-6 text-emerald-600" />
                    <span className="font-semibold text-emerald-800">
                      Premium Member
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        Unlimited
                      </div>
                      <div className="text-gray-600">Bookings</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">24/7</div>
                      <div className="text-gray-600">Support</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        Priority
                      </div>
                      <div className="text-gray-600">Access</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">
                        Exclusive
                      </div>
                      <div className="text-gray-600">Events</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500">
              You can now start booking exclusive experiences with your favorite
              celebrities!
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case "welcome":
        return true;
      case "terms":
        return termsAccepted;
      case "payment":
        return paymentCompleted && uploadedFile !== null;
      case "success":
        return true;
      default:
        return false;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case "welcome":
        return "Get Started";
      case "terms":
        return "Accept & Continue";
      case "payment":
        return "Complete Payment";
      case "success":
        return "Start Booking";
      default:
        return "Continue";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = step.id === currentStep;
                  const isCompleted =
                    steps.findIndex((s) => s.id === currentStep) >
                    steps.findIndex((s) => s.id === step.id);

                  return (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                          isActive &&
                            "bg-emerald-600 border-emerald-600 text-white",
                          isCompleted &&
                            "bg-green-500 border-green-500 text-white",
                          !isActive &&
                            !isCompleted &&
                            "bg-gray-100 border-gray-300 text-gray-500"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "w-8 h-0.5 mx-2",
                            isCompleted ? "bg-green-500" : "bg-gray-300"
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="text-sm text-gray-500">
                Step {steps.findIndex((s) => s.id === currentStep) + 1} of{" "}
                {steps.length}: {steps.find((s) => s.id === currentStep)?.title}
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="py-6">{renderStepContent()}</div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === "welcome"}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-emerald-900 hover:bg-emerald-800 text-zinc-100"
            >
              {getButtonText()}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
