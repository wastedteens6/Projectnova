'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

export interface CartItem {
    id: string;
    projectId: string;
    project: {
        id: string;
        title: string;
        slug: string;
        images: string[];
        thumbnailUrl?: string;
        tier1Price: number;
        tier2Price: number;
        tier3Price: number;
    };
    tier: 1 | 2 | 3;
    price: number;
}

interface CartContextType {
    items: CartItem[];
    cartCount: number;
    cartTotal: number;
    isLoading: boolean;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
    addToCart: (projectId: string, tier: 1 | 2 | 3) => Promise<void>;
    removeFromCart: (projectId: string) => Promise<void>;
    clearCart: () => void;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const cartCount = items.length;
    const cartTotal = items.reduce((sum, item) => sum + item.price, 0);

    // Fetch cart from server when user logs in
    const refreshCart = useCallback(async () => {
        if (!session?.user) {
            setItems([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch cart:', err);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user]);

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    const addToCart = async (projectId: string, tier: 1 | 2 | 3) => {
        if (!session?.user) {
            // Redirect to login if not authenticated
            window.location.href = '/auth/login?callbackUrl=' + window.location.pathname;
            return;
        }

        // Optimistically check for duplicate
        const exists = items.some((i) => i.projectId === projectId);
        if (exists) {
            setIsOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, tier }),
            });
            const data = await res.json();
            if (data.success) {
                await refreshCart();
                setIsOpen(true);
            } else {
                alert(data.error || 'Failed to add item to cart');
            }
        } catch (err) {
            console.error('Add to cart error:', err);
            alert('Failed to add item to cart. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const removeFromCart = async (projectId: string) => {
        setIsLoading(true);
        // Optimistic update
        setItems((prev) => prev.filter((i) => i.projectId !== projectId));
        try {
            await fetch('/api/cart', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId }),
            });
        } catch (err) {
            console.error('Failed to remove from cart:', err);
            await refreshCart(); // Revert on error
        } finally {
            setIsLoading(false);
        }
    };

    const clearCart = () => setItems([]);

    return (
        <CartContext.Provider
            value={{
                items,
                cartCount,
                cartTotal,
                isLoading,
                isOpen,
                openCart,
                closeCart,
                addToCart,
                removeFromCart,
                clearCart,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
