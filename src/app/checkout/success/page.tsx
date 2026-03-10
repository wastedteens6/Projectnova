'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order');
    const { refreshCart } = useCart();

    useEffect(() => {
        // Ensure cart is cleared in UI state
        refreshCart();
    }, [refreshCart]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Success Animation Container */}
                <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <div className="relative w-full h-full bg-background rounded-full border-4 border-green-500 flex items-center justify-center z-10">
                        <CheckCircle2 className="w-16 h-16 text-green-500 animate-in zoom-in duration-500" />
                    </div>
                </div>

                <div className="space-y-2 animate-in slide-in-from-bottom-5 duration-700 delay-200">
                    <h1 className="text-3xl font-bold tracking-tight">Payment Successful!</h1>
                    <p className="text-muted-foreground">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                    {orderNumber && (
                        <div className="pt-2">
                            <span className="inline-block bg-muted px-4 py-1.5 rounded-full text-sm font-medium font-mono">
                                Order #{orderNumber}
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4 animate-in slide-in-from-bottom-5 duration-700 delay-300 backdrop-blur-sm">
                    <div className="text-sm text-center text-muted-foreground">
                        <p>You can now access your projects.</p>
                        <p>A confirmation email has been sent to you.</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full animate-in slide-in-from-bottom-5 duration-700 delay-400">
                    {/* 
                        TODO: Link to Dashboard / My Orders when implemented.
                        For now, go to home or projects.
                    */}
                    <Link href="/dashboard" className="w-full">
                        <Button className="w-full h-12" variant="default">
                            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="/projects" className="w-full">
                        <Button variant="outline" className="w-full h-12">
                            Continue Shopping <ShoppingBag className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px]" />
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
