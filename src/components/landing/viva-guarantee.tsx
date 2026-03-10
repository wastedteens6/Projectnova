"use client";

import { Shield, FileCheck, Video, HeadphonesIcon, CheckCircle2 } from "lucide-react";

const guarantees = [
    {
        icon: Shield,
        title: "100% Original Code",
        description: "Every project is written from scratch. Clean, documented code that passes all plagiarism checkers.",
        color: "violet",
    },
    {
        icon: FileCheck,
        title: "Full Documentation",
        description: "Project reports, architecture diagrams, SRS documents, and module breakdowns — all included.",
        color: "blue",
    },
    {
        icon: Video,
        title: "Viva Prep Videos",
        description: "Step-by-step video walkthroughs and expert answers to commonly asked viva questions.",
        color: "purple",
    },
    {
        icon: HeadphonesIcon,
        title: "Priority Support",
        description: "Dedicated support team available 24/7 to help you understand and present your project.",
        color: "indigo",
    },
];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    violet: { bg: "bg-violet-500/10", icon: "text-violet-400", border: "border-violet-500/20" },
    blue: { bg: "bg-blue-500/10", icon: "text-blue-400", border: "border-blue-500/20" },
    purple: { bg: "bg-purple-500/10", icon: "text-purple-400", border: "border-purple-500/20" },
    indigo: { bg: "bg-indigo-500/10", icon: "text-indigo-400", border: "border-indigo-500/20" },
};

export function VivaGuarantee() {
    return (
        <section id="guarantee" className="relative py-16 sm:py-20">
            {/* Subtle bg strip */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/[0.04] to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mb-12">
                        <div className="space-y-3">
                            <div className="badge-pill inline-flex">Our Promise</div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                                Everything You Need
                                <br />
                                <span className="gradient-text">to Pass with Confidence</span>
                            </h2>
                        </div>
                        <p className="text-muted-foreground text-base leading-relaxed lg:pt-8">
                            We don&apos;t just sell code. Every project comes with everything your examiner
                            expects — and everything you need to explain it fluently.
                        </p>
                    </div>

                    {/* Feature grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {guarantees.map((item) => {
                            const c = colorMap[item.color];
                            return (
                                <div
                                    key={item.title}
                                    className={`group rounded-2xl p-5 border ${c.border} ${c.bg} hover:shadow-lg transition-all duration-300`}
                                >
                                    <div className={`w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                                        <item.icon className={`h-5 w-5 ${c.icon}`} />
                                    </div>
                                    <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Trust bar */}
                    <div className="mt-12 rounded-2xl border border-border/50 bg-card/40 p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-between backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/10 border border-green-500/20">
                                <CheckCircle2 className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">7-Day Money Back Guarantee</p>
                                <p className="text-xs text-muted-foreground">No questions asked refund policy</p>
                            </div>
                        </div>
                        <div className="h-px sm:h-10 sm:w-px w-full bg-border/50" />
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-blue-500/10 border border-blue-500/20">
                                <Shield className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Plagiarism-Free Code</p>
                                <p className="text-xs text-muted-foreground">Every project is 100% original</p>
                            </div>
                        </div>
                        <div className="h-px sm:h-10 sm:w-px w-full bg-border/50" />
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-violet-500/10 border border-violet-500/20">
                                <HeadphonesIcon className="h-5 w-5 text-violet-400" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Lifetime Access</p>
                                <p className="text-xs text-muted-foreground">Download anytime, forever</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
