"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  DollarSign,
  Star,
  Ban,
  CheckCircle2,
  Edit,
  Trash2,
  MessageCircle,
  Shield,
} from "lucide-react";

interface UserManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function UserManagementModal({
  open,
  onOpenChange,
  user,
}: UserManagementModalProps) {
  if (!user) return null;

  const statusConfig = {
    active: {
      color: "text-emerald-900",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-900",
      label: "ACTIVE",
    },
    suspended: {
      color: "text-red-900",
      bgColor: "bg-red-50",
      borderColor: "border-red-900",
      label: "SUSPENDED",
    },
    pending: {
      color: "text-amber-900",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-900",
      label: "PENDING",
    },
  };

  const config = statusConfig[user.status as keyof typeof statusConfig];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-zinc-200 rounded-2xl p-0">
        <DialogHeader className="border-b-2 border-zinc-200 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-zinc-900">
                {user.name}
              </DialogTitle>
              <p className="text-sm font-mono text-zinc-600 mt-1">
                {user.email}
              </p>
            </div>
            <Badge
              className={`${config.bgColor} ${config.color} border-2 ${config.borderColor} font-mono`}
            >
              {config.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* User Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border-2 border-blue-900 rounded-xl bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-blue-900" />
                <p className="text-xs font-mono text-blue-700">
                  TOTAL BOOKINGS
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {user.bookings}
              </p>
            </div>
            <div className="border-2 border-emerald-900 rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="size-4 text-emerald-900" />
                <p className="text-xs font-mono text-emerald-700">
                  TOTAL SPENT
                </p>
              </div>
              <p className="text-2xl font-bold text-emerald-900">$4,250</p>
            </div>
            <div className="border-2 border-amber-900 rounded-xl bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="size-4 text-amber-900" />
                <p className="text-xs font-mono text-amber-700">MEMBER SINCE</p>
              </div>
              <p className="text-sm font-mono font-bold text-amber-900">
                {user.joined}
              </p>
            </div>
          </div>

          {/* User Details */}
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList className="bg-white border-2 border-zinc-200 rounded-xl p-1">
              <TabsTrigger value="info" className="rounded-lg">
                Information
              </TabsTrigger>
              <TabsTrigger value="activity" className="rounded-lg">
                Activity
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-lg">
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="border-2 border-zinc-200 rounded-xl bg-white p-4">
                <h3 className="text-sm font-mono text-zinc-600 mb-4">
                  USER INFORMATION
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                    <span className="text-sm text-zinc-600">Full Name</span>
                    <span className="text-sm font-medium text-zinc-900">
                      {user.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                    <span className="text-sm text-zinc-600">Email Address</span>
                    <span className="text-sm font-mono text-zinc-900">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                    <span className="text-sm text-zinc-600">
                      Account Status
                    </span>
                    <Badge
                      className={`${config.bgColor} ${config.color} border-2 ${config.borderColor} font-mono text-xs`}
                    >
                      {config.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-zinc-600">Member Since</span>
                    <span className="text-sm font-mono text-zinc-900">
                      {user.joined}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="border-2 border-zinc-200 rounded-xl bg-white p-4">
                <h3 className="text-sm font-mono text-zinc-600 mb-4">
                  RECENT ACTIVITY
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-2">
                    <div className="size-8 rounded-lg bg-purple-50 border-2 border-purple-900 flex items-center justify-center">
                      <Calendar className="size-4 text-purple-900" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        Booked Summer Music Festival
                      </p>
                      <p className="text-xs text-zinc-600 font-mono">
                        2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2">
                    <div className="size-8 rounded-lg bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                      <DollarSign className="size-4 text-emerald-900" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        Deposited $500
                      </p>
                      <p className="text-xs text-zinc-600 font-mono">
                        5 days ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="border-2 border-zinc-200 rounded-xl bg-white p-4">
                <h3 className="text-sm font-mono text-zinc-600 mb-4">
                  SECURITY SETTINGS
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Shield className="size-4 text-emerald-900" />
                      <span className="text-sm text-zinc-900">
                        Two-Factor Authentication
                      </span>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                      ENABLED
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button
              variant="outline"
              className="border-2 border-zinc-200 rounded-xl h-12 bg-transparent hover:bg-zinc-50"
            >
              <Edit className="size-4 mr-2" />
              Edit User
            </Button>
            <Button
              variant="outline"
              className="border-2 border-zinc-200 rounded-xl h-12 bg-transparent hover:bg-zinc-50"
            >
              <MessageCircle className="size-4 mr-2" />
              Send Message
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {user.status === "active" ? (
              <Button
                variant="outline"
                className="border-2 border-red-200 rounded-xl h-12 bg-transparent hover:bg-red-50 text-red-900"
              >
                <Ban className="size-4 mr-2" />
                Suspend User
              </Button>
            ) : (
              <Button className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl h-12">
                <CheckCircle2 className="size-4 mr-2" />
                Activate User
              </Button>
            )}
            <Button
              variant="outline"
              className="border-2 border-red-200 rounded-xl h-12 bg-transparent hover:bg-red-50 text-red-900"
            >
              <Trash2 className="size-4 mr-2" />
              Delete User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
