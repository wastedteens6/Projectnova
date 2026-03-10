import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get unique tech stacks from all published projects
    const projects = await prisma.project.findMany({
      where: {
        isPublished: true,
      },
      select: {
        techStack: true,
      },
    });

    // Flatten and get unique technologies
    const allTech = projects.flatMap((p) => p.techStack);
    const uniqueTech = Array.from(new Set(allTech)).sort();

    return NextResponse.json({
      success: true,
      data: uniqueTech,
    });
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tech stack',
      },
      { status: 500 }
    );
  }
}
