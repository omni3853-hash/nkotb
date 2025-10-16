"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
} from "@heroicons/react/24/outline";

const sampleTransactions = [
  {
    id: 1,
    type: "credit",
    amount: 250.0,
    description: "Event Booking - Summer Music",
    date: "2024-01-15",
    time: "14:30",
    status: "completed",
    category: "Entertainment",
  },
  {
    id: 2,
    type: "debit",
    amount: -75.5,
    description: "Service Fee - Tech Conference 2024",
    date: "2024-01-14",
    time: "09:15",
    status: "completed",
    category: "Fees",
  },
  {
    id: 3,
    type: "credit",
    amount: 120.0,
    description: "Refund - Art Gallery Opening",
    date: "2024-01-13",
    time: "16:45",
    status: "completed",
    category: "Refund",
  },
  {
    id: 4,
    type: "debit",
    amount: -299.0,
    description: "Event Booking - Food & Wine ",
    date: "2024-01-12",
    time: "11:20",
    status: "pending",
    category: "Entertainment",
  },
  {
    id: 5,
    type: "debit",
    amount: -85.0,
    description: "Event Booking - Comedy Night",
    date: "2024-01-11",
    time: "20:10",
    status: "completed",
    category: "Entertainment",
  },
  {
    id: 6,
    type: "credit",
    amount: 50.0,
    description: "Cashback Reward",
    date: "2024-01-10",
    time: "12:00",
    status: "completed",
    category: "Reward",
  },
  {
    id: 7,
    type: "debit",
    amount: -150.0,
    description: "Event Booking - Jazz Concert",
    date: "2024-01-09",
    time: "19:30",
    status: "completed",
    category: "Entertainment",
  },
];

export function RecentTransactionsTable() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const recentTransactions = sampleTransactions.slice(0, 5);

  const formatAmount = (amount: number) => {
    const isPositive = amount > 0;
    return {
      value: `$${Math.abs(amount).toFixed(2)}`,
      isPositive,
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full  p-6 bg-white rounded-2xl  max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-700">
          Recent Transactions
        </h3>
        <Button
          variant="outline"
          className="text-zinc-100 px-5 py-4 rounded-xl bg-emerald-900"
          size="sm"
        >
          View All
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block space-y-3 ">
        {recentTransactions.map((transaction) => {
          const amount = formatAmount(transaction.amount);
          const isHovered = hoveredRow === transaction.id;

          return (
            <div
              key={transaction.id}
              className={`
                bg-zinc-100/50  border-gray-200 rounded-xl p-4 transition-all duration-300 ease-in-out cursor-pointer
                ${
                  isHovered
                    ? "scale-[1.02] shadow-2xl bg-white border border-zinc-200"
                    : "hover:border-gray-300"
                }
              `}
              onMouseEnter={() => setHoveredRow(transaction.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
                    ${
                      amount.isPositive
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }
                  `}
                  >
                    {amount.isPositive ? (
                      <ArrowUpRightIcon className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeftIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">
                      {transaction.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {transaction.time}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {transaction.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        amount.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {amount.isPositive ? "+" : ""}
                      {amount.value}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {recentTransactions.map((transaction) => {
          const amount = formatAmount(transaction.amount);
          const isHovered = hoveredRow === transaction.id;

          return (
            <div
              key={transaction.id}
              className={`
                bg-white border border-gray-200 rounded-xl p-4 transition-all duration-300 ease-in-out cursor-pointer
                ${
                  isHovered
                    ? "scale-[1.02] border-gray-300"
                    : "hover:border-gray-300"
                }
              `}
              onMouseEnter={() => setHoveredRow(transaction.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300
                  ${
                    amount.isPositive
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }
                `}
                >
                  {amount.isPositive ? (
                    <ArrowUpRightIcon className="w-5 h-5" />
                  ) : (
                    <ArrowDownLeftIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold text-lg ${
                      amount.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {amount.isPositive ? "+" : ""}
                    {amount.value}
                  </p>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-2">
                  {transaction.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span>{formatDate(transaction.date)}</span>
                  <span className="text-gray-300">•</span>
                  <span>{transaction.time}</span>
                  <span className="text-gray-300">•</span>
                  <span>{transaction.category}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
