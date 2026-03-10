'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/common/navbar';

export function ConditionalNavbar() {
    const pathname = usePathname();
    // Dashboard and Admin panels have their own navigation — no top navbar needed there
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return null;
    return <Navbar />;
}
