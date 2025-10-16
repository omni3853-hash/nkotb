"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  WalletIcon,
  SmartphoneIcon,
  CopyIcon,
  CheckIcon,
  TrendingUpIcon,
  ClockIcon,
  QrCodeIcon,
  AlertCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ZapIcon,
  GiftIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  XCircleIcon,
  CircleDotIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepositConfirmationModal } from "@/components/deposit-confirmation-modal";
import { TransactionDetailsModal } from "@/components/transaction-details-modal";

export default function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState<"crypto" | "mobile">(
    "crypto"
  );
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [selectedMobileApp, setSelectedMobileApp] = useState("cashapp");
  const [amount, setAmount] = useState("");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [liveRate, setLiveRate] = useState(45230);
  const [depositBonus, setDepositBonus] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<
    (typeof recentDeposits)[0] | null
  >(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRate((prev) => prev + (Math.random() - 0.5) * 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const numAmount = Number.parseFloat(amount) || 0;
    if (numAmount >= 1000) {
      setDepositBonus(numAmount * 0.1); // 10% bonus
    } else if (numAmount >= 500) {
      setDepositBonus(numAmount * 0.05); // 5% bonus
    } else if (numAmount >= 100) {
      setDepositBonus(numAmount * 0.02); // 2% bonus
    } else {
      setDepositBonus(0);
    }
  }, [amount]);

  const cryptoOptions = [
    {
      id: "BTC",
      name: "Bitcoin",
      symbol: "BTC",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      rate: liveRate,
      network: "Bitcoin Network",
      minDeposit: 50,
      icon: "₿",
      color: "from-emerald-500/20 to-emerald-900/20",
      borderColor: "border-emerald-900",
    },
    {
      id: "ETH",
      name: "Ethereum",
      symbol: "ETH",
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      rate: 2850,
      network: "Ethereum (ERC-20)",
      minDeposit: 30,
      icon: "Ξ",
      color: "from-emerald-500/20 to-emerald-900/20",
      borderColor: "border-emerald-900",
    },
    {
      id: "USDT",
      name: "Tether",
      symbol: "USDT",
      address: "TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6",
      rate: 1,
      network: "Tron (TRC-20)",
      minDeposit: 20,
      icon: "₮",
      color: "from-emerald-500/20 to-emerald-900/20",
      borderColor: "border-emerald-900",
    },
    {
      id: "USDC",
      name: "USD Coin",
      symbol: "USDC",
      address: "0x8e23ee67d1332ad560396262c48ffbb01f93d052",
      rate: 1,
      network: "Ethereum (ERC-20)",
      minDeposit: 20,
      icon: "$",
      color: "from-emerald-500/20 to-emerald-900/20",
      borderColor: "border-emerald-900",
    },
  ];

  const mobileMoneyApps = [
    {
      id: "cashapp",
      name: "Cash App",
      handle: "$EventBooker",
      instructions:
        "Send payment to our Cash App handle and include your user ID in the note.",
      processingTime: "5-10 minutes",
      minDeposit: 10,
      icon: "💵",
      color: "from-green-600 to-emerald-600",
    },
    {
      id: "zelle",
      name: "Zelle",
      handle: "payments@eventbooker.com",
      instructions:
        "Send payment to our Zelle email and include your user ID in the note.",
      processingTime: "5-15 minutes",
      minDeposit: 10,
      icon: "⚡",
      color: "from-purple-600 to-violet-600",
    },
    {
      id: "venmo",
      name: "Venmo",
      handle: "@EventBooker-Official",
      instructions:
        "Send payment to our Venmo handle and include your user ID in the note.",
      processingTime: "5-10 minutes",
      minDeposit: 10,
      icon: "💙",
      color: "from-blue-600 to-sky-600",
    },
    {
      id: "paypal",
      name: "PayPal",
      handle: "payments@eventbooker.com",
      instructions:
        "Send payment to our PayPal email and include your user ID in the note.",
      processingTime: "10-20 minutes",
      minDeposit: 15,
      icon: "🅿️",
      color: "from-blue-700 to-indigo-700",
    },
    {
      id: "skrill",
      name: "Skrill",
      handle: "payments@eventbooker.com",
      instructions:
        "Send payment to our Skrill email and include your user ID in the note.",
      processingTime: "15-30 minutes",
      minDeposit: 20,
      icon: "💳",
      color: "from-violet-600 to-purple-600",
    },
  ];

  const quickAmounts = [50, 100, 250, 500, 1000, 2500];

  const recentDeposits = [
    {
      id: 1,
      method: "Bitcoin",
      amount: 500,
      status: "completed" as const,
      date: "Oct 10, 2025",
      time: "2:30 PM",
      txHash: "0x742d35...f0bEb",
    },
    {
      id: 2,
      method: "Cash App",
      amount: 250,
      status: "pending" as const,
      date: "Oct 10, 2025",
      time: "1:15 PM",
      txHash: "CA-2024...891",
    },
    {
      id: 3,
      method: "Ethereum",
      amount: 1000,
      status: "completed" as const,
      date: "Oct 9, 2025",
      time: "5:45 PM",
      txHash: "0x8e23ee...d052",
    },
    {
      id: 4,
      method: "Zelle",
      amount: 150,
      status: "completed" as const,
      date: "Oct 8, 2025",
      time: "11:20 AM",
      txHash: "ZL-2024...456",
    },
    {
      id: 5,
      method: "USDT",
      amount: 750,
      status: "failed" as const,
      date: "Oct 7, 2025",
      time: "3:15 PM",
      txHash: "TY-2024...W6",
    },
    {
      id: 6,
      method: "Venmo",
      amount: 200,
      status: "completed" as const,
      date: "Oct 6, 2025",
      time: "9:30 AM",
      txHash: "VM-2024...123",
    },
  ];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(id);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const selectedCryptoData = cryptoOptions.find((c) => c.id === selectedCrypto);
  const selectedMobileData = mobileMoneyApps.find(
    (m) => m.id === selectedMobileApp
  );

  const filteredDeposits = recentDeposits.filter((deposit) => {
    const matchesStatus =
      filterStatus === "all" || deposit.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      deposit.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deposit.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleTransactionClick = (transaction: (typeof recentDeposits)[0]) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-50">
          <div className="@container/main flex flex-1 flex-col gap-2 px-3">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DynamicPageHeader
                title="Deposit Funds"
                subtitle="Add funds to your account using crypto or mobile money apps"
              />

              <div className="px-4 lg:px-6">
                <div className="relative overflow-hidden border-2 border-emerald-900 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 p-4 sm:p-6">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                  <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <GiftIcon className="size-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          Limited Time Offer!
                        </h3>
                        <p className="text-emerald-100 text-sm">
                          Get up to 10% bonus on deposits over $1,000 • 5% on
                          $500+ • 2% on $100+
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-white text-emerald-900 font-bold text-sm px-4 py-2 rounded-xl border-0">
                      <SparklesIcon className="size-4 mr-2" />
                      ACTIVE NOW
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="px-4 lg:px-6">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {/* Main Deposit Section */}
                  <div className="xl:col-span-2 space-y-6">
                    {/* Payment Method Selection */}
                    <div className="rounded-2xl bg-white p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
                          Select Payment Method
                        </h2>
                        <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900  text-xs">
                          <ShieldCheckIcon className="size-3 mr-1" />
                          SECURE
                        </Badge>
                      </div>
                      <Tabs
                        value={selectedMethod}
                        onValueChange={(v) =>
                          setSelectedMethod(v as "crypto" | "mobile")
                        }
                      >
                        <TabsList className="grid w-full grid-cols-2 bg-zinc-100 p-1  rounded-xl border-2 border-zinc-200">
                          <TabsTrigger
                            value="crypto"
                            className="rounded-lg data-[state=active]:bg-emerald-900 data-[state=active]:text-white"
                          >
                            <WalletIcon className="size-4 mr-2" />
                            Cryptocurrency
                          </TabsTrigger>
                          <TabsTrigger
                            value="mobile"
                            className="rounded-lg data-[state=active]:bg-emerald-900 data-[state=active]:text-white"
                          >
                            <SmartphoneIcon className="size-4 mr-2" />
                            Mobile Money
                          </TabsTrigger>
                        </TabsList>

                        {/* Crypto Tab */}
                        <TabsContent value="crypto" className="mt-6 space-y-6">
                          <div>
                            <Label className="text-sm  text-zinc-600 mb-3 block">
                              SELECT CRYPTOCURRENCY
                            </Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                              {cryptoOptions.map((crypto) => (
                                <button
                                  key={crypto.id}
                                  onClick={() => setSelectedCrypto(crypto.id)}
                                  className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all ${
                                    selectedCrypto === crypto.id
                                      ? `${crypto.borderColor} bg-gradient-to-br ${crypto.color} bg-opacity-10`
                                      : "border-zinc-200 bg-white hover:border-emerald-900"
                                  }`}
                                >
                                  {selectedCrypto === crypto.id && (
                                    <div
                                      className={`absolute inset-0 bg-gradient-to-br ${crypto.color} opacity-10`}
                                    />
                                  )}
                                  <div className="relative text-center">
                                    <div className="text-3xl mb-2">
                                      {crypto.icon}
                                    </div>
                                    <p className="font-bold text-zinc-900 mb-1">
                                      {crypto.symbol}
                                    </p>
                                    <p className="text-xs text-zinc-600">
                                      {crypto.name}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {selectedCryptoData && (
                            <div className="space-y-4">
                              <div className="border-2 border-zinc-200 rounded-xl bg-gradient-to-br from-zinc-50 to-white p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs  text-zinc-500 mb-1 flex items-center gap-1">
                                      <CircleDotIcon className="size-3 text-emerald-900 animate-pulse" />
                                      LIVE RATE
                                    </p>
                                    <p className=" text-zinc-900 font-bold">
                                      1 {selectedCryptoData.symbol} = $
                                      {selectedCryptoData.rate.toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs  text-zinc-500 mb-1">
                                      NETWORK
                                    </p>
                                    <p className=" text-zinc-900">
                                      {selectedCryptoData.network}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs  text-zinc-500 mb-1">
                                      MIN DEPOSIT
                                    </p>
                                    <p className=" text-zinc-900">
                                      ${selectedCryptoData.minDeposit}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </TabsContent>

                        {/* Mobile Money Tab */}
                        <TabsContent value="mobile" className="mt-6 space-y-6">
                          <div>
                            <Label className="text-sm  text-zinc-600 mb-3 block">
                              SELECT MOBILE APP
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {mobileMoneyApps.map((app) => (
                                <button
                                  key={app.id}
                                  onClick={() => setSelectedMobileApp(app.id)}
                                  className={`relative overflow-hidden p-4 rounded-xl border-2 transition-all text-left ${
                                    selectedMobileApp === app.id
                                      ? "border-emerald-900 bg-emerald-50"
                                      : "border-zinc-200 bg-white hover:border-emerald-900"
                                  }`}
                                >
                                  {selectedMobileApp === app.id && (
                                    <div
                                      className={`absolute inset-0 bg-gradient-to-br ${app.color} opacity-5`}
                                    />
                                  )}
                                  <div className="relative flex items-center gap-3">
                                    <div className="text-3xl">{app.icon}</div>
                                    <div>
                                      <p className="font-bold text-zinc-900 mb-1">
                                        {app.name}
                                      </p>
                                      <p className="text-xs text-zinc-600 ">
                                        {app.handle}
                                      </p>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {selectedMobileData && (
                            <div className="space-y-4">
                              <div className="border-2 border-zinc-200 rounded-xl bg-gradient-to-br from-zinc-50 to-white p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs  text-zinc-500 mb-1">
                                      PROCESSING TIME
                                    </p>
                                    <p className=" text-zinc-900 flex items-center gap-2">
                                      <ClockIcon className="size-4 text-emerald-900" />
                                      {selectedMobileData.processingTime}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs  text-zinc-500 mb-1">
                                      MIN DEPOSIT
                                    </p>
                                    <p className=" text-zinc-900">
                                      ${selectedMobileData.minDeposit}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm  text-zinc-600 mb-2 block">
                                  {selectedMobileData.name.toUpperCase()} HANDLE
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    value={selectedMobileData.handle}
                                    readOnly
                                    className=" text-sm border-2 border-zinc-200 rounded-xl bg-zinc-50"
                                  />
                                  <Button
                                    onClick={() =>
                                      copyToClipboard(
                                        selectedMobileData.handle,
                                        selectedMobileData.id
                                      )
                                    }
                                    className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl px-4"
                                  >
                                    {copiedAddress === selectedMobileData.id ? (
                                      <CheckIcon className="size-4" />
                                    ) : (
                                      <CopyIcon className="size-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              <div className="border-2 border-amber-200 rounded-xl bg-amber-50 p-4">
                                <div className="flex gap-3">
                                  <AlertCircleIcon className="size-5 text-amber-900 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-bold text-amber-900 mb-1">
                                      Important Instructions
                                    </p>
                                    <p className="text-sm text-amber-900">
                                      {selectedMobileData.instructions}
                                    </p>
                                    <div className="mt-3 p-3 bg-amber-100 rounded-lg border border-amber-200">
                                      <p className="text-xs  text-amber-800 mb-1">
                                        Your User ID:
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-amber-900 ">
                                          USR-2024-7891
                                        </span>
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            copyToClipboard(
                                              "USR-2024-7891",
                                              "userid"
                                            )
                                          }
                                          className="h-6 px-2 bg-amber-900 hover:bg-amber-800 text-white rounded-lg"
                                        >
                                          {copiedAddress === "userid" ? (
                                            <CheckIcon className="size-3" />
                                          ) : (
                                            <CopyIcon className="size-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Amount Input */}
                    <div className=" rounded-2xl bg-white p-4 sm:p-6">
                      <h2 className="text-lg sm:text-xl font-bold text-zinc-900 mb-4">
                        Enter Amount
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm  text-zinc-600 mb-2 block">
                            DEPOSIT AMOUNT (USD)
                          </Label>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="text-xl sm:text-2xl font-bold border-2 border-zinc-200 rounded-xl h-14 sm:h-16 pl-10 sm:pl-12"
                            />
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-bold text-zinc-400">
                              $
                            </span>
                          </div>
                        </div>

                        {depositBonus > 0 && (
                          <div className="border-2 border-emerald-200 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg bg-emerald-900 flex items-center justify-center">
                                  <SparklesIcon className="size-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-emerald-900">
                                    Bonus Applied!
                                  </p>
                                  <p className="text-xs text-emerald-800">
                                    You'll receive an extra $
                                    {depositBonus.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs  text-emerald-700 mb-1">
                                  TOTAL YOU'LL GET
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-emerald-900">
                                  $
                                  {(
                                    Number.parseFloat(amount) + depositBonus
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <Label className="text-sm  text-zinc-600 mb-2 block">
                            QUICK AMOUNTS
                          </Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                            {quickAmounts.map((quickAmount) => (
                              <Button
                                key={quickAmount}
                                onClick={() =>
                                  setAmount(quickAmount.toString())
                                }
                                variant="outline"
                                className="border-2 border-zinc-200 hover:border-emerald-900 hover:bg-emerald-50 rounded-xl font-bold"
                              >
                                ${quickAmount}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Button
                          onClick={() => setShowDepositModal(true)}
                          disabled={!amount || Number.parseFloat(amount) <= 0}
                          className="w-full bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl h-11 sm:h-12 text-sm sm:text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ZapIcon className="size-5 mr-2" />
                          Proceed to Payment
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6 order-first xl:order-last">
                    {/* Current Balance */}
                    <div className="relative overflow-hidden border-2 border-emerald-900 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-6">
                      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                      <div className="relative">
                        <p className="text-xs  text-emerald-100 mb-2">
                          CURRENT BALANCE
                        </p>
                        <p className="text-3xl sm:text-4xl font-bold text-white mb-6">
                          $10,250.00
                        </p>
                        <div className="flex items-center gap-2 text-emerald-100">
                          <TrendingUpIcon className="size-4" />
                          <span className="text-sm ">+$500 this week</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm  text-zinc-600">
                          DEPOSIT STATISTICS
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          <RefreshCwIcon className="size-4 text-zinc-600" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-zinc-600">
                              Total Deposits
                            </span>
                            <span className="text-sm font-bold text-zinc-900">
                              $15,750
                            </span>
                          </div>
                          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-900 to-emerald-700 rounded-full transition-all duration-500"
                              style={{ width: "75%" }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-zinc-600">
                              This Month
                            </span>
                            <span className="text-sm font-bold text-zinc-900">
                              $2,400
                            </span>
                          </div>
                          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500"
                              style={{ width: "45%" }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-zinc-600">
                              This Week
                            </span>
                            <span className="text-sm font-bold text-zinc-900">
                              $500
                            </span>
                          </div>
                          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-purple-500 rounded-full transition-all duration-500"
                              style={{ width: "15%" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-blue-200 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-lg bg-blue-600 flex items-center justify-center">
                          <ShieldCheckIcon className="size-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-blue-900">
                            Verification Level
                          </p>
                          <p className="text-xs text-blue-700">
                            Enhanced Security
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-800">Daily Limit</span>
                          <span className="font-bold text-blue-900">
                            $10,000
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-800">Monthly Limit</span>
                          <span className="font-bold text-blue-900">
                            $100,000
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-2 border-blue-600 text-blue-900 hover:bg-blue-100 rounded-xl mt-2 bg-transparent"
                        >
                          Upgrade Limits
                        </Button>
                      </div>
                    </div>

                    {/* Processing Info */}
                    <div className="border-2 border-zinc-200 rounded-2xl bg-white p-4 sm:p-6">
                      <div className="flex gap-3">
                        <ClockIcon className="size-5 text-zinc-600 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-zinc-900 mb-2">
                            Processing Times
                          </p>
                          <ul className="space-y-1 text-xs text-zinc-600">
                            <li className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-orange-500" />
                              Crypto: 10-30 minutes
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-blue-500" />
                              Mobile Money: 5-30 minutes
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-emerald-500" />
                              Funds available after confirmation
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Deposits */}
              <div className="px-4 lg:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
                    Recent Deposits
                  </h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 h-10 w-full sm:w-48 border-2 border-zinc-200 rounded-xl"
                      />
                    </div>
                    <Select
                      value={filterStatus}
                      onValueChange={setFilterStatus}
                    >
                      <SelectTrigger className="w-full sm:w-32 h-10 border-2 border-zinc-200 rounded-xl">
                        <FilterIcon className="size-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-2 border-zinc-200 rounded-xl h-10 bg-transparent"
                    >
                      <DownloadIcon className="size-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
                <div className="border-2 border-zinc-200 rounded-2xl bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-zinc-50 border-b-2 border-zinc-200">
                        <tr>
                          <th className="text-left p-3 sm:p-4 text-xs  text-zinc-600">
                            METHOD
                          </th>
                          <th className="text-left p-3 sm:p-4 text-xs  text-zinc-600">
                            AMOUNT
                          </th>
                          <th className="hidden sm:table-cell text-left p-3 sm:p-4 text-xs  text-zinc-600">
                            DATE
                          </th>
                          <th className="hidden md:table-cell text-left p-3 sm:p-4 text-xs  text-zinc-600">
                            TIME
                          </th>
                          <th className="hidden lg:table-cell text-left p-3 sm:p-4 text-xs  text-zinc-600">
                            TX HASH
                          </th>
                          <th className="text-left p-3 sm:p-4 text-xs  text-zinc-600">
                            STATUS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeposits.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-6 sm:p-8 text-center text-zinc-500"
                            >
                              No deposits found
                            </td>
                          </tr>
                        ) : (
                          filteredDeposits.map((deposit, index) => (
                            <tr
                              key={deposit.id}
                              onClick={() => handleTransactionClick(deposit)}
                              className={`border-b border-zinc-100 hover:bg-emerald-50 transition-colors cursor-pointer ${
                                index === filteredDeposits.length - 1
                                  ? "border-b-0"
                                  : ""
                              }`}
                            >
                              <td className="p-3 sm:p-4">
                                <span className="text-sm font-medium text-zinc-900">
                                  {deposit.method}
                                </span>
                              </td>
                              <td className="p-3 sm:p-4">
                                <span className="text-sm  font-bold text-emerald-900">
                                  +${deposit.amount.toLocaleString()}
                                </span>
                              </td>
                              <td className="hidden sm:table-cell p-3 sm:p-4">
                                <span className="text-sm  text-zinc-600">
                                  {deposit.date}
                                </span>
                              </td>
                              <td className="hidden md:table-cell p-3 sm:p-4">
                                <span className="text-sm  text-zinc-600">
                                  {deposit.time}
                                </span>
                              </td>
                              <td className="hidden lg:table-cell p-3 sm:p-4">
                                <span className="text-xs  text-zinc-500">
                                  {deposit.txHash}
                                </span>
                              </td>
                              <td className="p-3 sm:p-4">
                                <Badge
                                  className={` text-xs flex items-center gap-1 w-fit ${
                                    deposit.status === "completed"
                                      ? "bg-emerald-50 text-emerald-900 border-2 border-emerald-900"
                                      : deposit.status === "pending"
                                      ? "bg-amber-50 text-amber-900 border-2 border-amber-900"
                                      : "bg-red-50 text-red-900 border-2 border-red-900"
                                  }`}
                                >
                                  {deposit.status === "completed" ? (
                                    <CheckCircle2Icon className="size-3" />
                                  ) : deposit.status === "pending" ? (
                                    <ClockIcon className="size-3" />
                                  ) : (
                                    <XCircleIcon className="size-3" />
                                  )}
                                  {deposit.status.toUpperCase()}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      <DepositConfirmationModal
        open={showDepositModal}
        onOpenChange={setShowDepositModal}
        paymentMethod={selectedMethod}
        selectedCrypto={
          selectedMethod === "crypto" ? selectedCryptoData : undefined
        }
        selectedMobile={
          selectedMethod === "mobile" ? selectedMobileData : undefined
        }
        amount={amount}
        depositBonus={depositBonus}
      />

      <TransactionDetailsModal
        open={showTransactionModal}
        onOpenChange={setShowTransactionModal}
        transaction={selectedTransaction}
      />
    </SidebarProvider>
  );
}
