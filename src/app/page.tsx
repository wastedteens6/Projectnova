import { prisma } from "@/lib/db";
import { Hero } from "@/components/landing/hero";
import {
    FeaturedProjects,
    type FeaturedProjectCard,
} from "@/components/landing/featured-projects";
import { Footer } from "@/components/common/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";

async function getLandingProjects(): Promise<FeaturedProjectCard[]> {
    return prisma.project.findMany({
        where: {
            isPublished: true,
        },
        orderBy: {
            popularity: "desc",
        },
        take: 3,
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

export default async function HomePage() {
    const projects = await getLandingProjects();

    return (
        <main className="min-h-screen bg-white">
            <Hero projects={projects} />
            
            {/* Purple Promo Bar */}
            <div className="container mx-auto px-4 md:px-8 mb-12">
                <div className="bg-[#F8F7FF] border border-[#EBE9FE] rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-center gap-4 text-center">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-white border border-[#EBE9FE] rounded-full shadow-sm flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                             <span className="text-[10px] font-black text-pink-500 uppercase tracking-wider">New</span>
                             <span className="text-xs font-bold text-gray-900">Start a Project Brief</span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600">
                        Tell us what you need and instantly connect with world-class developers ready to work on your <span className="text-indigo-600 font-bold underline cursor-pointer">project</span>.
                    </p>
                </div>
            </div>

            <FeaturedProjects projects={projects} />

            {/* Dark Bottom Banner */}
            <div className="bg-[#0D0C22] py-20 mt-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 max-w-2xl mx-auto leading-tight">
                        Get 20% off your first software project on ProjectNova!
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="bg-white/10 backdrop-blur rounded-full px-6 py-3 border border-white/10 text-white font-bold">
                            Use code <span className="text-pink-400">WELCOME20</span> 🚀
                        </div>
                        <Link href="/auth/register">
                            <Button className="bg-white hover:bg-gray-100 text-black rounded-full px-10 py-6 h-auto text-lg font-black transition-transform active:scale-95">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
