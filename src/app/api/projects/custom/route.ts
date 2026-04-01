import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { z } from 'zod';

const customProjectSchema = z.object({
    title: z.string().min(5).max(100),
    description: z.string().min(20),
    techStack: z.array(z.string()).min(1),
    budget: z.string().optional(),
    deadline: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

export async function POST(req: NextRequest) {
    let session;
    try {
        session = await getServerSession(authOptions);
        if (!session?.user) {
            return apiError('Unauthorized', HTTP.UNAUTHORIZED);
        }

        const body = await req.json();
        const validatedData = customProjectSchema.parse(body);

        const request = await prisma.customProjectRequest.create({
            data: {
                userId: session.user.id,
                title: validatedData.title,
                description: validatedData.description,
                techStack: validatedData.techStack,
                budget: validatedData.budget,
                deadline: validatedData.deadline,
                status: 'PENDING',
            },
        });

        return apiSuccess(request, undefined, HTTP.CREATED);
    } catch (error) {
        const isAdmin = session?.user?.role === 'ADMIN';
        if (error instanceof z.ZodError) {
            return apiError(error.errors[0].message, HTTP.BAD_REQUEST, error.errors, isAdmin);
        }
        console.error('[Custom Project API Error]', error);
        return apiError(
            'Something went wrong while submitting your project request. Please try again later.', 
            HTTP.INTERNAL_SERVER_ERROR, 
            error instanceof Error ? { message: error.message, stack: error.stack } : error,
            isAdmin
        );
    }
}
