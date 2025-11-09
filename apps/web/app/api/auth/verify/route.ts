import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { verifyFarcasterSignature } from '@/lib/farcaster-auth';
import { prisma } from '@/lib/prisma';
import * as jose from 'jose';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, fid, signature, message } = body;

    let verifiedFid: number;
    let username: string | undefined;
    let walletAddress: string | undefined;

    // Try Farcaster signature verification first (OnchainKit pattern)
    if (fid && signature && message) {
      const user = await verifyFarcasterSignature(fid, signature, message);
      if (user) {
        verifiedFid = typeof user.fid === 'string' ? parseInt(user.fid) : user.fid;
        username = user.username;
        walletAddress = user.custody_address;
      } else {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    } else if (token) {
      // Fallback to JWT token (for backward compatibility)
      const payload = verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      verifiedFid = payload.fid;
      username = payload.username;
    } else {
      return NextResponse.json(
        { error: 'Token or Farcaster signature required' },
        { status: 400 }
      );
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { fid: verifiedFid },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fid: verifiedFid,
          username,
        },
      });
    } else if (username && user.username !== username) {
      // Update username if it changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    }

    // Generate JWT token (matching Base MiniKit pattern)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
    const jwtToken = await new jose.SignJWT({
      fid: verifiedFid,
      walletAddress,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secret);

    // Create the response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fid: user.fid,
        username: user.username,
        lorePoints: user.lorePoints,
      },
    });

    // Set the auth cookie with the JWT token (matching Base MiniKit pattern)
    response.cookies.set({
      name: 'auth_token',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

