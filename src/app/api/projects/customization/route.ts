import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { z } from 'zod';

const customizationSchema = z.object({
    projectId: z.string().cuid(),
    tier: z.number().refine(val => val === 3 || val === 4, {
        message: "Customization is only available for Tier 3 & 4",
    }),
    description: z.string().min(10),
    type: z.enum(['STANDARD', 'MAJOR']),
});

export async function POST(req: NextRequest) {
    let session;
    try {
        session = await getServerSession(authOptions);
        if (!session?.user) {
            return apiError('Unauthorized', HTTP.UNAUTHORIZED);
        }

        const body = await req.json();
        const validatedData = customizationSchema.parse(body);

        // Verify project exists
        const project = await prisma.project.findUnique({
            where: { id: validatedData.projectId }
        });

        if (!project) {
            return apiError('Project not found', HTTP.NOT_FOUND);
        }

        const request = await prisma.projectCustomizationRequest.create({
            data: {
                userId: session.user.id,
                projectId: validatedData.projectId,
                tier: validatedData.tier,
                description: validatedData.description,
                type: validatedData.type,
                status: 'PENDING',
            },
        });

        return apiSuccess(request, undefined, HTTP.CREATED);
    } catch (error) {
        const isAdmin = session?.user?.role === 'ADMIN';
        if (error instanceof z.ZodError) {
            return apiError(error.errors[0].message, HTTP.BAD_REQUEST, error.errors, isAdmin);
        }
        console.error('[Customization API Error]', error);
        return apiError(
            'Something went wrong while processing your customization request. Please try again later.', 
            HTTP.INTERNAL_SERVER_ERROR, 
            error instanceof Error ? { message: error.message, stack: error.stack } : error,
            isAdmin
        );
    }
}
