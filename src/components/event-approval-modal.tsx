"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Calendar, Users, Clock } from "lucide-react";

interface EventApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
}

export function EventApprovalModal({
  open,
  onOpenChange,
  event,
}: EventApprovalModalProps) {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-zinc-200 rounded-2xl p-0">
        <DialogHeader className="border-b-2 border-zinc-200 p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-zinc-900">
                {event.title}
              </DialogTitle>
              <p className="text-sm text-zinc-600 mt-1">
                Review event details before approval
              </p>
            </div>
            <Badge className="bg-amber-50 text-amber-900 border-2 border-amber-900 font-mono">
              <Clock className="size-3 mr-1" />
              PENDING
            </Badge>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Event Image */}
          <div className="border-2 border-zinc-200 rounded-xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-zinc-100 to-zinc-50 flex items-center justify-center">
              <Calendar className="size-16 text-zinc-400" />
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-blue-900 rounded-xl bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="size-4 text-blue-900" />
                <p className="text-xs font-mono text-blue-700">EVENT DATE</p>
              </div>
              <p className="text-lg font-bold text-blue-900">{event.date}</p>
            </div>
            <div className="border-2 border-purple-900 rounded-xl bg-purple-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="size-4 text-purple-900" />
                <p className="text-xs font-mono text-purple-700">
                  EXPECTED ATTENDEES
                </p>
              </div>
              <p className="text-lg font-bold text-purple-900">
                {event.attendees.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Organizer Info */}
          <div className="border-2 border-zinc-200 rounded-xl bg-white p-4">
            <h3 className="text-sm font-mono text-zinc-600 mb-4">
              ORGANIZER INFORMATION
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-sm text-zinc-600">Organizer Name</span>
                <span className="text-sm font-medium text-zinc-900">
                  {event.organizer}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100">
                <span className="text-sm text-zinc-600">Contact Email</span>
                <span className="text-sm font-mono text-zinc-900">
                  contact@{event.organizer.toLowerCase()}.com
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-600">Previous Events</span>
                <span className="text-sm font-bold text-zinc-900">
                  12 events
                </span>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div className="border-2 border-zinc-200 rounded-xl bg-white p-4">
            <h3 className="text-sm font-mono text-zinc-600 mb-3">
              EVENT DESCRIPTION
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed">
              Join us for an unforgettable experience featuring world-class
              entertainment, amazing food, and incredible atmosphere. This event
              promises to be one of the highlights of the year with performances
              from top artists and activities for all ages.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl h-12 font-bold">
              <CheckCircle2 className="size-5 mr-2" />
              Approve Event
            </Button>
            <Button
              variant="outline"
              className="border-2 border-red-200 rounded-xl h-12 bg-transparent hover:bg-red-50 text-red-900 font-bold"
            >
              <XCircle className="size-5 mr-2" />
              Reject Event
            </Button>
          </div>

          {/* Admin Notes */}
          <div className="border-2 border-blue-200 rounded-xl bg-blue-50 p-4">
            <h3 className="text-sm font-bold text-blue-900 mb-2">
              Admin Notes
            </h3>
            <p className="text-sm text-blue-800">
              Review all event details carefully before approval. Ensure the
              organizer has proper permits and insurance documentation.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
 