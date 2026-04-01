"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { FeaturedProjectCard } from "@/components/landing/featured-projects";
import {
  Search,
  LayoutGrid,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-IN")}`;
}

const popularTags = [
  { label: "MERN Stack", category: "WEB" },
  { label: "Python/AI", category: "AI" },
  { label: "Blockchain", category: "BLOCKCHAIN" },
  { label: "IoT Projects", category: "IOT" },
];

interface HeroProps {
  projects: FeaturedProjectCard[];
}

const heroTabs = [
  { label: "Projects", href: "/projects", icon: LayoutGrid },
  { label: "Documentation", href: "/docs", icon: BookOpen },
  { label: "Pricing", href: "/pricing", icon: CreditCard },
];

export function Hero({ projects }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  
  // Use the first project as the featured hero image
  const featuredHero = projects?.[0] || {
    title: "Eco-Friendly Dashboard",
    category: "Web Development",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/projects?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTagClick = (category: string) => {
    router.push(`/projects?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Content */}
          <div className="text-left">
            {/* Tabs */}
            <div className="flex items-center gap-6 mb-10 overflow-x-auto pb-2 scrollbar-hide">
              {heroTabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => router.push(tab.href)}
                  className="flex items-center gap-2 group whitespace-nowrap"
                >
                  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:border-black transition-all">
                    <tab.icon className="h-4 w-4 text-gray-500 group-hover:text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-black transition-colors">{tab.label}</span>
                </button>
              ))}
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-8 leading-[1.05]"
            >
              Discover the world's top <span className="text-pink-500">software projects</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-700 font-medium mb-12 max-w-xl"
            >
              ProjectNova is the leading destination to find & buy premium academic projects.
            </motion.p>

            {/* Hero Search */}
            <div className="relative group mb-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-pink-500 transition-colors">
                  <Search className="h-6 w-6" />
                </div>
                <Input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What type of project are you looking for?"
                  className="w-full h-16 bg-[#F3F3F7] border-none rounded-full px-16 text-lg focus-visible:ring-pink-500/20 placeholder:text-gray-500 font-medium transition-all"
                />
                <Button 
                  type="submit"
                  className="absolute right-2.5 top-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-full w-11 h-11 flex items-center justify-center p-0 shadow-lg shadow-pink-500/30 transition-transform active:scale-95"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>
            
            {/* Popular Tags */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 font-medium">Popular:</span>
              <div className="flex items-center gap-2 flex-wrap">
                {popularTags.map((tag) => (
                  <button 
                    key={tag.label}
                    onClick={() => handleTagClick(tag.category)}
                    className="px-4 py-1.5 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:border-black hover:text-black transition-all"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Featured Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="relative rounded-[40px] overflow-hidden aspect-[4/3] shadow-2xl group cursor-pointer">
              <img 
                src={(featuredHero as any).thumbnail || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"} 
                alt={featuredHero.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
              
              {/* User Badge Overlay */}
              <div className="absolute bottom-6 right-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full shadow-lg border border-white/20">
                  <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {featuredHero.title.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-gray-900">{featuredHero.category}</span>
                </div>
              </div>
            </div>

            {/* Floating Orbs for depth */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-100 rounded-full blur-[80px] -z-10 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-[80px] -z-10" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
