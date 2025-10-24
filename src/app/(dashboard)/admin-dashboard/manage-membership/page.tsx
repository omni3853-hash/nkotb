"use client";

import { useEffect, useRef, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Eye, CheckCircle2, X, Truck, Package, Crown, Users, MoreVertical, Save, Check, RefreshCw, CircleSlash2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateMembershipPlanSchema, UpdateMembershipPlanSchema, CreateDeliveryOptionSchema, UpdateDeliveryOptionSchema, AdminUpdateDeliveryRequestStatusSchema, UpdateMembershipStatusSchema, type CreateMembershipPlanFormData, type UpdateMembershipPlanFormData, type CreateDeliveryOptionFormData, type UpdateDeliveryOptionFormData, type UpdateMembershipStatusFormData } from "@/utils/schemas/schemas";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DeliveryOptionDto, DeliveryOptionsApi, DeliveryRequestDto, DeliveryRequestsApi, MembershipPlanDto, MembershipPlansApi, MembershipsApi, AdminMembershipsApi, UserMembershipsApi, type MembershipDto } from "@/api/admin-membership.client";

const fmtCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
const fmtDateTime = (str: string) => new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

type MembershipPlan = { id: string; name: string; price: number; period: "MONTH" | "YEAR" | "CUSTOM"; durationDays?: number; description: string; icon?: string; color?: string; features: string[]; limitations: string[]; popular: boolean; isActive: boolean; createdAt: string; updatedAt: string; };
type DeliveryOption = { id: string; name: string; price: number; deliveryTime: string; description: string; isActive: boolean; createdAt: string; updatedAt: string; };
type DeliveryRequest = { id: string; userName: string; userEmail: string; phone: string; address: string; city: string; state: string; zipCode: string; deliveryType: "standard" | "express"; status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED"; requestDate: string; };

export default function ManageMembershipPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [memberships, setMemberships] = useState<MembershipDto[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingMemberships, setLoadingMemberships] = useState(true);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isDeliveryOptionModalOpen, setIsDeliveryOptionModalOpen] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<DeliveryRequest | null>(null);
  const [membershipDetailsOpen, setMembershipDetailsOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<MembershipDto | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusTargetId, setStatusTargetId] = useState<string | null>(null);
  const statusForm = useForm<UpdateMembershipStatusFormData>({ resolver: zodResolver(UpdateMembershipStatusSchema), defaultValues: { status: "PENDING", reason: "" } as any });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmMeta, setConfirmMeta] = useState<{ kind: "plan" | "option" | "request" | "membership"; action: string; id: string; payload?: unknown } | null>(null);
  const [planSaveConfirmOpen, setPlanSaveConfirmOpen] = useState(false);
  const [optionSaveConfirmOpen, setOptionSaveConfirmOpen] = useState(false);
  const { control: planCtl, handleSubmit: handlePlanSubmit, reset: resetPlan, watch: watchPlan, formState: { isSubmitting: planSubmitting } } = useForm({ 
    resolver: zodResolver(editingPlanId ? UpdateMembershipPlanSchema : CreateMembershipPlanSchema), 
    defaultValues: { name: "", price: 0, period: "MONTH", durationDays: undefined, description: "", icon: "Crown", color: "bg-emerald-500", popular: false, features: [], limitations: [], isActive: true } 
  });
  const planPeriod = watchPlan("period");
  const { control: optionCtl, handleSubmit: handleOptionSubmit, reset: resetOption, formState: { isSubmitting: optionSubmitting } } = useForm({ 
    resolver: zodResolver(editingOptionId ? UpdateDeliveryOptionSchema : CreateDeliveryOptionSchema), 
    defaultValues: { name: "", price: 0, deliveryTime: "", description: "", isActive: true } 
  });
  const planSubmitRef = useRef<(() => void) | null>(null);
  const optionSubmitRef = useRef<(() => void) | null>(null);

  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const res = await MembershipPlansApi.list({ onlyActive: false, page: 1, limit: 100 });
      const mapped = (res.items ?? []).map((p: MembershipPlanDto): MembershipPlan => ({ id: p._id, name: p.name, price: p.price, period: p.period, durationDays: (p as any).durationDays, description: p.description, icon: p.icon, color: p.color, features: p.features ?? [], limitations: p.limitations ?? [], popular: !!p.popular, isActive: !!p.isActive, createdAt: p.createdAt, updatedAt: p.updatedAt }));
      setPlans(mapped);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load plans");
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const res = await DeliveryOptionsApi.list({ onlyActive: false, page: 1, limit: 100 });
      const mapped = (res.items ?? []).map((o: DeliveryOptionDto): DeliveryOption => ({ id: String(o._id), name: o.name, price: o.price, deliveryTime: o.deliveryTime, description: o.description ?? "", isActive: !!o.isActive, createdAt: o.createdAt, updatedAt: o.updatedAt }));
      setDeliveryOptions(mapped);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load delivery options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await DeliveryRequestsApi.adminList({ page: 1, limit: 100 });
      const mapped: DeliveryRequest[] = (res.items ?? []).map((r: DeliveryRequestDto) => {
        const user = typeof r.user === "object" && r.user ? r.user : undefined;
        const opt = typeof r.deliveryOption === "object" && r.deliveryOption ? r.deliveryOption : undefined;
        const deliveryType: "standard" | "express" = opt?.name?.toLowerCase().includes("express") ? "express" : "standard";
        return { id: String(r._id), userName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || (user.email ?? "—") : "—", userEmail: user?.email ?? "—", phone: (user as any)?.phone ?? "—", address: r.deliveryAddress?.street ?? "—", city: r.deliveryAddress?.city ?? "—", state: r.deliveryAddress?.state ?? "—", zipCode: r.deliveryAddress?.zipCode ?? "—", deliveryType, status: r.status, requestDate: r.createdAt };
      });
      setDeliveryRequests(mapped);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load delivery requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadMemberships = async () => {
    setLoadingMemberships(true);
    try {
      const res = await MembershipsApi.list({ page: 1, limit: 100 });
      setMemberships(res.items ?? []);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to load memberships");
    } finally {
      setLoadingMemberships(false);
    }
  };

  useEffect(() => {
    loadPlans();
    loadOptions();
    loadRequests();
    loadMemberships();
  }, []);

  const completedCount = deliveryRequests.filter(r => r.status === "COMPLETED").length;

  const getStatusBadge = (status: DeliveryRequest["status"]) => {
    switch (status) {
      case "PENDING": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "APPROVED": return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>;
      case "REJECTED": return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case "COMPLETED": return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const membershipStatusBadge = (s: MembershipDto["status"]) => {
    const base = "border";
    if (s === "ACTIVE") return <Badge className={`${base} bg-green-100 text-green-800 border-green-200`}>ACTIVE</Badge>;
    if (s === "PENDING") return <Badge className={`${base} bg-yellow-100 text-yellow-800 border-yellow-200`}>PENDING</Badge>;
    if (s === "SUSPENDED") return <Badge className={`${base} bg-orange-100 text-orange-800 border-orange-200`}>SUSPENDED</Badge>;
    if (s === "CANCELLED") return <Badge className={`${base} bg-red-100 text-red-800 border-red-200`}>CANCELLED</Badge>;
    if (s === "EXPIRED") return <Badge className={`${base} bg-zinc-100 text-zinc-700 border-zinc-200`}>EXPIRED</Badge>;
    return <Badge variant="secondary">{s}</Badge>;
  };

  const openConfirm = (meta: typeof confirmMeta) => { setConfirmMeta(meta); setConfirmOpen(true); };

  const doConfirm = async () => {
    if (!confirmMeta) return;
    setConfirming(true);
    try {
      const { kind, action, id, payload } = confirmMeta;
      if (kind === "plan") {
        if (action === "delete") await MembershipPlansApi.remove(id);
      }
      if (kind === "option") {
        if (action === "delete") await DeliveryOptionsApi.remove(id);
      }
      if (kind === "request") {
        if (action === "status") {
          const parsed = AdminUpdateDeliveryRequestStatusSchema.parse(payload);
          await DeliveryRequestsApi.updateStatus(id, parsed);
        }
      }
      if (kind === "membership") {
        if (action === "cancelAutoRenew") {
          await UserMembershipsApi.cancelAutoRenew(id);
        }
      }
      toast.success("Action completed");
      setConfirmOpen(false);
      setConfirmMeta(null);
      if (kind === "plan") loadPlans();
      if (kind === "option") loadOptions();
      if (kind === "request") loadRequests();
      if (kind === "membership") loadMemberships();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Action failed");
    } finally {
      setConfirming(false);
    }
  };

  const openCreatePlan = () => {
    setEditingPlanId(null);
    resetPlan({ name: "", price: 0, period: "MONTH", durationDays: undefined, description: "", icon: "Crown", color: "bg-emerald-500", popular: false, features: [], limitations: [], isActive: true });
    setIsPlanModalOpen(true);
  };

  const openEditPlan = (p: MembershipPlan) => {
    setEditingPlanId(p.id);
    resetPlan({ name: p.name, price: p.price, period: p.period, durationDays: p.durationDays, description: p.description, icon: p.icon, color: p.color, popular: p.popular, features: p.features, limitations: p.limitations, isActive: p.isActive });
    setIsPlanModalOpen(true);
  };

  const onPlanValid = async (raw: any) => {
    try {
      if (editingPlanId) {
        const payload = UpdateMembershipPlanSchema.parse(raw);
        await MembershipPlansApi.update(editingPlanId, payload);
        toast.success("Plan updated");
      } else {
        const payload = CreateMembershipPlanSchema.parse(raw);
        await MembershipPlansApi.create(payload);
        toast.success("Plan created");
      }
      setPlanSaveConfirmOpen(false);
      setIsPlanModalOpen(false);
      setEditingPlanId(null);
      loadPlans();
      resetPlan({ name: "", price: 0, period: "MONTH", durationDays: undefined, description: "", icon: "Crown", color: "bg-emerald-500", popular: false, features: [], limitations: [], isActive: true });
    } catch (e: any) {
      const msg = e?.issues ? e.issues.map((i: any) => i.message).join("; ") : e?.response?.data?.message || e?.message || "Failed to save plan";
      toast.error(msg);
    }
  };
  planSubmitRef.current = handlePlanSubmit(onPlanValid);

  const openCreateOption = () => {
    setEditingOptionId(null);
    resetOption({ name: "", price: 0, deliveryTime: "", description: "", isActive: true });
    setIsDeliveryOptionModalOpen(true);
  };

  const openEditOption = (o: DeliveryOption) => {
    setEditingOptionId(o.id);
    resetOption({ name: o.name, price: o.price, deliveryTime: o.deliveryTime, description: o.description, isActive: o.isActive });
    setIsDeliveryOptionModalOpen(true);
  };

  const onOptionValid = async (raw: any) => {
    try {
      if (editingOptionId) {
        const payload = UpdateDeliveryOptionSchema.parse(raw);
        await DeliveryOptionsApi.update(editingOptionId, payload);
        toast.success("Delivery option updated");
      } else {
        const payload = CreateDeliveryOptionSchema.parse(raw);
        await DeliveryOptionsApi.create(payload);
        toast.success("Delivery option created");
      }
      setOptionSaveConfirmOpen(false);
      setIsDeliveryOptionModalOpen(false);
      setEditingOptionId(null);
      loadOptions();
      resetOption({ name: "", price: 0, deliveryTime: "", description: "", isActive: true });
    } catch (e: any) {
      const msg = e?.issues ? e.issues.map((i: any) => i.message).join("; ") : e?.response?.data?.message || e?.message || "Failed to save option";
      toast.error(msg);
    }
  };
  optionSubmitRef.current = handleOptionSubmit(onOptionValid);

  const viewRequest = (req: DeliveryRequest) => { setViewingRequest(req); setIsRequestModalOpen(true); };
  const openMembershipDetails = (m: MembershipDto) => { setSelectedMembership(m); setMembershipDetailsOpen(true); };
  const openStatusDialog = (m: MembershipDto) => { setStatusTargetId(m._id); statusForm.reset({ status: m.status as any, reason: "" }); setStatusDialogOpen(true); };
  const submitStatusUpdate = async (data: UpdateMembershipStatusFormData) => {
    if (!statusTargetId) return;
    setStatusSubmitting(true);
    try {
      const payload = UpdateMembershipStatusSchema.parse(data);
      await AdminMembershipsApi.updateStatus(statusTargetId, payload);
      toast.success("Membership status updated");
      setStatusDialogOpen(false);
      setStatusTargetId(null);
      await loadMemberships();
    } catch (e: any) {
      const msg = e?.issues ? e.issues.map((i: any) => i.message).join("; ") : e?.response?.data?.message || e?.message || "Failed to update status";
      toast.error(msg);
    } finally {
      setStatusSubmitting(false);
    }
  };

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader title="Manage Membership" subtitle="Manage membership plans and card delivery services" actionButton={{ text: "Create Plan", icon: <Plus className="size-4" />, onClick: plans.length >= 4 ? undefined : openCreatePlan }} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center"><Crown className="size-5 text-emerald-900" /></div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">{loadingPlans ? "…" : `${plans.length}/4`}</Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">MEMBERSHIP PLANS</p>
                <p className="text-2xl font-bold text-emerald-900">{loadingPlans ? "—" : plans.length}</p>
              </Card>
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center"><Truck className="size-5 text-emerald-900" /></div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">{loadingRequests ? "…" : deliveryRequests.length}</Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">TOTAL DELIVERIES</p>
                <p className="text-2xl font-bold text-emerald-900">{loadingRequests ? "—" : deliveryRequests.length}</p>
              </Card>
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center"><CheckCircle2 className="size-5 text-emerald-900" /></div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">{loadingRequests ? "…" : completedCount}</Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">COMPLETED</p>
                <p className="text-2xl font-bold text-emerald-900">{loadingRequests ? "—" : completedCount}</p>
              </Card>
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center"><Users className="size-5 text-emerald-900" /></div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">{loadingMemberships ? "…" : memberships.length}</Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">MEMBERSHIPS</p>
                <p className="text-2xl font-bold text-emerald-900">{loadingMemberships ? "—" : memberships.length}</p>
              </Card>
            </div>

            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="plans" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"><Crown className="w-4 h-4 mr-2" /> Membership Plans</TabsTrigger>
                <TabsTrigger value="delivery-options" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"><Package className="w-4 h-4 mr-2" /> Delivery Options</TabsTrigger>
                <TabsTrigger value="requests" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"><Truck className="w-4 h-4 mr-2" /> Delivery Requests</TabsTrigger>
                <TabsTrigger value="memberships" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"><Users className="w-4 h-4 mr-2" /> Memberships</TabsTrigger>
              </TabsList>

              <TabsContent value="plans" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">Membership Plans</CardTitle>
                        <CardDescription>{loadingPlans ? "Loading…" : `${plans.length} of 4 plans created`}</CardDescription>
                      </div>
                      <Button onClick={openCreatePlan} disabled={plans.length >= 4} className="bg-emerald-800 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 mr-2" /> Create Plan</Button>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {loadingPlans ? (
                      <div className="flex items-center justify-center py-16 text-zinc-500"><RefreshCw className="size-4 animate-spin mr-2" /> Loading plans…</div>
                    ) : plans.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500">No plans yet. Click “Create Plan”.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                          <Card key={plan.id} className="relative">
                            <CardHeader className="text-center pb-3">
                              <div className={`w-12 h-12 rounded-full ${plan.color || "bg-emerald-500"} flex items-center justify-center mx-auto mb-3`}><span className="text-white font-semibold text-sm">{plan.icon ?? "Crown"}</span></div>
                              <div className="flex items-center justify-center gap-2 mb-2">
                                {plan.popular && <Badge className="bg-purple-100 text-purple-800 border-purple-200">Popular</Badge>}
                                <Badge className={plan.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-zinc-100 text-zinc-700 border-zinc-200"}>{plan.isActive ? "Active" : "Inactive"}</Badge>
                              </div>
                              <CardTitle className="text-lg font-bold text-emerald-900">{plan.name}</CardTitle>
                              <CardDescription className="text-sm text-zinc-600">{plan.description}</CardDescription>
                              <div className="mt-3">
                                <span className="text-3xl font-bold text-emerald-900">{fmtCurrency(plan.price)}</span>
                                <span className="ml-1 text-sm text-zinc-500">/{plan.period.toLowerCase()}</span>
                                {plan.period === "CUSTOM" && plan.durationDays ? <span className="ml-2 text-xs text-zinc-500">({plan.durationDays} days)</span> : null}
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div>
                                <p className="text-xs font-semibold text-zinc-700 mb-1">Features</p>
                                {plan.features?.length ? (
                                  <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">{plan.features.map((f, i) => <li key={`f-${plan.id}-${i}`}>{f}</li>)}</ul>
                                ) : <p className="text-sm text-zinc-500 italic">None</p>}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-zinc-700 mb-1">Limitations</p>
                                {plan.limitations?.length ? (
                                  <ul className="list-disc list-inside text-sm text-zinc-700 space-y-1">{plan.limitations.map((l, i) => <li key={`l-${plan.id}-${i}`}>{l}</li>)}</ul>
                                ) : <p className="text-sm text-zinc-500 italic">None</p>}
                              </div>
                              <div className="flex items-center justify-between pt-3">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditPlan(plan)}><Edit className="w-4 h-4 mr-2" /> Edit Plan</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openConfirm({ kind: "plan", action: "delete", id: plan.id })} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete Plan</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="delivery-options" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-emerald-900">Delivery Options</CardTitle>
                      <CardDescription>Manage standard and express options</CardDescription>
                    </div>
                    <Button onClick={openCreateOption} className="bg-emerald-800 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4 mr-2" /> New Option</Button>
                  </CardHeader>
                  <CardContent>
                    {loadingOptions ? (
                      <div className="flex items-center justify-center py-16 text-zinc-500"><RefreshCw className="size-4 animate-spin mr-2" /> Loading delivery options…</div>
                    ) : deliveryOptions.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500">No delivery options configured.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {deliveryOptions.map((option) => (
                          <Card key={option.id} className="relative">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-lg font-bold text-emerald-900">{option.name}</CardTitle>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge className={option.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-zinc-100 text-zinc-700 border-zinc-200"}>{option.isActive ? "Active" : "Inactive"}</Badge>
                                  </div>
                                  <CardDescription className="mt-2">{option.description}</CardDescription>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEditOption(option)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openConfirm({ kind: "option", action: "delete", id: option.id })} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between"><span className="text-sm font-medium text-zinc-700">Price:</span><span className="text-lg font-bold text-emerald-900">{option.price === 0 ? "Free" : `+${fmtCurrency(option.price)}`}</span></div>
                                <div className="flex items-center justify-between"><span className="text-sm font-medium text-zinc-700">Delivery Time:</span><span className="text-sm text-zinc-600">{option.deliveryTime}</span></div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">Delivery Requests</CardTitle>
                        <CardDescription>{loadingRequests ? "Loading…" : `${deliveryRequests.length} requests found`}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-50">
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Request ID</TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">User</TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Address</TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Type</TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Status</TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Date</TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {loadingRequests ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-10 text-zinc-500"><RefreshCw className="size-4 animate-spin inline-block mr-2" /> Loading requests…</TableCell>
                            </TableRow>
                          ) : deliveryRequests.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-10 text-zinc-500">No requests found</TableCell>
                            </TableRow>
                          ) : (
                            deliveryRequests.map((r) => (
                              <TableRow key={r.id} className="hover:bg-zinc-50">
                                <TableCell><div className="font-medium text-zinc-900">{r.id}</div></TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm text-zinc-900">{r.userName}</div>
                                    <div className="text-sm text-zinc-500">{r.userEmail}</div>
                                    <div className="text-sm text-zinc-500">{r.phone}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm text-zinc-900">{r.address}</div>
                                    <div className="text-sm text-zinc-500">{r.city}, {r.state} {r.zipCode}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{getTypeBadge(r.deliveryType)}</TableCell>
                                <TableCell>{getStatusBadge(r.status)}</TableCell>
                                <TableCell><div className="text-sm text-zinc-900">{fmtDateTime(r.requestDate)}</div></TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => { setViewingRequest(r); setIsRequestModalOpen(true); }}><Eye className="h-3 w-3" /></Button>
                                    {r.status === "PENDING" && (
                                      <>
                                        <Button size="sm" variant="outline" onClick={() => openConfirm({ kind: "request", action: "status", id: r.id, payload: { status: "APPROVED" } })} className="text-green-600 hover:bg-green-50"><Check className="h-3 w-3" /></Button>
                                        <Button size="sm" variant="outline" onClick={() => openConfirm({ kind: "request", action: "status", id: r.id, payload: { status: "REJECTED" } })} className="text-red-600 hover:bg-red-50"><X className="h-3 w-3" /></Button>
                                      </>
                                    )}
                                    {r.status === "APPROVED" && (
                                      <Button size="sm" title="Completed" variant="outline" onClick={() => openConfirm({ kind: "request", action: "status", id: r.id, payload: { status: "COMPLETED" } })} className="text-blue-600 hover:bg-blue-50"><Package className="h-3 w-3" /></Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="memberships" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">Memberships</CardTitle>
                    <CardDescription>{loadingMemberships ? "Loading…" : `${memberships.length} memberships found`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingMemberships ? (
                      <div className="flex items-center justify-center py-16 text-zinc-500"><RefreshCw className="size-4 animate-spin mr-2" /> Loading memberships…</div>
                    ) : memberships.length === 0 ? (
                      <div className="text-center py-12 text-zinc-500">No memberships yet.</div>
                    ) : (
                      <div className="rounded-md border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-zinc-50">
                              <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Member</TableHead>
                              <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Email</TableHead>
                              <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Plan</TableHead>
                              <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Status</TableHead>
                              <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Auto-Renew</TableHead>
                              <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Start</TableHead>
                              <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Expires</TableHead>
                              <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {memberships.map((m) => {
                              const user = typeof m.user === "object" ? m.user : { email: String(m.user) };
                              const plan = typeof m.planId === "object" ? m.planId : { _id: String(m.planId) };
                              const fullName = `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim();
                              return (
                                <TableRow key={m._id} className="hover:bg-zinc-50">
                                  <TableCell>{fullName || (user as any).email || "—"}</TableCell>
                                  <TableCell>{(user as any).email || "—"}</TableCell>
                                  <TableCell>{(plan as any).name ?? (plan as any)._id}</TableCell>
                                  <TableCell>{membershipStatusBadge(m.status)}</TableCell>
                                  <TableCell>{m.autoRenew ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">On</Badge> : <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200">Off</Badge>}</TableCell>
                                  <TableCell>{fmtDateTime(m.startedAt)}</TableCell>
                                  <TableCell>{fmtDateTime(m.expiresAt)}</TableCell>
                                  <TableCell>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline"><MoreVertical className="w-4 h-4 mr-1" /></Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem onClick={() => openMembershipDetails(m)}><Eye className="w-4 h-4 mr-2" /> View details</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openStatusDialog(m)}><CheckCircle2 className="w-4 h-4 mr-2" /> Update status</DropdownMenuItem>
                                        {m.autoRenew && <DropdownMenuItem onClick={() => openConfirm({ kind: "membership", action: "cancelAutoRenew", id: m._id })} className="text-red-600"><CircleSlash2 className="w-4 h-4 mr-2" /> Cancel auto-renew</DropdownMenuItem>}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <Dialog open={isPlanModalOpen} onOpenChange={(open) => { setIsPlanModalOpen(open); if (!open) { setEditingPlanId(null); setPlanSaveConfirmOpen(false); resetPlan({ name: "", price: 0, period: "MONTH", durationDays: undefined, description: "", icon: "Crown", color: "bg-emerald-500", popular: false, features: [], limitations: [], isActive: true }); } }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingPlanId ? "Edit Membership Plan" : "Create New Membership Plan"}</DialogTitle>
              <DialogDescription>{editingPlanId ? "Update plan information and settings." : "Create a new membership plan."}</DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); setPlanSaveConfirmOpen(true); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-emerald-900">Plan Name *</Label>
                  <Controller name="name" control={planCtl} render={({ field }) => <Input {...field} className="h-11 bg-white border-zinc-200 focus:border-emerald-500" placeholder="Enter plan name" />} />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-emerald-900">Price ($) *</Label>
                  <Controller name="price" control={planCtl} render={({ field }) => <Input type="number" value={field.value?.toString() ?? "0"} onChange={(e) => field.onChange(Number(e.target.value))} className="h-11 bg-white border-zinc-200 focus:border-emerald-500" placeholder="0" />} />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-emerald-900">Billing Period *</Label>
                  <Controller name="period" control={planCtl} render={({ field }) => (
                    <Select value={field.value as any} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-emerald-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTH">Monthly</SelectItem>
                        <SelectItem value="YEAR">Yearly</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm font-semibold text-emerald-900">{planPeriod === "CUSTOM" ? "Duration (days) *" : "Duration (days)"}</Label>
                  <Controller name="durationDays" control={planCtl} render={({ field }) => <Input type="number" value={field.value?.toString() ?? ""} onChange={(e) => field.onChange(Number(e.target.value || 0))} className="h-11 bg-white border-zinc-200 focus:border-emerald-500" placeholder="e.g., 365" disabled={planPeriod !== "CUSTOM"} />} />
                  <p className="text-[12px] text-zinc-600">How long you want the membership to last after payment.</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-emerald-900">Icon</Label>
                  <Controller name="icon" control={planCtl} render={({ field }) => <Input {...field} className="h-11 bg-white border-zinc-200 focus:border-emerald-500" placeholder="e.g., Crown" />} />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-emerald-900">Color</Label>
                  <Controller name="color" control={planCtl} render={({ field }) => (
                    <Select value={field.value || "bg-emerald-500"} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-emerald-500"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bg-blue-500">Blue</SelectItem>
                        <SelectItem value="bg-emerald-500">Emerald</SelectItem>
                        <SelectItem value="bg-purple-500">Purple</SelectItem>
                        <SelectItem value="bg-orange-500">Orange</SelectItem>
                        <SelectItem value="bg-red-500">Red</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-emerald-900">Description</Label>
                <Controller name="description" control={planCtl} render={({ field }) => <Textarea {...field} className="min-h-[100px] bg-white border-zinc-200 focus:border-emerald-500" placeholder="Enter plan description" />} />
              </div>

              <Controller name="features" control={planCtl} render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-emerald-900">Features</Label>
                  <TagEditor value={(field.value as string[]) || []} onChange={field.onChange} placeholder="Add a feature…" />
                </div>
              )} />
              <Controller name="limitations" control={planCtl} render={({ field }) => (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-emerald-900">Limitations</Label>
                  <TagEditor value={(field.value as string[]) || []} onChange={field.onChange} placeholder="Add a limitation…" />
                </div>
              )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Controller name="popular" control={planCtl} render={({ field }) => <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />} />
                  <Label className="text-sm font-medium text-zinc-700">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Controller name="isActive" control={planCtl} render={({ field }) => <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />} />
                  <Label className="text-sm font-medium text-zinc-700">Active</Label>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsPlanModalOpen(false)} className="border-zinc-300 text-zinc-700 hover:bg-zinc-100" disabled={planSubmitting}><X className="w-4 h-4 mr-2" /> Cancel</Button>
                <Button type="submit" className="bg-emerald-800 hover:bg-emerald-700 text-white px-6" disabled={planSubmitting}><Save className={`w-4 h-4 mr-2 ${planSubmitting ? "animate-pulse" : ""}`} />{editingPlanId ? "Save Changes" : "Create Plan"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeliveryOptionModalOpen} onOpenChange={(open) => { setIsDeliveryOptionModalOpen(open); if (!open) { setEditingOptionId(null); setOptionSaveConfirmOpen(false); resetOption({ name: "", price: 0, deliveryTime: "", description: "", isActive: true }); } }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{editingOptionId ? "Edit Delivery Option" : "Create Delivery Option"}</DialogTitle>
              <DialogDescription>{editingOptionId ? "Update delivery option details." : "Add a new delivery option."}</DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); setOptionSaveConfirmOpen(true); }} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-emerald-900">Option Name *</Label>
                <Controller name="name" control={optionCtl} render={({ field }) => <Input {...field} className="bg-zinc-50 focus:border-emerald-500" />} />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-900">Price ($) *</Label>
                <Controller name="price" control={optionCtl} render={({ field }) => <Input type="number" value={field.value?.toString() ?? "0"} onChange={(e) => field.onChange(Number(e.target.value))} className="bg-zinc-50 focus:border-emerald-500" />} />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-900">Delivery Time *</Label>
                <Controller name="deliveryTime" control={optionCtl} render={({ field }) => <Input {...field} className="bg-zinc-50 focus:border-emerald-500" placeholder="e.g., 5–7 business days" />} />
              </div>
              <div className="space-y-2">
                <Label className="text-emerald-900">Description</Label>
                <Controller name="description" control={optionCtl} render={({ field }) => <Textarea {...field} className="bg-zinc-50 focus:border-emerald-500" />} />
              </div>
              <div className="flex items-center space-x-3">
                <Controller name="isActive" control={optionCtl} render={({ field }) => <input type="checkbox" checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500" />} />
                <Label className="text-sm font-medium text-zinc-700">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDeliveryOptionModalOpen(false)} className="border-zinc-300 text-zinc-700 hover:bg-zinc-100" disabled={optionSubmitting}><X className="w-4 h-4 mr-2" /> Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={optionSubmitting}><Save className={`w-4 h-4 mr-2 ${optionSubmitting ? "animate-pulse" : ""}`} />{editingOptionId ? "Save Changes" : "Create Option"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isRequestModalOpen} onOpenChange={(open) => { setIsRequestModalOpen(open); if (!open) setViewingRequest(null); }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Delivery Request Details</DialogTitle>
              <DialogDescription>Request ID: {viewingRequest?.id}</DialogDescription>
            </DialogHeader>
            {viewingRequest && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">User</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><strong>Name:</strong> {viewingRequest.userName}</p>
                    <p className="text-sm"><strong>Email:</strong> {viewingRequest.userEmail}</p>
                    <p className="text-sm"><strong>Phone:</strong> {viewingRequest.phone}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Delivery</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><strong>Type:</strong> {viewingRequest.deliveryType === "express" ? <Badge className="bg-orange-100 text-orange-800 border-orange-200">Express</Badge> : <Badge className="bg-gray-100 text-gray-800 border-gray-200">Standard</Badge>}</p>
                    <p className="text-sm"><strong>Status:</strong> {getStatusBadge(viewingRequest.status)}</p>
                    <p className="text-sm"><strong>Date:</strong> {fmtDateTime(viewingRequest.requestDate)}</p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader><CardTitle className="text-lg">Address</CardTitle></CardHeader>
                  <CardContent className="space-y-1">
                    <p className="text-sm">{viewingRequest.address}</p>
                    <p className="text-sm">{viewingRequest.city}, {viewingRequest.state} {viewingRequest.zipCode}</p>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestModalOpen(false)} className="border-zinc-300 text-zinc-700 hover:bg-zinc-100">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={membershipDetailsOpen} onOpenChange={(o) => { setMembershipDetailsOpen(o); if (!o) setSelectedMembership(null); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Membership Details</DialogTitle>
              <DialogDescription>{selectedMembership?._id}</DialogDescription>
            </DialogHeader>
            {selectedMembership && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Member</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><strong>Name:</strong> {`${(selectedMembership.user as any)?.firstName ?? ""} ${(selectedMembership.user as any)?.lastName ?? ""}`.trim() || (selectedMembership.user as any)?.email || "—"}</p>
                    <p className="text-sm"><strong>Email:</strong> {(selectedMembership.user as any)?.email || "—"}</p>
                    <p className="text-sm"><strong>User ID:</strong> {(selectedMembership.user as any)?._id || (typeof selectedMembership.user === "string" ? selectedMembership.user : "—")}</p>
                    <p className="text-sm"><strong>Status:</strong> {membershipStatusBadge(selectedMembership.status)}</p>
                    <p className="text-sm"><strong>Auto-Renew:</strong> {selectedMembership.autoRenew ? "On" : "Off"}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Timeline</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm"><strong>Started:</strong> {fmtDateTime(selectedMembership.startedAt)}</p>
                    <p className="text-sm"><strong>Expires:</strong> {fmtDateTime(selectedMembership.expiresAt)}</p>
                    <p className="text-sm"><strong>Created:</strong> {fmtDateTime(selectedMembership.createdAt)}</p>
                    <p className="text-sm"><strong>Updated:</strong> {fmtDateTime(selectedMembership.updatedAt)}</p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader><CardTitle className="text-lg">Plan</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><p className="text-sm"><strong>Name:</strong> {(selectedMembership as any).planSnapshot?.name || (typeof selectedMembership.planId === "object" && (selectedMembership.planId as any)?.name) || (typeof selectedMembership.planId === "string" ? selectedMembership.planId : "—")}</p></div>
                      <div><p className="text-sm"><strong>Price:</strong> {fmtCurrency((selectedMembership as any).planSnapshot?.price ?? 0)}</p></div>
                      <div><p className="text-sm"><strong>Period:</strong> {(selectedMembership as any).planSnapshot?.period || "—"}</p></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><p className="text-sm"><strong>Duration Days:</strong> {(selectedMembership as any).planSnapshot?.durationDays ?? "—"}</p></div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold">Features</p>
                        {((selectedMembership as any).planSnapshot?.features || []).length ? (
                          <ul className="list-disc list-inside text-sm">{((selectedMembership as any).planSnapshot?.features || []).map((f: string, i: number) => <li key={`psf-${i}`}>{f}</li>)}</ul>
                        ) : <p className="text-sm text-zinc-500">—</p>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Limitations</p>
                      {((selectedMembership as any).planSnapshot?.limitations || []).length ? (
                        <ul className="list-disc list-inside text-sm">{((selectedMembership as any).planSnapshot?.limitations || []).map((l: string, i: number) => <li key={`psl-${i}`}>{l}</li>)}</ul>
                      ) : <p className="text-sm text-zinc-500">—</p>}
                    </div>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader><CardTitle className="text-lg">Payment</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><p className="text-sm"><strong>Amount:</strong> {fmtCurrency((selectedMembership as any).payment?.amount ?? (selectedMembership as any).planSnapshot?.price ?? 0)}</p></div>
                    <div><p className="text-sm"><strong>Method:</strong> {(selectedMembership as any).payment?.paymentMethod?.type || "—"}</p></div>
                    <div className="md:col-span-3">
                      <p className="text-sm font-semibold mb-2">Proof of Payment</p>
                      {(selectedMembership as any).proofOfPayment ? (
                        <a href={(selectedMembership as any).proofOfPayment} target="_blank" className="inline-block"><img src={(selectedMembership as any).proofOfPayment} alt="Proof of payment" className="max-h-56 rounded-lg border" /></a>
                      ) : (
                        <p className="text-sm text-zinc-500">—</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setMembershipDetailsOpen(false)} className="border-zinc-300 text-zinc-700 hover:bg-zinc-100">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={statusDialogOpen} onOpenChange={(o) => { setStatusDialogOpen(o); if (!o) { setStatusTargetId(null); statusForm.reset({ status: "PENDING", reason: "" } as any); } }}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Update Membership Status</DialogTitle>
              <DialogDescription>Select a new status and optionally provide a reason.</DialogDescription>
            </DialogHeader>
            <form onSubmit={statusForm.handleSubmit(submitStatusUpdate)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-emerald-900">Status</Label>
                <Controller name="status" control={statusForm.control} render={({ field }) => (
                  <Select value={field.value as any} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-emerald-500"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="SUSPENDED">SUSPENDED</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                      <SelectItem value="EXPIRED">EXPIRED</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-emerald-900">Reason (optional)</Label>
                <Controller name="reason" control={statusForm.control} render={({ field }) => <Textarea {...field} maxLength={500} className="min-h-[100px] bg-white border-zinc-200 focus:border-emerald-500" placeholder="Add an internal note (max 500 chars)" />} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)} className="border-zinc-300 text-zinc-700 hover:bg-zinc-100" disabled={statusSubmitting}><X className="w-4 h-4 mr-2" /> Cancel</Button>
                <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 text-white" disabled={statusSubmitting || !statusTargetId}><Save className={`w-4 h-4 mr-2 ${statusSubmitting ? "animate-pulse" : ""}`} /> Update Status</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Please Confirm" description="Are you sure you want to proceed?" confirmText="Confirm" confirmVariant="destructive" confirming={confirming} onConfirm={doConfirm} tone="danger" />
        <ConfirmDialog open={planSaveConfirmOpen} onOpenChange={setPlanSaveConfirmOpen} title={editingPlanId ? "Confirm Update" : "Create Plan"} description={editingPlanId ? "Save these changes to the membership plan?" : "Create this new membership plan?"} confirmText={editingPlanId ? "Save Changes" : "Create Plan"} confirmVariant="default" confirming={planSubmitting} onConfirm={() => { setPlanSaveConfirmOpen(false); planSubmitRef.current?.(); }} icon={<Save className="size-4" />} />
        <ConfirmDialog open={optionSaveConfirmOpen} onOpenChange={setOptionSaveConfirmOpen} title={editingOptionId ? "Confirm Update" : "Create Delivery Option"} description={editingOptionId ? "Save these changes to the delivery option?" : "Create this new delivery option?"} confirmText={editingOptionId ? "Save Changes" : "Create Option"} confirmVariant="default" confirming={optionSubmitting} onConfirm={() => { setOptionSaveConfirmOpen(false); optionSubmitRef.current?.(); }} icon={<Save className="size-4" />} />
      </SidebarInset>
    </SidebarProvider>
  );
}

function TagEditor({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [text, setText] = useState("");
  const add = () => {
    const t = text.trim();
    if (!t) return;
    onChange([...(value || []), t]);
    setText("");
  };
  const remove = (i: number) => onChange((value || []).filter((_, idx) => idx !== i));
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="flex-1 bg-white border-zinc-200 focus:border-emerald-500" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" onClick={add} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {(value || []).map((t, i) => (
          <div key={`${t}-${i}`} className="flex items-center justify-between bg-zinc-50 p-2 rounded-md">
            <span className="text-sm text-zinc-700 flex-1">{t}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"><X className="w-3 h-3" /></Button>
          </div>
        ))}
        {(!value || value.length === 0) && <p className="text-sm text-zinc-500 italic">None yet</p>}
      </div>
    </div>
  );
}

function getTypeBadge(t: "standard" | "express") {
  return t === "express" ? <Badge className="bg-orange-100 text-orange-800 border-orange-200">Express</Badge> : <Badge className="bg-gray-100 text-gray-800 border-gray-200">Standard</Badge>;
}
