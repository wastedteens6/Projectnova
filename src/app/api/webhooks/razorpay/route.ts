import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { grantDriveAccess } from '@/lib/google-drive';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            console.error('[Razorpay Webhook] Missing signature or secret');
            return apiError('Unauthorized', HTTP.UNAUTHORIZED);
        }

        // 1. Verify Signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.error('[Razorpay Webhook] Invalid signature');
            return apiError('Invalid signature', HTTP.BAD_REQUEST);
        }

        const event = JSON.parse(body);
        console.log('[Razorpay Webhook] Event received:', event.event);

        // 2. Handle relevant events
        if (event.event === 'order.paid' || event.event === 'payment.captured') {
            const razorpayOrderId = event.payload.order?.entity?.id || event.payload.payment?.entity?.order_id;
            const razorpayPaymentId = event.payload.payment?.entity?.id;

            if (!razorpayOrderId) {
                return apiSuccess({ status: 'ignored', reason: 'No order ID found' });
            }

            // Find the order in our database
            const order = await prisma.order.findUnique({
                where: { razorpayOrderId },
                include: { items: true, user: true },
            });

            if (!order) {
                console.warn('[Razorpay Webhook] Order not found in DB:', razorpayOrderId);
                return apiSuccess({ status: 'ignored', reason: 'Order not found' });
            }

            // Already processed?
            if (order.status === 'PAID') {
                return apiSuccess({ status: 'already_processed' });
            }

            // 3. Update Order Status (Idempotent)
            await prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: order.id },
                    data: {
                        status: 'PAID',
                        razorpayPaymentId: razorpayPaymentId,
                    },
                });

                // Clear cart for the user
                await tx.cart.deleteMany({
                    where: { userId: order.userId },
                });
            });

            // 4. Grant Google Drive Access (Async/Best-effort)
            const userEmail = order.user.email;
            if (userEmail) {
                for (const item of order.items) {
                    try {
                        // Using prisma here instead of tx as it's outside the transaction
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
                        console.error(`[Webhook Drive Sync Error] ${userEmail}:`, driveErr);
                    }
                }
            }
            
            return apiSuccess({ status: 'success', orderId: order.id });
        }

        return apiSuccess({ status: 'event_ignored' });
    } catch (error) {
        console.error('[Razorpay Webhook Error]', error);
        return apiError('Internal Server Error', HTTP.INTERNAL_SERVER_ERROR);
    }
}
