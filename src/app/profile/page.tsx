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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Bell,
  Eye,
  EyeOff,
  Camera,
  Save,
  Edit3,
  Check,
  X,
  Lock,
  Settings,
  CreditCard,
  Globe,
  Smartphone,
} from "lucide-react";
import { useState, useRef } from "react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock user data - in a real app, this would come from an API
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "Los Angeles, CA",
    joinDate: "October 2024",
    membership: "Premium",
    avatar: null as string | null,
    bio: "Passionate about exclusive experiences and celebrity encounters.",
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
    },
  });

  const [formData, setFormData] = useState(userData);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setUserData({ ...formData, avatar: profileImage || null });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setFormData(userData);
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword === passwordData.confirmPassword) {
      // In a real app, this would make an API call
      console.log("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader
              title="Profile Settings"
              subtitle="Manage your account information and preferences"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Profile Overview Card */}
              <div className="lg:col-span-1 order-1 lg:order-1">
                <Card className="bg-white">
                  <CardHeader className="text-center pb-4 px-4 sm:px-6">
                    <div className="relative inline-block">
                      <Avatar className="w-20 h-20 sm:w-24 sm:h-24 mx-auto border-4 bg-zinc-100">
                        <AvatarImage
                          src={profileImage || userData.avatar || ""}
                        />
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 text-lg sm:text-2xl font-semibold">
                          {getInitials(userData.name)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-emerald-900">
                      {userData.name}
                    </CardTitle>
                    <CardDescription className="text-zinc-600 text-sm sm:text-base">
                      {userData.email}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-zinc-600">
                        Member since {userData.joinDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-zinc-600">{userData.location}</span>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-emerald-900 mb-2">
                        Bio
                      </h4>
                      <p className="text-sm text-zinc-600">{userData.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content with Tabs */}
              <div className="lg:col-span-2 order-2 lg:order-2">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-emerald-50 h-auto">
                    <TabsTrigger
                      value="personal"
                      className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 text-xs sm:text-sm py-2 sm:py-3"
                    >
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Personal</span>
                      <span className="sm:hidden">Info</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 text-xs sm:text-sm py-2 sm:py-3"
                    >
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Security</span>
                      <span className="sm:hidden">Pass</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="notifications"
                      className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-emerald-700 text-xs sm:text-sm py-2 sm:py-3"
                    >
                      <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Notifications</span>
                      <span className="sm:hidden">Alerts</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Information Tab */}
                  <TabsContent value="personal" className="mt-3">
                    <Card className="bg-white">
                      <CardHeader className="px-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-emerald-900 text-lg sm:text-xl">
                              <User className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-base sm:text-lg">
                                Personal Information
                              </span>
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Update your personal details
                            </CardDescription>
                          </div>
                          {!isEditing ? (
                            <Button
                              variant="outline"
                              onClick={() => setIsEditing(true)}
                              className="bg-emerald-800 text-zinc-100 rounded-lg hover:bg-emerald-50 w-full sm:w-auto"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSaveProfile}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                              >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 px-4 sm:px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="name"
                              className="text-emerald-900 font-medium"
                            >
                              Full Name
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="bg-zinc-100 focus:border-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="email"
                              className="text-emerald-900 font-medium"
                            >
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  email: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="bg-zinc-100 focus:border-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="phone"
                              className="text-emerald-900 font-medium"
                            >
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="bg-zinc-100 focus:border-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="location"
                              className="text-emerald-900 font-medium"
                            >
                              Location
                            </Label>
                            <Input
                              id="location"
                              value={formData.location}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  location: e.target.value,
                                })
                              }
                              disabled={!isEditing}
                              className="bg-zinc-100 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label
                            htmlFor="bio"
                            className="text-emerald-900 font-medium"
                          >
                            Bio
                          </Label>
                          <textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) =>
                              setFormData({ ...formData, bio: e.target.value })
                            }
                            disabled={!isEditing}
                            rows={3}
                            className="w-full px-3 py-2 border bg-zinc-100 rounded-md focus:border-emerald-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 text-sm sm:text-base"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Security Tab */}
                  <TabsContent value="security" className="mt-3">
                    <Card className="bg-white">
                      <CardHeader className="px-4 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-emerald-900 text-lg sm:text-xl">
                          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-base sm:text-lg">
                            Change Password
                          </span>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Update your account password
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 px-4 sm:px-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="current-password"
                            className="text-emerald-900 font-medium"
                          >
                            Current Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="bg-zinc-100 focus:border-emerald-500 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="new-password"
                            className="text-emerald-900 font-medium"
                          >
                            New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              className="bg-zinc-100 focus:border-emerald-500 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="confirm-password"
                            className="text-emerald-900 font-medium"
                          >
                            Confirm New Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="bg-zinc-100 focus:border-emerald-500 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <Button
                          onClick={handlePasswordChange}
                          disabled={
                            !passwordData.currentPassword ||
                            !passwordData.newPassword ||
                            passwordData.newPassword !==
                              passwordData.confirmPassword
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Update Password
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="mt-3">
                    <Card className="bg-white">
                      <CardHeader className="px-4 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-emerald-900 text-lg sm:text-xl">
                          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-base sm:text-lg">
                            Notification Settings
                          </span>
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Manage your notification preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 px-4 sm:px-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <Label className="text-emerald-900 font-medium text-sm sm:text-base">
                                Email Notifications
                              </Label>
                              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                                Receive updates via email
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={userData.notifications.email}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  notifications: {
                                    ...userData.notifications,
                                    email: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 flex-shrink-0 mt-1"
                            />
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <Label className="text-emerald-900 font-medium text-sm sm:text-base">
                                Push Notifications
                              </Label>
                              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                                Receive push notifications
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={userData.notifications.push}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  notifications: {
                                    ...userData.notifications,
                                    push: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 flex-shrink-0 mt-1"
                            />
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <Label className="text-emerald-900 font-medium text-sm sm:text-base">
                                SMS Notifications
                              </Label>
                              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                                Receive SMS updates
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={userData.notifications.sms}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  notifications: {
                                    ...userData.notifications,
                                    sms: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 flex-shrink-0 mt-1"
                            />
                          </div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <Label className="text-emerald-900 font-medium text-sm sm:text-base">
                                Marketing Emails
                              </Label>
                              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                                Receive promotional content
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              checked={userData.notifications.marketing}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  notifications: {
                                    ...userData.notifications,
                                    marketing: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500 flex-shrink-0 mt-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
