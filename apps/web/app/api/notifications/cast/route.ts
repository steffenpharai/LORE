import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // For viral exit casts, we may not require auth (system-generated)
    // But for user-initiated casts, we should check auth
    const auth = getAuthFromRequest(request);
    const body = await request.json();
    const { text, embeds, authorFid } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text required' },
        { status: 400 }
      );
    }

    // If authorFid is provided (viral exit cast), use system signer
    // Otherwise, require auth for user-initiated casts
    const signerUuid = authorFid 
      ? process.env.NEYNAR_SIGNER_UUID 
      : (auth ? process.env.NEYNAR_SIGNER_UUID : null);

    if (!signerUuid) {
      return NextResponse.json(
        { error: 'Unauthorized or missing signer configuration' },
        { status: 401 }
      );
    }

    // Cast to feed using Neynar API v2
    const castPayload: any = {
      signer_uuid: signerUuid,
      text,
    };

    // Add embeds if provided (for OG images)
    if (embeds && Array.isArray(embeds) && embeds.length > 0) {
      castPayload.embeds = embeds;
    }

    const response = await fetch('https://api.neynar.com/v2/farcaster/cast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEYNAR_API_KEY || '',
      },
      body: JSON.stringify(castPayload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('Neynar cast error:', error);
      throw new Error(error.message || 'Failed to publish cast');
    }

    const cast = await response.json();

    return NextResponse.json({
      success: true,
      cast: {
        hash: cast.hash,
        text: cast.text,
      },
    });
  } catch (error) {
    console.error('Cast error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

