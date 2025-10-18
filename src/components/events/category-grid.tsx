"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Music,
  Laptop,
  Palette,
  Utensils,
  Gamepad2,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Camera,
  Heart,
  Mic,
  Paintbrush,
  Coffee,
  Theater,
  Trophy,
  Building,
  BookOpen,
  Image,
  ArrowRight,
  TrendingUp,
  Users,
  Star,
} from "lucide-react";

// Category data with icons and event counts
const categories = [
  {
    id: "music",
    name: "Music",
    icon: Music,
    count: 45,
    trending: true,
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-900",
    description: "Concerts, festivals, and live performances",
  },
  {
    id: "technology",
    name: "Technology",
    icon: Laptop,
    count: 32,
    trending: true,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    description: "Conferences, workshops, and tech meetups",
  },
  {
    id: "art",
    name: "Art",
    icon: Palette,
    count: 28,
    trending: false,
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-900",
    description: "Exhibitions, galleries, and creative workshops",
  },
  {
    id: "food-drink",
    name: "Food & Drink",
    icon: Utensils,
    count: 24,
    trending: false,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
    textColor: "text-green-900",
    description: "Tastings, cooking classes, and culinary events",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: Gamepad2,
    count: 19,
    trending: true,
    color: "from-yellow-500 to-orange-500",
    bgColor: "from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200",
    textColor: "text-yellow-900",
    description: "Comedy shows, gaming events, and fun activities",
  },
  {
    id: "sports-fitness",
    name: "Sports & Fitness",
    icon: Dumbbell,
    count: 16,
    trending: false,
    color: "from-red-500 to-pink-500",
    bgColor: "from-red-50 to-pink-50",
    borderColor: "border-red-200",
    textColor: "text-red-900",
    description: "Workouts, sports events, and fitness challenges",
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    count: 22,
    trending: false,
    color: "from-gray-500 to-slate-500",
    bgColor: "from-gray-50 to-slate-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-900",
    description: "Networking, conferences, and professional development",
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    count: 18,
    trending: false,
    color: "from-indigo-500 to-purple-500",
    bgColor: "from-indigo-50 to-purple-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-900",
    description: "Workshops, seminars, and learning opportunities",
  },
  {
    id: "photography",
    name: "Photography",
    icon: Camera,
    count: 12,
    trending: false,
    color: "from-teal-500 to-cyan-500",
    bgColor: "from-teal-50 to-cyan-50",
    borderColor: "border-teal-200",
    textColor: "text-teal-900",
    description: "Photo walks, workshops, and exhibitions",
  },
];

// Additional category icons for variety
const categoryIcons = {
  music: [Mic, Music],
  technology: [Laptop, Briefcase],
  art: [Palette, Paintbrush],
  "food-drink": [Utensils, Coffee],
  entertainment: [Gamepad2, Theater],
  "sports-fitness": [Dumbbell, Trophy],
  business: [Building, Briefcase],
  education: [BookOpen, GraduationCap],
  photography: [Camera, Image],
};

export function CategoryGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    // In a real app, this would filter the events grid
    console.log(`Selected category: ${categoryId}`);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h4 className="text-xs border w-fit px-3 py-1.5 bg-emerald-50 border-emerald-500/30 rounded-full mx-auto font-semibold text-emerald-600 mb-6">
            EXPLORE CATEGORIES
          </h4>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-emerald-900 mb-3">
            Find Events by <br />
            <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Category
            </span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto leading-relaxed">
            Browse through our diverse collection of event categories and
            discover experiences that match your interests and passions.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            const isHovered = hoveredCategory === category.id;

            return (
              <Card
                key={category.id}
                className={`border-2 cursor-pointer transition-all duration-300 hover:shadow-xl group ${
                  isSelected
                    ? `border-emerald-500 bg-gradient-to-br ${category.bgColor}`
                    : `border-zinc-200 hover:border-emerald-300 bg-white`
                }`}
                onClick={() => handleCategoryClick(category.id)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${category.color} text-white group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="size-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {category.trending && (
                        <Badge className="bg-orange-500 text-white border-0 text-xs">
                          <TrendingUp className="size-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          isSelected
                            ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                            : "bg-zinc-100 border-zinc-300 text-zinc-700"
                        }`}
                      >
                        {category.count} events
                      </Badge>
                    </div>
                  </div>

                  <h3
                    className={`text-xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 ${
                      isSelected ? category.textColor : "text-zinc-900"
                    }`}
                  >
                    {category.name}
                  </h3>

                  <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <Users className="size-4" />
                      <span>Popular choice</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors ${
                        isSelected ? "bg-emerald-100 text-emerald-900" : ""
                      }`}
                    >
                      Explore
                      <ArrowRight className="size-3 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Category Details */}
        {selectedCategory && (
          <div className="mb-12">
            <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-amber-50/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-900/10 rounded-xl">
                    <Star className="size-6 text-emerald-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900">
                      {categories.find((c) => c.id === selectedCategory)?.name}{" "}
                      Events
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {categories.find((c) => c.id === selectedCategory)?.count}{" "}
                      events available
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                    className="ml-auto"
                  >
                    Clear Selection
                  </Button>
                </div>

                <p className="text-zinc-700 mb-4">
                  {
                    categories.find((c) => c.id === selectedCategory)
                      ?.description
                  }
                </p>

                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-emerald-100 text-emerald-900 border-emerald-200">
                    <TrendingUp className="size-3 mr-1" />
                    Popular this week
                  </Badge>
                  <Badge className="bg-amber-100 text-amber-900 border-amber-200">
                    <Users className="size-3 mr-1" />
                    High attendance
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-900 border-blue-200">
                    <Star className="size-3 mr-1" />
                    Highly rated
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-2 border-zinc-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-emerald-900/10 rounded-xl w-fit mx-auto mb-4">
                <TrendingUp className="size-6 text-emerald-900" />
              </div>
              <div className="text-3xl font-bold text-emerald-900 mb-2 font-mono">
                {categories.filter((c) => c.trending).length}
              </div>
              <div className="text-sm text-zinc-600">Trending Categories</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-zinc-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-amber-500/10 rounded-xl w-fit mx-auto mb-4">
                <Users className="size-6 text-amber-600" />
              </div>
              <div className="text-3xl font-bold text-amber-600 mb-2 font-mono">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </div>
              <div className="text-sm text-zinc-600">Total Events</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-zinc-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="pt-6 text-center">
              <div className="p-3 bg-blue-500/10 rounded-xl w-fit mx-auto mb-4">
                <Star className="size-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2 font-mono">
                {categories.length}
              </div>
              <div className="text-sm text-zinc-600">Categories Available</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
