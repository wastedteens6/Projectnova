'use client';

import { useCart } from '@/context/CartContext';
import { CartItemRow } from './CartItem';
import { CheckoutButton } from './CheckoutButton';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CartDrawer() {
    const { items, cartTotal, cartCount, isOpen, closeCart, isLoading } = useCart();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={closeCart}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform bg-background border-l border-border/50 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold">
                            Your Cart{' '}
                            {cartCount > 0 && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    ({cartCount} item{cartCount !== 1 ? 's' : ''})
                                </span>
                            )}
                        </h2>
                    </div>
                    <button
                        onClick={closeCart}
                        className="rounded-full p-2 hover:bg-muted transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex h-[calc(100%-8rem)] flex-col overflow-y-auto px-6 py-4">
                    {isLoading ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
                        </div>
                    ) : items.length === 0 ? (
                        /* Empty State */
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                            <div className="rounded-full bg-muted p-6">
                                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Your cart is empty</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Browse our projects and add them to your cart
                                </p>
                            </div>
                            <Link href="/projects" onClick={closeCart}>
                                <Button variant="gradient" className="mt-2">
                                    Browse Projects
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        /* Cart Items */
                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartItemRow key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer with Total + Checkout */}
                {items.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 bg-background px-6 py-4 space-y-3">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
                            <span>Taxes included</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="text-primary">₹{cartTotal.toLocaleString()}</span>
                        </div>
                        <CheckoutButton />
                    </div>
                )}
            </div>
        </>
    );
}
