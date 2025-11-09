import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_DOMAIN = process.env.JWT_DOMAIN || 'lore-base.vercel.app';

const AuthPayloadSchema = z.object({
  fid: z.number(),
  username: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type AuthPayload = z.infer<typeof AuthPayloadSchema>;

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown;
    return AuthPayloadSchema.parse(decoded);
  } catch {
    return null;
  }
}

export function createToken(fid: number, username?: string): string {
  return jwt.sign(
    { fid, username },
    JWT_SECRET,
    {
      issuer: JWT_DOMAIN,
      expiresIn: '7d',
    }
  );
}

export function getAuthFromRequest(request: Request | NextRequest): AuthPayload | null {
  // First, try to get token from cookie (for NextRequest)
  if ('cookies' in request) {
    const cookieToken = (request as NextRequest).cookies.get('auth_token')?.value;
    if (cookieToken) {
      const payload = verifyToken(cookieToken);
      if (payload) return payload;
    }
  }

  // Fall back to Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  return null;
}

