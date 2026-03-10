import { prisma } from "@/lib/db";
import { Hero } from "@/components/landing/hero";
import {
    FeaturedProjects,
    type FeaturedProjectCard,
} from "@/components/landing/featured-projects";
import { HowItWorks } from "@/components/landing/how-it-works";
import { VivaGuarantee } from "@/components/landing/viva-guarantee";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/common/footer";

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
        <main className="min-h-screen">
            <Hero projects={projects} />
            <FeaturedProjects projects={projects} />
            <HowItWorks />
            <VivaGuarantee />
            <Testimonials />
            <FAQ />
            <Footer />
        </main>
    );
}
