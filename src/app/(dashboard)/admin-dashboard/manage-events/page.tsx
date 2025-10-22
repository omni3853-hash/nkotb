"use client";

import { useState, useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { DynamicPageHeader } from "@/components/dynamic-page-header";
import { Card } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  Eye,
  TrendingUp,
  Flame,
  Zap,
  PlusIcon,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreHorizontal,
  Image,
  DollarSign,
  Calendar as CalendarIcon,
  Settings,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  Upload,
} from "lucide-react";

// Event interface
interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  image: string;
  description: string;
  attendees: number;
  featured: boolean;
  trending: boolean;
  ticketsLeft: number;
  totalTickets: number;
  rating: number;
  reviews: number;
  viewsToday: number;
  bookingsToday: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Dynamic metrics with ranges
  metrics: {
    ratingRange: { min: number; max: number };
    reviewsRange: { min: number; max: number };
    viewsTodayRange: { min: number; max: number };
    bookingsTodayRange: { min: number; max: number };
    ticketsLeftRange: { min: number; max: number };
  };
}

// Sample events data
const initialEvents: Event[] = [
  {
    id: 1,
    title: "Summer Music Festival",
    date: "July 15, 2024",
    time: "6:00 PM",
    location: "Central Park, NYC",
    price: 150,
    category: "Music",
    image: "/summer-music-festival-concert-stage.jpg",
    description:
      "Join us for an unforgettable summer music experience featuring top artists from around the world.",
    attendees: 5000,
    featured: true,
    trending: true,
    ticketsLeft: 45,
    totalTickets: 5000,
    rating: 4.8,
    reviews: 342,
    viewsToday: 1247,
    bookingsToday: 23,
    status: "selling-fast",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
    metrics: {
      ratingRange: { min: 4.5, max: 5.0 },
      reviewsRange: { min: 300, max: 500 },
      viewsTodayRange: { min: 1000, max: 2000 },
      bookingsTodayRange: { min: 15, max: 35 },
      ticketsLeftRange: { min: 30, max: 60 },
    },
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    date: "August 22, 2024",
    time: "9:00 AM",
    location: "Convention Center",
    price: 299,
    category: "Technology",
    image: "/tech-conference-modern-stage-presentation.jpg",
    description:
      "The biggest tech conference of the year with industry leaders and innovative startups.",
    attendees: 2500,
    featured: true,
    trending: true,
    ticketsLeft: 234,
    totalTickets: 2500,
    rating: 4.9,
    reviews: 189,
    viewsToday: 892,
    bookingsToday: 15,
    status: "hot",
    createdAt: "2024-01-02",
    updatedAt: "2024-01-16",
    metrics: {
      ratingRange: { min: 4.7, max: 5.0 },
      reviewsRange: { min: 150, max: 250 },
      viewsTodayRange: { min: 800, max: 1200 },
      bookingsTodayRange: { min: 10, max: 25 },
      ticketsLeftRange: { min: 200, max: 300 },
    },
  },
  {
    id: 3,
    title: "Art Gallery Opening",
    date: "September 5, 2024",
    time: "7:00 PM",
    location: "Modern Art Museum",
    price: 75,
    category: "Art",
    image: "/contemporary-art-gallery.png",
    description:
      "Exclusive opening of contemporary art exhibition featuring emerging artists.",
    attendees: 200,
    featured: false,
    trending: false,
    ticketsLeft: 89,
    totalTickets: 200,
    rating: 4.6,
    reviews: 67,
    viewsToday: 234,
    bookingsToday: 8,
    status: "available",
    createdAt: "2024-01-03",
    updatedAt: "2024-01-17",
    metrics: {
      ratingRange: { min: 4.0, max: 4.8 },
      reviewsRange: { min: 50, max: 100 },
      viewsTodayRange: { min: 200, max: 400 },
      bookingsTodayRange: { min: 5, max: 15 },
      ticketsLeftRange: { min: 70, max: 120 },
    },
  },
];

const categories = [
  "Music",
  "Technology",
  "Art",
  "Food & Drink",
  "Entertainment",
  "Sports & Fitness",
  "Business",
  "Education",
];

const statusOptions = [
  {
    value: "available",
    label: "Available",
    color: "bg-emerald-50 text-emerald-900 border-emerald-900",
  },
  {
    value: "selling-fast",
    label: "Selling Fast",
    color: "bg-orange-50 text-orange-900 border-orange-900",
  },
  {
    value: "almost-full",
    label: "Almost Full",
    color: "bg-red-50 text-red-900 border-red-900",
  },
  {
    value: "hot",
    label: "Hot",
    color: "bg-red-50 text-red-900 border-red-900",
  },
  {
    value: "sold-out",
    label: "Sold Out",
    color: "bg-gray-50 text-gray-900 border-gray-900",
  },
];

// Utility function to generate random values within ranges
const generateRandomValue = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Utility function to update event metrics with random values
const updateEventMetrics = (event: Event): Event => {
  const { metrics } = event;
  return {
    ...event,
    rating: Number(
      generateRandomValue(
        metrics.ratingRange.min,
        metrics.ratingRange.max
      ).toFixed(1)
    ),
    reviews: Math.floor(
      generateRandomValue(metrics.reviewsRange.min, metrics.reviewsRange.max)
    ),
    viewsToday: Math.floor(
      generateRandomValue(
        metrics.viewsTodayRange.min,
        metrics.viewsTodayRange.max
      )
    ),
    bookingsToday: Math.floor(
      generateRandomValue(
        metrics.bookingsTodayRange.min,
        metrics.bookingsTodayRange.max
      )
    ),
    ticketsLeft: Math.floor(
      generateRandomValue(
        metrics.ticketsLeftRange.min,
        metrics.ticketsLeftRange.max
      )
    ),
  };
};

export default function ManageEventsPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<number | null>(null);

  // Refresh metrics for all events
  const refreshEventMetrics = () => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => updateEventMetrics(event))
    );
  };

  // Form state for create/edit
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    price: "",
    category: "",
    image: "",
    description: "",
    attendees: "",
    totalTickets: "",
    featured: false,
    trending: false,
    status: "available",
    // Dynamic metrics ranges
    ratingMin: "4.0",
    ratingMax: "5.0",
    reviewsMin: "0",
    reviewsMax: "100",
    viewsTodayMin: "0",
    viewsTodayMax: "1000",
    bookingsTodayMin: "0",
    bookingsTodayMax: "50",
    ticketsLeftMin: "0",
    ticketsLeftMax: "100",
  });

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All" || event.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      date: "",
      time: "",
      location: "",
      price: "",
      category: "",
      image: "",
      description: "",
      attendees: "",
      totalTickets: "",
      featured: false,
      trending: false,
      status: "available",
      ratingMin: "4.0",
      ratingMax: "5.0",
      reviewsMin: "0",
      reviewsMax: "100",
      viewsTodayMin: "0",
      viewsTodayMax: "1000",
      bookingsTodayMin: "0",
      bookingsTodayMax: "50",
      ticketsLeftMin: "0",
      ticketsLeftMax: "100",
    });
  };

  // Handle create event
  const handleCreateEvent = () => {
    const newEvent: Event = {
      id: Math.max(...events.map((e) => e.id)) + 1,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      price: Number(formData.price),
      category: formData.category,
      image: formData.image || "/placeholder.svg",
      description: formData.description,
      attendees: Number(formData.attendees),
      featured: formData.featured,
      trending: formData.trending,
      ticketsLeft: Number(formData.totalTickets),
      totalTickets: Number(formData.totalTickets),
      rating: 0,
      reviews: 0,
      viewsToday: 0,
      bookingsToday: 0,
      status: formData.status,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      metrics: {
        ratingRange: {
          min: Number(formData.ratingMin),
          max: Number(formData.ratingMax),
        },
        reviewsRange: {
          min: Number(formData.reviewsMin),
          max: Number(formData.reviewsMax),
        },
        viewsTodayRange: {
          min: Number(formData.viewsTodayMin),
          max: Number(formData.viewsTodayMax),
        },
        bookingsTodayRange: {
          min: Number(formData.bookingsTodayMin),
          max: Number(formData.bookingsTodayMax),
        },
        ticketsLeftRange: {
          min: Number(formData.ticketsLeftMin),
          max: Number(formData.ticketsLeftMax),
        },
      },
    };

    setEvents([...events, newEvent]);
    resetForm();
    setIsCreateModalOpen(false);
  };

  // Handle edit event
  const handleEditEvent = () => {
    if (!editingEvent) return;

    const updatedEvent: Event = {
      ...editingEvent,
      title: formData.title,
      date: formData.date,
      time: formData.time,
      location: formData.location,
      price: Number(formData.price),
      category: formData.category,
      image: formData.image || "/placeholder.svg",
      description: formData.description,
      attendees: Number(formData.attendees),
      featured: formData.featured,
      trending: formData.trending,
      ticketsLeft: Number(formData.totalTickets),
      totalTickets: Number(formData.totalTickets),
      status: formData.status,
      updatedAt: new Date().toISOString().split("T")[0],
      metrics: {
        ratingRange: {
          min: Number(formData.ratingMin),
          max: Number(formData.ratingMax),
        },
        reviewsRange: {
          min: Number(formData.reviewsMin),
          max: Number(formData.reviewsMax),
        },
        viewsTodayRange: {
          min: Number(formData.viewsTodayMin),
          max: Number(formData.viewsTodayMax),
        },
        bookingsTodayRange: {
          min: Number(formData.bookingsTodayMin),
          max: Number(formData.bookingsTodayMax),
        },
        ticketsLeftRange: {
          min: Number(formData.ticketsLeftMin),
          max: Number(formData.ticketsLeftMax),
        },
      },
    };

    setEvents(
      events.map((event) =>
        event.id === editingEvent.id ? updatedEvent : event
      )
    );
    resetForm();
    setIsEditModalOpen(false);
    setEditingEvent(null);
  };

  // Handle delete event
  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((event) => event.id !== id));
    setDeleteEventId(null);
  };

  // Open edit modal
  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      price: event.price.toString(),
      category: event.category,
      image: event.image,
      description: event.description,
      attendees: event.attendees.toString(),
      totalTickets: event.totalTickets.toString(),
      featured: event.featured,
      trending: event.trending,
      status: event.status,
      ratingMin: event.metrics.ratingRange.min.toString(),
      ratingMax: event.metrics.ratingRange.max.toString(),
      reviewsMin: event.metrics.reviewsRange.min.toString(),
      reviewsMax: event.metrics.reviewsRange.max.toString(),
      viewsTodayMin: event.metrics.viewsTodayRange.min.toString(),
      viewsTodayMax: event.metrics.viewsTodayRange.max.toString(),
      bookingsTodayMin: event.metrics.bookingsTodayRange.min.toString(),
      bookingsTodayMax: event.metrics.bookingsTodayRange.max.toString(),
      ticketsLeftMin: event.metrics.ticketsLeftRange.min.toString(),
      ticketsLeftMax: event.metrics.ticketsLeftRange.max.toString(),
    });
    setIsEditModalOpen(true);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((s) => s.value === status);
    return (
      <Badge
        className={`font-mono text-xs border-2 ${
          statusOption?.color || "bg-gray-50 text-gray-900 border-gray-900"
        }`}
      >
        {statusOption?.label || status}
      </Badge>
    );
  };

  // Event form component
  const EventForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <Calendar className="h-5 w-5 text-emerald-900" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-zinc-700"
            >
              Event Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter event title"
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="category"
              className="text-sm font-medium text-zinc-700"
            >
              Category *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="date" className="text-sm font-medium text-zinc-700">
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="time" className="text-sm font-medium text-zinc-700">
              Time *
            </Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="price"
              className="text-sm font-medium text-zinc-700"
            >
              Price ($) *
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0"
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="location"
            className="text-sm font-medium text-zinc-700"
          >
            Location *
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Enter event location"
            className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="image" className="text-sm font-medium text-zinc-700">
            Image URL
          </Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            placeholder="Enter image URL"
            className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>

        <div className="space-y-3">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-zinc-700"
          >
            Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter event description"
            className="rounded-xl min-h-[120px] border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Users className="h-5 w-5 text-blue-900" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">Event Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label
              htmlFor="attendees"
              className="text-sm font-medium text-zinc-700"
            >
              Expected Attendees *
            </Label>
            <Input
              id="attendees"
              type="number"
              value={formData.attendees}
              onChange={(e) =>
                setFormData({ ...formData, attendees: e.target.value })
              }
              placeholder="0"
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
          <div className="space-y-3">
            <Label
              htmlFor="totalTickets"
              className="text-sm font-medium text-zinc-700"
            >
              Total Tickets *
            </Label>
            <Input
              id="totalTickets"
              type="number"
              value={formData.totalTickets}
              onChange={(e) =>
                setFormData({ ...formData, totalTickets: e.target.value })
              }
              placeholder="0"
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="status" className="text-sm font-medium text-zinc-700">
            Status *
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <Label
              htmlFor="featured"
              className="text-sm font-medium text-zinc-700"
            >
              Featured Event
            </Label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="trending"
              checked={formData.trending}
              onChange={(e) =>
                setFormData({ ...formData, trending: e.target.checked })
              }
              className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
            />
            <Label
              htmlFor="trending"
              className="text-sm font-medium text-zinc-700"
            >
              Trending Event
            </Label>
          </div>
        </div>
      </div>

      {/* Dynamic Metrics */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-900" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">
            Dynamic Metrics Ranges
          </h3>
          <Badge
            variant="outline"
            className="text-xs text-purple-600 border-purple-200"
          >
            For Real-time Display
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rating Range */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <Label className="text-sm font-medium text-zinc-700">
                Rating Range
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="ratingMin" className="text-xs text-zinc-600">
                  Min Rating
                </Label>
                <Input
                  id="ratingMin"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.ratingMin}
                  onChange={(e) =>
                    setFormData({ ...formData, ratingMin: e.target.value })
                  }
                  className="rounded-lg border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ratingMax" className="text-xs text-zinc-600">
                  Max Rating
                </Label>
                <Input
                  id="ratingMax"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.ratingMax}
                  onChange={(e) =>
                    setFormData({ ...formData, ratingMax: e.target.value })
                  }
                  className="rounded-lg border-yellow-200 focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
            </div>
          </div>

          {/* Reviews Range */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-medium text-zinc-700">
                Reviews Range
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="reviewsMin" className="text-xs text-zinc-600">
                  Min Reviews
                </Label>
                <Input
                  id="reviewsMin"
                  type="number"
                  value={formData.reviewsMin}
                  onChange={(e) =>
                    setFormData({ ...formData, reviewsMin: e.target.value })
                  }
                  className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewsMax" className="text-xs text-zinc-600">
                  Max Reviews
                </Label>
                <Input
                  id="reviewsMax"
                  type="number"
                  value={formData.reviewsMax}
                  onChange={(e) =>
                    setFormData({ ...formData, reviewsMax: e.target.value })
                  }
                  className="rounded-lg border-blue-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Views Today Range */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              <Label className="text-sm font-medium text-zinc-700">
                Views Today Range
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="viewsTodayMin"
                  className="text-xs text-zinc-600"
                >
                  Min Views
                </Label>
                <Input
                  id="viewsTodayMin"
                  type="number"
                  value={formData.viewsTodayMin}
                  onChange={(e) =>
                    setFormData({ ...formData, viewsTodayMin: e.target.value })
                  }
                  className="rounded-lg border-green-200 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="viewsTodayMax"
                  className="text-xs text-zinc-600"
                >
                  Max Views
                </Label>
                <Input
                  id="viewsTodayMax"
                  type="number"
                  value={formData.viewsTodayMax}
                  onChange={(e) =>
                    setFormData({ ...formData, viewsTodayMax: e.target.value })
                  }
                  className="rounded-lg border-green-200 focus:border-green-500 focus:ring-green-500/20"
                />
              </div>
            </div>
          </div>

          {/* Bookings Today Range */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <Label className="text-sm font-medium text-zinc-700">
                Bookings Today Range
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label
                  htmlFor="bookingsTodayMin"
                  className="text-xs text-zinc-600"
                >
                  Min Bookings
                </Label>
                <Input
                  id="bookingsTodayMin"
                  type="number"
                  value={formData.bookingsTodayMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookingsTodayMin: e.target.value,
                    })
                  }
                  className="rounded-lg border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="bookingsTodayMax"
                  className="text-xs text-zinc-600"
                >
                  Max Bookings
                </Label>
                <Input
                  id="bookingsTodayMax"
                  type="number"
                  value={formData.bookingsTodayMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bookingsTodayMax: e.target.value,
                    })
                  }
                  className="rounded-lg border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>
            </div>
          </div>

          {/* Tickets Left Range */}
          <div className="space-y-4 p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 md:col-span-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-red-600" />
              <Label className="text-sm font-medium text-zinc-700">
                Tickets Left Range
              </Label>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="space-y-2">
                <Label
                  htmlFor="ticketsLeftMin"
                  className="text-xs text-zinc-600"
                >
                  Min Tickets Left
                </Label>
                <Input
                  id="ticketsLeftMin"
                  type="number"
                  value={formData.ticketsLeftMin}
                  onChange={(e) =>
                    setFormData({ ...formData, ticketsLeftMin: e.target.value })
                  }
                  className="rounded-lg border-red-200 focus:border-red-500 focus:ring-red-500/20"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="ticketsLeftMax"
                  className="text-xs text-zinc-600"
                >
                  Max Tickets Left
                </Label>
                <Input
                  id="ticketsLeftMax"
                  type="number"
                  value={formData.ticketsLeftMax}
                  onChange={(e) =>
                    setFormData({ ...formData, ticketsLeftMax: e.target.value })
                  }
                  className="rounded-lg border-red-200 focus:border-red-500 focus:ring-red-500/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col bg-zinc-100">
          <div className="@container/main flex flex-1 flex-col gap-2 px-2 sm:px-3">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DynamicPageHeader
                title={
                  <>
                    <span className="text-zinc-500">Manage</span> Events
                  </>
                }
                subtitle="Create, edit, and manage all platform events"
                actionButton={{
                  text: "Create Event",
                  icon: <PlusIcon className="size-4" />,
                  onClick: () => {
                    resetForm();
                    setIsCreateModalOpen(true);
                  },
                }}
              />

              {/* Stats Cards */}
              <div className="px-2 sm:px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                        <Calendar className="size-5 text-emerald-900" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                        +12.5%
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-zinc-600 mb-1">
                      TOTAL EVENTS
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {events.length}
                    </p>
                  </Card>

                  <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-xl bg-orange-50 border-2 border-orange-900 flex items-center justify-center">
                        <Flame className="size-5 text-orange-900" />
                      </div>
                      <Badge className="bg-orange-50 text-orange-900 border-2 border-orange-900 font-mono text-xs">
                        +8.3%
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-zinc-600 mb-1">
                      FEATURED EVENTS
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {events.filter((e) => e.featured).length}
                    </p>
                  </Card>

                  <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-xl bg-purple-50 border-2 border-purple-900 flex items-center justify-center">
                        <TrendingUp className="size-5 text-purple-900" />
                      </div>
                      <Badge className="bg-purple-50 text-purple-900 border-2 border-purple-900 font-mono text-xs">
                        +15.2%
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-zinc-600 mb-1">
                      TRENDING EVENTS
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {events.filter((e) => e.trending).length}
                    </p>
                  </Card>

                  <Card className="border-2 border-zinc-200 rounded-2xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-xl bg-blue-50 border-2 border-blue-900 flex items-center justify-center">
                        <Users className="size-5 text-blue-900" />
                      </div>
                      <Badge className="bg-blue-50 text-blue-900 border-2 border-blue-900 font-mono text-xs">
                        +23.1%
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-zinc-600 mb-1">
                      TOTAL ATTENDEES
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {events
                        .reduce((sum, e) => sum + e.attendees, 0)
                        .toLocaleString()}
                    </p>
                  </Card>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="px-2 sm:px-4 lg:px-6">
                <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-full sm:w-40 rounded-xl">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger className="w-full sm:w-40 rounded-xl">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All Status</SelectItem>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        onClick={refreshEventMetrics}
                        className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Refresh Metrics
                      </Button>

                      {(searchTerm ||
                        selectedCategory !== "All" ||
                        selectedStatus !== "All") && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory("All");
                            setSelectedStatus("All");
                          }}
                          className="rounded-xl"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {filteredEvents.length} events found
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Events Table */}
              <div className="px-2 sm:px-4 lg:px-6">
                <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                  <div className="border-2 border-zinc-200 rounded-2xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-zinc-50">
                        <TableRow>
                          <TableHead className="font-mono text-xs">
                            EVENT
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            CATEGORY
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            DATE & TIME
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            LOCATION
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            PRICE
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            STATUS
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            ATTENDEES
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            ACTIONS
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event) => (
                          <TableRow
                            key={event.id}
                            className="hover:bg-zinc-50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="size-12 rounded-lg overflow-hidden border-2 border-zinc-200">
                                  <img
                                    src={event.image || "/placeholder.svg"}
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {event.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {event.featured && (
                                      <Badge className="bg-emerald-50 text-emerald-900 border-emerald-900 text-xs">
                                        Featured
                                      </Badge>
                                    )}
                                    {event.trending && (
                                      <Badge className="bg-orange-50 text-orange-900 border-orange-900 text-xs">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        Trending
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {event.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">
                                  {event.date}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {event.time}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">
                                  {event.location}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                <span className="font-mono font-semibold">
                                  ${event.price}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(event.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="font-mono text-sm">
                                  {event.attendees.toLocaleString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditModal(event)}
                                  className="h-8 w-8 p-0 rounded-lg"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 w-8 p-0 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Event
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {event.title}"? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteEvent(event.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredEvents.length === 0 && (
                    <div className="text-center py-12 border border-border rounded-xl">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-bold text-zinc-800 mb-2">
                        No events found
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Try adjusting your search criteria or create a new event
                      </p>
                      <Button
                        onClick={() => {
                          resetForm();
                          setIsCreateModalOpen(true);
                        }}
                        className="bg-emerald-900 hover:bg-emerald-900/90 text-zinc-100"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Create Event Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create New Event
            </DialogTitle>
          </DialogHeader>
          <EventForm />
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(false);
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvent}
              className="bg-emerald-900 hover:bg-emerald-900/90 text-zinc-100 rounded-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm isEdit={true} />
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsEditModalOpen(false);
                setEditingEvent(null);
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditEvent}
              className="bg-emerald-900 hover:bg-emerald-900/90 text-zinc-100 rounded-xl"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
