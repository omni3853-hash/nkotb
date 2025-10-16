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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  Server,
  Clock,
  Database,
  Globe,
  Users,
  CreditCard,
  Shield,
  AlertTriangle,
  Check,
  X,
  Eye,
  EyeOff,
  Bell,
  Mail,
  Smartphone,
  Lock,
  Key,
  Zap,
  HardDrive,
  FileText,
  TrendingUp,
  RefreshCw,
  User,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";

// Settings interfaces
interface GeneralSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  adminEmail: string;
  supportEmail: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  timezone: string;
  dateFormat: string;
  currency: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: "traditional" | "crypto" | "mobile_money";
  enabled: boolean;
  details: {
    accountNumber?: string;
    walletAddress?: string;
    phoneNumber?: string;
    email?: string;
    bankName?: string;
    currency?: string;
    network?: string;
    provider?: string;
  };
  fees?: {
    percentage?: number;
    fixed?: number;
  };
  description?: string;
  icon?: string;
}

interface PlatformSettings {
  defaultMembership: string;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  bookingFeePercentage: number;
  cancellationPolicy: string;
  refundPolicy: string;
  paymentMethods: PaymentMethod[];
  minimumDepositAmount: number;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  pushNotificationsEnabled: boolean;
}

interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  apiEnabled: boolean;
  apiRateLimit: number;
  webhookUrl: string;
  autoBackupEnabled: boolean;
  backupFrequency: string;
  lastBackupDate: string;
  logLevel: string;
  logRetentionDays: number;
}

interface AdminLoginSettings {
  currentUsername: string;
  newUsername: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  lastLoginDate: string;
  loginAttempts: number;
  accountLocked: boolean;
}

// Sample data
const initialGeneralSettings: GeneralSettings = {
  siteName: "CelBookings",
  siteTagline: "Book Celebrities for Your Events",
  siteDescription:
    "The premier platform for booking celebrities and organizing exclusive events.",
  adminEmail: "admin@celbookings.com",
  supportEmail: "support@celbookings.com",
  phone: "+1 (555) 123-4567",
  address: "123 Hollywood Blvd, Los Angeles, CA 90210",
  socialMedia: {
    facebook: "https://facebook.com/celbookings",
    twitter: "https://twitter.com/celbookings",
    instagram: "https://instagram.com/celbookings",
    linkedin: "https://linkedin.com/company/celbookings",
  },
  timezone: "America/Los_Angeles",
  dateFormat: "MM/DD/YYYY",
  currency: "USD",
  maintenanceMode: false,
  maintenanceMessage:
    "We're currently performing scheduled maintenance. We'll be back shortly!",
};

const initialPlatformSettings: PlatformSettings = {
  defaultMembership: "Basic",
  registrationEnabled: true,
  emailVerificationRequired: true,
  bookingFeePercentage: 5.0,
  cancellationPolicy:
    "Cancellations must be made 48 hours in advance for full refund.",
  refundPolicy: "Refunds are processed within 5-7 business days.",
  paymentMethods: [
    {
      id: "credit-card",
      name: "Credit Card",
      type: "traditional",
      enabled: true,
      details: {
        provider: "Stripe",
        currency: "USD",
      },
      fees: {
        percentage: 2.9,
        fixed: 0.3,
      },
      description: "Accept payments via Visa, Mastercard, and American Express",
      icon: "💳",
    },
    {
      id: "paypal",
      name: "PayPal",
      type: "traditional",
      enabled: true,
      details: {
        email: "payments@celbookings.com",
        provider: "PayPal",
      },
      fees: {
        percentage: 3.4,
        fixed: 0.35,
      },
      description: "Secure payments through PayPal",
      icon: "🅿️",
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      type: "traditional",
      enabled: true,
      details: {
        bankName: "Chase Bank",
        accountNumber: "****1234",
        currency: "USD",
      },
      fees: {
        fixed: 5.0,
      },
      description: "Direct bank transfer for large amounts",
      icon: "🏦",
    },
    {
      id: "bitcoin",
      name: "Bitcoin",
      type: "crypto",
      enabled: false,
      details: {
        walletAddress: "",
        network: "Bitcoin",
        currency: "BTC",
      },
      fees: {
        percentage: 1.0,
      },
      description: "Accept Bitcoin payments",
      icon: "₿",
    },
    {
      id: "ethereum",
      name: "Ethereum",
      type: "crypto",
      enabled: false,
      details: {
        walletAddress: "",
        network: "Ethereum",
        currency: "ETH",
      },
      fees: {
        percentage: 1.0,
      },
      description: "Accept Ethereum payments",
      icon: "Ξ",
    },
    {
      id: "mpesa",
      name: "M-Pesa",
      type: "mobile_money",
      enabled: false,
      details: {
        phoneNumber: "",
        provider: "Safaricom",
        currency: "KES",
      },
      fees: {
        percentage: 1.5,
      },
      description: "Mobile money payments via M-Pesa",
      icon: "📱",
    },
  ],
  minimumDepositAmount: 100,
  emailNotificationsEnabled: true,
  smsNotificationsEnabled: false,
  pushNotificationsEnabled: true,
};

const initialSecuritySettings: SecuritySettings = {
  twoFactorRequired: false,
  sessionTimeout: 30,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: false,
  apiEnabled: true,
  apiRateLimit: 1000,
  webhookUrl: "https://api.celbookings.com/webhooks",
  autoBackupEnabled: true,
  backupFrequency: "daily",
  lastBackupDate: "2024-01-20T10:30:00Z",
  logLevel: "info",
  logRetentionDays: 30,
};

const initialAdminLoginSettings: AdminLoginSettings = {
  currentUsername: "admin",
  newUsername: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorEnabled: false,
  lastLoginDate: "2024-01-20T10:30:00Z",
  loginAttempts: 0,
  accountLocked: false,
};

export default function AdminSettingsPage() {
  // State management
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(
    initialGeneralSettings
  );
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    initialPlatformSettings
  );
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(
    initialSecuritySettings
  );
  const [adminLoginSettings, setAdminLoginSettings] =
    useState<AdminLoginSettings>(initialAdminLoginSettings);

  // Form states for tracking changes
  const [generalForm, setGeneralForm] = useState<GeneralSettings>(
    initialGeneralSettings
  );
  const [platformForm, setPlatformForm] = useState<PlatformSettings>(
    initialPlatformSettings
  );
  const [securityForm, setSecurityForm] = useState<SecuritySettings>(
    initialSecuritySettings
  );
  const [adminLoginForm, setAdminLoginForm] = useState<AdminLoginSettings>(
    initialAdminLoginSettings
  );

  // Save states
  const [generalHasChanges, setGeneralHasChanges] = useState(false);
  const [platformHasChanges, setPlatformHasChanges] = useState(false);
  const [securityHasChanges, setSecurityHasChanges] = useState(false);
  const [adminLoginHasChanges, setAdminLoginHasChanges] = useState(false);

  // Payment method modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [paymentMethodForm, setPaymentMethodForm] = useState<PaymentMethod>({
    id: "",
    name: "",
    type: "traditional",
    enabled: true,
    details: {},
    fees: {},
    description: "",
    icon: "",
  });

  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());

  // Track changes
  useEffect(() => {
    setGeneralHasChanges(
      JSON.stringify(generalForm) !== JSON.stringify(generalSettings)
    );
  }, [generalForm, generalSettings]);

  useEffect(() => {
    setPlatformHasChanges(
      JSON.stringify(platformForm) !== JSON.stringify(platformSettings)
    );
  }, [platformForm, platformSettings]);

  useEffect(() => {
    setSecurityHasChanges(
      JSON.stringify(securityForm) !== JSON.stringify(securitySettings)
    );
  }, [securityForm, securitySettings]);

  useEffect(() => {
    setAdminLoginHasChanges(
      JSON.stringify(adminLoginForm) !== JSON.stringify(adminLoginSettings)
    );
  }, [adminLoginForm, adminLoginSettings]);

  // Save functions
  const handleSaveGeneral = () => {
    setGeneralSettings(generalForm);
    setGeneralHasChanges(false);
    setLastUpdated(new Date().toISOString());
    console.log("General settings saved:", generalForm);
  };

  const handleSavePlatform = () => {
    setPlatformSettings(platformForm);
    setPlatformHasChanges(false);
    setLastUpdated(new Date().toISOString());
    console.log("Platform settings saved:", platformForm);
  };

  const handleSaveSecurity = () => {
    setSecuritySettings(securityForm);
    setSecurityHasChanges(false);
    setLastUpdated(new Date().toISOString());
    console.log("Security settings saved:", securityForm);
  };

  const handleSaveAdminLogin = () => {
    setAdminLoginSettings(adminLoginForm);
    setAdminLoginHasChanges(false);
    setLastUpdated(new Date().toISOString());
    console.log("Admin login settings saved:", adminLoginForm);
  };

  // Reset functions
  const handleResetGeneral = () => {
    setGeneralForm(initialGeneralSettings);
  };

  const handleResetPlatform = () => {
    setPlatformForm(initialPlatformSettings);
  };

  const handleResetSecurity = () => {
    setSecurityForm(initialSecuritySettings);
  };

  const handleResetAdminLogin = () => {
    setAdminLoginForm(initialAdminLoginSettings);
  };

  // Payment method CRUD functions
  const handleAddPaymentMethod = () => {
    setEditingPaymentMethod(null);
    setPaymentMethodForm({
      id: "",
      name: "",
      type: "traditional",
      enabled: true,
      details: {},
      fees: {},
      description: "",
      icon: "",
    });
    setIsPaymentModalOpen(true);
  };

  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setEditingPaymentMethod(paymentMethod);
    setPaymentMethodForm({ ...paymentMethod });
    setIsPaymentModalOpen(true);
  };

  const handleDeletePaymentMethod = (paymentMethodId: string) => {
    const updatedMethods = platformForm.paymentMethods.filter(
      (method) => method.id !== paymentMethodId
    );
    setPlatformForm({
      ...platformForm,
      paymentMethods: updatedMethods,
    });
  };

  const handleSavePaymentMethod = () => {
    if (editingPaymentMethod) {
      // Update existing payment method
      const updatedMethods = platformForm.paymentMethods.map((method) =>
        method.id === editingPaymentMethod.id ? paymentMethodForm : method
      );
      setPlatformForm({
        ...platformForm,
        paymentMethods: updatedMethods,
      });
    } else {
      // Add new payment method
      const newMethod = {
        ...paymentMethodForm,
        id: paymentMethodForm.name.toLowerCase().replace(/\s+/g, "-"),
      };
      setPlatformForm({
        ...platformForm,
        paymentMethods: [...platformForm.paymentMethods, newMethod],
      });
    }
    setIsPaymentModalOpen(false);
    setEditingPaymentMethod(null);
  };

  const handleTogglePaymentMethod = (paymentMethodId: string) => {
    const updatedMethods = platformForm.paymentMethods.map((method) =>
      method.id === paymentMethodId
        ? { ...method, enabled: !method.enabled }
        : method
    );
    setPlatformForm({
      ...platformForm,
      paymentMethods: updatedMethods,
    });
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActiveSettingsCount = () => {
    let count = 0;
    if (generalSettings.siteName) count++;
    if (platformSettings.registrationEnabled) count++;
    if (securitySettings.apiEnabled) count++;
    return count;
  };

  const getSystemStatus = () => {
    return generalSettings.maintenanceMode ? "Maintenance" : "Operational";
  };

  const getSystemStatusColor = () => {
    return generalSettings.maintenanceMode
      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
      : "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Admin Settings"
              subtitle="Manage website configuration and platform settings"
              actionButton={{
                text: "Export Settings",
                icon: <Database className="size-4" />,
              }}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <CheckCircle2 className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {getActiveSettingsCount()}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  ACTIVE SETTINGS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {getActiveSettingsCount()}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Server className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {getSystemStatus()}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  SYSTEM STATUS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {getSystemStatus()}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Clock className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {formatDate(lastUpdated).split(",")[0]}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  LAST UPDATED
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {formatDate(lastUpdated).split(",")[0]}
                </p>
              </Card>

              <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white hover:border-emerald-900 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                    <Database className="size-5 text-emerald-900" />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                    {securitySettings.autoBackupEnabled ? "Auto" : "Manual"}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-zinc-600 mb-1">
                  BACKUP STATUS
                </p>
                <p className="text-2xl font-bold text-emerald-900">
                  {securitySettings.autoBackupEnabled ? "Auto" : "Manual"}
                </p>
              </Card>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
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
                  value="security"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="admin-login"
                  className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </TabsTrigger>
              </TabsList>

              {/* General Settings Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">
                          General Settings
                        </CardTitle>
                        <CardDescription>
                          Configure basic site information and contact details
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {generalHasChanges && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Unsaved Changes
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          onClick={handleResetGeneral}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          onClick={handleSaveGeneral}
                          disabled={!generalHasChanges}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Site Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Site Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="siteName"
                            className="text-emerald-900"
                          >
                            Site Name
                          </Label>
                          <Input
                            id="siteName"
                            value={generalForm.siteName}
                            onChange={(e) =>
                              setGeneralForm({
                                ...generalForm,
                                siteName: e.target.value,
                              })
                            }
                            className="bg-zinc-50 focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="siteTagline"
                            className="text-emerald-900"
                          >
                            Site Tagline
                          </Label>
                          <Input
                            id="siteTagline"
                            value={generalForm.siteTagline}
                            onChange={(e) =>
                              setGeneralForm({
                                ...generalForm,
                                siteTagline: e.target.value,
                              })
                            }
                            className="bg-zinc-50 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="siteDescription"
                          className="text-emerald-900"
                        >
                          Site Description
                        </Label>
                        <Textarea
                          id="siteDescription"
                          value={generalForm.siteDescription}
                          onChange={(e) =>
                            setGeneralForm({
                              ...generalForm,
                              siteDescription: e.target.value,
                            })
                          }
                          className="bg-zinc-50 focus:border-emerald-500 min-h-[100px]"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="adminEmail"
                            className="text-emerald-900"
                          >
                            Admin Email
                          </Label>
                          <Input
                            id="adminEmail"
                            type="email"
                            value={generalForm.adminEmail}
                            onChange={(e) =>
                              setGeneralForm({
                                ...generalForm,
                                adminEmail: e.target.value,
                              })
                            }
                            className="bg-zinc-50 focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="supportEmail"
                            className="text-emerald-900"
                          >
                            Support Email
                          </Label>
                          <Input
                            id="supportEmail"
                            type="email"
                            value={generalForm.supportEmail}
                            onChange={(e) =>
                              setGeneralForm({
                                ...generalForm,
                                supportEmail: e.target.value,
                              })
                            }
                            className="bg-zinc-50 focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-emerald-900">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={generalForm.phone}
                            onChange={(e) =>
                              setGeneralForm({
                                ...generalForm,
                                phone: e.target.value,
                              })
                            }
                            className="bg-zinc-50 focus:border-emerald-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-emerald-900">
                            Address
                          </Label>
                          <Input
                            id="address"
                            value={generalForm.address}
                            onChange={(e) =>
                              setGeneralForm({
                                ...generalForm,
                                address: e.target.value,
                              })
                            }
                            className="bg-zinc-50 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Regional Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Regional Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="timezone"
                            className="text-emerald-900"
                          >
                            Timezone
                          </Label>
                          <Select
                            value={generalForm.timezone}
                            onValueChange={(value) =>
                              setGeneralForm({
                                ...generalForm,
                                timezone: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="America/Los_Angeles">
                                Pacific Time
                              </SelectItem>
                              <SelectItem value="America/Denver">
                                Mountain Time
                              </SelectItem>
                              <SelectItem value="America/Chicago">
                                Central Time
                              </SelectItem>
                              <SelectItem value="America/New_York">
                                Eastern Time
                              </SelectItem>
                              <SelectItem value="Europe/London">
                                London
                              </SelectItem>
                              <SelectItem value="Europe/Paris">
                                Paris
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="dateFormat"
                            className="text-emerald-900"
                          >
                            Date Format
                          </Label>
                          <Select
                            value={generalForm.dateFormat}
                            onValueChange={(value) =>
                              setGeneralForm({
                                ...generalForm,
                                dateFormat: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MM/DD/YYYY">
                                MM/DD/YYYY
                              </SelectItem>
                              <SelectItem value="DD/MM/YYYY">
                                DD/MM/YYYY
                              </SelectItem>
                              <SelectItem value="YYYY-MM-DD">
                                YYYY-MM-DD
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="currency"
                            className="text-emerald-900"
                          >
                            Currency
                          </Label>
                          <Select
                            value={generalForm.currency}
                            onValueChange={(value) =>
                              setGeneralForm({
                                ...generalForm,
                                currency: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EUR">EUR (€)</SelectItem>
                              <SelectItem value="GBP">GBP (£)</SelectItem>
                              <SelectItem value="CAD">CAD (C$)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Maintenance Mode */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Maintenance Mode
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="maintenanceMode"
                            checked={generalForm.maintenanceMode}
                            onChange={(e) =>
                              setGeneralForm({
                                ...generalForm,
                                maintenanceMode: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="maintenanceMode"
                            className="text-emerald-900"
                          >
                            Enable Maintenance Mode
                          </Label>
                        </div>
                        {generalForm.maintenanceMode && (
                          <div className="space-y-2">
                            <Label
                              htmlFor="maintenanceMessage"
                              className="text-emerald-900"
                            >
                              Maintenance Message
                            </Label>
                            <Textarea
                              id="maintenanceMessage"
                              value={generalForm.maintenanceMessage}
                              onChange={(e) =>
                                setGeneralForm({
                                  ...generalForm,
                                  maintenanceMessage: e.target.value,
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500 min-h-[100px]"
                              placeholder="Enter maintenance message..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Platform Settings Tab */}
              <TabsContent value="platform" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">
                          Platform Settings
                        </CardTitle>
                        <CardDescription>
                          Configure user management and platform behavior
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {platformHasChanges && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Unsaved Changes
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          onClick={handleResetPlatform}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          onClick={handleSavePlatform}
                          disabled={!platformHasChanges}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        User Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="defaultMembership"
                            className="text-emerald-900"
                          >
                            Default Membership
                          </Label>
                          <Select
                            value={platformForm.defaultMembership}
                            onValueChange={(value) =>
                              setPlatformForm({
                                ...platformForm,
                                defaultMembership: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Basic">Basic</SelectItem>
                              <SelectItem value="Premium">Premium</SelectItem>
                              <SelectItem value="VIP">VIP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="minimumDepositAmount"
                            className="text-emerald-900"
                          >
                            Minimum Deposit Amount ($)
                          </Label>
                          <Input
                            id="minimumDepositAmount"
                            type="number"
                            value={platformForm.minimumDepositAmount}
                            onChange={(e) =>
                              setPlatformForm({
                                ...platformForm,
                                minimumDepositAmount: Number(e.target.value),
                              })
                            }
                            className="bg-zinc-50 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="registrationEnabled"
                            checked={platformForm.registrationEnabled}
                            onChange={(e) =>
                              setPlatformForm({
                                ...platformForm,
                                registrationEnabled: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="registrationEnabled"
                            className="text-emerald-900"
                          >
                            Enable User Registration
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="emailVerificationRequired"
                            checked={platformForm.emailVerificationRequired}
                            onChange={(e) =>
                              setPlatformForm({
                                ...platformForm,
                                emailVerificationRequired: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="emailVerificationRequired"
                            className="text-emerald-900"
                          >
                            Require Email Verification
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Booking Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Booking Settings
                      </h4>
                      <div className="space-y-2">
                        <Label
                          htmlFor="bookingFeePercentage"
                          className="text-emerald-900"
                        >
                          Booking Fee Percentage (%)
                        </Label>
                        <Input
                          id="bookingFeePercentage"
                          type="number"
                          step="0.1"
                          value={platformForm.bookingFeePercentage}
                          onChange={(e) =>
                            setPlatformForm({
                              ...platformForm,
                              bookingFeePercentage: Number(e.target.value),
                            })
                          }
                          className="bg-zinc-50 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="cancellationPolicy"
                          className="text-emerald-900"
                        >
                          Cancellation Policy
                        </Label>
                        <Textarea
                          id="cancellationPolicy"
                          value={platformForm.cancellationPolicy}
                          onChange={(e) =>
                            setPlatformForm({
                              ...platformForm,
                              cancellationPolicy: e.target.value,
                            })
                          }
                          className="bg-zinc-50 focus:border-emerald-500 min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="refundPolicy"
                          className="text-emerald-900"
                        >
                          Refund Policy
                        </Label>
                        <Textarea
                          id="refundPolicy"
                          value={platformForm.refundPolicy}
                          onChange={(e) =>
                            setPlatformForm({
                              ...platformForm,
                              refundPolicy: e.target.value,
                            })
                          }
                          className="bg-zinc-50 focus:border-emerald-500 min-h-[100px]"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Methods */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Payment Methods
                        </h4>
                        <Button
                          onClick={handleAddPaymentMethod}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>

                      {/* Payment Methods List */}
                      <div className="space-y-3">
                        {platformForm.paymentMethods.map((method) => (
                          <Card
                            key={method.id}
                            className="bg-zinc-50 border-zinc-200"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-2xl">{method.icon}</div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-medium text-emerald-900">
                                        {method.name}
                                      </h5>
                                      <Badge
                                        variant="outline"
                                        className={
                                          method.type === "traditional"
                                            ? "border-blue-200 text-blue-800"
                                            : method.type === "crypto"
                                            ? "border-orange-200 text-orange-800"
                                            : "border-green-200 text-green-800"
                                        }
                                      >
                                        {method.type.replace("_", " ")}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-zinc-600">
                                      {method.description}
                                    </p>
                                    {method.fees && (
                                      <div className="text-xs text-zinc-500 mt-1">
                                        Fees:{" "}
                                        {method.fees.percentage && (
                                          <span>{method.fees.percentage}%</span>
                                        )}
                                        {method.fees.percentage &&
                                          method.fees.fixed && <span> + </span>}
                                        {method.fees.fixed && (
                                          <span>${method.fees.fixed}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={method.enabled}
                                    onChange={() =>
                                      handleTogglePaymentMethod(method.id)
                                    }
                                    className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                  />
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleEditPaymentMethod(method)
                                        }
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeletePaymentMethod(method.id)
                                        }
                                        className="text-red-600"
                                      >
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
                    </div>

                    <Separator />

                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="emailNotificationsEnabled"
                            checked={platformForm.emailNotificationsEnabled}
                            onChange={(e) =>
                              setPlatformForm({
                                ...platformForm,
                                emailNotificationsEnabled: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="emailNotificationsEnabled"
                            className="text-emerald-900"
                          >
                            Enable Email Notifications
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="smsNotificationsEnabled"
                            checked={platformForm.smsNotificationsEnabled}
                            onChange={(e) =>
                              setPlatformForm({
                                ...platformForm,
                                smsNotificationsEnabled: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="smsNotificationsEnabled"
                            className="text-emerald-900"
                          >
                            Enable SMS Notifications
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="pushNotificationsEnabled"
                            checked={platformForm.pushNotificationsEnabled}
                            onChange={(e) =>
                              setPlatformForm({
                                ...platformForm,
                                pushNotificationsEnabled: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="pushNotificationsEnabled"
                            className="text-emerald-900"
                          >
                            Enable Push Notifications
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">
                          Security & Advanced Settings
                        </CardTitle>
                        <CardDescription>
                          Configure security policies and advanced system
                          settings
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {securityHasChanges && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Unsaved Changes
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          onClick={handleResetSecurity}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          onClick={handleSaveSecurity}
                          disabled={!securityHasChanges}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Security Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="twoFactorRequired"
                            checked={securityForm.twoFactorRequired}
                            onChange={(e) =>
                              setSecurityForm({
                                ...securityForm,
                                twoFactorRequired: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="twoFactorRequired"
                            className="text-emerald-900"
                          >
                            Require Two-Factor Authentication
                          </Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="sessionTimeout"
                              className="text-emerald-900"
                            >
                              Session Timeout (minutes)
                            </Label>
                            <Input
                              id="sessionTimeout"
                              type="number"
                              value={securityForm.sessionTimeout}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  sessionTimeout: Number(e.target.value),
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="passwordMinLength"
                              className="text-emerald-900"
                            >
                              Minimum Password Length
                            </Label>
                            <Input
                              id="passwordMinLength"
                              type="number"
                              value={securityForm.passwordMinLength}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  passwordMinLength: Number(e.target.value),
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="passwordRequireUppercase"
                              checked={securityForm.passwordRequireUppercase}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  passwordRequireUppercase: e.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <Label
                              htmlFor="passwordRequireUppercase"
                              className="text-emerald-900"
                            >
                              Require Uppercase Letters
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="passwordRequireNumbers"
                              checked={securityForm.passwordRequireNumbers}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  passwordRequireNumbers: e.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <Label
                              htmlFor="passwordRequireNumbers"
                              className="text-emerald-900"
                            >
                              Require Numbers
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="passwordRequireSpecialChars"
                              checked={securityForm.passwordRequireSpecialChars}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  passwordRequireSpecialChars: e.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <Label
                              htmlFor="passwordRequireSpecialChars"
                              className="text-emerald-900"
                            >
                              Require Special Characters
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* API Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        API Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="apiEnabled"
                            checked={securityForm.apiEnabled}
                            onChange={(e) =>
                              setSecurityForm({
                                ...securityForm,
                                apiEnabled: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="apiEnabled"
                            className="text-emerald-900"
                          >
                            Enable API Access
                          </Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="apiRateLimit"
                              className="text-emerald-900"
                            >
                              API Rate Limit (requests/hour)
                            </Label>
                            <Input
                              id="apiRateLimit"
                              type="number"
                              value={securityForm.apiRateLimit}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  apiRateLimit: Number(e.target.value),
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="webhookUrl"
                              className="text-emerald-900"
                            >
                              Webhook URL
                            </Label>
                            <Input
                              id="webhookUrl"
                              value={securityForm.webhookUrl}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  webhookUrl: e.target.value,
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Backup Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <HardDrive className="w-5 h-5" />
                        Backup Settings
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="autoBackupEnabled"
                            checked={securityForm.autoBackupEnabled}
                            onChange={(e) =>
                              setSecurityForm({
                                ...securityForm,
                                autoBackupEnabled: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="autoBackupEnabled"
                            className="text-emerald-900"
                          >
                            Enable Automatic Backups
                          </Label>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="backupFrequency"
                              className="text-emerald-900"
                            >
                              Backup Frequency
                            </Label>
                            <Select
                              value={securityForm.backupFrequency}
                              onValueChange={(value) =>
                                setSecurityForm({
                                  ...securityForm,
                                  backupFrequency: value,
                                })
                              }
                            >
                              <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Hourly</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="lastBackupDate"
                              className="text-emerald-900"
                            >
                              Last Backup Date
                            </Label>
                            <Input
                              id="lastBackupDate"
                              type="datetime-local"
                              value={securityForm.lastBackupDate.slice(0, 16)}
                              onChange={(e) =>
                                setSecurityForm({
                                  ...securityForm,
                                  lastBackupDate: e.target.value + ":00Z",
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* System Logs */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        System Logs
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="logLevel"
                            className="text-emerald-900"
                          >
                            Log Level
                          </Label>
                          <Select
                            value={securityForm.logLevel}
                            onValueChange={(value) =>
                              setSecurityForm({
                                ...securityForm,
                                logLevel: value,
                              })
                            }
                          >
                            <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="debug">Debug</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="error">Error</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="logRetentionDays"
                            className="text-emerald-900"
                          >
                            Log Retention (days)
                          </Label>
                          <Input
                            id="logRetentionDays"
                            type="number"
                            value={securityForm.logRetentionDays}
                            onChange={(e) =>
                              setSecurityForm({
                                ...securityForm,
                                logRetentionDays: Number(e.target.value),
                              })
                            }
                            className="bg-zinc-50 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Login Settings Tab */}
              <TabsContent value="admin-login" className="space-y-6">
                <Card className="bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-emerald-900">
                          Admin Login Settings
                        </CardTitle>
                        <CardDescription>
                          Manage admin account credentials and security settings
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {adminLoginHasChanges && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Unsaved Changes
                          </Badge>
                        )}
                        <Button
                          variant="outline"
                          onClick={handleResetAdminLogin}
                          className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          onClick={handleSaveAdminLogin}
                          disabled={!adminLoginHasChanges}
                          className="bg-emerald-800 hover:bg-emerald-700 text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Admin Info */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Current Admin Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-emerald-900">
                            Current Username
                          </Label>
                          <Input
                            value={adminLoginForm.currentUsername}
                            disabled
                            className="bg-zinc-100 text-zinc-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-emerald-900">Last Login</Label>
                          <Input
                            value={formatDate(adminLoginForm.lastLoginDate)}
                            disabled
                            className="bg-zinc-100 text-zinc-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-emerald-900">
                            Login Attempts
                          </Label>
                          <Input
                            value={adminLoginForm.loginAttempts.toString()}
                            disabled
                            className="bg-zinc-100 text-zinc-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-emerald-900">
                            Account Status
                          </Label>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                adminLoginForm.accountLocked
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-green-100 text-green-800 border-green-200"
                              }
                            >
                              {adminLoginForm.accountLocked
                                ? "Locked"
                                : "Active"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Change Username */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Change Username
                      </h4>
                      <div className="space-y-2">
                        <Label
                          htmlFor="newUsername"
                          className="text-emerald-900"
                        >
                          New Username
                        </Label>
                        <Input
                          id="newUsername"
                          value={adminLoginForm.newUsername}
                          onChange={(e) =>
                            setAdminLoginForm({
                              ...adminLoginForm,
                              newUsername: e.target.value,
                            })
                          }
                          className="bg-zinc-50 focus:border-emerald-500"
                          placeholder="Enter new username"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Change Password */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Change Password
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="currentPassword"
                            className="text-emerald-900"
                          >
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type="password"
                              value={adminLoginForm.currentPassword}
                              onChange={(e) =>
                                setAdminLoginForm({
                                  ...adminLoginForm,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500 pr-10"
                              placeholder="Enter current password"
                            />
                            <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="newPassword"
                            className="text-emerald-900"
                          >
                            New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type="password"
                              value={adminLoginForm.newPassword}
                              onChange={(e) =>
                                setAdminLoginForm({
                                  ...adminLoginForm,
                                  newPassword: e.target.value,
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500 pr-10"
                              placeholder="Enter new password"
                            />
                            <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="confirmPassword"
                            className="text-emerald-900"
                          >
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={adminLoginForm.confirmPassword}
                              onChange={(e) =>
                                setAdminLoginForm({
                                  ...adminLoginForm,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="bg-zinc-50 focus:border-emerald-500 pr-10"
                              placeholder="Confirm new password"
                            />
                            <Eye className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-emerald-900">
                            Password Strength
                          </Label>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-zinc-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  adminLoginForm.newPassword.length >= 8
                                    ? adminLoginForm.newPassword.length >= 12
                                      ? "bg-green-500"
                                      : "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    (adminLoginForm.newPassword.length / 12) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-zinc-600">
                              {adminLoginForm.newPassword.length >= 12
                                ? "Strong"
                                : adminLoginForm.newPassword.length >= 8
                                ? "Medium"
                                : "Weak"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Two-Factor Authentication */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Two-Factor Authentication
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="twoFactorEnabled"
                            checked={adminLoginForm.twoFactorEnabled}
                            onChange={(e) =>
                              setAdminLoginForm({
                                ...adminLoginForm,
                                twoFactorEnabled: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <Label
                            htmlFor="twoFactorEnabled"
                            className="text-emerald-900"
                          >
                            Enable Two-Factor Authentication
                          </Label>
                        </div>
                        {adminLoginForm.twoFactorEnabled && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Smartphone className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">
                                Two-Factor Authentication Setup
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">
                              Scan the QR code with your authenticator app to
                              complete setup.
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-700"
                              >
                                <Smartphone className="w-4 h-4 mr-2" />
                                Setup Authenticator
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 text-blue-700"
                              >
                                <Mail className="w-4 h-4 mr-2" />
                                Setup SMS
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Security Actions */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Security Actions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          className="border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset Login Attempts
                        </Button>
                        <Button
                          variant="outline"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Unlock Account
                        </Button>
                        <Button
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Force Logout All Sessions
                        </Button>
                        <Button
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Login History
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>

      {/* Payment Method Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="w-[90vw] max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-emerald-900">
              {editingPaymentMethod
                ? "Edit Payment Method"
                : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              {editingPaymentMethod
                ? "Update the payment method details below."
                : "Configure a new payment method for your platform."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-900">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="methodName" className="text-emerald-900">
                    Payment Method Name
                  </Label>
                  <Input
                    id="methodName"
                    value={paymentMethodForm.name}
                    onChange={(e) =>
                      setPaymentMethodForm({
                        ...paymentMethodForm,
                        name: e.target.value,
                      })
                    }
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="e.g., Credit Card, Bitcoin, M-Pesa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methodType" className="text-emerald-900">
                    Payment Type
                  </Label>
                  <Select
                    value={paymentMethodForm.type}
                    onValueChange={(
                      value: "traditional" | "crypto" | "mobile_money"
                    ) =>
                      setPaymentMethodForm({
                        ...paymentMethodForm,
                        type: value,
                      })
                    }
                  >
                    <SelectTrigger className="bg-zinc-50 focus:border-emerald-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="traditional">Traditional</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methodIcon" className="text-emerald-900">
                    Icon (Emoji)
                  </Label>
                  <Input
                    id="methodIcon"
                    value={paymentMethodForm.icon}
                    onChange={(e) =>
                      setPaymentMethodForm({
                        ...paymentMethodForm,
                        icon: e.target.value,
                      })
                    }
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="💳"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="methodEnabled" className="text-emerald-900">
                    Status
                  </Label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="methodEnabled"
                      checked={paymentMethodForm.enabled}
                      onChange={(e) =>
                        setPaymentMethodForm({
                          ...paymentMethodForm,
                          enabled: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <Label htmlFor="methodEnabled" className="text-emerald-900">
                      Enabled
                    </Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="methodDescription" className="text-emerald-900">
                  Description
                </Label>
                <Textarea
                  id="methodDescription"
                  value={paymentMethodForm.description}
                  onChange={(e) =>
                    setPaymentMethodForm({
                      ...paymentMethodForm,
                      description: e.target.value,
                    })
                  }
                  className="bg-zinc-50 focus:border-emerald-500"
                  placeholder="Brief description of this payment method"
                />
              </div>
            </div>

            <Separator />

            {/* Payment Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-900">
                Payment Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethodForm.type === "traditional" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="provider" className="text-emerald-900">
                        Provider
                      </Label>
                      <Input
                        id="provider"
                        value={paymentMethodForm.details.provider || ""}
                        onChange={(e) =>
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            details: {
                              ...paymentMethodForm.details,
                              provider: e.target.value,
                            },
                          })
                        }
                        className="bg-zinc-50 focus:border-emerald-500"
                        placeholder="e.g., Stripe, PayPal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="accountNumber"
                        className="text-emerald-900"
                      >
                        Account Number
                      </Label>
                      <Input
                        id="accountNumber"
                        value={paymentMethodForm.details.accountNumber || ""}
                        onChange={(e) =>
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            details: {
                              ...paymentMethodForm.details,
                              accountNumber: e.target.value,
                            },
                          })
                        }
                        className="bg-zinc-50 focus:border-emerald-500"
                        placeholder="Account or merchant ID"
                      />
                    </div>
                  </>
                )}

                {paymentMethodForm.type === "crypto" && (
                  <>
                    <div className="space-y-2">
                      <Label
                        htmlFor="walletAddress"
                        className="text-emerald-900"
                      >
                        Wallet Address
                      </Label>
                      <Input
                        id="walletAddress"
                        value={paymentMethodForm.details.walletAddress || ""}
                        onChange={(e) =>
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            details: {
                              ...paymentMethodForm.details,
                              walletAddress: e.target.value,
                            },
                          })
                        }
                        className="bg-zinc-50 focus:border-emerald-500"
                        placeholder="Enter wallet address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="network" className="text-emerald-900">
                        Network
                      </Label>
                      <Input
                        id="network"
                        value={paymentMethodForm.details.network || ""}
                        onChange={(e) =>
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            details: {
                              ...paymentMethodForm.details,
                              network: e.target.value,
                            },
                          })
                        }
                        className="bg-zinc-50 focus:border-emerald-500"
                        placeholder="e.g., Bitcoin, Ethereum"
                      />
                    </div>
                  </>
                )}

                {paymentMethodForm.type === "mobile_money" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-emerald-900">
                        Phone Number
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={paymentMethodForm.details.phoneNumber || ""}
                        onChange={(e) =>
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            details: {
                              ...paymentMethodForm.details,
                              phoneNumber: e.target.value,
                            },
                          })
                        }
                        className="bg-zinc-50 focus:border-emerald-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider" className="text-emerald-900">
                        Provider
                      </Label>
                      <Input
                        id="provider"
                        value={paymentMethodForm.details.provider || ""}
                        onChange={(e) =>
                          setPaymentMethodForm({
                            ...paymentMethodForm,
                            details: {
                              ...paymentMethodForm.details,
                              provider: e.target.value,
                            },
                          })
                        }
                        className="bg-zinc-50 focus:border-emerald-500"
                        placeholder="e.g., Safaricom, Airtel"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-emerald-900">
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    value={paymentMethodForm.details.currency || ""}
                    onChange={(e) =>
                      setPaymentMethodForm({
                        ...paymentMethodForm,
                        details: {
                          ...paymentMethodForm.details,
                          currency: e.target.value,
                        },
                      })
                    }
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="e.g., USD, BTC, KES"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Fees */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-emerald-900">Fees</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feePercentage" className="text-emerald-900">
                    Percentage Fee (%)
                  </Label>
                  <Input
                    id="feePercentage"
                    type="number"
                    step="0.1"
                    value={paymentMethodForm.fees?.percentage || ""}
                    onChange={(e) =>
                      setPaymentMethodForm({
                        ...paymentMethodForm,
                        fees: {
                          ...paymentMethodForm.fees,
                          percentage: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="2.9"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feeFixed" className="text-emerald-900">
                    Fixed Fee ($)
                  </Label>
                  <Input
                    id="feeFixed"
                    type="number"
                    step="0.01"
                    value={paymentMethodForm.fees?.fixed || ""}
                    onChange={(e) =>
                      setPaymentMethodForm({
                        ...paymentMethodForm,
                        fees: {
                          ...paymentMethodForm.fees,
                          fixed: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      })
                    }
                    className="bg-zinc-50 focus:border-emerald-500"
                    placeholder="0.30"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
              className="border-zinc-300 text-zinc-700 hover:bg-zinc-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePaymentMethod}
              className="bg-emerald-800 hover:bg-emerald-700 text-white"
            >
              {editingPaymentMethod
                ? "Update Payment Method"
                : "Add Payment Method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
