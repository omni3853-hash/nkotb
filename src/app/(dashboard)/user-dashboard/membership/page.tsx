"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FaCrown,
  FaStar,
  FaCheck,
  FaTimes,
  FaCreditCard,
  FaTruck,
  FaShieldAlt,
  FaBolt,
  FaUsers,
  FaCalendarAlt,
  FaGift,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Membership tiers data
const membershipTiers = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    period: "month",
    description: "Perfect for getting started with celebrity bookings",
    icon: FaUsers,
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
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    period: "month",
    description: "Most popular choice for regular event organizers",
    icon: FaStar,
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
  },
  {
    id: "vip",
    name: "VIP",
    price: 199,
    period: "month",
    description: "Ultimate experience for high-end events and exclusive access",
    icon: FaCrown,
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
  },
];

export default function MembershipPage() {
  const [selectedTier, setSelectedTier] = useState("premium");
  const [isActivating, setIsActivating] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    deliveryType: "",
    specialInstructions: "",
  });

  const handleActivateMembership = () => {
    setIsActivating(true);
    // Simulate API call
    setTimeout(() => {
      setIsActivating(false);
      // Handle success
    }, 2000);
  };

  const handleDeliverCard = () => {
    setIsDelivering(true);
    // Simulate API call
    setTimeout(() => {
      setIsDelivering(false);
      // Handle success
    }, 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDelivering(true);

    // Simulate API call
    setTimeout(() => {
      setIsDelivering(false);
      setIsFormSubmitted(true);
    }, 2000);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Reset form after a delay to allow modal close animation
    setTimeout(() => {
      setIsFormSubmitted(false);
      setFormData({
        fullName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        deliveryType: "",
        specialInstructions: "",
      });
    }, 300);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col px-2 sm:px-3 bg-zinc-100">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Membership"
              subtitle="Choose the perfect membership plan for your celebrity booking needs"
              actionButton={{
                text: "View Billing",
                icon: <FaCreditCard className="w-4 h-4" />,
              }}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-7">
              <Card className="bg-white border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <FaCrown className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-emerald-900 text-sm sm:text-base">
                        Current Membership
                      </CardTitle>
                      <CardDescription className="text-emerald-700 text-xs sm:text-sm">
                        Premium Plan - Active since January 2024
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Membership Stats */}

                    {/* Next Booking */}
                    <div className="bg-emerald-800 rounded-lg p-3 border border-emerald-100/50">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-100" />
                        <span className="text-xs font-medium text-zinc-100">
                          Upcoming Booking
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-zinc-100 text-sm sm:text-base truncate">
                            Keanu Reeves
                          </p>
                          <p className="text-xs text-zinc-200">Private Event</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-xs sm:text-sm font-bold text-emerald-300">
                            Feb 8
                          </p>
                          <p className="text-xs text-zinc-200">10:00 AM</p>
                        </div>
                      </div>
                    </div>

                    {/* Membership Benefits */}
                    <div className="bg-white/60 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FaStar className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-900">
                          Premium Benefits
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant="outline"
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Priority Booking
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Dedicated Manager
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Exclusive Access
                        </Badge>
                      </div>
                    </div>

                    {/* Status Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-emerald-100/50">
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 w-fit">
                        <FaCheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-emerald-600">
                          Renews Feb 15, 2024
                        </p>
                        <p className="text-xs text-zinc-500">
                          Auto-renewal enabled
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <FaTruck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-purple-900 text-sm sm:text-base">
                        Deliver Membership Card
                      </CardTitle>
                      <CardDescription className="text-purple-700 text-xs sm:text-sm">
                        Request physical membership card delivery
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 justify-between h-full">
                  <p className="text-xs sm:text-sm text-purple-800 mb-4">
                    Get your premium membership card delivered to your address
                    within 5-7 business days.
                  </p>
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm">
                        <FaTruck className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Request Delivery
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl mx-4 sm:mx-0">
                      <DialogHeader className="pb-3">
                        <DialogTitle className="text-purple-900 text-base sm:text-lg font-bold flex items-center gap-2">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <FaTruck className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                          </div>
                          <span className="text-sm sm:text-base">
                            Request Membership Card Delivery
                          </span>
                        </DialogTitle>
                        <DialogDescription className="text-purple-700 text-xs sm:text-sm">
                          {isFormSubmitted
                            ? "Your delivery request has been submitted successfully"
                            : "Please provide your delivery information to request your premium membership card"}
                        </DialogDescription>
                      </DialogHeader>

                      {!isFormSubmitted ? (
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                          {/* Personal Information */}
                          <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                            <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                              <FaUsers className="w-3 h-3" />
                              Personal Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label
                                  htmlFor="fullName"
                                  className="text-purple-800 font-medium text-xs"
                                >
                                  Full Name *
                                </Label>
                                <Input
                                  id="fullName"
                                  type="text"
                                  placeholder="Enter your full name"
                                  value={formData.fullName}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "fullName",
                                      e.target.value
                                    )
                                  }
                                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <Label
                                  htmlFor="phone"
                                  className="text-purple-800 font-medium text-xs"
                                >
                                  Phone Number *
                                </Label>
                                <Input
                                  id="phone"
                                  type="tel"
                                  placeholder="(555) 123-4567"
                                  value={formData.phone}
                                  onChange={(e) =>
                                    handleInputChange("phone", e.target.value)
                                  }
                                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          {/* Delivery Address */}
                          <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                            <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                              <FaMapMarkerAlt className="w-3 h-3" />
                              Delivery Address
                            </h3>
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label
                                  htmlFor="address"
                                  className="text-purple-800 font-medium text-xs"
                                >
                                  Street Address *
                                </Label>
                                <Input
                                  id="address"
                                  type="text"
                                  placeholder="123 Main Street, Apt 4B"
                                  value={formData.address}
                                  onChange={(e) =>
                                    handleInputChange("address", e.target.value)
                                  }
                                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label
                                    htmlFor="city"
                                    className="text-purple-800 font-medium text-xs"
                                  >
                                    City *
                                  </Label>
                                  <Input
                                    id="city"
                                    type="text"
                                    placeholder="Los Angeles"
                                    value={formData.city}
                                    onChange={(e) =>
                                      handleInputChange("city", e.target.value)
                                    }
                                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                                    required
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    htmlFor="state"
                                    className="text-purple-800 font-medium text-xs"
                                  >
                                    State *
                                  </Label>
                                  <Select
                                    value={formData.state}
                                    onValueChange={(value) =>
                                      handleInputChange("state", value)
                                    }
                                  >
                                    <SelectTrigger className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm">
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="CA">
                                        California
                                      </SelectItem>
                                      <SelectItem value="NY">
                                        New York
                                      </SelectItem>
                                      <SelectItem value="TX">Texas</SelectItem>
                                      <SelectItem value="FL">
                                        Florida
                                      </SelectItem>
                                      <SelectItem value="IL">
                                        Illinois
                                      </SelectItem>
                                      <SelectItem value="WA">
                                        Washington
                                      </SelectItem>
                                      <SelectItem value="OR">Oregon</SelectItem>
                                      <SelectItem value="NV">Nevada</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label
                                    htmlFor="zipCode"
                                    className="text-purple-800 font-medium text-xs"
                                  >
                                    ZIP Code *
                                  </Label>
                                  <Input
                                    id="zipCode"
                                    type="text"
                                    placeholder="90210"
                                    value={formData.zipCode}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "zipCode",
                                        e.target.value
                                      )
                                    }
                                    className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Delivery Options */}
                          <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100">
                            <h3 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                              <FaClock className="w-3 h-3" />
                              Delivery Options
                            </h3>
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-purple-800 font-medium text-xs">
                                  Delivery Type *
                                </Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {/* Standard Delivery Card */}
                                  <div
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                      formData.deliveryType === "standard"
                                        ? "border-purple-600 bg-purple-600"
                                        : "border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-25"
                                    }`}
                                    onClick={() =>
                                      handleInputChange(
                                        "deliveryType",
                                        "standard"
                                      )
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            formData.deliveryType === "standard"
                                              ? "border-white bg-white"
                                              : "border-purple-300"
                                          }`}
                                        >
                                          {formData.deliveryType ===
                                            "standard" && (
                                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                          )}
                                        </div>
                                        <div>
                                          <p
                                            className={`text-sm font-medium ${
                                              formData.deliveryType ===
                                              "standard"
                                                ? "text-white"
                                                : "text-purple-900"
                                            }`}
                                          >
                                            Standard Delivery
                                          </p>
                                          <p
                                            className={`text-xs ${
                                              formData.deliveryType ===
                                              "standard"
                                                ? "text-purple-100"
                                                : "text-purple-600"
                                            }`}
                                          >
                                            5-7 business days
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p
                                          className={`text-sm font-semibold ${
                                            formData.deliveryType === "standard"
                                              ? "text-white"
                                              : "text-purple-900"
                                          }`}
                                        >
                                          Free
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Express Delivery Card */}
                                  <div
                                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                      formData.deliveryType === "express"
                                        ? "border-purple-600 bg-purple-600"
                                        : "border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-25"
                                    }`}
                                    onClick={() =>
                                      handleInputChange(
                                        "deliveryType",
                                        "express"
                                      )
                                    }
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            formData.deliveryType === "express"
                                              ? "border-white bg-white"
                                              : "border-purple-300"
                                          }`}
                                        >
                                          {formData.deliveryType ===
                                            "express" && (
                                            <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                          )}
                                        </div>
                                        <div>
                                          <p
                                            className={`text-sm font-medium ${
                                              formData.deliveryType ===
                                              "express"
                                                ? "text-white"
                                                : "text-purple-900"
                                            }`}
                                          >
                                            Express Delivery
                                          </p>
                                          <p
                                            className={`text-xs ${
                                              formData.deliveryType ===
                                              "express"
                                                ? "text-purple-100"
                                                : "text-purple-600"
                                            }`}
                                          >
                                            2-3 business days
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p
                                          className={`text-sm font-semibold ${
                                            formData.deliveryType === "express"
                                              ? "text-white"
                                              : "text-purple-900"
                                          }`}
                                        >
                                          +$15
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label
                                  htmlFor="specialInstructions"
                                  className="text-purple-800 font-medium text-xs"
                                >
                                  Special Instructions
                                </Label>
                                <Input
                                  id="specialInstructions"
                                  type="text"
                                  placeholder="Any special delivery instructions (optional)"
                                  value={formData.specialInstructions}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "specialInstructions",
                                      e.target.value
                                    )
                                  }
                                  className="border-purple-200 focus:border-purple-500 focus:ring-purple-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Form Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleModalClose}
                              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 text-sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={isDelivering}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm"
                            >
                              {isDelivering ? (
                                <>
                                  <FaClock className="w-3 h-3 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <FaTruck className="w-3 h-3 mr-2" />
                                  Submit Request
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        /* Success Message */
                        <div className="text-center py-4 sm:py-6">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                            <FaCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-green-900 mb-2">
                            Delivery Request Submitted!
                          </h3>
                          <p className="text-green-700 mb-4 max-w-md mx-auto text-xs sm:text-sm">
                            Your membership card delivery request has been
                            submitted and is pending approval. You will receive
                            a confirmation email within 24 hours.
                          </p>
                          <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-4">
                            <div className="flex items-center gap-2">
                              <FaClock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <div className="text-left">
                                <p className="font-semibold text-green-900 text-xs sm:text-sm">
                                  Status: Pending Approval
                                </p>
                                <p className="text-xs text-green-700">
                                  Expected approval: Within 24 hours
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={handleModalClose}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 text-sm"
                          >
                            Close
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>

            {/* Membership Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-7">
              {membershipTiers.map((tier) => {
                const IconComponent = tier.icon;
                const isSelected = selectedTier === tier.id;

                return (
                  <Card
                    key={tier.id}
                    className={`relative bg-white border-0 transition-all duration-200 hover:shadow-lg ${
                      isSelected
                        ? "ring-2 ring-emerald-800/20 shadow-lg sm:scale-105"
                        : "hover:shadow-md"
                    } ${
                      tier.popular ? "bg-emerald-900 border-emerald-300" : ""
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-emerald-500 text-white px-4 py-1">
                          <FaStar className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-3">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${tier.color} flex items-center justify-center mx-auto mb-3`}
                      >
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <CardTitle
                        className={`text-lg sm:text-xl font-bold ${
                          tier.popular ? "text-zinc-100" : "text-emerald-900"
                        }`}
                      >
                        {tier.name}
                      </CardTitle>
                      <CardDescription
                        className={`text-xs sm:text-sm ${
                          tier.popular ? "text-zinc-300" : "text-zinc-600"
                        }`}
                      >
                        {tier.description}
                      </CardDescription>
                      <div className="mt-3">
                        <span
                          className={`text-2xl sm:text-3xl font-bold ${
                            tier.popular ? "text-zinc-100" : "text-emerald-600"
                          }`}
                        >
                          ${tier.price}
                        </span>
                        <span
                          className={`ml-1 text-xs sm:text-sm ${
                            tier.popular ? "text-zinc-300" : "text-zinc-500"
                          }`}
                        >
                          /{tier.period}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <h4
                          className={`font-medium flex items-center gap-2 text-xs sm:text-sm ${
                            tier.popular ? "text-zinc-100" : "text-emerald-900"
                          }`}
                        >
                          <FaCheck
                            className={`w-3 h-3 ${
                              tier.popular
                                ? "text-zinc-300"
                                : "text-emerald-600"
                            }`}
                          />
                          What's Included
                        </h4>
                        <ul className="space-y-1.5">
                          {tier.features.map((feature, index) => (
                            <li
                              key={index}
                              className={`flex items-start gap-2 text-xs ${
                                tier.popular ? "text-zinc-200" : "text-zinc-700"
                              }`}
                            >
                              <FaCheck
                                className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                                  tier.popular
                                    ? "text-zinc-300"
                                    : "text-emerald-600"
                                }`}
                              />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {tier.limitations.length > 0 && (
                        <div className="space-y-2">
                          <h4
                            className={`font-medium flex items-center gap-2 text-xs sm:text-sm ${
                              tier.popular ? "text-zinc-200" : "text-zinc-700"
                            }`}
                          >
                            <FaTimes
                              className={`w-3 h-3 ${
                                tier.popular ? "text-zinc-400" : "text-zinc-500"
                              }`}
                            />
                            Limitations
                          </h4>
                          <ul className="space-y-1.5">
                            {tier.limitations.map((limitation, index) => (
                              <li
                                key={index}
                                className={`flex items-start gap-2 text-xs ${
                                  tier.popular
                                    ? "text-zinc-300"
                                    : "text-zinc-500"
                                }`}
                              >
                                <FaTimes
                                  className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                                    tier.popular
                                      ? "text-zinc-400"
                                      : "text-zinc-400"
                                  }`}
                                />
                                {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-3">
                        <Button
                          size="sm"
                          className={`w-full text-sm ${
                            tier.popular
                              ? "bg-zinc-100 hover:bg-zinc-200 text-emerald-900"
                              : isSelected
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                              : "bg-emerald-800 hover:bg-emerald-700 text-white"
                          }`}
                          onClick={() => setSelectedTier(tier.id)}
                        >
                          {isSelected ? "Selected Plan" : "Select Plan"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons */}

            {/* Notes and Guidelines */}
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <FaInfoCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-amber-900 text-sm sm:text-base">
                      Membership Guidelines & Notes
                    </CardTitle>
                    <CardDescription className="text-amber-700 text-xs sm:text-sm">
                      Important information about your membership
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-amber-900 flex items-center gap-2 text-sm sm:text-base">
                      <FaShieldAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                      Terms & Conditions
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-amber-800">
                      <li className="flex items-start gap-2">
                        <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Membership fees are billed monthly in advance
                      </li>
                      <li className="flex items-start gap-2">
                        <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Cancellation requires 30 days notice
                      </li>
                      <li className="flex items-start gap-2">
                        <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Unused bookings do not roll over to next month
                      </li>
                      <li className="flex items-start gap-2">
                        <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        All bookings subject to celebrity availability
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-semibold text-amber-900 flex items-center gap-2 text-sm sm:text-base">
                      <FaExclamationTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Important Notes
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-amber-800">
                      <li className="flex items-start gap-2">
                        <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Membership activation is immediate upon payment
                      </li>
                      <li className="flex items-start gap-2">
                        <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Physical cards take 5-7 business days to arrive
                      </li>
                      <li className="flex items-start gap-2">
                        <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Premium features unlock after first successful booking
                      </li>
                      <li className="flex items-start gap-2">
                        <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        Contact support for any membership questions
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
