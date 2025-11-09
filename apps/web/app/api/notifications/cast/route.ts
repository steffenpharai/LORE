import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest } from '@/lib/auth';
import { NeynarAPIClient } from 'neynar';

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text required' },
        { status: 400 }
      );
    }

    // Check if Neynar API key is configured
    if (!process.env.NEYNAR_API_KEY) {
      return NextResponse.json(
        { error: 'Neynar API key not configured' },
        { status: 500 }
      );
    }

    // Cast to Farcaster feed
    // Note: Free tier has rate limits. For production, consider:
    // - Using a signer for authenticated casts
    // - Implementing retry logic with exponential backoff
    // - Caching to avoid duplicate casts
    const cast = await neynarClient.publishCast(
      auth.fid.toString(),
      text,
      {
        replyTo: undefined,
      }
    );

    return NextResponse.json({
      cast: {
        hash: cast.hash,
        text: cast.text,
      },
    });
  } catch (error: any) {
    console.error('Cast error:', error);
    
    // Handle rate limiting (common on free tier)
    if (error?.status === 429 || error?.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Handle authentication errors
    if (error?.status === 401 || error?.status === 403) {
      return NextResponse.json(
        { error: 'Neynar API authentication failed. Check your API key.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

