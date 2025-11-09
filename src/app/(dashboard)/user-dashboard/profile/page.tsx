"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { UsersApi } from "@/api/users.api";
import { UserNotificationsApi, type NotificationDto } from "@/api/notifications.api";
import type { IUser } from "@/lib/models/user.model";
import { ChangePasswordSchema, UpdateSelfSchema, type UpdateSelfFormData } from "@/utils/schemas/schemas";
import { toast } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { User, MapPin, Calendar, Camera, Save, Edit3, X, Lock, Bell, RefreshCcw, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToCloudinary } from "@/utils/upload-to-cloudinary";

const ChangePasswordWithConfirmSchema = ChangePasswordSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((vals) => vals.newPassword === vals.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type ChangePasswordWithConfirm = z.infer<typeof ChangePasswordWithConfirmSchema>;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<IUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadPct, setUploadPct] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"personal" | "security" | "notifications">("personal");
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors, isDirty },
    setValue,
  } = useForm<UpdateSelfFormData>({
    resolver: zodResolver(UpdateSelfSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
      profileImage: null,
      bio: "",
      address: { street: "", city: "", state: "", country: "", zipCode: "", timezone: "" },
    },
    mode: "onChange",
  });

  const profileImage = watch("profileImage");

  const {
    register: regPwd,
    handleSubmit: submitPwd,
    reset: resetPwd,
    formState: pwdState,
    watch: watchPwd,
  } = useForm<ChangePasswordWithConfirm>({
    resolver: zodResolver(ChangePasswordWithConfirmSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onChange",
  });

  const [noti, setNoti] = useState<{ items: NotificationDto[]; total: number; page: number; limit: number }>({
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  const [notiLoading, setNotiLoading] = useState(false);
  const [notiMoreLoading, setNotiMoreLoading] = useState(false);
  const [notiMarking, setNotiMarking] = useState(false);

  const unreadCount = useMemo(() => noti.items.filter((n) => !n.read).length, [noti.items]);
  const hasMore = noti.items.length < noti.total;

  const loadMe = async () => {
    const u = await UsersApi.me();
    setMe(u);
    reset({
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      phone: u.phone ?? "",
      dateOfBirth: u.dateOfBirth ?? "",
      profileImage: u.profileImage ?? null,
      bio: u.bio ?? "",
      address: {
        street: u.address?.street ?? "",
        city: u.address?.city ?? "",
        state: u.address?.state ?? "",
        country: u.address?.country ?? "",
        zipCode: u.address?.zipCode ?? "",
        timezone: u.address?.timezone ?? "",
      },
    });
  };

  const loadNotifications = async (opts?: { reset?: boolean }) => {
    try {
      if (opts?.reset) setNoti((p) => ({ ...p, page: 1 }));
      if (opts?.reset) setNotiLoading(true);
      if (!opts?.reset) setNotiMoreLoading(true);
      const page = opts?.reset ? 1 : noti.page;
      const res = await UserNotificationsApi.myList({ page, limit: noti.limit });
      setNoti((prev) => ({
        ...res,
        items: opts?.reset ? res.items : [...prev.items, ...res.items],
      }));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to load notifications");
    } finally {
      setNotiLoading(false);
      setNotiMoreLoading(false);
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications({ reset: true });
  };

  const loadMoreNotifications = async () => {
    if (!hasMore || notiMoreLoading) return;
    setNoti((p) => ({ ...p, page: p.page + 1 }));
    await loadNotifications();
  };

  const markAllNotiRead = async () => {
    if (unreadCount === 0 || notiMarking) return;
    try {
      setNotiMarking(true);
      await UserNotificationsApi.markAllRead();
      setNoti((prev) => ({ ...prev, items: prev.items.map((n) => ({ ...n, read: true })) }));
    } finally {
      setNotiMarking(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await Promise.all([loadMe(), refreshNotifications()]);
      } catch (e: any) {
        toast.error(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let t: any;
    if (activeTab === "notifications" && unreadCount > 0) {
      t = setTimeout(() => {
        markAllNotiRead();
      }, 450);
    }
    return () => clearTimeout(t);
  }, [activeTab, unreadCount]);

  useEffect(() => {
    if (activeTab !== "notifications") return;
    const id = setInterval(refreshNotifications, 30000);
    return () => clearInterval(id);
  }, [activeTab]);

  const onPickImage = () => fileRef.current?.click();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadPct(1);
      const res = await uploadToCloudinary(file, { onProgress: (pct) => setUploadPct(pct) });
      setValue("profileImage", res.url, { shouldDirty: true });
      toast.success("Photo uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploadPct(0);
    }
  };

  const onSubmit = async (data: UpdateSelfFormData) => {
    try {
      const updated = await UsersApi.updateMe(data);
      setMe(updated);
      setIsEditing(false);
      reset({
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        phone: updated.phone ?? "",
        dateOfBirth: updated.dateOfBirth ?? "",
        profileImage: updated.profileImage ?? null,
        bio: updated.bio ?? "",
        address: {
          street: updated.address?.street ?? "",
          city: updated.address?.city ?? "",
          state: updated.address?.state ?? "",
          country: updated.address?.country ?? "",
          zipCode: updated.address?.zipCode ?? "",
          timezone: updated.address?.timezone ?? "",
        },
      });
      loadMe();
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update profile");
    }
  };

  const onChangePassword = async (vals: ChangePasswordWithConfirm) => {
    try {
      await UsersApi.changeMyPassword({ oldPassword: vals.oldPassword, newPassword: vals.newPassword });
      resetPwd();
      toast.success("Password updated");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to change password");
    }
  };

  const initials = (first?: string, last?: string) => [first?.[0] ?? "", last?.[0] ?? ""].join("").toUpperCase() || "U";
  const fullName = `${me?.firstName ?? ""} ${me?.lastName ?? ""}`.trim() || me?.email || "";

  const newPwd = watchPwd("newPassword");
  const confirmPwd = watchPwd("confirmPassword");
  const passwordsMatch = !!newPwd && !!confirmPwd && newPwd === confirmPwd;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100 px-2 sm:px-3">
          <div className="@container/main flex flex-1 flex-col gap-4 sm:gap-6 px-3 sm:px-6 py-4 sm:py-6">
            <DynamicPageHeader title="Profile Settings" subtitle="Manage your account information and preferences" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-1">
                <Card className="bg-white">
                  <CardHeader className="text-center pb-3 sm:pb-4">
                    <div className="relative inline-block">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 sm:border-4 bg-zinc-100">
                        <AvatarImage src={(profileImage as string) || me?.profileImage || ""} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 text-2xl font-semibold">
                          {initials(me?.firstName, me?.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="icon"
                        className="absolute -bottom-2 -right-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-8 h-8"
                        onClick={onPickImage}
                        isLoading={uploadPct > 0}
                        loadingText={`${uploadPct}%`}
                        disabled={!isEditing}
                        preserveWidth
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                      <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={onFile} />
                    </div>
                    <CardTitle className="mt-2 sm:mt-3 text-base sm:text-lg text-emerald-900 break-words">{loading ? "Loading…" : fullName}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-zinc-600 break-words">{me?.email}</CardDescription>
                    {uploadPct > 0 && <div className="mt-2 sm:mt-3 text-xs text-zinc-600">Uploading… {uploadPct}%</div>}
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-zinc-600 truncate">Member since {me ? new Date(me.createdAt).toLocaleString() : "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-zinc-600 truncate">
                        {[me?.address?.city, me?.address?.state, me?.address?.country].filter(Boolean).join(", ") || "—"}
                      </span>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="mb-1 sm:mb-2 text-sm sm:text-base font-semibold text-emerald-900">Bio</h4>
                      <p className="text-xs sm:text-sm text-zinc-600 break-words">{me?.bio || "—"}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-emerald-50">
                    <TabsTrigger value="personal" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-xs sm:text-sm">
                      <User className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Personal</span><span className="sm:hidden">Info</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-xs sm:text-sm">
                      <Lock className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Security</span><span className="sm:hidden">Pass</span>
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-800 data-[state=active]:text-white text-xs sm:text-sm">
                      <Bell className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Notifications</span><span className="sm:hidden">Notif</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="mt-3">
                    <Card className="bg-white">
                      <CardHeader className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-emerald-900">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            <span className="truncate">Personal Information</span>
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">Update your personal details</CardDescription>
                        </div>
                        {!isEditing ? (
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="bg-emerald-800 text-zinc-100 hover:bg-emerald-700 w-full sm:w-auto"
                          >
                            <Edit3 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Edit
                          </Button>
                        ) : (
                          <div className="flex flex-col gap-2 sm:flex-row w-full sm:w-auto">
                            <Button
                              variant="outline"
                              className="border-red-300 text-red-700 hover:bg-red-50 w-full sm:w-auto"
                              onClick={() => {
                                reset();
                                setIsEditing(false);
                              }}
                              disabled={isSubmitting}
                              disableWhileLoading
                              preserveWidth
                              isLoading={false}
                            >
                              <X className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Cancel
                            </Button>
                            <Button
                              onClick={handleSubmit(onSubmit)}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 w-full sm:w-auto"
                              isLoading={isSubmitting}
                              loadingText="Saving…"
                              disabled={!isDirty}
                              preserveWidth
                            >
                              <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Save
                            </Button>
                          </div>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <Label>First name</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("firstName")} className="bg-zinc-100" />
                            {errors.firstName?.message && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                          </div>
                          <div>
                            <Label>Last name</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("lastName")} className="bg-zinc-100" />
                            {errors.lastName?.message && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input disabled value={me?.email ?? ""} className="bg-zinc-100" />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("phone")} className="bg-zinc-100" />
                            {errors.phone?.message && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                          </div>
                          <div>
                            <Label>Date of birth</Label>
                            <Input type="date" disabled={!isEditing || isSubmitting} {...register("dateOfBirth")} className="bg-zinc-100" />
                            {errors.dateOfBirth?.message && <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth.message}</p>}
                          </div>
                          <div>
                            <Label>Timezone</Label>
                            <Input
                              placeholder="e.g., America/New_York"
                              disabled={!isEditing || isSubmitting}
                              {...register("address.timezone")}
                              className="bg-zinc-100"
                            />
                            {errors.address?.timezone?.message && <p className="mt-1 text-xs text-red-600">{errors.address.timezone?.message}</p>}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Textarea rows={3} disabled={!isEditing || isSubmitting} {...register("bio")} className="bg-zinc-100" />
                          {errors.bio?.message && <p className="mt-1 text-xs text-red-600">{errors.bio.message}</p>}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <Label>Street</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("address.street")} className="bg-zinc-100" />
                            {errors.address?.street?.message && <p className="mt-1 text-xs text-red-600">{errors.address.street.message}</p>}
                          </div>
                          <div>
                            <Label>City</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("address.city")} className="bg-zinc-100" />
                            {errors.address?.city?.message && <p className="mt-1 text-xs text-red-600">{errors.address.city.message}</p>}
                          </div>
                          <div>
                            <Label>State/Region</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("address.state")} className="bg-zinc-100" />
                            {errors.address?.state?.message && <p className="mt-1 text-xs text-red-600">{errors.address.state.message}</p>}
                          </div>
                          <div>
                            <Label>Country</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("address.country")} className="bg-zinc-100" />
                            {errors.address?.country?.message && <p className="mt-1 text-xs text-red-600">{errors.address.country.message}</p>}
                          </div>
                          <div>
                            <Label>Zip/Postal</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("address.zipCode")} className="bg-zinc-100" />
                            {errors.address?.zipCode?.message && <p className="mt-1 text-xs text-red-600">{errors.address.zipCode.message}</p>}
                          </div>
                          <div>
                            <Label>Profile image URL</Label>
                            <Input disabled={!isEditing || isSubmitting} {...register("profileImage")} placeholder="https://…" className="bg-zinc-100" />
                            {errors.profileImage?.message && <p className="mt-1 text-xs text-red-600">{errors.profileImage.message as any}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="mt-3">
                    <Card className="bg-white">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-900">
                          <Lock className="h-5 w-5" />
                          Change Password
                        </CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                      </CardHeader>

                      <form onSubmit={submitPwd(onChangePassword)}>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Current password</Label>
                            <Input type="password" {...regPwd("oldPassword")} className="bg-zinc-100" disabled={pwdState.isSubmitting} />
                            {pwdState.errors.oldPassword?.message && (
                              <p className="mt-1 text-xs text-red-600">{pwdState.errors.oldPassword.message}</p>
                            )}
                          </div>
                          <div>
                            <Label>New password</Label>
                            <Input type="password" {...regPwd("newPassword")} className="bg-zinc-100" disabled={pwdState.isSubmitting} />
                            {pwdState.errors.newPassword?.message && (
                              <p className="mt-1 text-xs text-red-600">{pwdState.errors.newPassword.message}</p>
                            )}
                          </div>
                          <div>
                            <Label>Confirm new password</Label>
                            <Input
                              type="password"
                              {...regPwd("confirmPassword")}
                              className={cn(
                                "bg-zinc-100",
                                confirmPwd
                                  ? passwordsMatch
                                    ? "ring-1 ring-emerald-500 focus-visible:ring-emerald-500"
                                    : "ring-1 ring-red-400 focus-visible:ring-red-500"
                                  : ""
                              )}
                              disabled={pwdState.isSubmitting}
                            />
                            {pwdState.errors.confirmPassword?.message ? (
                              <p className="mt-1 text-xs text-red-600">{pwdState.errors.confirmPassword.message}</p>
                            ) : confirmPwd ? (
                              <p className={cn("mt-1 text-xs", passwordsMatch ? "text-emerald-600" : "text-red-600")}>
                                {passwordsMatch ? "Passwords match ✓" : "Passwords do not match"}
                              </p>
                            ) : null}
                          </div>
                          <div className="pt-2">
                            <Button
                              type="submit"
                              className="bg-emerald-600 text-white hover:bg-emerald-700"
                              isLoading={pwdState.isSubmitting}
                              loadingText="Updating…"
                              preserveWidth
                              disabled={pwdState.isSubmitting || !passwordsMatch}
                            >
                              Update Password
                            </Button>
                          </div>
                        </CardContent>
                      </form>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notifications" className="mt-3">
                    <Card className="bg-white">
                      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-emerald-900">
                            <Bell className="h-5 w-5" />
                            Notifications
                          </CardTitle>
                          <CardDescription>Latest updates for your account. Opening this tab marks new alerts as read automatically.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={refreshNotifications}
                            isLoading={notiLoading}
                            loadingText="Refreshing…"
                            className="hover:bg-emerald-50"
                            preserveWidth
                          >
                            <RefreshCcw className={cn("mr-2 h-4 w-4", notiLoading && "invisible")} />
                            Refresh
                          </Button>
                          <Button
                            variant="outline"
                            onClick={markAllNotiRead}
                            disabled={unreadCount === 0}
                            isLoading={notiMarking}
                            loadingText="Marking…"
                            preserveWidth
                          >
                            <CheckCheck className={cn("mr-2 h-4 w-4", (notiMarking || unreadCount === 0) && "invisible")} />
                            Mark all read
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="rounded-md border">
                          <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-zinc-600">
                            <span>Total: {noti.total}</span>
                            <span>Unread: {unreadCount}</span>
                          </div>

                          <div className="max-h-[440px] overflow-y-auto">
                            {notiLoading ? (
                              <div className="py-10 text-center text-sm text-zinc-500">Loading…</div>
                            ) : noti.items.length === 0 ? (
                              <div className="py-12 text-center text-sm text-zinc-500">You’re all caught up 🎉</div>
                            ) : (
                              <ul className="divide-y">
                                {noti.items.map((n) => (
                                  <li key={n._id} className="p-4 hover:bg-zinc-50">
                                    <div className="flex items-start gap-3">
                                      <div className={cn("mt-1 h-2 w-2 rounded-full", n.read ? "bg-zinc-300" : "bg-amber-500")} />
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                          <p className="truncate text-sm font-medium text-zinc-900">{n.title}</p>
                                          <p className="shrink-0 text-[11px] text-zinc-400">{new Date(n.createdAt).toLocaleString()}</p>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{n.message}</p>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>

                          <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-zinc-500">
                              Showing {noti.items.length} of {noti.total}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={loadMoreNotifications}
                              isLoading={notiMoreLoading}
                              loadingText="Loading…"
                              disabled={!hasMore || notiMoreLoading}
                              preserveWidth
                            >
                              {hasMore ? "Load more" : "No more"}
                            </Button>
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
