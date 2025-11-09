import { verifyMessage } from 'viem';
import { fetchUser, type NeynarUser } from './neynar';

/**
 * Verify Farcaster signature using OnchainKit's authentication pattern
 * This matches the Base MiniKit starter implementation
 */
export async function verifyFarcasterSignature(
  fid: string,
  signature: string,
  message: string
): Promise<NeynarUser | null> {
  try {
    const user = await fetchUser(fid);
    
    if (!user?.custody_address) {
      return null;
    }

    // Verify signature matches custody address
    const isValidSignature = await verifyMessage({
      address: user.custody_address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValidSignature) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to verify Farcaster signature:', error);
    return null;
  }
}

