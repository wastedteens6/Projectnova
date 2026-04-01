'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Category, CATEGORY_LABELS } from '@/types/project';

interface ProjectCardProps {
    slug: string;
    title: string;
    description: string;
    category: Category;
    techStack: string[];
    images: string[];
    thumbnailUrl?: string;
    tier1Price: number;
    tier2Price: number;
    tier3Price: number;
    views: number;
}

export function ProjectCard({
    slug,
    title,
    description,
    category,
    techStack,
    images,
    thumbnailUrl,
    tier1Price,
    tier2Price,
    tier3Price,
    views,
}: ProjectCardProps) {
    const imageUrl = thumbnailUrl || images[0] || '/placeholder-project.png';
    const lowestPrice = tier1Price;

    return (
        <Link href={`/projects/${slug}`}>
            <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card backdrop-blur-xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="backdrop-blur-md bg-background/80">
                            {CATEGORY_LABELS[category]}
                        </Badge>
                    </div>

                    {/* Views */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full backdrop-blur-md bg-background/80 px-2 py-1 text-xs">
                        <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                        <span>{views}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Title */}
                    <h3 className="mb-2 text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                        {description}
                    </p>

                    {/* Tech Stack */}
                    <div className="mb-4 flex flex-wrap gap-2">
                        {techStack.slice(0, 3).map((tech) => (
                            <Badge
                                key={tech}
                                variant="outline"
                                className="text-xs border-primary/30"
                            >
                                {tech}
                            </Badge>
                        ))}
                        {techStack.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{techStack.length - 3}
                            </Badge>
                        )}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Starting from</p>
                            <p className="text-2xl font-bold text-primary">
                                ₹{lowestPrice.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                            View Details
                            <svg
                                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/0 via-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
        </Link>
    );
}
