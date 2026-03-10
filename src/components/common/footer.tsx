import Link from "next/link";
import { Mail, Github, Twitter, Linkedin, Zap } from "lucide-react";

const links = {
    product: [
        { label: "Browse Projects", href: "/projects" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Pricing", href: "/#pricing" },
        { label: "Our Guarantee", href: "/#guarantee" },
    ],
    support: [
        { label: "Help Center", href: "/dashboard/support" },
        { label: "Contact Us", href: "mailto:support@projectnova.com" },
        { label: "Refund Policy", href: "/refund-policy" },
        { label: "Privacy Policy", href: "/privacy" },
    ],
    account: [
        { label: "Sign Up", href: "/auth/register" },
        { label: "Sign In", href: "/auth/login" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "My Orders", href: "/dashboard/orders" },
    ],
};

export function Footer() {
    return (
        <footer className="relative border-t border-border/50 mt-16">
            {/* Subtle top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <div className="container mx-auto px-4 sm:px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand - wider column */}
                    <div className="col-span-2 space-y-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <Zap className="h-4.5 w-4.5 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">ProjectNova</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            India&apos;s premier academic project marketplace. Helping students ace their
                            project defenses since 2022.
                        </p>
                        <div className="flex items-center gap-3">
                            {[
                                { icon: Github, href: "#" },
                                { icon: Twitter, href: "#" },
                                { icon: Linkedin, href: "#" },
                            ].map(({ icon: Icon, href }) => (
                                <a
                                    key={href}
                                    href={href}
                                    className="w-9 h-9 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
                                >
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            support@projectnova.com
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(links).map(([group, items]) => (
                        <div key={group}>
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                                {group}
                            </h3>
                            <ul className="space-y-2.5">
                                {items.map(({ label, href }) => (
                                    <li key={label}>
                                        <Link
                                            href={href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} ProjectNova. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="/refund-policy" className="hover:text-foreground transition-colors">Refunds</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
