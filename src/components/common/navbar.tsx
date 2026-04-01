"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Search,
    ShoppingCart,
    Menu,
    X,
    ChevronDown,
    LayoutDashboard,
    MessageSquare,
    Bell,
    FileText,
} from "lucide-react";

const navLinks = [
    { label: "Projects", href: "/projects" },
    { label: "Pricing", href: "/pricing" },
    { label: "Support", href: "/support" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/projects?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300",
                isScrolled
                    ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm"
                    : "bg-white"
            )}
        >
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-20 gap-8">
                    {/* Left Side: Logo + Links */}
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                            <span className="text-xl font-black tracking-tighter text-black">
                                Project<span className="text-pink-500">Nova</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center gap-8">
                            <div className="flex items-center gap-1 group cursor-pointer">
                                <span className="text-sm font-bold text-gray-500 hover:text-black transition-colors">Explore</span>
                                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                            </div>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-extrabold text-gray-600 hover:text-black transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-5">
                        <div className="hidden md:flex items-center gap-2">
                        <Link href="/support?intent=project-brief">
                            <Button variant="ghost" className="h-11 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Start Project Brief
                            </Button>
                        </Link>
                        </div>
                        
                        <div className="flex items-center gap-4 border-l border-gray-100 pl-5">
                            <Link href={session?.user ? "/dashboard/support" : "/support"}>
                                <button className="text-gray-400 hover:text-black transition-colors">
                                    <MessageSquare className="h-5 w-5" />
                                </button>
                            </Link>
                            <Link href={session?.user ? "/dashboard/notifications" : "/auth/login"}>
                                <button className="text-gray-400 hover:text-black transition-colors">
                                    <Bell className="h-5 w-5" />
                                </button>
                            </Link>

                            {/* Profile / Dashboard */}
                            {session?.user ? (
                                <Link href="/dashboard">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all">
                                        {(session.user as any).image ? (
                                            <img src={(session.user as any).image} alt={session.user.name || "User"} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-xs text-center leading-10">
                                                {session.user.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ) : (
                                <Link href="/auth/login">
                                    <Button className="bg-black hover:bg-gray-800 text-white rounded-full px-6 h-10 text-sm font-bold">
                                        Sign in
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden p-2 text-gray-500 hover:text-black"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden py-4 px-4 bg-white border-t border-gray-100 animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col gap-4">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setIsMenuOpen(false)}
                                className="text-sm font-bold text-gray-500 hover:text-black transition-colors"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
