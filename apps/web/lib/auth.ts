import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_DOMAIN = process.env.JWT_DOMAIN || 'loremachine.app';

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
  } catch (error) {
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

export function getAuthFromRequest(request: Request): AuthPayload | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

