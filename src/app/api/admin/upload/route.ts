import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { apiError, apiSuccess, HTTP } from '@/lib/api-response';
import { nanoid } from 'nanoid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Limits: 5MB for images, 50MB for video
const LIMITS = {
    image: 5 * 1024 * 1024,
    video: 50 * 1024 * 1024,
};

const ALLOWED_TYPES = {
    image: ['image/jpeg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/webm'],
};

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            return apiError('Unauthorized', HTTP.UNAUTHORIZED);
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as 'image' | 'video';

        if (!file) return apiError('No file provided', HTTP.BAD_REQUEST);
        if (!type || !['image', 'video'].includes(type)) return apiError('Invalid file type category', HTTP.BAD_REQUEST);

        // Validate size
        if (file.size > LIMITS[type]) {
            return apiError(`File too large. Max ${type === 'image' ? '5MB' : '50MB'}`, HTTP.BAD_REQUEST);
        }

        // Validate MIME type
        if (!ALLOWED_TYPES[type].includes(file.type)) {
            return apiError(`Invalid file type. Allowed: ${ALLOWED_TYPES[type].join(', ')}`, HTTP.BAD_REQUEST);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || (type === 'image' ? '.jpg' : '.mp4');
        const filename = `${type}_${nanoid()}${ext}`;
        const dir = path.join(process.cwd(), 'public', 'uploads', type === 'image' ? 'images' : 'videos');
        const filePath = path.join(dir, filename);

        // Ensure directory exists
        await mkdir(dir, { recursive: true });
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/${type === 'image' ? 'images' : 'videos'}/${filename}`;

        return apiSuccess({ url: publicUrl }, 'File uploaded successfully');
    } catch (error) {
        console.error('Upload error:', error);
        return apiError('Failed to upload file', HTTP.INTERNAL_SERVER_ERROR);
    }
}
