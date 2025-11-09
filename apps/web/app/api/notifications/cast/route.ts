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

    // Cast to Farcaster feed
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
  } catch (error) {
    console.error('Cast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

