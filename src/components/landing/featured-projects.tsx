import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Layers,
  Cpu,
  Database,
  Shield,
  Gamepad2,
  ArrowRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import TiltedCard from "@/components/animations/TiltedCard";

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

type CategoryMeta = {
  gradient: string;
  icon: React.ElementType;
  badge: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  AI: {
    gradient: "from-violet-600/20 to-purple-600/20",
    icon: Cpu,
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  WEB: {
    gradient: "from-blue-600/20 to-cyan-600/20",
    icon: Code2,
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  IOT: {
    gradient: "from-green-600/20 to-teal-600/20",
    icon: Layers,
    badge: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  ML: {
    gradient: "from-orange-600/20 to-amber-600/20",
    icon: Database,
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  BLOCKCHAIN: {
    gradient: "from-yellow-600/20 to-amber-600/20",
    icon: Shield,
    badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  GAME: {
    gradient: "from-pink-600/20 to-rose-600/20",
    icon: Gamepad2,
    badge: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  },
  DEFAULT: {
    gradient: "from-violet-600/20 to-indigo-600/20",
    icon: Code2,
    badge: "bg-muted/50 text-muted-foreground border-border",
  },
};

async function getFeaturedProjects(): Promise<FeaturedProjectCard[]> {
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

function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-IN")}`;
}

export async function FeaturedProjects({
  projects: initialProjects,
}: {
  projects?: FeaturedProjectCard[];
}) {
  const projects = initialProjects ?? await getFeaturedProjects();

  return (
    <section className="relative py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="badge-pill inline-flex">Featured Collection</div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Projects Built to
            <br />
            <span className="gradient-text">Impress Examiners</span>
          </h2>

          <p className="text-muted-foreground text-base leading-relaxed">
            Handpicked projects with real-world complexity and thorough documentation
          </p>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No projects available yet.</p>
            <p className="text-sm mt-2">
              Run{" "}
              <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">
                npx prisma db seed
              </code>{" "}
              to populate the catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
            {projects.map((project) => {
              const meta =
                CATEGORY_META[project.category] ?? CATEGORY_META.DEFAULT;

              const Icon = meta.icon;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/5 shine flex flex-col"
                >
                  {/* Visual Header */}
                  <div className="relative h-44 w-full flex-shrink-0">

                    <TiltedCard
                      imageSrc="/placeholder-project.png"
                      altText={project.title}
                      containerHeight="176px"
                      containerWidth="100%"
                      imageHeight="176px"
                      imageWidth="100%"
                      rotateAmplitude={10}
                      scaleOnHover={1.02}
                      showTooltip={false}
                      displayOverlayContent
                      overlayContent={
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}
                        >
                          <div className="absolute inset-0 mesh-grid opacity-30" />

                          <Icon className="h-16 w-16 text-white/5 absolute" />

                          <div className="relative z-10 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                            <Icon className="h-10 w-10 text-white/60" />
                          </div>

                          <Badge
                            className={`absolute top-3 left-3 text-[10px] font-medium border ${meta.badge}`}
                          >
                            {project.category}
                          </Badge>

                          {project.views > 100 && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 text-[9px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5">
                              <Star className="h-2.5 w-2.5 fill-yellow-400" />
                              Popular
                            </div>
                          )}
                        </div>
                      }
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4 flex flex-col flex-1">

                    <h3 className="font-semibold text-base leading-snug group-hover:text-violet-400 transition-colors">
                      {project.title}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                      {project.description}
                    </p>

                    {/* Tech stack */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                        >
                          {tech}
                        </span>
                      ))}

                      {project.techStack.length > 3 && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-xl font-bold">
                          {formatPrice(project.tier1Price)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          up to {formatPrice(project.tier3Price)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-violet-400 font-medium group-hover:gap-2 transition-all">
                        View Details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* View All */}
        <div className="text-center">
          <Link href="/projects">
            <Button
              variant="ghost"
              size="lg"
              className="border border-border/60 hover:border-violet-500/40 hover:bg-violet-500/5 gap-2 transition-all"
            >
              View All Projects
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
