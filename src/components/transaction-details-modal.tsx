"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  DownloadIcon,
  AlertCircleIcon,
  FileIcon,
} from "lucide-react";
import { useState } from "react";

interface Transaction {
  id: number;
  method: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  time: string;
  txHash: string;
}

interface TransactionDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

export function TransactionDetailsModal({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailsModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!transaction) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const statusConfig = {
    completed: {
      icon: CheckCircle2Icon,
      color: "text-emerald-900",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-900",
      label: "COMPLETED",
    },
    pending: {
      icon: ClockIcon,
      color: "text-amber-900",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-900",
      label: "PENDING",
    },
    failed: {
      icon: XCircleIcon,
      color: "text-red-900",
      bgColor: "bg-red-50",
      borderColor: "border-red-900",
      label: "FAILED",
    },
  };

  const config = statusConfig[transaction.status];
  const StatusIcon = config.icon;

  // Mock timeline data
  const timeline = [
    {
      label: "Payment Initiated",
      time: transaction.time,
      completed: true,
    },
    {
      label: "Payment Received",
      time: transaction.status !== "failed" ? "2 mins later" : "-",
      completed: transaction.status !== "failed",
    },
    {
      label: "Verification",
      time: transaction.status === "completed" ? "5 mins later" : "-",
      completed: transaction.status === "completed",
    },
    {
      label: "Funds Credited",
      time: transaction.status === "completed" ? "10 mins later" : "-",
      completed: transaction.status === "completed",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-zinc-200 rounded-2xl p-0">
        <DialogHeader className="border-b-2 border-zinc-200 p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-zinc-900">
            Transaction Details
          </DialogTitle>
          <p className="text-sm text-zinc-600 mt-1">
            Complete information about your deposit
          </p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Status Card */}
          <div
            className={`border-2 ${config.borderColor} rounded-xl ${config.bgColor} p-4`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`size-12 rounded-xl ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center`}
                >
                  <StatusIcon className={`size-6 ${config.color}`} />
                </div>
                <div>
                  <p className="text-xs font-mono text-zinc-600 mb-1">
                    TRANSACTION STATUS
                  </p>
                  <Badge
                    className={`${config.bgColor} ${config.color} border-2 ${config.borderColor} font-mono`}
                  >
                    {config.label}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-zinc-600 mb-1">AMOUNT</p>
                <p className={`text-2xl font-bold ${config.color}`}>
                  +${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="border-2 border-zinc-200 rounded-xl bg-white p-4">
            <h3 className="text-sm font-mono text-zinc-600 mb-4">
              TRANSACTION INFORMATION
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-sm text-zinc-600">Transaction ID</span>
                <span className="text-sm font-mono font-bold text-zinc-900">
                  TXN-{transaction.id}2024
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-sm text-zinc-600">Payment Method</span>
                <span className="text-sm font-medium text-zinc-900">
                  {transaction.method}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-sm text-zinc-600">Date & Time</span>
                <span className="text-sm font-mono text-zinc-900">
                  {transaction.date} at {transaction.time}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-600">Transaction Hash</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-zinc-900">
                    {transaction.txHash}
                  </span>
                  <Button
                    onClick={() => copyToClipboard(transaction.txHash)}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 hover:bg-zinc-100 rounded-lg"
                  >
                    {copiedHash ? (
                      <CheckIcon className="size-3" />
                    ) : (
                      <CopyIcon className="size-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="border-2 border-zinc-200 rounded-xl bg-white p-4">
            <h3 className="text-sm font-mono text-zinc-600 mb-4">
              TRANSACTION TIMELINE
            </h3>
            <div className="space-y-4">
              {timeline.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`size-8 rounded-full border-2 flex items-center justify-center ${
                        step.completed
                          ? "bg-emerald-900 border-emerald-900"
                          : "bg-zinc-100 border-zinc-300"
                      }`}
                    >
                      {step.completed && (
                        <CheckIcon className="size-4 text-white" />
                      )}
                    </div>
                    {index < timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-12 ${
                          step.completed ? "bg-emerald-900" : "bg-zinc-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p
                      className={`text-sm font-medium ${
                        step.completed ? "text-zinc-900" : "text-zinc-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs font-mono mt-1 ${
                        step.completed ? "text-zinc-600" : "text-zinc-400"
                      }`}
                    >
                      {step.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proof of Payment */}
          {transaction.status !== "failed" && (
            <div className="border-2 border-zinc-200 rounded-xl bg-zinc-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-mono text-zinc-900">
                  PROOF OF PAYMENT
                </h3>
                <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                  VERIFIED
                </Badge>
              </div>
              <div className="border-2 border-zinc-200 rounded-xl bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="size-16 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <FileIcon className="size-8 text-zinc-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 mb-1">
                      payment_proof_{transaction.id}.png
                    </p>
                    <p className="text-xs text-zinc-500">
                      Uploaded on {transaction.date}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-zinc-200 rounded-lg hover:bg-zinc-50 bg-transparent"
                  >
                    <DownloadIcon className="size-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Failed Transaction Info */}
          {transaction.status === "failed" && (
            <div className="border-2 border-red-200 rounded-xl bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertCircleIcon className="size-5 text-red-900 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-900 mb-2">
                    Transaction Failed
                  </p>
                  <p className="text-sm text-red-800 mb-3">
                    This transaction could not be completed. Common reasons
                    include insufficient funds, network issues, or incorrect
                    payment details.
                  </p>
                  <Button
                    size="sm"
                    className="bg-red-900 hover:bg-red-800 text-white rounded-lg"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              className="border-2 border-zinc-200 rounded-xl h-12 bg-transparent hover:bg-zinc-50"
            >
              <ExternalLinkIcon className="size-4 mr-2" />
              View on Explorer
            </Button>
            <Button
              variant="outline"
              className="border-2 border-zinc-200 rounded-xl h-12 bg-transparent hover:bg-zinc-50"
            >
              <MessageCircleIcon className="size-4 mr-2" />
              Contact Support
            </Button>
          </div>

          {/* Support Info */}
          <div className="border-2 border-blue-200 rounded-xl bg-blue-50 p-4">
            <div className="flex gap-3">
              <MessageCircleIcon className="size-5 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-1">
                  Need Help?
                </p>
                <p className="text-sm text-blue-800">
                  Our support team is available 24/7 to assist you with any
                  questions about this transaction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
