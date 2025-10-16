"use client";

import { useState, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Crown,
  Star,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Clock,
  MoreVertical,
  Save,
  X,
  Check,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCw,
} from "lucide-react";

// Interfaces
interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  limitations: string[];
  popular: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryOption {
  id: string;
  type: "standard" | "express";
  name: string;
  price: number;
  deliveryTime: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryRequest {
  id: string;
  userId: number;
  userName: string;
  userEmail: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryType: "standard" | "express";
  specialInstructions: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  trackingNumber?: string;
}

// Sample data
const initialPlans: MembershipPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    period: "month",
    description: "Perfect for getting started with celebrity bookings",
    icon: "Users",
    color: "bg-blue-500",
    features: [
      "Up to 2 celebrity bookings per month",
      "Basic event support",
      "Standard customer service",
      "Access to celebrity directory",
      "Basic event planning tools",
    ],
    limitations: [
      "No priority booking",
      "Limited celebrity selection",
      "Standard response time",
    ],
    popular: false,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    period: "month",
    description: "Most popular choice for regular event organizers",
    icon: "Star",
    color: "bg-emerald-500",
    features: [
      "Up to 10 celebrity bookings per month",
      "Priority booking access",
      "Premium customer support",
      "Access to exclusive celebrities",
      "Advanced event planning tools",
      "Custom event packages",
      "Dedicated account manager",
    ],
    limitations: ["Limited to 10 bookings monthly", "Standard delivery time"],
    popular: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "vip",
    name: "VIP",
    price: 199,
    period: "month",
    description: "Ultimate experience for high-end events and exclusive access",
    icon: "Crown",
    color: "bg-purple-500",
    features: [
      "Unlimited celebrity bookings",
      "VIP priority booking (24/7)",
      "White-glove concierge service",
      "Access to A-list celebrities",
      "Premium event planning suite",
      "Custom event packages",
      "Dedicated VIP account manager",
      "Exclusive event invitations",
      "Complimentary event consultation",
      "Priority customer support",
    ],
    limitations: [],
    popular: false,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

const initialDeliveryOptions: DeliveryOption[] = [
  {
    id: "standard",
    type: "standard",
    name: "Standard Delivery",
    price: 0,
    deliveryTime: "5-7 business days",
    description: "Free standard delivery within 5-7 business days",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "express",
    type: "express",
    name: "Express Delivery",
    price: 15,
    deliveryTime: "2-3 business days",
    description: "Fast express delivery within 2-3 business days",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

const initialDeliveryRequests: DeliveryRequest[] = [
  {
    id: "DR-001",
    userId: 1,
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    fullName: "John Doe",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, Apt 4B",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    deliveryType: "express",
    specialInstructions: "Please deliver after 5 PM",
    status: "pending",
    requestDate: "2024-01-20T10:30:00Z",
  },
  {
    id: "DR-002",
    userId: 2,
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@example.com",
    fullName: "Sarah Johnson",
    phone: "+1 (555) 234-5678",
    address: "456 Oak Avenue",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    deliveryType: "standard",
    specialInstructions: "",
    status: "approved",
    requestDate: "2024-01-19T14:15:00Z",
    processedDate: "2024-01-19T16:30:00Z",
    processedBy: "Admin User",
  },
  {
    id: "DR-003",
    userId: 3,
    userName: "Mike Chen",
    userEmail: "mike.chen@example.com",
    fullName: "Mike Chen",
    phone: "+1 (555) 345-6789",
    address: "789 Pine Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    deliveryType: "express",
    specialInstructions: "Leave with doorman if no answer",
    status: "completed",
    requestDate: "2024-01-18T09:45:00Z",
    processedDate: "2024-01-18T11:20:00Z",
    processedBy: "Admin User",
    trackingNumber: "TRK123456789",
  },
  {
    id: "DR-004",
    userId: 4,
    userName: "Emma Wilson",
    userEmail: "emma.wilson@example.com",
    fullName: "Emma Wilson",
    phone: "+1 (555) 456-7890",
    address: "321 Elm Street",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    deliveryType: "standard",
    specialInstructions: "",
    status: "rejected",
    requestDate: "2024-01-17T13:20:00Z",
    processedDate: "2024-01-17T15:45:00Z",
    processedBy: "Admin User",
  },
  {
    id: "DR-005",
    userId: 5,
    userName: "David Brown",
    userEmail: "david.brown@example.com",
    fullName: "David Brown",
    phone: "+1 (555) 567-8901",
    address: "654 Maple Drive",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    deliveryType: "express",
    specialInstructions: "Call before delivery",
    status: "pending",
    requestDate: "2024-01-16T16:10:00Z",
  },
];

export default function ManageMembershipPage() {
  // State management
  const [plans, setPlans] = useState<MembershipPlan[]>(initialPlans);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(
    initialDeliveryOptions
  );
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>(
    initialDeliveryRequests
  );

  // Modal states
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isDeliveryOptionModalOpen, setIsDeliveryOptionModalOpen] =
    useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [editingDeliveryOption, setEditingDeliveryOption] =
    useState<DeliveryOption | null>(null);
  const [viewingRequest, setViewingRequest] = useState<DeliveryRequest | null>(
    null
  );

  // Form states
  const [planForm, setPlanForm] = useState<Partial<MembershipPlan>>({});
  const [deliveryOptionForm, setDeliveryOptionForm] = useState<
    Partial<DeliveryOption>
  >({});
  const [newFeature, setNewFeature] = useState("");
  const [newLimitation, setNewLimitation] = useState("");

  // Filter states
  const [requestStatusFilter, setRequestStatusFilter] = useState("all");
  const [requestSearchTerm, setRequestSearchTerm] = useState("");

  // Filter delivery requests
  const filteredRequests = deliveryRequests.filter((request) => {
    const matchesStatus =
      requestStatusFilter === "all" || request.status === requestStatusFilter;
    const matchesSearch =
      request.fullName
        .toLowerCase()
        .includes(requestSearchTerm.toLowerCase()) ||
      request.userEmail
        .toLowerCase()
        .includes(requestSearchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(requestSearchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  // Helper functions
  const getStatusBadge = (status: DeliveryRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Completed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDeliveryTypeBadge = (type: "standard" | "express") => {
    switch (type) {
      case "standard":
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Standard
          </Badge>
        );
      case "express":
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            Express
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Plan operations
  const handleCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: "",
      price: 0,
      period: "month",
      description: "",
      icon: "Users",
      color: "bg-blue-500",
      features: [],
      limitations: [],
      popular: false,
    });
    setIsPlanModalOpen(true);
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setPlanForm(plan);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = () => {
    if (editingPlan) {
      // Update existing plan
      setPlans(
        plans.map((p) =>
          p.id === editingPlan.id
            ? ({
                ...p,
                ...planForm,
                updatedAt: new Date().toISOString(),
              } as MembershipPlan)
            : p
        )
      );
    } else {
      // Create new plan
      const newPlan: MembershipPlan = {
        id: `plan-${Date.now()}`,
        name: planForm.name || "",
        price: planForm.price || 0,
        period: planForm.period || "month",
        description: planForm.description || "",
        icon: planForm.icon || "Users",
        color: planForm.color || "bg-blue-500",
        features: planForm.features || [],
        limitations: planForm.limitations || [],
        popular: planForm.popular || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPlans([...plans, newPlan]);
    }
    setIsPlanModalOpen(false);
    setPlanForm({});
    setEditingPlan(null);
    setNewFeature("");
    setNewLimitation("");
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(plans.filter((p) => p.id !== planId));
  };

  // Feature and limitation management
  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const currentFeatures = planForm.features || [];
      setPlanForm({
        ...planForm,
        features: [...currentFeatures, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const currentFeatures = planForm.features || [];
    setPlanForm({
      ...planForm,
      features: currentFeatures.filter((_, i) => i !== index),
    });
  };

  const handleAddLimitation = () => {
    if (newLimitation.trim()) {
      const currentLimitations = planForm.limitations || [];
      setPlanForm({
        ...planForm,
        limitations: [...currentLimitations, newLimitation.trim()],
      });
      setNewLimitation("");
    }
  };

  const handleRemoveLimitation = (index: number) => {
    const currentLimitations = planForm.limitations || [];
    setPlanForm({
      ...planForm,
      limitations: currentLimitations.filter((_, i) => i !== index),
    });
  };

  // Delivery option operations
  const handleEditDeliveryOption = (option: DeliveryOption) => {
    setEditingDeliveryOption(option);
    setDeliveryOptionForm(option);
    setIsDeliveryOptionModalOpen(true);
  };

  const handleSaveDeliveryOption = () => {
    if (editingDeliveryOption) {
      setDeliveryOptions(
        deliveryOptions.map((opt) =>
          opt.id === editingDeliveryOption.id
            ? ({
                ...opt,
                ...deliveryOptionForm,
                updatedAt: new Date().toISOString(),
              } as DeliveryOption)
            : opt
        )
      );
    }
    setIsDeliveryOptionModalOpen(false);
    setDeliveryOptionForm({});
    setEditingDeliveryOption(null);
  };

  // Request operations
  const handleViewRequest = (request: DeliveryRequest) => {
    setViewingRequest(request);
    setIsRequestModalOpen(true);
  };

  const handleUpdateRequestStatus = (
    requestId: string,
    status: DeliveryRequest["status"]
  ) => {
    setDeliveryRequests(
      deliveryRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status,
              processedDate: new Date().toISOString(),
              processedBy: "Admin User",
            }
          : req
      )
    );
  };

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Manage Membership"
              subtitle="Manage membership plans and card delivery services"
              actionButton={{
                text: "Create Plan",
                icon: <Plus className="size-4" />,
                onClick: plans.length >= 4 ? undefined : handleCreatePlan,
              }}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Crown className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {plans.length}/4
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  MEMBERSHIP PLANS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {plans.length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Clock className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {
                      deliveryRequests.filter((r) => r.status === "pending")
                        .length
                    }
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  PENDING REQUESTS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {
                    deliveryRequests.filter((r) => r.status === "pending")
                      .length
                  }
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Truck className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {deliveryRequests.length}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  TOTAL DELIVERIES
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {deliveryRequests.length}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {
                      deliveryRequests.filter((r) => r.status === "completed")
                        .length
                    }
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  COMPLETED
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {
                    deliveryRequests.filter((r) => r.status === "completed")
                      .length
                  }
                </p>
              </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="plans" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger
                  value="plans"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Membership Plans
                </TabsTrigger>
                <TabsTrigger
                  value="delivery-options"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Delivery Options
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Delivery Requests
                </TabsTrigger>
              </TabsList>

              {/* Membership Plans Tab */}
              <TabsContent value="plans" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">
                          Membership Plans
                        </CardTitle>
                        <CardDescription>
                          {plans.length} of 4 plans created
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handleCreatePlan}
                        disabled={plans.length >= 4}
                        className="bg-emerald-800 hover:bg-emerald-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Plan
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {plans.map((plan) => (
                        <Card key={plan.id} className="relative">
                          <CardHeader className="text-center pb-3">
                            <div
                              className={`w-12 h-12 rounded-full ${plan.color} flex items-center justify-center mx-auto mb-3`}
                            >
                              {plan.icon === "Users" && (
                                <Users className="w-6 h-6 text-white" />
                              )}
                              {plan.icon === "Star" && (
                                <Star className="w-6 h-6 text-white" />
                              )}
                              {plan.icon === "Crown" && (
                                <Crown className="w-6 h-6 text-white" />
                              )}
                            </div>
                            <CardTitle className="text-lg font-bold text-emerald-900">
                              {plan.name}
                            </CardTitle>
                            <CardDescription className="text-sm text-zinc-600">
                              {plan.description}
                            </CardDescription>
                            <div className="mt-3">
                              <span className="text-3xl font-bold text-emerald-900">
                                ${plan.price}
                              </span>
                              <span className="ml-1 text-sm text-zinc-500">
                                /{plan.period}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <h4 className="font-medium flex items-center gap-2 text-sm text-emerald-900">
                                <CheckCircle2 className="w-3 h-3 text-emerald-900" />
                                Features ({plan.features.length})
                              </h4>
                              <ul className="space-y-1">
                                {plan.features
                                  .slice(0, 3)
                                  .map((feature, index) => (
                                    <li
                                      key={index}
                                      className="flex items-start gap-2 text-xs text-zinc-700"
                                    >
                                      <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-900" />
                                      {feature}
                                    </li>
                                  ))}
                                {plan.features.length > 3 && (
                                  <li className="text-xs text-zinc-500">
                                    +{plan.features.length - 3} more features
                                  </li>
                                )}
                              </ul>
                            </div>
                            <div className="flex items-center justify-between pt-3">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleEditPlan(plan)}
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Plan
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeletePlan(plan.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Plan
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Delivery Options Tab */}
              <TabsContent value="delivery-options" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">
                      Delivery Options
                    </CardTitle>
                    <CardDescription>
                      Manage standard and express delivery options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {deliveryOptions.map((option) => (
                        <Card key={option.id} className="relative">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg font-bold text-emerald-900">
                                  {option.name}
                                </CardTitle>
                                <CardDescription>
                                  {option.description}
                                </CardDescription>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDeliveryOption(option)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-700">
                                  Price:
                                </span>
                                <span className="text-lg font-bold text-emerald-900">
                                  {option.price === 0
                                    ? "Free"
                                    : `+${formatCurrency(option.price)}`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-700">
                                  Delivery Time:
                                </span>
                                <span className="text-sm text-zinc-600">
                                  {option.deliveryTime}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Delivery Requests Tab */}
              <TabsContent value="requests" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">
                          Delivery Requests
                        </CardTitle>
                        <CardDescription>
                          {filteredRequests.length} requests found
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                        <Input
                          placeholder="Search requests..."
                          value={requestSearchTerm}
                          onChange={(e) => setRequestSearchTerm(e.target.value)}
                          className="pl-10 bg-zinc-50 focus:border-emerald-500"
                        />
                      </div>
                      <Select
                        value={requestStatusFilter}
                        onValueChange={setRequestStatusFilter}
                      >
                        <SelectTrigger className="w-full sm:w-40 bg-zinc-50 focus:border-emerald-500">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Requests Table */}
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-zinc-50">
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                              Request ID
                            </TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                              User Info
                            </TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                              Delivery Address
                            </TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                              Type
                            </TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                              Status
                            </TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                              Request Date
                            </TableHead>
                            <TableHead className="text-emerald-900 font-semibold text-xs sm:text-sm">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredRequests.map((request) => (
                            <TableRow
                              key={request.id}
                              className="hover:bg-zinc-50"
                            >
                              <TableCell>
                                <div className="font-medium text-zinc-900">
                                  {request.id}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm text-zinc-900">
                                    {request.fullName}
                                  </div>
                                  <div className="text-sm text-zinc-500">
                                    {request.userEmail}
                                  </div>
                                  <div className="text-sm text-zinc-500">
                                    {request.phone}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="text-sm text-zinc-900">
                                    {request.address}
                                  </div>
                                  <div className="text-sm text-zinc-500">
                                    {request.city}, {request.state}{" "}
                                    {request.zipCode}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getDeliveryTypeBadge(request.deliveryType)}
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(request.status)}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-zinc-900">
                                  {formatDate(request.requestDate)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewRequest(request)}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  {request.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleUpdateRequestStatus(
                                            request.id,
                                            "approved"
                                          )
                                        }
                                        className="text-green-600 hover:bg-green-50"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleUpdateRequestStatus(
                                            request.id,
                                            "rejected"
                                          )
                                        }
                                        className="text-red-600 hover:bg-red-50"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                  {request.status === "approved" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleUpdateRequestStatus(
                                          request.id,
                                          "completed"
                                        )
                                      }
                                      className="text-blue-600 hover:bg-blue-50"
                                    >
                                      <Package className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredRequests.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-zinc-500 mb-2">
                          No requests found
                        </div>
                        <div className="text-sm text-zinc-400">
                          Try adjusting your filters or search terms
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Plan Modal */}
        <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
          <DialogContent className="w-[90vw] max-w-4xl h-[90vh] overflow-hidden p-0">
            <div className="flex flex-col h-full">
              <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 px-6 py-4 text-white">
                <DialogTitle className="text-xl font-bold">
                  {editingPlan
                    ? "Edit Membership Plan"
                    : "Create New Membership Plan"}
                </DialogTitle>
                <DialogDescription className="text-emerald-100 mt-1">
                  {editingPlan
                    ? "Update plan information and settings"
                    : "Create a new membership plan"}
                </DialogDescription>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-emerald-900"
                      >
                        Plan Name *
                      </Label>
                      <Input
                        id="name"
                        value={planForm.name || ""}
                        onChange={(e) =>
                          setPlanForm({ ...planForm, name: e.target.value })
                        }
                        className="h-11 bg-white border-zinc-200 focus:border-emerald-500"
                        placeholder="Enter plan name"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="price"
                        className="text-sm font-semibold text-emerald-900"
                      >
                        Price ($) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={planForm.price || 0}
                        onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            price: Number(e.target.value),
                          })
                        }
                        className="h-11 bg-white border-zinc-200 focus:border-emerald-500"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="period"
                        className="text-sm font-semibold text-emerald-900"
                      >
                        Billing Period *
                      </Label>
                      <Select
                        value={planForm.period || "month"}
                        onValueChange={(value) =>
                          setPlanForm({ ...planForm, period: value })
                        }
                      >
                        <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="month">Monthly</SelectItem>
                          <SelectItem value="year">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="color"
                        className="text-sm font-semibold text-emerald-900"
                      >
                        Plan Color *
                      </Label>
                      <Select
                        value={planForm.color || "bg-blue-500"}
                        onValueChange={(value) =>
                          setPlanForm({ ...planForm, color: value })
                        }
                      >
                        <SelectTrigger className="h-11 bg-white border-zinc-200 focus:border-emerald-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bg-blue-500">Blue</SelectItem>
                          <SelectItem value="bg-emerald-500">
                            Emerald
                          </SelectItem>
                          <SelectItem value="bg-purple-500">Purple</SelectItem>
                          <SelectItem value="bg-orange-500">Orange</SelectItem>
                          <SelectItem value="bg-red-500">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-emerald-900"
                    >
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={planForm.description || ""}
                      onChange={(e) =>
                        setPlanForm({
                          ...planForm,
                          description: e.target.value,
                        })
                      }
                      className="min-h-[100px] bg-white border-zinc-200 focus:border-emerald-500"
                      placeholder="Enter plan description"
                    />
                  </div>

                  {/* Features Management */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-emerald-900">
                      Features
                    </Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add a new feature..."
                          className="flex-1 bg-white border-zinc-200 focus:border-emerald-500"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddFeature}
                          disabled={!newFeature.trim()}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {(planForm.features || []).map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-zinc-50 p-2 rounded-md"
                          >
                            <span className="text-sm text-zinc-700 flex-1">
                              {feature}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFeature(index)}
                              className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        {(!planForm.features ||
                          planForm.features.length === 0) && (
                          <p className="text-sm text-zinc-500 italic">
                            No features added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Limitations Management */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-emerald-900">
                      Limitations
                    </Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newLimitation}
                          onChange={(e) => setNewLimitation(e.target.value)}
                          placeholder="Add a new limitation..."
                          className="flex-1 bg-white border-zinc-200 focus:border-emerald-500"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddLimitation();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddLimitation}
                          disabled={!newLimitation.trim()}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {(planForm.limitations || []).map(
                          (limitation, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-zinc-50 p-2 rounded-md"
                            >
                              <span className="text-sm text-zinc-700 flex-1">
                                {limitation}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveLimitation(index)}
                                className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )
                        )}
                        {(!planForm.limitations ||
                          planForm.limitations.length === 0) && (
                          <p className="text-sm text-zinc-500 italic">
                            No limitations added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="popular"
                      checked={planForm.popular || false}
                      onChange={(e) =>
                        setPlanForm({ ...planForm, popular: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Label
                      htmlFor="popular"
                      className="text-sm font-medium text-zinc-700"
                    >
                      Mark as Popular Plan
                    </Label>
                  </div>
                </div>
              </div>
              <div className="border-t bg-zinc-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-600">
                    {editingPlan
                      ? "Updating membership plan"
                      : "Creating new membership plan"}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsPlanModalOpen(false);
                        setNewFeature("");
                        setNewLimitation("");
                      }}
                      className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSavePlan}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white px-6"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editingPlan ? "Update Plan" : "Create Plan"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delivery Option Modal */}
        <Dialog
          open={isDeliveryOptionModalOpen}
          onOpenChange={setIsDeliveryOptionModalOpen}
        >
          <DialogContent className="w-[90vw] max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-emerald-900">
                Edit Delivery Option
              </DialogTitle>
              <DialogDescription>
                Update delivery option details for {editingDeliveryOption?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="optionName" className="text-emerald-900">
                  Option Name
                </Label>
                <Input
                  id="optionName"
                  value={deliveryOptionForm.name || ""}
                  onChange={(e) =>
                    setDeliveryOptionForm({
                      ...deliveryOptionForm,
                      name: e.target.value,
                    })
                  }
                  className="bg-zinc-50 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionPrice" className="text-emerald-900">
                  Price ($)
                </Label>
                <Input
                  id="optionPrice"
                  type="number"
                  value={deliveryOptionForm.price || 0}
                  onChange={(e) =>
                    setDeliveryOptionForm({
                      ...deliveryOptionForm,
                      price: Number(e.target.value),
                    })
                  }
                  className="bg-zinc-50 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTime" className="text-emerald-900">
                  Delivery Time
                </Label>
                <Input
                  id="deliveryTime"
                  value={deliveryOptionForm.deliveryTime || ""}
                  onChange={(e) =>
                    setDeliveryOptionForm({
                      ...deliveryOptionForm,
                      deliveryTime: e.target.value,
                    })
                  }
                  className="bg-zinc-50 focus:border-emerald-500"
                  placeholder="e.g., 5-7 business days"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="optionDescription" className="text-emerald-900">
                  Description
                </Label>
                <Textarea
                  id="optionDescription"
                  value={deliveryOptionForm.description || ""}
                  onChange={(e) =>
                    setDeliveryOptionForm({
                      ...deliveryOptionForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-zinc-50 focus:border-emerald-500"
                  placeholder="Enter option description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeliveryOptionModalOpen(false)}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveDeliveryOption}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Details Modal */}
        <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
          <DialogContent className="w-[90vw] max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-emerald-900">
                Delivery Request Details
              </DialogTitle>
              <DialogDescription>
                Request ID: {viewingRequest?.id}
              </DialogDescription>
            </DialogHeader>
            {viewingRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Full Name
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {viewingRequest.fullName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Email
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {viewingRequest.userEmail}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Phone
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {viewingRequest.phone}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Delivery Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Delivery Type
                        </Label>
                        <div className="mt-1">
                          {getDeliveryTypeBadge(viewingRequest.deliveryType)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Status
                        </Label>
                        <div className="mt-1">
                          {getStatusBadge(viewingRequest.status)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Request Date
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {formatDate(viewingRequest.requestDate)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-zinc-900">
                        {viewingRequest.address}
                      </p>
                      <p className="text-sm text-zinc-900">
                        {viewingRequest.city}, {viewingRequest.state}{" "}
                        {viewingRequest.zipCode}
                      </p>
                      {viewingRequest.specialInstructions && (
                        <div className="mt-3">
                          <Label className="text-sm font-medium text-zinc-700">
                            Special Instructions
                          </Label>
                          <p className="text-sm text-zinc-900 mt-1">
                            {viewingRequest.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                {viewingRequest.status !== "pending" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Processing Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Processed Date
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {viewingRequest.processedDate
                            ? formatDate(viewingRequest.processedDate)
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-zinc-700">
                          Processed By
                        </Label>
                        <p className="text-sm text-zinc-900">
                          {viewingRequest.processedBy || "N/A"}
                        </p>
                      </div>
                      {viewingRequest.trackingNumber && (
                        <div>
                          <Label className="text-sm font-medium text-zinc-700">
                            Tracking Number
                          </Label>
                          <p className="text-sm text-zinc-900">
                            {viewingRequest.trackingNumber}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRequestModalOpen(false)}
                className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              >
                Close
              </Button>
              {viewingRequest?.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleUpdateRequestStatus(viewingRequest.id, "rejected");
                      setIsRequestModalOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleUpdateRequestStatus(viewingRequest.id, "approved");
                      setIsRequestModalOpen(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
