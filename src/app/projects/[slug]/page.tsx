'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, CATEGORY_LABELS } from '@/types/project';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(1);
    const [isAdding, setIsAdding] = useState(false);
    const { addToCart, items } = useCart();
    const isInCart = project ? items.some((i) => i.projectId === project.id) : false;

    useEffect(() => {
        fetchProject();
    }, [slug]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`/api/projects/${slug}`);
            const data = await response.json();

            if (data.success) {
                setProject(data.data);
            } else {
                notFound();
            }
        } catch (err) {
            console.error('Error fetching project:', err);
            notFound();
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    if (!project) {
        return notFound();
    }

    const tierDetails = [
        {
            tier: 1,
            name: 'Code Only',
            price: project.tier1Price,
            features: project.tier1Features,
        },
        {
            tier: 2,
            name: 'Code + Videos',
            price: project.tier2Price,
            features: project.tier2Features,
        },
        {
            tier: 3,
            name: 'Premium Support',
            price: project.tier3Price,
            features: project.tier3Features,
        },
    ];

    const currentTier = tierDetails.find((t) => t.tier === selectedTier)!;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative container mx-auto px-4 py-12 pt-28">
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm text-muted-foreground">
                    <a href="/projects" className="hover:text-primary transition-colors">
                        Projects
                    </a>
                    <span className="mx-2">/</span>
                    <span>{project.title}</span>
                </nav>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant="secondary">{CATEGORY_LABELS[project.category]}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            {project.views} views
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                        {project.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-4xl">
                        {project.description}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Images Gallery */}
                        {project.images.length > 0 && (
                            <div className="rounded-2xl overflow-hidden border border-border/50 bg-card backdrop-blur-xl">
                                <img
                                    src={project.images[0]}
                                    alt={project.title}
                                    className="w-full h-96 object-cover"
                                />
                            </div>
                        )}

                        {/* Tech Stack */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6">
                            <h2 className="text-2xl font-bold mb-4">Tech Stack</h2>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((tech) => (
                                    <Badge key={tech} variant="outline" className="text-sm">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6">
                            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
                            <ul className="grid md:grid-cols-2 gap-3">
                                {project.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <svg
                                            className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Modules Breakdown */}
                        {project.modulesBreakdown.length > 0 && (
                            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6">
                                <h2 className="text-2xl font-bold mb-4">Modules Breakdown</h2>
                                <ul className="space-y-2">
                                    {project.modulesBreakdown.map((module, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                {idx + 1}
                                            </span>
                                            <span className="pt-1">{module}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Viva Q&A */}
                        {project.vivaQA && (
                            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-6">
                                <h2 className="text-2xl font-bold mb-4">Viva Preparation</h2>
                                <div className="prose prose-sm max-w-none">
                                    <p className="whitespace-pre-wrap text-muted-foreground">
                                        {project.vivaQA}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Pricing */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border/50 bg-card backdrop-blur-xl p-6 space-y-6">
                            <h3 className="text-xl font-bold">Choose Your Package</h3>

                            {/* Tier Selection */}
                            <div className="grid grid-cols-3 gap-2">
                                {tierDetails.map((tier) => (
                                    <button
                                        key={tier.tier}
                                        onClick={() => setSelectedTier(tier.tier as 1 | 2 | 3)}
                                        className={`px-3 py-2 rounded-lg border-2 transition-all ${selectedTier === tier.tier
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border/50 hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="text-xs font-semibold">Tier {tier.tier}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Current Tier Details */}
                            <div>
                                <div className="text-sm text-muted-foreground">{currentTier.name}</div>
                                <div className="text-4xl font-bold text-primary">
                                    ₹{currentTier.price.toLocaleString()}
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3">
                                {currentTier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                        <svg
                                            className="h-5 w-5 text-primary mt-0.5 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <Button
                                className="w-full h-12 text-lg font-semibold"
                                variant={isInCart ? 'outline' : 'gradient'}
                                disabled={isAdding}
                                onClick={async () => {
                                    if (isInCart) return;
                                    setIsAdding(true);
                                    await addToCart(project.id, selectedTier);
                                    setIsAdding(false);
                                }}
                            >
                                {isAdding ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>
                                ) : isInCart ? (
                                    <><Check className="mr-2 h-4 w-4" />Added to Cart</>
                                ) : (
                                    <><ShoppingCart className="mr-2 h-4 w-4" />Add to Cart — ₹{currentTier.price.toLocaleString()}</>
                                )}
                            </Button>

                            {/* Security Badge */}
                            <div className="text-center text-xs text-muted-foreground">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    Secure Payment
                                </div>
                                <p>Powered by Razorpay</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
