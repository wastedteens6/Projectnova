'use client';

import { useCart, CartItem } from '@/context/CartContext';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const TIER_NAMES = { 1: 'Code Only', 2: 'Code + Videos', 3: 'Premium Support' };

export function CartItemRow({ item }: { item: CartItem }) {
    const { removeFromCart, closeCart } = useCart();
    const imageUrl = item.project.thumbnailUrl || item.project.images[0] || null;

    return (
        <div className="flex gap-4 rounded-xl border border-border/50 bg-card/50 p-4">
            {/* Thumbnail */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.project.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                        IMG
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex flex-1 flex-col gap-1 min-w-0">
                <Link
                    href={`/projects/${item.project.slug}`}
                    onClick={closeCart}
                    className="text-sm font-semibold hover:text-primary transition-colors line-clamp-2"
                >
                    {item.project.title}
                </Link>
                <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Tier {item.tier} — {TIER_NAMES[item.tier]}
                </span>
                <span className="text-base font-bold text-primary">
                    ₹{item.price.toLocaleString()}
                </span>
            </div>

            {/* Remove Button */}
            <button
                onClick={() => removeFromCart(item.projectId)}
                className="flex-shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                aria-label="Remove item"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
