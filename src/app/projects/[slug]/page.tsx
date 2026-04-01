'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project, CATEGORY_LABELS } from '@/types/project';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Check, Loader2, Sparkles, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { UpgradeButton } from '@/components/dashboard/UpgradeButton';

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
    const { data: session } = useSession();
    const { slug } = params;
    const [project, setProject] = useState<Project | any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTier, setSelectedTier] = useState<1 | 2 | 3 | 4>(1);
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [customNote, setCustomNote] = useState('');
    const [customType, setCustomType] = useState<'STANDARD' | 'MAJOR'>('STANDARD');
    const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
    const [notFoundState, setNotFoundState] = useState(false);
    const [purchasedTier, setPurchasedTier] = useState<number>(0);
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
                setPurchasedTier(data.data.purchasedTier || 0);
            } else {
                setNotFoundState(true);
            }
        } catch (err) {
            console.error('Error fetching project:', err);
            setNotFoundState(true);
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

    if (notFoundState || !project) {
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
        ...(project.tier4Price ? [{
            tier: 4,
            name: 'Enterprise / Custom',
            price: project.tier4Price,
            features: project.tier4Features,
        }] : []),
    ];

    const currentTier = tierDetails.find((t) => t.tier === selectedTier)!;

    const handleCustomizationRequest = async () => {
        if (!customNote.trim()) {
            toast({ title: "Please describe your customization", variant: "destructive" });
            return;
        }

        setIsSubmittingCustom(true);
        try {
            const response = await fetch('/api/projects/customization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId: project.id,
                    tier: selectedTier,
                    description: customNote,
                    type: customType,
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast({
                    title: "Request Sent!",
                    description: "Our team will review your requirements and update the quote.",
                });
                setIsCustomizing(false);
                setCustomNote('');
            } else {
                const isAdmin = session?.user?.role === 'ADMIN';
                toast({ 
                    title: "Request Failed", 
                    description: data.error || "Failed to send request", 
                    variant: "destructive",
                });
                
                if (isAdmin && data.details) {
                    toast({
                        title: "[Admin Only] Error Details",
                        description: JSON.stringify(data.details).substring(0, 100) + '...',
                        variant: "destructive",
                    });
                }
            }
        } catch (error) {
            console.error('[Customization Error]', error);
            toast({ title: "Error connecting to server", variant: "destructive" });
        } finally {
            setIsSubmittingCustom(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative container mx-auto px-4 py-12 pt-28">
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm text-muted-foreground transition-all">
                    <Link href="/projects" className="hover:text-primary transition-colors">
                        Projects
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="gradient-text font-medium">{project.title}</span>
                </nav>

                {/* Header */}
                <div className="mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{CATEGORY_LABELS[project.category] || 'Software'}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {project.views} views
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent leading-tight">
                        {project.title}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed">
                        {project.description}
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Images Gallery */}
                        {project.images && project.images.length > 0 && (
                            <div className="rounded-2xl overflow-hidden border border-border/50 bg-card backdrop-blur-xl shadow-2xl shadow-black/20 group">
                                <img
                                    src={project.images[0]}
                                    alt={project.title}
                                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        )}

                        {/* Tech Stack */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 hover:border-primary/30 transition-colors">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="h-8 w-1.5 bg-primary rounded-full" />
                                Tech Stack
                            </h2>
                            <div className="flex flex-wrap gap-2.5">
                                {project.techStack.map((tech: string) => (
                                    <Badge key={tech} variant="outline" className="text-sm px-3 py-1 bg-background/50 border-border/80">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Features */}
                        <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-8 hover:border-primary/30 transition-colors">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="h-8 w-1.5 bg-primary rounded-full" />
                                Key Features
                            </h2>
                            <ul className="grid md:grid-cols-2 gap-4">
                                {project.features.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-3 group">
                                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/20 transition-colors">
                                            <Check className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Modules Breakdown */}
                        {project.modulesBreakdown && project.modulesBreakdown.length > 0 && (
                            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl p-8">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span className="h-8 w-1.5 bg-primary rounded-full" />
                                    Modules Breakdown
                                </h2>
                                <ul className="space-y-4">
                                    {project.modulesBreakdown.map((module: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-4">
                                            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg border border-primary/20">
                                                {idx + 1}
                                            </span>
                                            <span className="pt-1.5 text-muted-foreground">{module}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Pricing */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 rounded-2xl border border-border/50 bg-card backdrop-blur-xl p-8 space-y-8 shadow-xl shadow-black/10">
                            <div>
                                <h3 className="text-xl font-bold mb-4">Choose Your Package</h3>
                                {/* Tier Selection */}
                                <div className="grid grid-cols-4 gap-2">
                                    {tierDetails.map((tier) => (
                                        <button
                                            key={tier.tier}
                                            onClick={() => setSelectedTier(tier.tier as 1 | 2 | 3 | 4)}
                                            className={`px-2 py-2.5 rounded-xl border-2 transition-all ${selectedTier === tier.tier
                                                ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/5'
                                                : 'border-border/50 hover:border-primary/50 text-muted-foreground opacity-60'
                                                }`}
                                        >
                                            <div className="text-[10px] font-bold uppercase tracking-tighter">Tier {tier.tier}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Current Tier Details */}
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="text-xs font-bold text-primary uppercase tracking-widest">{currentTier.name}</div>
                                    {purchasedTier >= selectedTier && (
                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] h-5">Purchased</Badge>
                                    )}
                                </div>
                                <div className="text-4xl font-extrabold flex items-baseline gap-1">
                                    <span className="text-2xl font-medium opacity-50">₹</span>
                                    {currentTier.price.toLocaleString()}
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 border-t border-border/50 pt-6">
                                {currentTier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm">
                                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                        <span className="text-muted-foreground leading-snug">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Customization Request UI (Tiers 3 & 4 only) */}
                            {(selectedTier === 3 || selectedTier === 4) && (
                                <div className="pt-2 border-t border-border/50">
                                    {!isCustomizing ? (
                                        <Button 
                                            variant="ghost" 
                                            className="w-full text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 gap-2 h-10"
                                            onClick={() => setIsCustomizing(true)}
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            Need Customization?
                                        </Button>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-4 py-4"
                                        >
                                            <div className="text-xs font-bold uppercase text-muted-foreground flex justify-between">
                                                <span>Customization Details</span>
                                                <button onClick={() => setIsCustomizing(false)} className="hover:text-primary">Cancel</button>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant={customType === 'STANDARD' ? 'secondary' : 'outline'}
                                                    className="flex-1 text-[10px]"
                                                    onClick={() => setCustomType('STANDARD')}
                                                >
                                                    Standard (+₹300)
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant={customType === 'MAJOR' ? 'secondary' : 'outline'}
                                                    className="flex-1 text-[10px]"
                                                    onClick={() => setCustomType('MAJOR')}
                                                >
                                                    Major (+₹1000)
                                                </Button>
                                            </div>
                                            <textarea
                                                className="w-full bg-muted/40 border-border/50 rounded-lg p-3 text-xs focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 h-24"
                                                placeholder="Describe exactly what changes you need..."
                                                value={customNote}
                                                onChange={(e) => setCustomNote(e.target.value)}
                                            />
                                            <Button 
                                                className="w-full h-10 text-xs font-bold" 
                                                variant="secondary"
                                                onClick={handleCustomizationRequest}
                                                disabled={isSubmittingCustom}
                                            >
                                                {isSubmittingCustom ? (
                                                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Sending...</>
                                                ) : "Submit Customization Request"}
                                            </Button>
                                            <p className="text-[10px] text-center text-muted-foreground/60 leading-tight">
                                                * Price will be added by admin after review.
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* CTA Button */}
                            <div className="space-y-3">
                                {purchasedTier >= selectedTier ? (
                                    <Link href="/dashboard/downloads" className="block w-full">
                                        <Button
                                            className="w-full h-14 text-lg font-bold shadow-xl shadow-green-500/20 hover:shadow-green-500/30 bg-green-600 hover:bg-green-700 text-white transition-all gap-2"
                                        >
                                            <Download className="h-5 w-5" />
                                            Download Materials
                                        </Button>
                                    </Link>
                                ) : purchasedTier > 0 && selectedTier > purchasedTier && selectedTier <= 3 ? (
                                    <UpgradeButton 
                                        projectId={project.id}
                                        projectTitle={project.title}
                                        currentTier={purchasedTier}
                                        targetTier={selectedTier as 1|2|3}
                                        upgradeAmount={Math.max(0, currentTier.price - (purchasedTier === 1 ? project.tier1Price : project.tier2Price))}
                                    />
                                ) : (
                                    <Button
                                        className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                                        variant={selectedTier === 4 || isInCart ? 'outline' : 'gradient'}
                                        disabled={isAdding}
                                        onClick={async () => {
                                            if (isInCart) return;
                                            if (selectedTier === 4) {
                                                toast({
                                                    title: "Tier 4 requires manual handling",
                                                    description: "Use the customization request flow for enterprise packages.",
                                                    variant: "destructive",
                                                });
                                                return;
                                            }
                                            
                                            setIsAdding(true);
                                            try {
                                                await addToCart(project.id, selectedTier as 1 | 2 | 3);
                                                toast({
                                                    title: "Project Added!",
                                                    description: "Review your cart to complete the purchase.",
                                                });
                                            } catch (error) {
                                                toast({
                                                    title: "Error",
                                                    description: "Failed to add to cart.",
                                                    variant: "destructive",
                                                });
                                            } finally {
                                                setIsAdding(false);
                                            }
                                        }}
                                    >
                                        {isAdding ? (
                                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Adding...</>
                                        ) : selectedTier === 4 ? (
                                            <>Request Enterprise Quote</>
                                        ) : isInCart ? (
                                            <><Check className="mr-2 h-5 w-5" />Added to Cart</>
                                        ) : (
                                            <><ShoppingCart className="mr-2 h-5 w-5" />Add to Cart</>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {/* Security Badge */}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Secure SSL Encrypted
                                </div>
                                <div className="flex items-center justify-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                    <img src="https://img.icons8.com/color/48/razorpay.png" alt="Razorpay" className="h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
