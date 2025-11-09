import { MESSAGE_EXPIRATION_TIME } from '@/lib/constants';
import { type NeynarUser } from '@/lib/neynar';
import { useAuthenticate, useMiniKit } from '@coinbase/onchainkit/minikit';
import { useCallback, useEffect, useState } from 'react';

export interface BaseUser {
  fid: string | number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  custody_address?: string;
  verifications?: string[];
}

export const useSignIn = ({ autoSignIn = false }: { autoSignIn?: boolean }) => {
  const { context } = useMiniKit();
  // this method allows for Sign in with Base app authentication
  const { signIn } = useAuthenticate();
  const [user, setUser] = useState<NeynarUser | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Base app user data from context
  const baseUser: BaseUser | null = context?.user ? {
    fid: context.user.fid,
    username: context.user.username,
    display_name: (context.user as any).display_name || (context.user as any).displayName || undefined,
    pfp_url: (context.user as any).pfp_url || (context.user as any).pfpUrl || undefined,
    custody_address: (context.user as any).custody_address || (context.user as any).custodyAddress || undefined,
    verifications: (context.user as any).verifications || [],
  } : null;

  const handleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!context) {
        throw new Error('No context found');
      }
      let referrerFid: number | null = null;
      const result = await signIn({
        nonce: Math.random().toString(36).substring(2),
        notBefore: new Date().toISOString(),
        expirationTime: new Date(
          Date.now() + MESSAGE_EXPIRATION_TIME
        ).toISOString(),
      });
      if (!result) {
        throw new Error('Sign in failed');
      }
      referrerFid =
        context.location?.type === 'cast_embed'
          ? (() => {
              const fid = (context.location.cast as { fid?: string | number })?.fid;
              return fid ? (typeof fid === 'number' ? fid : parseInt(fid, 10)) : null;
            })()
          : null;

      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          signature: result.signature,
          message: result.message,
          fid: context.user.fid,
          referrerFid,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(errorData);
        throw new Error(errorData.message || 'Sign in failed');
      }

      const data = await res.json();
      console.log('data', data);
      // Merge Base app context user data with server response
      const mergedUser: NeynarUser = {
        ...data.user,
        // Prefer Base app context data when available
        fid: baseUser?.fid?.toString() || data.user.fid,
        username: baseUser?.username || data.user.username,
        display_name: baseUser?.display_name || data.user.display_name,
        pfp_url: baseUser?.pfp_url || data.user.pfp_url,
        custody_address: baseUser?.custody_address || data.user.custody_address,
        verifications: baseUser?.verifications || data.user.verifications || [],
      };
      setUser(mergedUser);
      setIsSignedIn(true);
      return { ...data, user: mergedUser };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [context, signIn, baseUser]);

  useEffect(() => {
    // if autoSignIn is true, sign in automatically on mount
    if (autoSignIn) {
      handleSignIn();
    }
  }, [autoSignIn, handleSignIn]);

  // Return Base app user data directly from context when available
  const effectiveUser = baseUser ? {
    fid: baseUser.fid.toString(),
    username: baseUser.username || '',
    display_name: baseUser.display_name || '',
    pfp_url: baseUser.pfp_url || '',
    custody_address: baseUser.custody_address || '',
    verifications: baseUser.verifications || [],
  } : user;

  return { 
    signIn: handleSignIn, 
    isSignedIn, 
    isLoading, 
    error, 
    user: effectiveUser,
    baseUser: baseUser, // Expose Base context user directly
  };
};

