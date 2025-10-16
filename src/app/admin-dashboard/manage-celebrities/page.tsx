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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  Users,
  TrendingUp,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Calendar,
  Clock,
  DollarSign,
  Award,
  MessageSquare,
  UserPlus,
  Minus,
  Copy,
  ExternalLink,
  Sparkles,
  Zap,
  User,
  Settings,
} from "lucide-react";

// Sample celebrities data (in real app, this would come from API)
const initialCelebrities = [
  {
    id: 1,
    name: "Keanu Reeves",
    category: "Actor",
    tags: ["Actor", "Producer"],
    image: "/keanu-reeves-portrait.jpg",
    basePrice: 50000,
    rating: 4.9,
    bookings: 1250,
    views: 45000,
    availability: "Available",
    trending: true,
    hot: true,
    verified: true,
    description: "Hollywood A-list actor known for The Matrix and John Wick",
    responseTime: "Within 24 hours",
    achievements: [
      "3x MTV Movie Award Winner",
      "Hollywood Walk of Fame Star",
      "Saturn Award for Best Actor",
    ],
    bookingTypes: [
      {
        id: 1,
        name: "Virtual Meet & Greet",
        duration: "30 minutes",
        price: 15000,
        description: "Personal video call with Q&A session",
        features: [
          "30-minute private video call",
          "Q&A session",
          "Personalized autograph (digital)",
          "Photo opportunity (screenshot)",
        ],
        availability: 15,
        popular: false,
      },
      {
        id: 2,
        name: "In-Person Appearance",
        duration: "2 hours",
        price: 50000,
        description: "Attend your event in person",
        features: [
          "2-hour event appearance",
          "Photo opportunities",
          "Brief meet & greet",
          "Social media mention",
        ],
        availability: 5,
        popular: true,
      },
    ],
    reviews: [
      {
        id: 1,
        author: "Sarah M.",
        rating: 5,
        date: "2 weeks ago",
        comment:
          "Absolutely incredible experience! Keanu was so genuine and kind. Worth every penny!",
        verified: true,
      },
      {
        id: 2,
        author: "Michael R.",
        rating: 5,
        date: "1 month ago",
        comment:
          "Professional, punctual, and exceeded all expectations. Our corporate event was a huge success!",
        verified: true,
      },
    ],
  },
  {
    id: 2,
    name: "Taylor Swift",
    category: "Musician",
    tags: ["Singer", "Songwriter"],
    image: "/portrait-singer.png",
    basePrice: 150000,
    rating: 5.0,
    bookings: 2100,
    views: 98000,
    availability: "Limited",
    trending: true,
    hot: true,
    verified: true,
    description: "Grammy-winning pop superstar and cultural icon",
    responseTime: "Within 48 hours",
    achievements: [
      "12x Grammy Award Winner",
      "Billboard Artist of the Decade",
      "Time Person of the Year",
    ],
  },
  {
    id: 3,
    name: "Dwayne Johnson",
    category: "Actor",
    tags: ["Actor", "Producer", "Athlete"],
    image: "/dwayne-johnson-portrait.jpg",
    basePrice: 75000,
    rating: 4.8,
    bookings: 1800,
    views: 67000,
    availability: "Available",
    trending: true,
    hot: false,
    verified: true,
    description: "Former WWE champion turned Hollywood megastar",
    responseTime: "Within 24 hours",
    achievements: [
      "WWE Hall of Famer",
      "Highest Paid Actor 2023",
      "People's Choice Award Winner",
    ],
  },
  {
    id: 4,
    name: "Beyoncé",
    category: "Musician",
    tags: ["Singer", "Performer"],
    image: "/beyonce-portrait.jpg",
    basePrice: 200000,
    rating: 5.0,
    bookings: 1950,
    views: 89000,
    availability: "Booked",
    trending: true,
    hot: true,
    verified: true,
    description: "Queen Bey - Multi-Grammy award winning artist",
    responseTime: "Within 72 hours",
    achievements: [
      "32x Grammy Award Winner",
      "MTV Video Vanguard Award",
      "BET Lifetime Achievement Award",
    ],
  },
];

const categories = [
  "Actor",
  "Musician",
  "Athlete",
  "Comedian",
  "Influencer",
  "Model",
  "Director",
  "Producer",
];

const availabilityOptions = ["Available", "Limited", "Booked", "Unavailable"];

export default function ManageCelebritiesPage() {
  const [celebrities, setCelebrities] = useState(initialCelebrities);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingCelebrity, setEditingCelebrity] = useState<any>(null);
  const [deletingCelebrity, setDeletingCelebrity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    tags: "",
    image: "",
    basePrice: "",
    description: "",
    availability: "Available",
    responseTime: "Within 24 hours",
    achievements: [] as string[],
    bookingTypes: [] as any[],
    reviews: [] as any[],
    trending: false,
    hot: false,
    verified: false,
  });

  // Dynamic form states
  const [newAchievement, setNewAchievement] = useState("");
  const [newBookingType, setNewBookingType] = useState({
    name: "",
    duration: "",
    price: "",
    description: "",
    features: [] as string[],
    availability: "",
    popular: false,
  });
  const [newFeature, setNewFeature] = useState("");
  const [newReview, setNewReview] = useState({
    author: "",
    rating: 5,
    comment: "",
    verified: false,
  });

  // Filter celebrities
  const filteredCelebrities = celebrities.filter((celebrity) => {
    const matchesSearch =
      celebrity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celebrity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celebrity.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === "All" || celebrity.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      tags: "",
      image: "",
      basePrice: "",
      description: "",
      availability: "Available",
      responseTime: "Within 24 hours",
      achievements: [],
      bookingTypes: [],
      reviews: [],
      trending: false,
      hot: false,
      verified: false,
    });
    setNewAchievement("");
    setNewBookingType({
      name: "",
      duration: "",
      price: "",
      description: "",
      features: [],
      availability: "",
      popular: false,
    });
    setNewFeature("");
    setNewReview({
      author: "",
      rating: 5,
      comment: "",
      verified: false,
    });
  };

  // Helper functions for dynamic data management
  const addAchievement = () => {
    if (newAchievement.trim()) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement.trim()],
      });
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setNewBookingType({
        ...newBookingType,
        features: [...newBookingType.features, newFeature.trim()],
      });
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setNewBookingType({
      ...newBookingType,
      features: newBookingType.features.filter((_, i) => i !== index),
    });
  };

  const addBookingType = () => {
    if (
      newBookingType.name &&
      newBookingType.duration &&
      newBookingType.price
    ) {
      const bookingType = {
        id: Date.now(),
        ...newBookingType,
        price: parseInt(newBookingType.price),
        availability: parseInt(newBookingType.availability) || 0,
      };
      setFormData({
        ...formData,
        bookingTypes: [...formData.bookingTypes, bookingType],
      });
      setNewBookingType({
        name: "",
        duration: "",
        price: "",
        description: "",
        features: [],
        availability: "",
        popular: false,
      });
    }
  };

  const removeBookingType = (index: number) => {
    setFormData({
      ...formData,
      bookingTypes: formData.bookingTypes.filter((_, i) => i !== index),
    });
  };

  const addReview = () => {
    if (newReview.author && newReview.comment) {
      const review = {
        id: Date.now(),
        ...newReview,
        date: "Just now",
      };
      setFormData({
        ...formData,
        reviews: [...formData.reviews, review],
      });
      setNewReview({
        author: "",
        rating: 5,
        comment: "",
        verified: false,
      });
    }
  };

  const removeReview = (index: number) => {
    setFormData({
      ...formData,
      reviews: formData.reviews.filter((_, i) => i !== index),
    });
  };

  // Handle create celebrity
  const handleCreate = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newCelebrity = {
      id: celebrities.length + 1,
      name: formData.name,
      category: formData.category,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
      image: formData.image || "/placeholder-user.jpg",
      basePrice: parseInt(formData.basePrice),
      rating: 0,
      bookings: 0,
      views: 0,
      availability: formData.availability,
      trending: formData.trending,
      hot: formData.hot,
      verified: formData.verified,
      description: formData.description,
      responseTime: formData.responseTime,
      achievements: formData.achievements,
      bookingTypes: formData.bookingTypes,
      reviews: formData.reviews,
    };

    setCelebrities([...celebrities, newCelebrity]);
    setShowCreateDialog(false);
    resetForm();
    setIsLoading(false);
  };

  // Handle edit celebrity
  const handleEdit = (celebrity: any) => {
    setEditingCelebrity(celebrity);
    setFormData({
      name: celebrity.name,
      category: celebrity.category,
      tags: celebrity.tags.join(", "),
      image: celebrity.image,
      basePrice: celebrity.basePrice.toString(),
      description: celebrity.description,
      availability: celebrity.availability,
      responseTime: celebrity.responseTime,
      achievements: celebrity.achievements || [],
      bookingTypes: celebrity.bookingTypes || [],
      reviews: celebrity.reviews || [],
      trending: celebrity.trending,
      hot: celebrity.hot,
      verified: celebrity.verified,
    });
    setShowEditDialog(true);
  };

  // Handle update celebrity
  const handleUpdate = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedCelebrities = celebrities.map((celebrity) =>
      celebrity.id === editingCelebrity?.id
        ? {
            ...celebrity,
            name: formData.name,
            category: formData.category,
            tags: formData.tags.split(",").map((tag) => tag.trim()),
            image: formData.image || celebrity.image,
            basePrice: parseInt(formData.basePrice),
            description: formData.description,
            availability: formData.availability,
            responseTime: formData.responseTime,
            achievements: formData.achievements,
            bookingTypes: formData.bookingTypes,
            reviews: formData.reviews,
            trending: formData.trending,
            hot: formData.hot,
            verified: formData.verified,
          }
        : celebrity
    );

    setCelebrities(updatedCelebrities);
    setShowEditDialog(false);
    setEditingCelebrity(null);
    resetForm();
    setIsLoading(false);
  };

  // Handle delete celebrity
  const handleDelete = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setCelebrities(celebrities.filter((c) => c.id !== deletingCelebrity?.id));
    setShowDeleteDialog(false);
    setDeletingCelebrity(null);
    setIsLoading(false);
  };

  // Stats
  const totalCelebrities = celebrities.length;
  const activeCelebrities = celebrities.filter(
    (c) => c.availability === "Available"
  ).length;
  const trendingCelebrities = celebrities.filter((c) => c.trending).length;
  const totalBookings = celebrities.reduce((sum, c) => sum + c.bookings, 0);

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
                    <span className="text-zinc-500">Manage</span> Celebrities
                  </>
                }
                subtitle="Create, edit, and manage celebrity profiles"
                actionButton={{
                  text: "Add Celebrity",
                  icon: <Plus className="size-4" />,
                  onClick: () => setShowCreateDialog(true),
                }}
              />

              {/* Stats Cards */}
              <div className="px-2 sm:px-4 lg:px-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-2 border-zinc-200 rounded-2xl p-4 hover:border-emerald-900 transition-all cursor-pointer bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-xl bg-emerald-50 border-2 border-emerald-900 flex items-center justify-center">
                        <Users className="size-5 text-emerald-900" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                        Total
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-zinc-600 mb-1">
                      TOTAL CELEBRITIES
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {totalCelebrities}
                    </p>
                  </Card>

                  <Card className="border-2 border-zinc-200 rounded-2xl p-4 hover:border-blue-900 transition-all cursor-pointer bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-xl bg-blue-50 border-2 border-blue-900 flex items-center justify-center">
                        <CheckCircle2 className="size-5 text-blue-900" />
                      </div>
                      <Badge className="bg-blue-50 text-blue-900 border-2 border-blue-900 font-mono text-xs">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-zinc-600 mb-1">
                      ACTIVE CELEBRITIES
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {activeCelebrities}
                    </p>
                  </Card>

                  <Card className="border-2 border-zinc-200 rounded-2xl p-4 hover:border-orange-900 transition-all cursor-pointer bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-xl bg-orange-50 border-2 border-orange-900 flex items-center justify-center">
                        <TrendingUp className="size-5 text-orange-900" />
                      </div>
                      <Badge className="bg-orange-50 text-orange-900 border-2 border-orange-900 font-mono text-xs">
                        Trending
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-zinc-600 mb-1">
                      TRENDING NOW
                    </p>
                    <p className="text-2xl font-bold text-orange-900">
                      {trendingCelebrities}
                    </p>
                  </Card>

                  <Card className="border-2 border-zinc-200 rounded-2xl p-4 hover:border-purple-900 transition-all cursor-pointer bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="size-10 rounded-xl bg-purple-50 border-2 border-purple-900 flex items-center justify-center">
                        <Star className="size-5 text-purple-900" />
                      </div>
                      <Badge className="bg-purple-50 text-purple-900 border-2 border-purple-900 font-mono text-xs">
                        Bookings
                      </Badge>
                    </div>
                    <p className="text-xs font-mono text-zinc-600 mb-1">
                      TOTAL BOOKINGS
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {totalBookings.toLocaleString()}
                    </p>
                  </Card>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="px-2 sm:px-4 lg:px-6">
                <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search celebrities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl"
                      />
                    </div>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="w-full sm:w-48 rounded-xl">
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
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl"
                    >
                      <Plus className="size-4 mr-2" />
                      Add Celebrity
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Celebrities Table */}
              <div className="px-2 sm:px-4 lg:px-6">
                <Card className="border-2 border-zinc-200 rounded-2xl p-6 bg-white">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900">
                        Celebrity Profiles
                      </h2>
                      <p className="text-sm text-zinc-600 mt-1">
                        Manage all celebrity profiles and their details
                      </p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-900 border-2 border-emerald-900 font-mono text-xs">
                      {filteredCelebrities.length} celebrities
                    </Badge>
                  </div>

                  <div className="border-2 border-zinc-200 rounded-2xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-zinc-50">
                        <TableRow>
                          <TableHead className="font-mono text-xs">
                            PROFILE
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            CATEGORY
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            PRICE
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            STATUS
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            BOOKINGS
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            RATING
                          </TableHead>
                          <TableHead className="font-mono text-xs">
                            ACTIONS
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCelebrities.map((celebrity) => (
                          <TableRow
                            key={celebrity.id}
                            className="hover:bg-zinc-50 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="size-12 rounded-xl overflow-hidden border-2 border-zinc-200">
                                  <img
                                    src={
                                      celebrity.image || "/placeholder-user.jpg"
                                    }
                                    alt={celebrity.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-zinc-900">
                                    {celebrity.name}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    {celebrity.hot && (
                                      <Badge className="bg-orange-500 text-white border-0 text-xs">
                                        <Flame className="size-3 mr-1" />
                                        Hot
                                      </Badge>
                                    )}
                                    {celebrity.trending && (
                                      <Badge className="bg-emerald-900 text-white border-0 text-xs">
                                        <TrendingUp className="size-3 mr-1" />
                                        Trending
                                      </Badge>
                                    )}
                                    {celebrity.verified && (
                                      <Badge className="bg-blue-500 text-white border-0 text-xs">
                                        <CheckCircle2 className="size-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-purple-50 text-purple-900 border-2 border-purple-900 font-mono text-xs">
                                {celebrity.category.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm font-bold text-emerald-900">
                              ${celebrity.basePrice.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`font-mono text-xs ${
                                  celebrity.availability === "Available"
                                    ? "bg-emerald-50 text-emerald-900 border-2 border-emerald-900"
                                    : celebrity.availability === "Limited"
                                    ? "bg-amber-50 text-amber-900 border-2 border-amber-900"
                                    : "bg-red-50 text-red-900 border-2 border-red-900"
                                }`}
                              >
                                {celebrity.availability.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm font-bold text-zinc-900">
                              {celebrity.bookings.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="size-3 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-sm">
                                  {celebrity.rating}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 hover:bg-blue-50 hover:text-blue-500"
                                  onClick={() => {
                                    // View celebrity details
                                    window.open(
                                      `/celebrities/${celebrity.id}`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  <Eye className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 hover:bg-emerald-50 hover:text-emerald-900"
                                  onClick={() => handleEdit(celebrity)}
                                >
                                  <Edit className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 hover:bg-red-50 hover:text-red-500"
                                  onClick={() => {
                                    setDeletingCelebrity(celebrity);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {filteredCelebrities.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <Users className="h-16 w-16 mx-auto" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No celebrities found
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Try adjusting your search criteria or add a new
                        celebrity
                      </p>
                      <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="bg-emerald-900 hover:bg-emerald-800 text-white"
                      >
                        <Plus className="size-4 mr-2" />
                        Add Celebrity
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Create Celebrity Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-emerald-900" />
                Create New Celebrity Profile
              </DialogTitle>
              <DialogDescription>
                Build a comprehensive celebrity profile with all necessary
                details and services
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="size-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="flex items-center gap-2"
                >
                  <Calendar className="size-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="flex items-center gap-2"
                >
                  <Award className="size-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="size-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="size-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-zinc-200">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                      <User className="h-5 w-5 text-emerald-900" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      Basic Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-zinc-700"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter celebrity name"
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
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter celebrity description"
                      className="rounded-xl min-h-[120px] border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="tags"
                      className="text-sm font-medium text-zinc-700"
                    >
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="Actor, Producer, Musician"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-gray-500">
                      Separate tags with commas
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="image"
                      className="text-sm font-medium text-zinc-700"
                    >
                      Profile Image
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="rounded-xl"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl"
                      >
                        <Upload className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">Booking Services</h3>
                  </div>

                  {/* Existing Booking Types */}
                  {formData.bookingTypes.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium">Current Services</h4>
                      {formData.bookingTypes.map((type, index) => (
                        <div
                          key={type.id}
                          className="p-4 border rounded-xl bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold">{type.name}</h5>
                                {type.popular && (
                                  <Badge className="bg-emerald-900 text-white text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {type.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {type.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="size-3" />$
                                  {type.price.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <UserPlus className="size-3" />
                                  {type.availability} slots
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBookingType(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Booking Type */}
                  <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-xl">
                    <h4 className="font-medium">Add New Service</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Service Name *
                        </Label>
                        <Input
                          value={newBookingType.name}
                          onChange={(e) =>
                            setNewBookingType({
                              ...newBookingType,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Virtual Meet & Greet"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Duration *
                        </Label>
                        <Input
                          value={newBookingType.duration}
                          onChange={(e) =>
                            setNewBookingType({
                              ...newBookingType,
                              duration: e.target.value,
                            })
                          }
                          placeholder="e.g., 30 minutes"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Price ($) *
                        </Label>
                        <Input
                          type="number"
                          value={newBookingType.price}
                          onChange={(e) =>
                            setNewBookingType({
                              ...newBookingType,
                              price: e.target.value,
                            })
                          }
                          placeholder="15000"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Available Slots
                        </Label>
                        <Input
                          type="number"
                          value={newBookingType.availability}
                          onChange={(e) =>
                            setNewBookingType({
                              ...newBookingType,
                              availability: e.target.value,
                            })
                          }
                          placeholder="15"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={newBookingType.description}
                        onChange={(e) =>
                          setNewBookingType({
                            ...newBookingType,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe what this service includes"
                        className="rounded-xl"
                        rows={2}
                      />
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Features</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add a feature"
                          className="rounded-xl"
                          onKeyPress={(e) => e.key === "Enter" && addFeature()}
                        />
                        <Button
                          onClick={addFeature}
                          size="sm"
                          className="rounded-xl"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                      {newBookingType.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newBookingType.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {feature}
                              <X
                                className="size-3 cursor-pointer"
                                onClick={() => removeFeature(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="popular"
                        checked={newBookingType.popular}
                        onChange={(e) =>
                          setNewBookingType({
                            ...newBookingType,
                            popular: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="popular" className="text-sm">
                        Mark as Popular
                      </Label>
                    </div>

                    <Button
                      onClick={addBookingType}
                      className="w-full rounded-xl"
                    >
                      <Plus className="size-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">
                      Achievements & Awards
                    </h3>
                  </div>

                  {/* Existing Achievements */}
                  {formData.achievements.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium">Current Achievements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.achievements.map((achievement, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-amber-500/20"
                          >
                            <div className="size-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                              <Award className="size-4 text-white" />
                            </div>
                            <p className="font-medium text-sm flex-1">
                              {achievement}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAchievement(index)}
                              className="text-red-500 hover:text-red-700 size-6"
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Achievement */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Add Achievement</h4>
                    <div className="flex gap-2">
                      <Input
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        placeholder="e.g., Grammy Award Winner"
                        className="rounded-xl"
                        onKeyPress={(e) =>
                          e.key === "Enter" && addAchievement()
                        }
                      />
                      <Button onClick={addAchievement} className="rounded-xl">
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">
                      Reviews & Testimonials
                    </h3>
                  </div>

                  {/* Existing Reviews */}
                  {formData.reviews.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium">Current Reviews</h4>
                      {formData.reviews.map((review, index) => (
                        <div
                          key={review.id}
                          className="p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {review.author}
                              </span>
                              {review.verified && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-emerald-900 text-emerald-900"
                                >
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeReview(index)}
                              className="text-red-500 hover:text-red-700 size-6"
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="size-3 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Review */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Add Review</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Author Name
                        </Label>
                        <Input
                          value={newReview.author}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              author: e.target.value,
                            })
                          }
                          placeholder="John D."
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Rating</Label>
                        <Select
                          value={newReview.rating.toString()}
                          onValueChange={(value) =>
                            setNewReview({
                              ...newReview,
                              rating: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem
                                key={rating}
                                value={rating.toString()}
                              >
                                {rating} Star{rating > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Review Comment
                      </Label>
                      <Textarea
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comment: e.target.value,
                          })
                        }
                        placeholder="Write a review comment..."
                        className="rounded-xl"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="verified-review"
                        checked={newReview.verified}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            verified: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="verified-review" className="text-sm">
                        Mark as Verified
                      </Label>
                    </div>

                    <Button onClick={addReview} className="w-full rounded-xl">
                      <Plus className="size-4 mr-2" />
                      Add Review
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">Settings & Status</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="basePrice"
                        className="text-sm font-medium"
                      >
                        Base Price ($) *
                      </Label>
                      <Input
                        id="basePrice"
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basePrice: e.target.value,
                          })
                        }
                        placeholder="50000"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="availability"
                        className="text-sm font-medium"
                      >
                        Availability *
                      </Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) =>
                          setFormData({ ...formData, availability: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label
                      htmlFor="responseTime"
                      className="text-sm font-medium"
                    >
                      Response Time
                    </Label>
                    <Input
                      id="responseTime"
                      value={formData.responseTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responseTime: e.target.value,
                        })
                      }
                      placeholder="Within 24 hours"
                      className="rounded-xl"
                    />
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h4 className="font-medium">Status Flags</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-3 border rounded-xl">
                        <input
                          type="checkbox"
                          id="trending"
                          checked={formData.trending}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              trending: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <TrendingUp className="size-4 text-orange-500" />
                          <Label
                            htmlFor="trending"
                            className="text-sm font-medium"
                          >
                            Trending
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-xl">
                        <input
                          type="checkbox"
                          id="hot"
                          checked={formData.hot}
                          onChange={(e) =>
                            setFormData({ ...formData, hot: e.target.checked })
                          }
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <Flame className="size-4 text-red-500" />
                          <Label htmlFor="hot" className="text-sm font-medium">
                            Hot
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-xl">
                        <input
                          type="checkbox"
                          id="verified"
                          checked={formData.verified}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              verified: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-blue-500" />
                          <Label
                            htmlFor="verified"
                            className="text-sm font-medium"
                          >
                            Verified
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
                disabled={isLoading}
                className="rounded-xl"
              >
                <X className="size-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  isLoading ||
                  !formData.name ||
                  !formData.category ||
                  !formData.basePrice
                }
                className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl"
              >
                {isLoading ? (
                  <>
                    <div className="size-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-2" />
                    Create Celebrity
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Celebrity Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="w-[90vw] max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="size-5 text-emerald-900" />
                Edit Celebrity Profile
              </DialogTitle>
              <DialogDescription>
                Update {editingCelebrity?.name}'s profile information and
                services
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <User className="size-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="flex items-center gap-2"
                >
                  <Calendar className="size-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger
                  value="achievements"
                  className="flex items-center gap-2"
                >
                  <Award className="size-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="size-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="flex items-center gap-2"
                >
                  <Settings className="size-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-name"
                        className="text-sm font-medium"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="edit-name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter celebrity name"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-category"
                        className="text-sm font-medium"
                      >
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl">
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

                  <div className="space-y-2 mt-4">
                    <Label
                      htmlFor="edit-description"
                      className="text-sm font-medium"
                    >
                      Description *
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter celebrity description"
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="edit-tags" className="text-sm font-medium">
                      Tags
                    </Label>
                    <Input
                      id="edit-tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="Actor, Producer, Musician"
                      className="rounded-xl"
                    />
                    <p className="text-xs text-gray-500">
                      Separate tags with commas
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="edit-image" className="text-sm font-medium">
                      Profile Image
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-image"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="rounded-xl"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl"
                      >
                        <Upload className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">Booking Services</h3>
                  </div>

                  {/* Existing Booking Types */}
                  {formData.bookingTypes.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium">Current Services</h4>
                      {formData.bookingTypes.map((type, index) => (
                        <div
                          key={type.id}
                          className="p-4 border rounded-xl bg-gray-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold">{type.name}</h5>
                                {type.popular && (
                                  <Badge className="bg-emerald-900 text-white text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {type.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {type.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="size-3" />$
                                  {type.price.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <UserPlus className="size-3" />
                                  {type.availability} slots
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBookingType(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Booking Type */}
                  <div className="space-y-4 p-4 border-2 border-dashed border-gray-300 rounded-xl">
                    <h4 className="font-medium">Add New Service</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Service Name *
                        </Label>
                        <Input
                          value={newBookingType.name}
                          onChange={(e) =>
                            setNewBookingType({
                              ...newBookingType,
                              name: e.target.value,
                            })
                          }
                          placeholder="e.g., Virtual Meet & Greet"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Duration *
                        </Label>
                        <Input
                          value={newBookingType.duration}
                          onChange={(e) =>
                            setNewBookingType({
                              ...newBookingType,
                              duration: e.target.value,
                            })
                          }
                          placeholder="e.g., 30 minutes"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Price ($) *
                        </Label>
                        <Input
                          type="number"
                          value={newBookingType.price}
                          onChange={(e) =>
                            setNewBookingType({
                              ...newBookingType,
                              price: e.target.value,
                            })
                          }
                          placeholder="15000"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Available Slots
                        </Label>
                        <Input
                          type="number"
                          value={newBookingType.availability}
                          onChange={(e) =>
                            setNewBookingType({
                              ...newBookingType,
                              availability: e.target.value,
                            })
                          }
                          placeholder="15"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea
                        value={newBookingType.description}
                        onChange={(e) =>
                          setNewBookingType({
                            ...newBookingType,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe what this service includes"
                        className="rounded-xl"
                        rows={2}
                      />
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Features</Label>
                      <div className="flex gap-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add a feature"
                          className="rounded-xl"
                          onKeyPress={(e) => e.key === "Enter" && addFeature()}
                        />
                        <Button
                          onClick={addFeature}
                          size="sm"
                          className="rounded-xl"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                      {newBookingType.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newBookingType.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {feature}
                              <X
                                className="size-3 cursor-pointer"
                                onClick={() => removeFeature(index)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-popular"
                        checked={newBookingType.popular}
                        onChange={(e) =>
                          setNewBookingType({
                            ...newBookingType,
                            popular: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="edit-popular" className="text-sm">
                        Mark as Popular
                      </Label>
                    </div>

                    <Button
                      onClick={addBookingType}
                      className="w-full rounded-xl"
                    >
                      <Plus className="size-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">
                      Achievements & Awards
                    </h3>
                  </div>

                  {/* Existing Achievements */}
                  {formData.achievements.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium">Current Achievements</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.achievements.map((achievement, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-white rounded-xl border-2 border-amber-500/20"
                          >
                            <div className="size-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                              <Award className="size-4 text-white" />
                            </div>
                            <p className="font-medium text-sm flex-1">
                              {achievement}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAchievement(index)}
                              className="text-red-500 hover:text-red-700 size-6"
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Achievement */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Add Achievement</h4>
                    <div className="flex gap-2">
                      <Input
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        placeholder="e.g., Grammy Award Winner"
                        className="rounded-xl"
                        onKeyPress={(e) =>
                          e.key === "Enter" && addAchievement()
                        }
                      />
                      <Button onClick={addAchievement} className="rounded-xl">
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">
                      Reviews & Testimonials
                    </h3>
                  </div>

                  {/* Existing Reviews */}
                  {formData.reviews.length > 0 && (
                    <div className="space-y-3 mb-6">
                      <h4 className="font-medium">Current Reviews</h4>
                      {formData.reviews.map((review, index) => (
                        <div
                          key={review.id}
                          className="p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {review.author}
                              </span>
                              {review.verified && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-emerald-900 text-emerald-900"
                                >
                                  <CheckCircle2 className="size-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeReview(index)}
                              className="text-red-500 hover:text-red-700 size-6"
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="size-3 text-yellow-500 fill-yellow-500"
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Review */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Add Review</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Author Name
                        </Label>
                        <Input
                          value={newReview.author}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              author: e.target.value,
                            })
                          }
                          placeholder="John D."
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Rating</Label>
                        <Select
                          value={newReview.rating.toString()}
                          onValueChange={(value) =>
                            setNewReview({
                              ...newReview,
                              rating: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem
                                key={rating}
                                value={rating.toString()}
                              >
                                {rating} Star{rating > 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Review Comment
                      </Label>
                      <Textarea
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comment: e.target.value,
                          })
                        }
                        placeholder="Write a review comment..."
                        className="rounded-xl"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="edit-verified-review"
                        checked={newReview.verified}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            verified: e.target.checked,
                          })
                        }
                        className="rounded"
                      />
                      <Label htmlFor="edit-verified-review" className="text-sm">
                        Mark as Verified
                      </Label>
                    </div>

                    <Button onClick={addReview} className="w-full rounded-xl">
                      <Plus className="size-4 mr-2" />
                      Add Review
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="size-5 text-emerald-900" />
                    <h3 className="text-lg font-semibold">Settings & Status</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-basePrice"
                        className="text-sm font-medium"
                      >
                        Base Price ($) *
                      </Label>
                      <Input
                        id="edit-basePrice"
                        type="number"
                        value={formData.basePrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            basePrice: e.target.value,
                          })
                        }
                        placeholder="50000"
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-availability"
                        className="text-sm font-medium"
                      >
                        Availability *
                      </Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) =>
                          setFormData({ ...formData, availability: value })
                        }
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          {availabilityOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label
                      htmlFor="edit-responseTime"
                      className="text-sm font-medium"
                    >
                      Response Time
                    </Label>
                    <Input
                      id="edit-responseTime"
                      value={formData.responseTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          responseTime: e.target.value,
                        })
                      }
                      placeholder="Within 24 hours"
                      className="rounded-xl"
                    />
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h4 className="font-medium">Status Flags</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-3 border rounded-xl">
                        <input
                          type="checkbox"
                          id="edit-trending"
                          checked={formData.trending}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              trending: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <TrendingUp className="size-4 text-orange-500" />
                          <Label
                            htmlFor="edit-trending"
                            className="text-sm font-medium"
                          >
                            Trending
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-xl">
                        <input
                          type="checkbox"
                          id="edit-hot"
                          checked={formData.hot}
                          onChange={(e) =>
                            setFormData({ ...formData, hot: e.target.checked })
                          }
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <Flame className="size-4 text-red-500" />
                          <Label
                            htmlFor="edit-hot"
                            className="text-sm font-medium"
                          >
                            Hot
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-xl">
                        <input
                          type="checkbox"
                          id="edit-verified"
                          checked={formData.verified}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              verified: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-blue-500" />
                          <Label
                            htmlFor="edit-verified"
                            className="text-sm font-medium"
                          >
                            Verified
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingCelebrity(null);
                  resetForm();
                }}
                disabled={isLoading}
                className="rounded-xl"
              >
                <X className="size-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={
                  isLoading ||
                  !formData.name ||
                  !formData.category ||
                  !formData.basePrice
                }
                className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl"
              >
                {isLoading ? (
                  <>
                    <div className="size-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Update Celebrity
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="w-[90vw] max-w-md max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="size-5" />
                Delete Celebrity
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this celebrity? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>

            {deletingCelebrity && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="size-12 rounded-xl overflow-hidden border-2 border-red-200">
                    <img
                      src={deletingCelebrity.image || "/placeholder-user.jpg"}
                      alt={deletingCelebrity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-red-900">
                      {deletingCelebrity.name}
                    </p>
                    <p className="text-sm text-red-700">
                      {deletingCelebrity.category} •{" "}
                      {deletingCelebrity.bookings} bookings
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="size-4 text-amber-600" />
                    <span className="font-semibold text-amber-900">
                      Warning
                    </span>
                  </div>
                  <p className="text-sm text-amber-800">
                    Deleting this celebrity will remove all associated bookings
                    and data. This action is permanent and cannot be reversed.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingCelebrity(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="size-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-4 mr-2" />
                    Delete Celebrity
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
