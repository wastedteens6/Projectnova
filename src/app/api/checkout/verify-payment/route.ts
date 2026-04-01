import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { verifyPaymentSchema } from '@/lib/validations/api.validation';
import { grantDriveAccess } from '@/lib/google-drive';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return apiError('Unauthorized', HTTP.UNAUTHORIZED);
    }

    try {
        const body = await req.json();
        const parsed = verifyPaymentSchema.safeParse(body);

        if (!parsed.success) {
            return apiError(parsed.error.errors[0].message, HTTP.BAD_REQUEST);
        }

        const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

        // 1. Verify Signature
        const bodyData = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(bodyData.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpaySignature;

        if (!isAuthentic) {
            return apiError('Invalid payment signature', HTTP.BAD_REQUEST);
        }

        const existingOrder = await prisma.order.findUnique({
            where: { razorpayOrderId },
            include: { items: true },
        });

        if (!existingOrder) {
            return apiError('Order not found', HTTP.NOT_FOUND);
        }

        if (existingOrder.userId !== session.user.id) {
            return apiError('Forbidden', HTTP.FORBIDDEN);
        }

        let order = existingOrder;
        if (existingOrder.status !== 'PAID') {
            order = await prisma.order.update({
                where: { razorpayOrderId },
                data: {
                    status: 'PAID',
                    razorpayPaymentId,
                    razorpaySignature,
                },
                include: { items: true },
            });
        }

        // 3. Clear User's Cart
        await prisma.cart.deleteMany({
            where: { userId: session.user.id },
        });

        // 4. Grant Google Drive Access
        const userEmail = session.user.email;
        if (userEmail) {
            for (const item of order.items) {
                try {
                    // Fetch project to get Drive IDs
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
                    console.error(`[Drive Sync Error] Failed for ${userEmail} on project ${item.projectId}:`, driveErr);
                    // Don't fail the whole request if Drive sync fails, but log it
                }
            }
        }

        return apiSuccess({
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: 'PAID',
        });

    } catch (error) {
        console.error('[Verify Payment Error]', error);
        return apiError('Payment verification failed', HTTP.INTERNAL_SERVER_ERROR, error);
    }
}
