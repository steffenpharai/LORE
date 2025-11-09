import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const UpdateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  theme: z.string().optional(),
  customAvatarUrl: z.string().url().optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = UpdateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { fid: auth.fid },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(validated.bio !== undefined && { bio: validated.bio }),
        ...(validated.theme !== undefined && { theme: validated.theme }),
        ...(validated.customAvatarUrl !== undefined && {
          customAvatarUrl: validated.customAvatarUrl,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        fid: updated.fid,
        username: updated.username,
        bio: updated.bio,
        theme: updated.theme,
        customAvatarUrl: updated.customAvatarUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

