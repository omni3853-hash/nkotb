"use client";

import { useEffect, useMemo, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import {
  Settings, Save, RotateCcw, CheckCircle2, Clock, Database,
  Globe, Users, CreditCard, Edit, Trash2, MoreVertical, Star,
  RefreshCw, Filter, ShieldAlert, CheckCircle,
} from "lucide-react";

import { AccountType } from "@/lib/enums/account.enum";
import type { IPlatform } from "@/lib/models/platform.model";

import {
  UpdatePlatformSchema,
  type UpdatePlatformFormData,
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
  type CreatePaymentMethodFormData,
  type UpdatePaymentMethodFormData,
} from "@/utils/schemas/schemas";

import { PlatformApi } from "@/api/platform.api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PaymentMethodsApi } from "@/api/payment-methods.api";

/* ---------- Frontend-lean type (plain object) ---------- */
type PaymentMethodLean = {
  _id: string;
  user?: string;
  type: AccountType;

  // Crypto
  cryptocurrency?: string;
  network?: string;
  walletAddress?: string;
  qrCode?: string;

  // Bank
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;

  // Mobile
  provider?: string;
  handle?: string;
  email?: string;

  // Common
  status: boolean;
  processingTime: string;
  fee: number;
  isDefault: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

/* ---------- Local UI types for editing ---------- */
type PaymentMethodUI = {
  id?: string;
  _id?: string;
  type: AccountType;

  // crypto
  cryptocurrency?: string;
  network?: string;
  walletAddress?: string;
  qrCode?: string;

  // bank
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;

  // mobile
  provider?: string;
  handle?: string;
  email?: string;

  // common
  status: boolean;
  processingTime: string;
  fee: number;
  isDefault: boolean;
};

const emptyPayment: PaymentMethodUI = {
  type: AccountType.BANK_ACCOUNT,
  status: true,
  processingTime: "1-3 business days",
  fee: 0,
  isDefault: false,
};

const asId = (v: any) => String(v ?? "");

export default function AdminSettingsPage() {
  /* ---------- Platform ---------- */
  const [platform, setPlatform] = useState<IPlatform | null>(null);

  const [generalForm, setGeneralForm] = useState<UpdatePlatformFormData>({});
  const [platformForm, setPlatformForm] = useState<UpdatePlatformFormData>({});

  const [loadingPlatform, setLoadingPlatform] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState(false);

  /* ---------- Payment Methods (LEAN) ---------- */
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodLean[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Modal + forms
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethodLean | null>(null);
  const [paymentForm, setPaymentForm] = useState<PaymentMethodUI>(emptyPayment);

  // Save/Add/Update loader + confirm
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [confirmPaymentSaveOpen, setConfirmPaymentSaveOpen] = useState(false);

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethodLean | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toggle + default confirmations
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<PaymentMethodLean | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [confirmDefaultOpen, setConfirmDefaultOpen] = useState(false);
  const [defaultTarget, setDefaultTarget] = useState<PaymentMethodLean | null>(null);
  const [defaultLoading, setDefaultLoading] = useState(false);

  // General/Platform confirmers
  const [confirmSaveGeneralOpen, setConfirmSaveGeneralOpen] = useState(false);
  const [confirmSavePlatformOpen, setConfirmSavePlatformOpen] = useState(false);
  const [confirmResetGeneralOpen, setConfirmResetGeneralOpen] = useState(false);
  const [confirmResetPlatformOpen, setConfirmResetPlatformOpen] = useState(false);

  const [lastUpdated, setLastUpdated] = useState<string>("");

  /* ---------- Filters ---------- */
  type FilterType = "ALL" | AccountType;
  type FilterStatus = "ALL" | "ENABLED" | "DISABLED";
  type FilterDefault = "ALL" | "DEFAULT" | "NON_DEFAULT";

  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [filterDefault, setFilterDefault] = useState<FilterDefault>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const clearFilters = () => {
    setFilterType("ALL");
    setFilterStatus("ALL");
    setFilterDefault("ALL");
    setSearchQuery("");
  };

  const filteredPayments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return paymentMethods.filter((m) => {
      if (filterType !== "ALL" && m.type !== filterType) return false;
      if (filterStatus === "ENABLED" && !m.status) return false;
      if (filterStatus === "DISABLED" && m.status) return false;
      if (filterDefault === "DEFAULT" && !m.isDefault) return false;
      if (filterDefault === "NON_DEFAULT" && m.isDefault) return false;

      if (!q) return true;

      const hay = [
        m.bankName, m.accountName, m.accountNumber, m.routingNumber, m.swiftCode,
        m.provider, m.handle, m.email, m.cryptocurrency, m.network, m.walletAddress,
        m.processingTime, String(m.fee ?? ""),
        m.type?.replace("_", " "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [paymentMethods, filterType, filterStatus, filterDefault, searchQuery]);

  /* ---------- Loaders ---------- */
  async function loadPlatform() {
    try {
      setLoadingPlatform(true);
      const p = await PlatformApi.get();
      setPlatform(p);

      setGeneralForm({
        siteName: p.siteName,
        siteTagline: p.siteTagline,
        siteDescription: p.siteDescription,
        supportEmail: p.supportEmail,
        supportPhone: p.supportPhone,
      });
      setPlatformForm({
        minDepositAmount: p.minDepositAmount,
        bookingFeePercentage: p.bookingFeePercentage,
        cancellationPolicy: p.cancellationPolicy,
        refundPolicy: p.refundPolicy,
      });
      setLastUpdated(p.updatedAt ? new Date(p.updatedAt as any).toISOString() : new Date().toISOString());
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load platform";
      toast.error(msg);
    } finally {
      setLoadingPlatform(false);
    }
  }

  async function loadPaymentMethods() {
    try {
      setLoadingPayments(true);
      const res = await PaymentMethodsApi.adminList({ page: 1, limit: 100 });
      setPaymentMethods((res.items || []).map((x: any): PaymentMethodLean => ({
        _id: asId(x._id),
        user: asId(x.user),
        type: x.type,
        cryptocurrency: x.cryptocurrency,
        network: x.network,
        walletAddress: x.walletAddress,
        qrCode: x.qrCode,
        bankName: x.bankName,
        accountName: x.accountName,
        accountNumber: x.accountNumber,
        routingNumber: x.routingNumber,
        swiftCode: x.swiftCode,
        provider: x.provider,
        handle: x.handle,
        email: x.email,
        status: !!x.status,
        processingTime: x.processingTime,
        fee: Number(x.fee ?? 0),
        isDefault: !!x.isDefault,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
      })));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to load payment methods";
      toast.error(msg);
    } finally {
      setLoadingPayments(false);
    }
  }

  // Refresh both after mutations
  const refreshAll = async () => {
    await Promise.all([loadPlatform(), loadPaymentMethods()]);
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- Change tracking ---------- */
  const generalHasChanges = useMemo(() => {
    if (!platform) return false;
    const base = {
      siteName: platform.siteName,
      siteTagline: platform.siteTagline,
      siteDescription: platform.siteDescription,
      supportEmail: platform.supportEmail,
      supportPhone: platform.supportPhone,
    };
    return JSON.stringify(base) !== JSON.stringify(generalForm);
  }, [platform, generalForm]);

  const platformHasChanges = useMemo(() => {
    if (!platform) return false;
    const base = {
      minDepositAmount: platform.minDepositAmount,
      bookingFeePercentage: platform.bookingFeePercentage,
      cancellationPolicy: platform.cancellationPolicy,
      refundPolicy: platform.refundPolicy,
    };
    return JSON.stringify(base) !== JSON.stringify(platformForm);
  }, [platform, platformForm]);

  /* ---------- Helpers: build full payload (NO DATA LOSS) ---------- */
  const buildFullPayload = (): UpdatePlatformFormData => {
    const merged = { ...generalForm, ...platformForm } as UpdatePlatformFormData;
    return UpdatePlatformSchema.parse(merged);
  };

  /* ---------- Save handlers (Platform + General) ---------- */
  const doSaveGeneral = async () => {
    if (!platform) return;
    try {
      setSavingPlatform(true);
      const payload = buildFullPayload();
      const updated = await PlatformApi.update(payload);

      setPlatform(updated);
      setGeneralForm({
        siteName: updated.siteName,
        siteTagline: updated.siteTagline,
        siteDescription: updated.siteDescription,
        supportEmail: updated.supportEmail,
        supportPhone: updated.supportPhone,
      });
      setPlatformForm({
        minDepositAmount: updated.minDepositAmount,
        bookingFeePercentage: updated.bookingFeePercentage,
        cancellationPolicy: updated.cancellationPolicy,
        refundPolicy: updated.refundPolicy,
      });
      setLastUpdated(updated.updatedAt ? new Date(updated.updatedAt as any).toISOString() : new Date().toISOString());

      await refreshAll();
      toast.success("General settings saved");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save general settings";
      toast.error(msg);
    } finally {
      setSavingPlatform(false);
      setConfirmSaveGeneralOpen(false);
    }
  };

  const doSavePlatform = async () => {
    if (!platform) return;
    try {
      setSavingPlatform(true);
      const payload = buildFullPayload();
      const updated = await PlatformApi.update(payload);

      setPlatform(updated);
      setGeneralForm({
        siteName: updated.siteName,
        siteTagline: updated.siteTagline,
        siteDescription: updated.siteDescription,
        supportEmail: updated.supportEmail,
        supportPhone: updated.supportPhone,
      });
      setPlatformForm({
        minDepositAmount: updated.minDepositAmount,
        bookingFeePercentage: updated.bookingFeePercentage,
        cancellationPolicy: updated.cancellationPolicy,
        refundPolicy: updated.refundPolicy,
      });
      setLastUpdated(updated.updatedAt ? new Date(updated.updatedAt as any).toISOString() : new Date().toISOString());

      await refreshAll();
      toast.success("Platform settings saved");
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save platform settings";
      toast.error(msg);
    } finally {
      setSavingPlatform(false);
      setConfirmSavePlatformOpen(false);
    }
  };

  /* ---------- Resets ---------- */
  const doResetGeneral = () => {
    if (!platform) return;
    setGeneralForm({
      siteName: platform.siteName,
      siteTagline: platform.siteTagline,
      siteDescription: platform.siteDescription,
      supportEmail: platform.supportEmail,
      supportPhone: platform.supportPhone,
    });
    setConfirmResetGeneralOpen(false);
  };

  const doResetPlatform = () => {
    if (!platform) return;
    setPlatformForm({
      minDepositAmount: platform.minDepositAmount,
      bookingFeePercentage: platform.bookingFeePercentage,
      cancellationPolicy: platform.cancellationPolicy,
      refundPolicy: platform.refundPolicy,
    });
    setConfirmResetPlatformOpen(false);
  };

  /* ---------- Payment: modal open/edit/new ---------- */
  const handleAddPaymentMethod = () => {
    setEditingPayment(null);
    setPaymentForm(emptyPayment);
    setIsPaymentModalOpen(true);
  };

  const handleEditPaymentMethod = (m: PaymentMethodLean) => {
    setEditingPayment(m);
    setPaymentForm({
      _id: m._id,
      type: m.type,
      cryptocurrency: m.cryptocurrency,
      network: m.network,
      walletAddress: m.walletAddress,
      qrCode: m.qrCode,
      bankName: m.bankName,
      accountName: m.accountName,
      accountNumber: m.accountNumber,
      routingNumber: m.routingNumber,
      swiftCode: m.swiftCode,
      provider: m.provider,
      handle: m.handle,
      email: m.email,
      status: !!m.status,
      processingTime: m.processingTime,
      fee: m.fee,
      isDefault: !!m.isDefault,
    });
    setIsPaymentModalOpen(true);
  };

  /* ---------- Payment: delete ---------- */
  const handleDeletePaymentMethod = (m: PaymentMethodLean) => {
    setDeleteTarget(m);
    setDeleteOpen(true);
  };

  const confirmDeletePayment = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await PaymentMethodsApi.remove(String(deleteTarget._id));
      // local update
      setPaymentMethods((prev) => prev.filter((x) => asId(x._id) !== asId(deleteTarget._id)));
      await refreshAll();
      toast.success("Payment method deleted");
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Failed to delete payment method";
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  /* ---------- Payment: toggle status ---------- */
  const askTogglePaymentStatus = (m: PaymentMethodLean) => {
    setToggleTarget(m);
    setConfirmToggleOpen(true);
  };

  const doTogglePaymentStatus = async () => {
    if (!toggleTarget) return;
    const m = toggleTarget;
    const optimistic = [...paymentMethods];
    try {
      setToggleLoading(true);
      // optimistic UI
      setPaymentMethods((prev) =>
        prev.map((x) => (asId(x._id) === asId(m._id) ? { ...x, status: !x.status } as PaymentMethodLean : x))
      );
      const updated = await PaymentMethodsApi.toggleStatus(String(m._id), !m.status);
      setPaymentMethods((prev) =>
        prev.map((x) =>
          asId(x._id) === asId(m._id)
            ? ({
              ...x,
              ...updated,
              _id: asId(updated._id),
              user: asId(updated.user),
              status: !!updated.status,
              isDefault: !!updated.isDefault,
              fee: Number(updated.fee ?? x.fee),
            } as PaymentMethodLean)
            : x
        )
      );
      await refreshAll();
      toast.success(`Payment method ${m.status ? "disabled" : "enabled"}`);
    } catch (e: any) {
      setPaymentMethods(optimistic);
      const msg = e?.response?.data?.message || e?.message || "Failed to toggle status";
      toast.error(msg);
    } finally {
      setToggleLoading(false);
      setConfirmToggleOpen(false);
      setToggleTarget(null);
    }
  };

  /* ---------- Payment: set default ---------- */
  const askSetDefault = (m: PaymentMethodLean) => {
    setDefaultTarget(m);
    setConfirmDefaultOpen(true);
  };

  const doSetDefault = async () => {
    if (!defaultTarget) return;
    const optimistic = [...paymentMethods];
    try {
      setDefaultLoading(true);
      setPaymentMethods((prev) => prev.map((x) => ({ ...x, isDefault: asId(x._id) === asId(defaultTarget._id) })));
      await PaymentMethodsApi.setDefault(String(defaultTarget._id));
      await refreshAll();
      toast.success("Default payment method set");
    } catch (e: any) {
      setPaymentMethods(optimistic);
      const msg = e?.response?.data?.message || e?.message || "Failed to set default";
      toast.error(msg);
    } finally {
      setDefaultLoading(false);
      setConfirmDefaultOpen(false);
      setDefaultTarget(null);
    }
  };

  /* ---------- Payment: create/update with confirm + loaders ---------- */
  const savePaymentMethod = async () => {
    try {
      setPaymentSaving(true);

      if (editingPayment) {
        const dto: UpdatePaymentMethodFormData = UpdatePaymentMethodSchema.parse({
          type: paymentForm.type,
          cryptocurrency: paymentForm.cryptocurrency,
          network: paymentForm.network,
          walletAddress: paymentForm.walletAddress,
          qrCode: paymentForm.qrCode,
          bankName: paymentForm.bankName,
          accountName: paymentForm.accountName,
          accountNumber: paymentForm.accountNumber,
          routingNumber: paymentForm.routingNumber,
          swiftCode: paymentForm.swiftCode,
          provider: paymentForm.provider,
          handle: paymentForm.handle,
          email: paymentForm.email,
          status: paymentForm.status,
          processingTime: paymentForm.processingTime,
          fee: paymentForm.fee,
          isDefault: paymentForm.isDefault,
        });
        const updated = await PaymentMethodsApi.update(String(editingPayment._id), dto);
        const normalized: PaymentMethodLean = {
          ...editingPayment,
          ...updated,
          _id: asId(updated._id ?? editingPayment._id),
          user: asId(updated.user ?? editingPayment.user),
          status: !!updated.status,
          isDefault: !!updated.isDefault,
          fee: Number(updated.fee ?? editingPayment.fee),
        };
        setPaymentMethods((prev) => prev.map((x) => (asId(x._id) === asId(normalized._id) ? normalized : x)));
        toast.success("Payment method updated");
      } else {
        const dto: CreatePaymentMethodFormData = CreatePaymentMethodSchema.parse({
          type: paymentForm.type,
          cryptocurrency: paymentForm.cryptocurrency,
          network: paymentForm.network,
          walletAddress: paymentForm.walletAddress,
          qrCode: paymentForm.qrCode,
          bankName: paymentForm.bankName,
          accountName: paymentForm.accountName,
          accountNumber: paymentForm.accountNumber,
          routingNumber: paymentForm.routingNumber,
          swiftCode: paymentForm.swiftCode,
          provider: paymentForm.provider,
          handle: paymentForm.handle,
          email: paymentForm.email,
          status: paymentForm.status,
          processingTime: paymentForm.processingTime,
          fee: paymentForm.fee,
          isDefault: paymentForm.isDefault,
        });
        const created = await PaymentMethodsApi.create(dto);
        const normalized: PaymentMethodLean = {
          _id: asId(created._id),
          type: created.type,
          cryptocurrency: created.cryptocurrency,
          network: created.network,
          walletAddress: created.walletAddress,
          qrCode: created.qrCode,
          bankName: created.bankName,
          accountName: created.accountName,
          accountNumber: created.accountNumber,
          routingNumber: created.routingNumber,
          swiftCode: created.swiftCode,
          provider: created.provider,
          handle: created.handle,
          email: created.email,
          status: !!created.status,
          processingTime: created.processingTime,
          fee: Number(created.fee ?? 0),
          isDefault: !!created.isDefault,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        };
        setPaymentMethods((prev) => [normalized, ...prev]);
        toast.success("Payment method added");
      }

      // Close + clear
      setIsPaymentModalOpen(false);
      setEditingPayment(null);
      setPaymentForm(emptyPayment);

      await refreshAll();
    } catch (e: any) {
      console.log(e)
      const msg = e?.response?.data?.message || e?.message || "Failed to save payment method";
      toast.error(msg);
    } finally {
      setPaymentSaving(false);
      setConfirmPaymentSaveOpen(false);
    }
  };

  /* ---------- Export ---------- */
  const exportSettings = () => {
    const payload = {
      platform: platform ?? {},
      paymentMethods,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-settings-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const activeSettingsCount = () => {
    let c = 0;
    if (platform?.siteName) c++;
    if (platform?.supportEmail) c++;
    if (paymentMethods.length) c++;
    return c;
  };

  const paymentActionLabel = editingPayment ? "Update Payment Method" : "Add Payment Method";

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Admin Settings"
              subtitle="Platform configuration based on your data models"
              actionButton={{
                text: loadingPlatform && loadingPayments ? "Loading…" : "Export Settings",
                icon: <Database className="size-4" />,
                onClick: exportSettings,
              }}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {activeSettingsCount()}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">ACTIVE SETTINGS</p>
                <p className="text-2xl font-bold text-emerald-900">{activeSettingsCount()}</p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Clock className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {lastUpdated ? formatDate(lastUpdated) : "—"}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">LAST UPDATED</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {lastUpdated ? formatDate(lastUpdated) : "—"}
                </p>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="general"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="platform"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Platform
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payments
                </TabsTrigger>
              </TabsList>

              {/* General */}
              <TabsContent value="general" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">General Settings</CardTitle>
                        <CardDescription>Basic site information and support contacts</CardDescription>
                      </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        {generalHasChanges && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Unsaved Changes
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setConfirmResetGeneralOpen(true)}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                          disabled={loadingPlatform || savingPlatform || !platform}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          onClick={() => setConfirmSaveGeneralOpen(true)}
                          disabled={!generalHasChanges || savingPlatform || !platform}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white"
                          isLoading={savingPlatform}
                          loadingText="Saving…"
                        >
                          {!savingPlatform ? <Save className="w-4 h-4 mr-2" /> : null}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Site info */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Site Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-emerald-900">Site Name</Label>
                          <Input
                            value={generalForm.siteName ?? ""}
                            onChange={(e) => setGeneralForm({ ...generalForm, siteName: e.target.value })}
                            className="bg-zinc-50 focus:border-emerald-500"
                            disabled={loadingPlatform || savingPlatform}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-emerald-900">Site Tagline</Label>
                          <Input
                            value={generalForm.siteTagline ?? ""}
                            onChange={(e) => setGeneralForm({ ...generalForm, siteTagline: e.target.value })}
                            className="bg-zinc-50 focus:border-emerald-500"
                            disabled={loadingPlatform || savingPlatform}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-emerald-900">Site Description</Label>
                        <Textarea
                          value={generalForm.siteDescription ?? ""}
                          onChange={(e) => setGeneralForm({ ...generalForm, siteDescription: e.target.value })}
                          className="bg-zinc-50 focus:border-emerald-500 min-h-[100px]"
                          disabled={loadingPlatform || savingPlatform}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Support contacts */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Support Contacts
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-emerald-900">Support Email</Label>
                          <Input
                            type="email"
                            value={generalForm.supportEmail ?? ""}
                            onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                            className="bg-zinc-50 focus:border-emerald-500"
                            disabled={loadingPlatform || savingPlatform}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-emerald-900">Support Phone</Label>
                          <Input
                            value={generalForm.supportPhone ?? ""}
                            onChange={(e) => setGeneralForm({ ...generalForm, supportPhone: e.target.value })}
                            className="bg-zinc-50 focus:border-emerald-500"
                            disabled={loadingPlatform || savingPlatform}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Platform */}
              <TabsContent value="platform" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">Platform Settings</CardTitle>
                        <CardDescription>Booking fees and platform policies</CardDescription>
                      </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        {platformHasChanges && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Unsaved Changes
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setConfirmResetPlatformOpen(true)}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                          disabled={loadingPlatform || savingPlatform || !platform}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          onClick={() => setConfirmSavePlatformOpen(true)}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white"
                          disabled={savingPlatform || !platform}
                          isLoading={savingPlatform}
                          loadingText="Saving…"
                        >
                          {!savingPlatform ? <Save className="w-4 h-4 mr-2" /> : null}
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Booking settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-emerald-900">Min Deposit Amount</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={platformForm.minDepositAmount ?? 0}
                          onChange={(e) => setPlatformForm({ ...platformForm, minDepositAmount: Number(e.target.value) || 0 })}
                          className="bg-zinc-50 focus:border-emerald-500"
                          disabled={loadingPlatform || savingPlatform}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-emerald-900">Booking Fee Percentage (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={platformForm.bookingFeePercentage ?? 0}
                          onChange={(e) => setPlatformForm({ ...platformForm, bookingFeePercentage: Number(e.target.value) || 0 })}
                          className="bg-zinc-50 focus:border-emerald-500"
                          disabled={loadingPlatform || savingPlatform}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-emerald-900">Cancellation Policy</Label>
                        <Textarea
                          value={platformForm.cancellationPolicy ?? ""}
                          onChange={(e) => setPlatformForm({ ...platformForm, cancellationPolicy: e.target.value })}
                          className="bg-zinc-50 focus:border-emerald-500 min-h-[100px]"
                          disabled={loadingPlatform || savingPlatform}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label className="text-emerald-900">Refund Policy</Label>
                        <Textarea
                          value={platformForm.refundPolicy ?? ""}
                          onChange={(e) => setPlatformForm({ ...platformForm, refundPolicy: e.target.value })}
                          className="bg-zinc-50 focus:border-emerald-500 min-h-[100px]"
                          disabled={loadingPlatform || savingPlatform}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payments */}
              <TabsContent value="payments" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">Payment Methods</CardTitle>
                        <CardDescription>Manage methods and quickly filter by type, status, default, or search.</CardDescription>
                      </div>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          onClick={loadPaymentMethods}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                          disabled={loadingPayments}
                          isLoading={loadingPayments}
                          loadingText="Refreshing…"
                        >
                          {!loadingPayments ? <RefreshCw className="w-4 h-4 mr-2" /> : null}
                          Refresh
                        </Button>
                        <Button
                          onClick={handleAddPaymentMethod}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white"
                          disabled={loadingPayments}
                        >
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Filters */}
                    <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50">
                      <div className="space-y-1">
                        <Label className="text-emerald-900 flex items-center gap-2 text-sm">
                          <Filter className="w-4 h-4" /> Type
                        </Label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value as FilterType)}
                          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="ALL">All</option>
                          <option value={AccountType.BANK_ACCOUNT}>Bank Account</option>
                          <option value={AccountType.CRYPTO_WALLET}>Crypto Wallet</option>
                          <option value={AccountType.MOBILE_PAYMENT}>Mobile Payment</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-emerald-900 text-sm">Status</Label>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="ALL">All</option>
                          <option value="ENABLED">Enabled</option>
                          <option value="DISABLED">Disabled</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-emerald-900 text-sm">Default</Label>
                        <select
                          value={filterDefault}
                          onChange={(e) => setFilterDefault(e.target.value as FilterDefault)}
                          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="ALL">All</option>
                          <option value="DEFAULT">Default only</option>
                          <option value="NON_DEFAULT">Non-default only</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-emerald-900 text-sm">Search</Label>
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Bank, provider, coin, account #..."
                          className="bg-white w-full"
                        />
                      </div>

                      <div className="md:col-span-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-2">
                        <Badge variant="outline" className="border-zinc-300 text-zinc-700 w-full sm:w-auto text-center sm:text-left">
                          {filteredPayments.length} result{filteredPayments.length === 1 ? "" : "s"}
                        </Badge>
                        <Button variant="outline" onClick={clearFilters} className="border-zinc-300 text-zinc-700 hover:bg-zinc-100 w-full sm:w-auto">
                          Reset Filters
                        </Button>
                      </div>
                    </div>

                    {/* List */}
                    {loadingPayments ? (
                      <div className="flex items-center gap-2 text-zinc-500">
                        <RefreshCw className="w-4 h-4 animate-spin" /> loading payment methods…
                      </div>
                    ) : filteredPayments.length === 0 ? (
                      <div className="text-sm text-zinc-600">No payment methods match your filters.</div>
                    ) : (
                      <div className="space-y-3">
                        {filteredPayments.map((m) => (
                            <Card key={asId(m._id)} className="bg-zinc-50 border-zinc-200">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="font-medium text-emerald-900">
                                      {m.bankName || m.provider || m.cryptocurrency || m.accountName || m.type}
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={
                                        m.type === AccountType.CRYPTO_WALLET
                                          ? "border-orange-200 text-orange-800"
                                          : m.type === AccountType.MOBILE_PAYMENT
                                            ? "border-green-200 text-green-800"
                                            : "border-blue-200 text-blue-800"
                                      }
                                    >
                                      {m.type.replace("_", " ")}
                                    </Badge>
                                    {m.isDefault && (
                                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                        <Star className="w-3 h-3 mr-1" /> Default
                                      </Badge>
                                    )}
                                    <Badge className={m.status ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-zinc-100 text-zinc-700 border-zinc-200"}>
                                      {m.status ? "Enabled" : "Disabled"}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-zinc-600 mt-2 grid sm:grid-cols-2 gap-2">
                                    {m.type === AccountType.CRYPTO_WALLET && (
                                      <>
                                        <div>Coin: <span className="text-zinc-900">{m.cryptocurrency || "—"}</span></div>
                                        <div>Network: <span className="text-zinc-900">{m.network || "—"}</span></div>
                                        <div className="sm:col-span-2 truncate">Wallet: <span className="text-zinc-900">{m.walletAddress || "—"}</span></div>
                                      </>
                                    )}
                                    {m.type === AccountType.BANK_ACCOUNT && (
                                      <>
                                        <div>Bank: <span className="text-zinc-900">{m.bankName || "—"}</span></div>
                                        <div>Account Name: <span className="text-zinc-900">{m.accountName || "—"}</span></div>
                                        <div>Account #: <span className="text-zinc-900">{m.accountNumber || "—"}</span></div>
                                        <div>Routing #: <span className="text-zinc-900">{m.routingNumber || "—"}</span></div>
                                        <div>SWIFT: <span className="text-zinc-900">{m.swiftCode || "—"}</span></div>
                                      </>
                                    )}
                                    {m.type === AccountType.MOBILE_PAYMENT && (
                                      <>
                                        <div>Provider: <span className="text-zinc-900">{m.provider || "—"}</span></div>
                                        <div>Handle: <span className="text-zinc-900">{m.handle || "—"}</span></div>
                                        <div>Email: <span className="text-zinc-900">{m.email || "—"}</span></div>
                                      </>
                                    )}
                                    <div>Processing: <span className="text-zinc-900">{m.processingTime}</span></div>
                                    <div>Fee: <span className="text-zinc-900">{m.fee}</span></div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                                    <input
                                      type="checkbox"
                                      checked={!!m.status}
                                      onChange={() => askTogglePaymentStatus(m)}
                                      className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    Enabled
                                  </label>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditPaymentMethod(m)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => askSetDefault(m)}>
                                        <Star className="w-4 h-4 mr-2" />
                                        Set as Default
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeletePaymentMethod(m)} className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>

      {/* Payment Method Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={(v) => {
        // prevent closing while saving
        if (paymentSaving) return;
        setIsPaymentModalOpen(v);
        if (!v) {
          setEditingPayment(null);
          setPaymentForm(emptyPayment);
        }
      }}>
        <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-emerald-900">
              {editingPayment ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>Configure fields according to the selected account type.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Core */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-emerald-900">Account Type</Label>
                <select
                  value={paymentForm.type}
                  onChange={(e) => setPaymentForm({ ...paymentForm, type: e.target.value as AccountType })}
                  className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  disabled={paymentSaving}
                >
                  <option value={AccountType.BANK_ACCOUNT}>Bank Account</option>
                  <option value={AccountType.CRYPTO_WALLET}>Crypto Wallet</option>
                  <option value={AccountType.MOBILE_PAYMENT}>Mobile Payment</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-900">Processing Time</Label>
                <Input
                  value={paymentForm.processingTime}
                  onChange={(e) => setPaymentForm({ ...paymentForm, processingTime: e.target.value })}
                  className="bg-zinc-50 focus:border-emerald-500"
                  placeholder="e.g., 1-3 business days"
                  disabled={paymentSaving}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-900">Fee</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={paymentForm.fee}
                  onChange={(e) => setPaymentForm({ ...paymentForm, fee: Number(e.target.value) || 0 })}
                  className="bg-zinc-50 focus:border-emerald-500"
                  placeholder="0.30"
                  disabled={paymentSaving}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-900">Status / Default</Label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={paymentForm.status}
                      onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      disabled={paymentSaving}
                    />
                    Enabled
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={paymentForm.isDefault}
                      onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                      className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                      disabled={paymentSaving}
                    />
                    Default
                  </label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Conditional sections */}
            {paymentForm.type === AccountType.CRYPTO_WALLET && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-900">Cryptocurrency</Label>
                  <Input
                    value={paymentForm.cryptocurrency || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cryptocurrency: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="BTC / ETH"
                    disabled={paymentSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900">Network</Label>
                  <Input
                    value={paymentForm.network || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, network: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="Bitcoin / Ethereum / TRON"
                    disabled={paymentSaving}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-emerald-900">Wallet Address</Label>
                  <Input
                    value={paymentForm.walletAddress || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, walletAddress: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="Wallet address"
                    disabled={paymentSaving}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-emerald-900">QR Code (URL)</Label>
                  <Input
                    value={paymentForm.qrCode || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, qrCode: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="Optional QR image URL"
                    disabled={paymentSaving}
                  />
                </div>
              </div>
            )}

            {paymentForm.type === AccountType.BANK_ACCOUNT && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-900">Bank Name</Label>
                  <Input
                    value={paymentForm.bankName || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, bankName: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    disabled={paymentSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900">Account Name</Label>
                  <Input
                    value={paymentForm.accountName || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, accountName: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    disabled={paymentSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900">Account Number</Label>
                  <Input
                    value={paymentForm.accountNumber || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    disabled={paymentSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900">Routing Number</Label>
                  <Input
                    value={paymentForm.routingNumber || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, routingNumber: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    disabled={paymentSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900">SWIFT Code</Label>
                  <Input
                    value={paymentForm.swiftCode || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, swiftCode: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    disabled={paymentSaving}
                  />
                </div>
              </div>
            )}

            {paymentForm.type === AccountType.MOBILE_PAYMENT && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-emerald-900">Provider</Label>
                  <Input
                    value={paymentForm.provider || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, provider: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="M-Pesa / Airtel / etc."
                    disabled={paymentSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900">Handle</Label>
                  <Input
                    value={paymentForm.handle || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, handle: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="Phone/account handle"
                    disabled={paymentSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-900">Email</Label>
                  <Input
                    value={paymentForm.email || ""}
                    onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="Optional"
                    disabled={paymentSaving}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (paymentSaving) return;
                setIsPaymentModalOpen(false);
                setEditingPayment(null);
                setPaymentForm(emptyPayment);
              }}
              className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              disabled={paymentSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setConfirmPaymentSaveOpen(true)}
              className="bg-emerald-800 hover:bg-emerald-700 text-white"
              isLoading={paymentSaving}
              loadingText={editingPayment ? "Updating…" : "Creating…"}
              disabled={paymentSaving}
            >
              {paymentActionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm SAVE (Payment create/update) */}
      <ConfirmDialog
        open={confirmPaymentSaveOpen}
        onOpenChange={setConfirmPaymentSaveOpen}
        title={editingPayment ? "Update this payment method?" : "Create this payment method?"}
        description={editingPayment
          ? "We will update the selected payment method. You can change it later."
          : "We will create a new payment method with the details provided."}
        confirmText={editingPayment ? "Update" : "Create"}
        confirmVariant="default"
        confirming={paymentSaving}
        onConfirm={savePaymentMethod}
        icon={<CheckCircle className="size-5" />}
      >
        <div className="space-y-1 text-sm">
          <div><strong>Type:</strong> {paymentForm.type?.toString().replace("_", " ")}</div>
          {paymentForm.bankName && <div><strong>Bank:</strong> {paymentForm.bankName}</div>}
          {paymentForm.provider && <div><strong>Provider:</strong> {paymentForm.provider}</div>}
          {paymentForm.cryptocurrency && <div><strong>Coin:</strong> {paymentForm.cryptocurrency}</div>}
          {paymentForm.walletAddress && <div className="truncate"><strong>Wallet:</strong> {paymentForm.walletAddress}</div>}
          <div><strong>Status:</strong> {paymentForm.status ? "Enabled" : "Disabled"}</div>
          <div><strong>Default:</strong> {paymentForm.isDefault ? "Yes" : "No"}</div>
        </div>
      </ConfirmDialog>

      {/* Confirm DELETE */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Payment Method"
        description="This will permanently remove the payment method."
        confirmText="Delete"
        confirmVariant="destructive"
        confirmClassName="bg-red-600 hover:bg-red-700 text-white"
        confirming={deleteLoading}
        onConfirm={confirmDeletePayment}
        icon={<Trash2 className="size-5" />}
        tone="danger"
      >
        {deleteTarget ? (
          <div className="space-y-2 text-sm">
            <div><strong>Type:</strong> {deleteTarget.type}</div>
            <div><strong>Label:</strong> {deleteTarget.bankName || deleteTarget.provider || deleteTarget.cryptocurrency || deleteTarget.accountName || "—"}</div>
          </div>
        ) : null}
      </ConfirmDialog>

      {/* Confirm SAVE (General) */}
      <ConfirmDialog
        open={confirmSaveGeneralOpen}
        onOpenChange={setConfirmSaveGeneralOpen}
        title="Save General Settings?"
        description="This will update your platform with the current General and Platform values together."
        confirmText="Save"
        confirmVariant="default"
        confirming={savingPlatform}
        onConfirm={doSaveGeneral}
        icon={<CheckCircle className="size-5" />}
      />

      {/* Confirm SAVE (Platform) */}
      <ConfirmDialog
        open={confirmSavePlatformOpen}
        onOpenChange={setConfirmSavePlatformOpen}
        title="Save Platform Settings?"
        description="This will update your platform with the current General and Platform values together."
        confirmText="Save"
        confirmVariant="default"
        confirming={savingPlatform}
        onConfirm={doSavePlatform}
        icon={<CheckCircle className="size-5" />}
      />

      {/* Confirm RESET (General) */}
      <ConfirmDialog
        open={confirmResetGeneralOpen}
        onOpenChange={setConfirmResetGeneralOpen}
        title="Reset General form?"
        description="This will discard unsaved changes in the General tab."
        confirmText="Reset"
        confirmVariant="outline"
        onConfirm={doResetGeneral}
        icon={<RotateCcw className="size-5" />}
      />

      {/* Confirm RESET (Platform) */}
      <ConfirmDialog
        open={confirmResetPlatformOpen}
        onOpenChange={setConfirmResetPlatformOpen}
        title="Reset Platform form?"
        description="This will discard unsaved changes in the Platform tab."
        confirmText="Reset"
        confirmVariant="outline"
        onConfirm={doResetPlatform}
        icon={<RotateCcw className="size-5" />}
      />

      {/* Confirm TOGGLE status */}
      <ConfirmDialog
        open={confirmToggleOpen}
        onOpenChange={setConfirmToggleOpen}
        title={toggleTarget?.status ? "Disable payment method?" : "Enable payment method?"}
        description="You can change this later."
        confirmText={toggleTarget?.status ? "Disable" : "Enable"}
        confirmVariant="default"
        confirming={toggleLoading}
        onConfirm={doTogglePaymentStatus}
        icon={<ShieldAlert className="size-5" />}
      >
        {toggleTarget ? (
          <div className="text-sm">
            {toggleTarget.bankName || toggleTarget.provider || toggleTarget.cryptocurrency || toggleTarget.accountName || toggleTarget.type}
          </div>
        ) : null}
      </ConfirmDialog>

      {/* Confirm SET DEFAULT */}
      <ConfirmDialog
        open={confirmDefaultOpen}
        onOpenChange={setConfirmDefaultOpen}
        title="Set as default method?"
        description="This will replace the current default payment method."
        confirmText="Set Default"
        confirmVariant="default"
        confirming={defaultLoading}
        onConfirm={doSetDefault}
        icon={<Star className="size-5" />}
      >
        {defaultTarget ? (
          <div className="text-sm">
            {defaultTarget.bankName || defaultTarget.provider || defaultTarget.cryptocurrency || defaultTarget.accountName || defaultTarget.type}
          </div>
        ) : null}
      </ConfirmDialog>
    </SidebarProvider>
  );
}
