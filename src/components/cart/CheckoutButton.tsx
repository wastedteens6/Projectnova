'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function CheckoutButton() {
    const { cartTotal, clearCart, closeCart, refreshCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const router = useRouter();

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        setIsProcessing(true);

        try {
            // Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                alert('Failed to load payment gateway. Please try again.');
                setIsProcessing(false);
                return;
            }

            // Create Razorpay order on server
            const res = await fetch('/api/checkout/create-order', { method: 'POST' });
            const data = await res.json();

            if (!data.success) {
                alert(data.error || 'Failed to initiate checkout');
                setIsProcessing(false);
                return;
            }

            const { razorpayOrderId, amount, currency, keyId } = data.data;

            // Open Razorpay modal
            const options = {
                key: keyId,
                amount,
                currency,
                name: 'ProjectNova',
                description: 'Final Year Project Purchase',
                order_id: razorpayOrderId,
                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    // Verify payment on server
                    const verifyRes = await fetch('/api/checkout/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        }),
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        clearCart();
                        closeCart();
                        router.push(`/checkout/success?order=${verifyData.data.orderNumber}`);
                    } else {
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {},
                theme: {
                    color: '#6366f1', // Indigo/primary color
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Something went wrong. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <Button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full h-12 text-base font-semibold"
            variant="gradient"
        >
            {isProcessing ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Pay ₹{cartTotal.toLocaleString()}
                </>
            )}
        </Button>
    );
}
