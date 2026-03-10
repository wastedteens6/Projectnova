import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { apiSuccess, apiError, HTTP } from '@/lib/api-response';
import { requireAdmin } from '@/lib/admin-guard';

// PATCH — toggle publish/unpublish
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const authErr = requireAdmin(session);
  if (authErr) return authErr;

  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      select: { isPublished: true },
    });

    if (!project) {
      return apiError('Project not found', HTTP.NOT_FOUND);
    }

    // Validation: Cannot publish without images OR video
    if (!project.isPublished) { // Only check when trying to publish (draft -> published)
        const check = await prisma.project.findUnique({
            where: { id: params.id },
            select: { images: true, videoUrl: true }
        });
        
        if (!check?.videoUrl && (!check?.images || check.images.length === 0)) {
            return apiError('Cannot publish project without at least one image or a video', HTTP.BAD_REQUEST);
        }
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: { isPublished: !project.isPublished },
      select: { id: true, isPublished: true },
    });

    return apiSuccess(updated, updated.isPublished ? 'Project published' : 'Project unpublished');
  } catch (err) {
    console.error('[Admin Project Publish PATCH]', err);
    return apiError('Failed to toggle publish status', HTTP.INTERNAL_SERVER_ERROR, err);
  }
}
