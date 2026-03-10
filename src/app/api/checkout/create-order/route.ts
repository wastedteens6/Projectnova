import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { razorpay } from '@/lib/razorpay';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return apiError('Unauthorized', HTTP.UNAUTHORIZED);
    }

    try {
        // 1. Fetch user's cart with project details
        const cart = await prisma.cart.findUnique({
            where: { userId: session.user.id },
            include: {
                items: {
                    include: {
                        project: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return apiError('Cart is empty', HTTP.BAD_REQUEST);
        }

        // 2. Calculate Total Amount
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of cart.items) {
            let price = 0;
            if (item.tier === 1) price = item.project.tier1Price;
            else if (item.tier === 2) price = item.project.tier2Price;
            else if (item.tier === 3) price = item.project.tier3Price;

            totalAmount += price;
            orderItemsData.push({
                projectId: item.projectId,
                tier: item.tier,
                price: price,
            });
        }

        // 3. Create Razorpay Order
        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}_${session.user.id.slice(0, 5)}`,
            payment_capture: 1,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 4. Create Pending Order in Database
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                totalAmount: totalAmount,
                status: 'PENDING',
                razorpayOrderId: razorpayOrder.id,
                items: {
                    create: orderItemsData,
                },
            },
        });

        // 5. Return Details to Client
        return apiSuccess({
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: order.id, // Internal DB ID
        });

    } catch (error) {
        console.error('[Create Order Error]', error);
        return apiError('Failed to create order', HTTP.INTERNAL_SERVER_ERROR, error);
    }
}
