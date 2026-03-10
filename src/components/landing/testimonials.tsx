"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Rahul Sharma",
        role: "BTech CSE",
        university: "Mumbai University",
        year: "2024",
        rating: 5,
        content: "Got an A+ in my final year project presentation. The viva Q&A material is what set me apart. Every question the examiner asked — I had it covered.",
        avatar: "RS",
        color: "violet",
    },
    {
        name: "Priya Patel",
        role: "MCA Graduate",
        university: "Delhi University",
        year: "2023",
        rating: 5,
        content: "The code quality is production-grade. I wasn't just submitting a project — I actually understood it because of the video tutorials. Worth every rupee.",
        avatar: "PP",
        color: "purple",
    },
    {
        name: "Amit Kumar",
        role: "BTech IT",
        university: "Pune University",
        year: "2024",
        rating: 5,
        content: "Support team responded within 2 hours and helped me customize the project to my university's specific requirements. Exceptional service.",
        avatar: "AK",
        color: "indigo",
    },
];

const colorMap: Record<string, { avatar: string; quote: string; star: string }> = {
    violet: { avatar: "bg-violet-500/20 text-violet-400 border-violet-500/30", quote: "text-violet-500/20", star: "text-yellow-400 fill-yellow-400" },
    purple: { avatar: "bg-purple-500/20 text-purple-400 border-purple-500/30", quote: "text-purple-500/20", star: "text-yellow-400 fill-yellow-400" },
    indigo: { avatar: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", quote: "text-indigo-500/20", star: "text-yellow-400 fill-yellow-400" },
};

export function Testimonials() {
    return (
        <section className="relative py-16 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6 mb-12">
                <div className="section-divider" />
            </div>

            <div className="container mx-auto px-4 sm:px-6">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                    <div className="badge-pill inline-flex">Student Stories</div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Real Results from
                        <br />
                        <span className="gradient-text">Real Students</span>
                    </h2>
                    <p className="text-muted-foreground text-base">
                        5,000+ students have secured top grades with ProjectNova
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {testimonials.map((t) => {
                        const c = colorMap[t.color];
                        return (
                            <div
                                key={t.name}
                                className="group rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 hover:border-border hover:shadow-lg transition-all duration-300 flex flex-col"
                            >
                                {/* Quote mark */}
                                <Quote className={`h-8 w-8 ${c.quote} mb-4`} />

                                {/* Stars */}
                                <div className="flex items-center gap-0.5 mb-4">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${c.star}`} />
                                    ))}
                                </div>

                                {/* Content */}
                                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                                    &ldquo;{t.content}&rdquo;
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 ${c.avatar}`}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">{t.role}, {t.year} · {t.university}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
