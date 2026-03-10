'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    ShoppingBag,
    Download,
    User,
    LogOut,
    X,
    Menu,
    LifeBuoy,
    ShieldCheck,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/orders', label: 'My Orders', icon: ShoppingBag },
    { href: '/dashboard/downloads', label: 'Downloads', icon: Download },
    { href: '/dashboard/support', label: 'Support', icon: LifeBuoy },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
];


interface DashboardSidebarProps {
    user: {
        name?: string | null;
        email?: string | null;
        role?: string;
    };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname.startsWith(href);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-border/50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">PN</span>
                    </div>
                    <span className="font-bold gradient-text">ProjectNova</span>
                </Link>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => {
                    const active = isActive(item.href, item.exact);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                                active
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            )}
                        >
                            <item.icon className={cn('h-4 w-4', active && 'text-primary')} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Admin Back Link */}
            {user.role === 'ADMIN' && (
                <div className="px-3 py-2 border-t border-border/50">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-all w-full"
                    >
                        <ShieldCheck className="h-4 w-4" />
                        Back to Admin Panel
                    </Link>
                </div>
            )}

            {/* Sign Out */}
            <div className="px-3 py-4 border-t border-border/50">
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col border-r border-border/50 bg-background/80 backdrop-blur-xl z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Top Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">PN</span>
                    </div>
                    <span className="font-bold gradient-text">ProjectNova</span>
                </Link>
                <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-muted">
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="fixed left-0 top-0 h-full w-72 z-50 bg-background border-r border-border/50 md:hidden flex flex-col">
                        <div className="flex justify-end p-4">
                            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <SidebarContent />
                    </aside>
                </>
            )}
        </>
    );
}
