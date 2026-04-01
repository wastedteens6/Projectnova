"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface UpgradeButtonProps {
    projectId: string;
    projectTitle: string;
    currentTier: number;
    targetTier: number;
    upgradeAmount: number;
}

export function UpgradeButton({
    projectId,
    projectTitle,
    targetTier,
    upgradeAmount,
}: UpgradeButtonProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleUpgrade = async () => {
        setIsProcessing(true);

        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast({
                    title: "Razorpay Failed",
                    description: "Failed to load payment gateway. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            // 1. Create Upgrade Order
            const res = await fetch("/api/checkout/create-upgrade-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, targetTier }),
            });

            const data = await res.json();

            if (!data.success) {
                toast({
                    title: "Upgrade Failed",
                    description: data.error || "Failed to initiate upgrade",
                    variant: "destructive",
                });
                return;
            }

            const { razorpayOrderId, amount, currency, keyId } = data.data;

            // 2. Open Razorpay
            const options = {
                key: keyId,
                amount,
                currency,
                name: "ProjectNova",
                description: `Upgrade ${projectTitle} to Tier ${targetTier}`,
                order_id: razorpayOrderId,
                handler: async (response: any) => {
                    // Verify payment
                    const verifyRes = await fetch("/api/checkout/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        }),
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        toast({
                            title: "Upgrade Successful!",
                            description: `Project upgraded to Tier ${targetTier}. New materials are now available.`,
                        });
                        router.refresh();
                    } else {
                        toast({
                            title: "Verification Failed",
                            description: "Payment verification failed. Please contact support.",
                            variant: "destructive",
                        });
                    }
                },
                theme: { color: "#6366f1" },
                modal: { ondismiss: () => setIsProcessing(false) },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Upgrade error:", err);
            toast({
                title: "Something went wrong",
                description: "Failed to process upgrade. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Button
            onClick={handleUpgrade}
            disabled={isProcessing}
            variant="outline"
            className="w-full h-10 gap-2 border-primary/20 text-primary hover:bg-primary/5 font-bold rounded-xl transition-all"
        >
            {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <ArrowUpCircle className="h-4 w-4" />
            )}
            Upgrade to Tier {targetTier} (₹{upgradeAmount})
        </Button>
    );
}
