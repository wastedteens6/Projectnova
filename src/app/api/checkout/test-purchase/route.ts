import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { grantDriveAccess } from '@/lib/google-drive';

export async function POST(req: NextRequest) {
    // 1. Security Check: Only allow if explicitly enabled in ENV
    if (process.env.NEXT_PUBLIC_ALLOW_TEST_PAYMENT !== 'true') {
        return apiError('Test purchase mode is disabled', HTTP.FORBIDDEN);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return apiError('Unauthorized', HTTP.UNAUTHORIZED);
    }

    try {
        // 2. Fetch user's cart
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

        // 3. Calculate Total and Prepare Items
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

        // 4. Create PAID Order immediately (Bypass Razorpay)
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                totalAmount: totalAmount,
                status: 'PAID',
                razorpayOrderId: `test_order_${Date.now()}`,
                razorpayPaymentId: `test_pay_${Date.now()}`,
                razorpaySignature: 'test_bypass_signature',
                items: {
                    create: orderItemsData,
                },
            },
            include: { items: true },
        });

        // 5. Clear Cart
        await prisma.cart.deleteMany({
            where: { userId: session.user.id },
        });

        // 6. Grant Google Drive Access
        const userEmail = session.user.email;
        if (userEmail) {
            for (const item of order.items) {
                try {
                    const project = await prisma.project.findUnique({
                        where: { id: item.projectId },
                        select: { tier1Files: true, tier2Files: true, tier3Files: true },
                    });

                    if (project) {
                        const tierFile = (project[`tier${item.tier}Files` as keyof typeof project] as any);
                        const driveId = tierFile?.driveId;

                        if (driveId) {
                            await grantDriveAccess(driveId, userEmail);
                        }
                    }
                } catch (driveErr) {
                    console.error(`[Test Purchase Drive Error]`, driveErr);
                }
            }
        }

        return apiSuccess({
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: 'PAID',
            isTest: true,
        });

    } catch (error) {
        console.error('[Test Purchase Error]', error);
        return apiError('Failed to process test purchase', HTTP.INTERNAL_SERVER_ERROR, error);
    }
}
