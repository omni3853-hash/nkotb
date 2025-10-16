"use client";

import type React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  QrCodeIcon,
  CopyIcon,
  CheckIcon,
  UploadIcon,
  XIcon,
  AlertCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CheckCircle2Icon,
  FileIcon,
} from "lucide-react";
import { useState } from "react";

interface DepositConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethod: "crypto" | "mobile";
  selectedCrypto?: {
    id: string;
    name: string;
    symbol: string;
    address: string;
    network: string;
    icon: string;
    color: string;
    borderColor: string;
    minDeposit: number;
  };
  selectedMobile?: {
    id: string;
    name: string;
    handle: string;
    instructions: string;
    processingTime: string;
    icon: string;
  };
  amount: string;
  depositBonus: number;
}

export function DepositConfirmationModal({
  open,
  onOpenChange,
  paymentMethod,
  selectedCrypto,
  selectedMobile,
  amount,
  depositBonus,
}: DepositConfirmationModalProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadPreview(null);
  };

  const transactionId = `TXN-${Date.now().toString().slice(-8)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-zinc-200 rounded-2xl p-0">
        <DialogHeader className="border-b-2 border-zinc-200 p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            Complete Your Deposit
          </DialogTitle>
          <p className="text-sm text-zinc-600 mt-1">
            Follow the instructions below to complete your deposit
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Transaction Summary */}
          <div className="border-2 border-emerald-900 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-mono text-emerald-700 mb-1">
                  TRANSACTION ID
                </p>
                <p className="text-sm font-mono font-bold text-emerald-900">
                  {transactionId}
                </p>
              </div>
              <Badge className="bg-emerald-900 text-white border-0 font-mono">
                <ClockIcon className="size-3 mr-1" />
                PENDING
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-emerald-200">
              <div>
                <p className="text-xs font-mono text-emerald-700 mb-1">
                  DEPOSIT AMOUNT
                </p>
                <p className="text-xl font-bold text-emerald-900">${amount}</p>
              </div>
              {depositBonus > 0 && (
                <div>
                  <p className="text-xs font-mono text-emerald-700 mb-1">
                    BONUS AMOUNT
                  </p>
                  <p className="text-xl font-bold text-emerald-900">
                    +${depositBonus.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            {depositBonus > 0 && (
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono text-emerald-700">
                    TOTAL YOU'LL RECEIVE
                  </p>
                  <p className="text-2xl font-bold text-emerald-900">
                    ${(Number.parseFloat(amount) + depositBonus).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Instructions */}
          {paymentMethod === "crypto" && selectedCrypto && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 border-2 border-zinc-200 flex items-center justify-center text-2xl">
                  {selectedCrypto.icon}
                </div>
                <div>
                  <p className="text-sm font-mono text-zinc-600">
                    SEND {selectedCrypto.symbol} TO
                  </p>
                  <p className="text-lg font-bold text-zinc-900">
                    {selectedCrypto.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {selectedCrypto.network}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="border-2 border-zinc-200 rounded-xl bg-white p-6">
                <div className="flex flex-col items-center">
                  <div
                    className={`size-56 bg-white rounded-xl border-2 ${selectedCrypto.borderColor} flex items-center justify-center mb-4`}
                  >
                    <QrCodeIcon className="size-32 text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-600 font-mono text-center mb-2">
                    Scan QR code with your wallet app
                  </p>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    <ShieldCheckIcon className="size-3 mr-1" />
                    SECURE PAYMENT
                  </Badge>
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <Label className="text-sm font-mono text-zinc-600 mb-2 block">
                  WALLET ADDRESS
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={selectedCrypto.address}
                    readOnly
                    className="font-mono text-sm border-2 border-zinc-200 rounded-xl bg-zinc-50"
                  />
                  <Button
                    onClick={() => copyToClipboard(selectedCrypto.address)}
                    className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl px-4 shrink-0"
                  >
                    {copiedAddress ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Important Notice */}
              <div className="border-2 border-amber-200 rounded-xl bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertCircleIcon className="size-5 text-amber-900 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm text-amber-900">
                    <p className="font-bold">Important:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Only send {selectedCrypto.symbol} to this address</li>
                      <li>Ensure you're using the {selectedCrypto.network}</li>
                      <li>Minimum deposit: ${selectedCrypto.minDeposit}</li>
                      <li>Deposits are credited after network confirmation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "mobile" && selectedMobile && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 border-2 border-zinc-200 flex items-center justify-center text-2xl">
                  {selectedMobile.icon}
                </div>
                <div>
                  <p className="text-sm font-mono text-zinc-600">
                    SEND PAYMENT VIA
                  </p>
                  <p className="text-lg font-bold text-zinc-900">
                    {selectedMobile.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Processing: {selectedMobile.processingTime}
                  </p>
                </div>
              </div>

              {/* Payment Handle */}
              <div>
                <Label className="text-sm font-mono text-zinc-600 mb-2 block">
                  {selectedMobile.name.toUpperCase()} HANDLE
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={selectedMobile.handle}
                    readOnly
                    className="font-mono text-sm border-2 border-zinc-200 rounded-xl bg-zinc-50"
                  />
                  <Button
                    onClick={() => copyToClipboard(selectedMobile.handle)}
                    className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl px-4 shrink-0"
                  >
                    {copiedAddress ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* User ID */}
              <div className="border-2 border-blue-200 rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-bold text-blue-900 mb-3">
                  Include Your User ID in Payment Note
                </p>
                <div className="flex gap-2">
                  <Input
                    value="USR-2024-7891"
                    readOnly
                    className="font-mono text-sm border-2 border-blue-300 rounded-xl bg-white"
                  />
                  <Button
                    onClick={() => copyToClipboard("USR-2024-7891")}
                    className="bg-blue-900 hover:bg-blue-800 text-white rounded-xl px-4 shrink-0"
                  >
                    {copiedAddress ? (
                      <CheckIcon className="size-4" />
                    ) : (
                      <CopyIcon className="size-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="border-2 border-amber-200 rounded-xl bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertCircleIcon className="size-5 text-amber-900 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900 mb-2">
                      Payment Instructions:
                    </p>
                    <p className="text-sm text-amber-900">
                      {selectedMobile.instructions}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Proof of Payment Upload */}
          <div className="border-2 border-zinc-200 rounded-xl bg-zinc-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label className="text-sm font-mono text-zinc-900 mb-1 block">
                  UPLOAD PROOF OF PAYMENT
                </Label>
                <p className="text-xs text-zinc-600">
                  Upload screenshot or receipt of your payment
                </p>
              </div>
              <Badge className="bg-blue-50 text-blue-900 border-2 border-blue-900 font-mono text-xs">
                OPTIONAL
              </Badge>
            </div>

            {!uploadedFile ? (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-zinc-300 rounded-xl bg-white p-8 hover:border-emerald-900 hover:bg-emerald-50 transition-all">
                  <div className="flex flex-col items-center text-center">
                    <UploadIcon className="size-8 text-zinc-400 mb-2" />
                    <p className="text-sm font-medium text-zinc-900 mb-1">
                      Click to upload
                    </p>
                    <p className="text-xs text-zinc-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="border-2 border-emerald-900 rounded-xl bg-white p-4">
                <div className="flex items-center gap-3">
                  {uploadPreview && uploadPreview.startsWith("data:image") ? (
                    <img
                      src={uploadPreview || "/placeholder.svg"}
                      alt="Proof"
                      className="size-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="size-16 rounded-lg bg-zinc-100 flex items-center justify-center">
                      <FileIcon className="size-8 text-zinc-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 mb-1">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    onClick={removeFile}
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0 hover:bg-red-50 hover:text-red-900 rounded-lg"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 border-2 border-zinc-200 rounded-xl h-12 bg-transparent hover:bg-zinc-50"
            >
              Cancel
            </Button>
            <Button className="flex-1 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl h-12 font-bold">
              <CheckCircle2Icon className="size-5 mr-2" />
              I've Sent Payment
            </Button>
          </div>

          {/* Processing Info */}
          <div className="border-2 border-blue-200 rounded-xl bg-blue-50 p-4">
            <div className="flex gap-3">
              <ClockIcon className="size-5 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">
                  What happens next?
                </p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Your payment will be verified automatically</li>
                  <li>• Funds will be credited after confirmation</li>
                  <li>• You'll receive an email notification</li>
                  <li>• Track status in your transaction history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
