"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        question: "What exactly do I get when I purchase a project?",
        answer: "You get instant access to the full source code, a detailed project report, architecture diagrams, and viva Q&A materials. Higher tiers also include step-by-step video tutorials and 1-on-1 support sessions.",
    },
    {
        question: "Will this project pass plagiarism checks at my university?",
        answer: "Yes. Every project is written from scratch by our developers. We do not resell projects or reuse code across customers. Each codebase is unique and passes all standard plagiarism software.",
    },
    {
        question: "Can I customize the project for my institute's specific requirements?",
        answer: "Absolutely. The Tier 3 Premium plan includes direct support from our developers who will help you customize modules, update documentation, and adapt the project to your university's requirements.",
    },
    {
        question: "How fast is delivery after payment?",
        answer: "Delivery is instant. As soon as your payment is confirmed, you'll see the download links in your dashboard. There is no waiting period.",
    },
    {
        question: "What if I need help understanding the code during viva?",
        answer: "All tiers include viva Q&A materials covering likely questions. Tier 2 includes video explanations. Tier 3 includes direct expert support where you can ask us anything about your project.",
    },
    {
        question: "Do you offer refunds?",
        answer: "Yes. We have a 7-day no-questions-asked refund policy. If you're not satisfied for any reason within 7 days of purchase, contact our support team and we'll process your refund immediately.",
    },
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                open ? "border-violet-500/30 bg-violet-500/[0.04]" : "border-border/50 bg-card/40 hover:border-border"
            )}
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between p-5 text-left gap-4"
            >
                <span className={cn("text-sm font-medium leading-snug", open && "text-violet-400")}>
                    {q}
                </span>
                <ChevronDown className={cn("h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform duration-200", open && "rotate-180 text-violet-400")} />
            </button>
            {open && (
                <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
}

export function FAQ() {
    return (
        <section id="faq" className="relative py-16 sm:py-20">
            <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10 space-y-3">
                        <div className="badge-pill inline-flex">FAQ</div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Common <span className="gradient-text">Questions</span>
                        </h2>
                        <p className="text-muted-foreground text-base">
                            Everything you need to know before purchasing
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <FAQItem key={faq.question} q={faq.question} a={faq.answer} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
