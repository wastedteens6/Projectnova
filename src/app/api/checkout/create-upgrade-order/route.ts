import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";
import { apiSuccess, apiError, HTTP } from "@/lib/api-response";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return apiError("Unauthorized", HTTP.UNAUTHORIZED);
    }

    try {
        const { projectId, targetTier } = await req.json();

        if (!projectId || !targetTier) {
            return apiError("Missing projectId or targetTier", HTTP.BAD_REQUEST);
        }

        // 1. Find the player's current highest tier for this project
        const latestPaidOrderItem = await prisma.orderItem.findFirst({
            where: {
                projectId,
                order: {
                    userId: session.user.id,
                    status: "PAID",
                },
            },
            orderBy: { tier: "desc" },
            include: { project: true }
        });

        if (!latestPaidOrderItem) {
            return apiError("Project not owned. Cannot upgrade.", HTTP.NOT_FOUND);
        }

        const project = latestPaidOrderItem.project;
        const currentTier = latestPaidOrderItem.tier;

        if (targetTier <= currentTier) {
            return apiError(`Already at Tier ${currentTier}. Cannot upgrade to Tier ${targetTier}.`, HTTP.BAD_REQUEST);
        }

        // 2. Calculate Price Difference
        let targetTierPrice = 0;
        if (targetTier === 1) targetTierPrice = project.tier1Price;
        else if (targetTier === 2) targetTierPrice = project.tier2Price;
        else if (targetTier === 3) targetTierPrice = project.tier3Price;
        else if (targetTier === 4 && project.tier4Price) targetTierPrice = project.tier4Price;

        if (targetTierPrice === 0) {
            return apiError("Invalid target tier price.", HTTP.BAD_REQUEST);
        }

        // Price Difference = Target Tier Price - (Original Price Paid for current tier)
        // We use the price they PAID to ensure fair upgrades even if project prices changed.
        const upgradeAmount = Math.max(0, targetTierPrice - latestPaidOrderItem.price);

        if (upgradeAmount < 1) {
            // Already fully paid or price decreased (unlikely)
            return apiError("No upgrade cost detected.", HTTP.BAD_REQUEST);
        }

        // 3. Create Razorpay Order
        const options = {
            amount: Math.round(upgradeAmount * 100), // In paise
            currency: "INR",
            receipt: `upgrade_${Date.now()}_${session.user.id.slice(0, 5)}`,
            payment_capture: 1,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 4. Create Pending Upgrade Order in DB
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                totalAmount: upgradeAmount,
                status: "PENDING",
                razorpayOrderId: razorpayOrder.id,
                items: {
                    create: {
                        projectId: projectId,
                        tier: targetTier,
                        price: targetTierPrice, // We store the FULL price of the target tier for audit trail
                    },
                },
            },
        });

        return apiSuccess({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            isUpgrade: true,
            upgradeAmount: upgradeAmount,
        });

    } catch (error) {
        console.error("[Create Upgrade Order Error]", error);
        return apiError("Failed to initiate upgrade", HTTP.INTERNAL_SERVER_ERROR, error);
    }
}
