import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = params;

    const project = await prisma.project.findUnique({
      where: {
        slug,
        isPublished: true,
      },
      include: {
        assignments: {
          where: {
            isActive: true,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: 'Project not found',
        },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    prisma.project
      .update({
        where: { id: project.id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => console.error('Failed to increment views:', err));

    // Transform assignments to hide internal team structure from public
    // Only show if you want to display "Project by Team XYZ" publicly
    // For now, we'll exclude it from the response
    const { assignments, ...projectData } = project;

    // Check for user purchase if logged in
    let purchasedTier = 0;
    if (session?.user?.id) {
      const purchase = await prisma.orderItem.findFirst({
        where: {
          projectId: project.id,
          order: {
            userId: session.user.id,
            status: 'PAID',
          },
        },
        orderBy: { tier: 'desc' },
        select: { tier: true },
      });
      purchasedTier = purchase?.tier || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...projectData,
        purchasedTier,
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch project',
      },
      { status: 500 }
    );
  }
}
