import { NextResponse } from 'next/server';
import { NeynarAPIClient } from 'neynar';

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || '');

/**
 * Notification proxy endpoint for MiniKit
 * Matches Base MiniKit starter pattern
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, notification } = body;

    if (!fid || !notification) {
      return NextResponse.json(
        { error: 'fid and notification required' },
        { status: 400 }
      );
    }

    // Send frame notification via Neynar
    // This is a simplified version - in production you'd use the notification client
    const result = await neynarClient.publishCast(
      String(fid),
      `${notification.title}: ${notification.body}`,
      {
        replyTo: undefined,
      }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

