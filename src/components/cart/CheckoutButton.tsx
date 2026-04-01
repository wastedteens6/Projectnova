'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export function CheckoutButton() {
    const { cartTotal, clearCart, closeCart, refreshCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
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
                toast({
                    title: 'Payment Gateway Error',
                    description: 'Failed to load payment gateway. Please try again.',
                    variant: 'destructive',
                });
                setIsProcessing(false);
                return;
            }

            // Create Razorpay order on server
            const res = await fetch('/api/checkout/create-order', { method: 'POST' });
            const data = await res.json();

            if (!data.success) {
                toast({
                    title: 'Checkout Failed',
                    description: data.error || 'Failed to initiate checkout',
                    variant: 'destructive',
                });
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
                        toast({
                            title: 'Verification Failed',
                            description: 'Payment verification failed. Please contact support.',
                            variant: 'destructive',
                        });
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
            toast({
                title: 'Something went wrong',
                description: 'Failed to process checkout. Please try again.',
                variant: 'destructive',
            });
            setIsProcessing(false);
        }
    };

    const handleTestPurchase = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/checkout/test-purchase', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                clearCart();
                closeCart();
                router.push(`/checkout/success?order=${data.data.orderNumber}&test=true`);
                toast({
                    title: 'Test Purchase Successful',
                    description: 'Order processed via bypass mode.',
                });
            } else {
                toast({
                    title: 'Test Purchase Failed',
                    description: data.error || 'Bypass failed',
                    variant: 'destructive',
                });
            }
        } catch (err) {
            console.error('Test purchase error:', err);
            toast({
                title: 'Error',
                description: 'Failed to process test purchase',
                variant: 'destructive',
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const showTestMode = process.env.NEXT_PUBLIC_ALLOW_TEST_PAYMENT === 'true';

    return (
        <div className="space-y-2">
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

            {showTestMode && (
                <Button
                    onClick={handleTestPurchase}
                    disabled={isProcessing}
                    variant="outline"
                    className="w-full border-dashed border-primary/50 text-xs text-muted-foreground hover:bg-primary/5 h-8"
                >
                    Test Purchase (Bypass Payment)
                </Button>
            )}
        </div>
    );
}
