import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail } from '@/lib/services/auth.service';
import { verifyEmailSchema } from '@/lib/validations/auth.validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { token } = verifyEmailSchema.parse(body);

    // Verify email
    const result = await verifyEmail(token);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// Also handle GET for email links (e.g., /api/auth/verify-email?token=xxx)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token is required',
        },
        { status: 400 }
      );
    }

    // Verify email
    const result = await verifyEmail(token);

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL('/auth/login?verified=true', request.url)
    );
  } catch (error) {
    if (error instanceof Error) {
      // Redirect to login with error
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/auth/login?error=Verification failed', request.url)
    );
  }
}
