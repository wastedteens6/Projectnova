import { prisma } from "@/lib/db";
import { Heart, Eye, MoreHorizontal, FolderPlus, ChevronDown, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FeaturedProjectCard = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  tier1Price: number;
  tier3Price: number;
  views: number;
};

async function getFeaturedProjects(): Promise<FeaturedProjectCard[]> {
  return prisma.project.findMany({
    where: {
      isPublished: true,
    },
    orderBy: {
      popularity: "desc",
    },
    take: 8, // Increased for Dribbble grid
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      category: true,
      techStack: true,
      tier1Price: true,
      tier3Price: true,
      views: true,
    },
  });
}

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-IN")}`;
}

export async function FeaturedProjects({
  projects: initialProjects,
}: {
  projects?: FeaturedProjectCard[];
}) {
  const projects = initialProjects ?? await getFeaturedProjects();

  const categories = [
    "Discover",
    "Animation",
    "Branding",
    "Illustration",
    "Mobile",
    "Print",
    "Product Design",
    "Typography",
    "Web Design",
  ];

  return (
    <section className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Category Bar */}
        <div className="flex items-center justify-between mb-10 overflow-hidden">
          {/* Left: Following Dropdown */}
          <div className="flex-shrink-0">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-black transition-all">
              Following <ChevronDown className="h-4 w-4 text-gray-400" />
            </button>
          </div>

          {/* Center: Categories */}
          <div className="hidden lg:flex items-center justify-center gap-8 flex-1 px-10">
            {categories.map((cat, i) => (
              <button 
                key={cat} 
                className={cn(
                  "text-[14px] font-bold transition-all whitespace-nowrap",
                  cat === "Discover" ? "text-black" : "text-gray-500 hover:text-black"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right: Filters */}
          <div className="flex-shrink-0">
            <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-black transition-all">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Shots Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
             <p className="text-gray-400 font-bold">No shots found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
              {projects.map((project) => (
                <div key={project.id} className="group cursor-pointer">
                  {/* Shot Card (Image) */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-gray-100 shadow-sm border border-gray-100">
                    <img 
                       src="/placeholder-project.png" 
                       alt={project.title}
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                       <div className="flex items-center justify-between w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                         <span className="text-white font-bold text-sm truncate pr-4">{project.title}</span>
                         <div className="flex items-center gap-2">
                           <button className="p-2.5 bg-white rounded-full hover:bg-gray-100 transition-all text-gray-800 shadow-md">
                             <FolderPlus className="h-4 w-4" />
                           </button>
                           <button className="p-2.5 bg-white rounded-full hover:bg-gray-100 transition-all text-pink-500 shadow-md">
                             <Heart className="h-4 w-4" />
                           </button>
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Metadata Below Card */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 group/user max-w-[65%]">
                      <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-[10px] font-bold text-pink-500 border border-pink-200">
                        {project.title.charAt(0)}
                      </div>
                      <span className="text-[13px] font-bold text-gray-800 truncate hover:text-pink-500 transition-all uppercase tracking-wider">
                        {project.category}
                      </span>
                       <span className="px-1.5 py-0.5 bg-gray-400 rounded text-[9px] font-black text-white hover:bg-gray-500 transition-all uppercase">PRO</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Heart className="h-3.5 w-3.5 fill-current" />
                        <span className="text-[11px] font-bold">120</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Eye className="h-3.5 w-3.5 fill-current" />
                        <span className="text-[11px] font-bold">4.2k</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-20 text-center">
              <Link href="/projects">
                <Button className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold px-8 py-6 rounded-full border-none shadow-none text-sm transition-all h-auto">
                  Browse more projects
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
