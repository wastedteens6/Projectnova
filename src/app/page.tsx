import { Hero } from "@/components/landing/hero";
import { FeaturedProjects } from "@/components/landing/featured-projects";
import { HowItWorks } from "@/components/landing/how-it-works";
import { VivaGuarantee } from "@/components/landing/viva-guarantee";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/common/footer";

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <Hero />
            <FeaturedProjects />
            <HowItWorks />
            <VivaGuarantee />
            <Testimonials />
            <FAQ />
            <Footer />
        </main>
    );
}
