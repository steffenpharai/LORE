/**
 * Token Sync Service
 * Syncs off-chain lorePoints to on-chain Clanker token balances
 * Uses Merkle tree for claim verification (leverages existing ClaimManager)
 */

import { prisma } from './prisma';
import { getTokenConfig, isTokenDeployed } from './token-config';
import { createPublicClient, http, encodeAbiParameters, keccak256, toHex } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { MerkleTree } from 'merkletreejs';

/**
 * Generate Merkle tree from pending claims
 */
export async function generateMerkleTree(): Promise<{
  tree: MerkleTree;
  root: string;
  leaves: Array<{ address: string; amount: bigint; leaf: string }>;
}> {
  const config = getTokenConfig();
  if (!config) {
    throw new Error('Token not configured');
  }

  // Get all unclaimed rewards
  const unclaimedClaims = await prisma.claim.findMany({
    where: { isClaimed: false },
    include: { user: true },
  });

  // Fetch custody addresses from Neynar for users
  const { fetchUser } = await import('./neynar');
  const leaves = [];
  
  for (const claim of unclaimedClaims) {
    try {
      const neynarUser = await fetchUser(claim.user.fid.toString());
      if (neynarUser.custody_address) {
        const address = neynarUser.custody_address as `0x${string}`;
        const amount = BigInt(claim.amount);
      
      // Encode: keccak256(abi.encodePacked(address, amount))
        const encoded = encodeAbiParameters(
          [{ type: 'address' }, { type: 'uint256' }],
          [address, amount]
        );
        const leaf = keccak256(encoded);

        leaves.push({
          address,
          amount,
          leaf,
          claimId: claim.id,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch address for user ${claim.user.fid}:`, error);
    }
  }

  // Create Merkle tree
  // MerkleTree expects Buffer, but we have hex strings, so convert
  const tree = new MerkleTree(
    leaves.map((l) => Buffer.from(l.leaf.slice(2), 'hex')),
    (data: Buffer) => {
      const hex = `0x${data.toString('hex')}` as `0x${string}`;
      return Buffer.from(keccak256(hex).slice(2), 'hex');
    },
    { sortPairs: true }
  );

  const root = tree.getHexRoot();

  return {
    tree,
    root,
    leaves: leaves.map(({ address, amount, leaf }) => ({ address, amount, leaf })),
  };
}

/**
 * Get Merkle proof for a specific claim
 */
export async function getMerkleProof(
  address: `0x${string}`,
  amount: bigint
): Promise<{ proof: string[]; root: string } | null> {
  const { tree, root, leaves } = await generateMerkleTree();

  const leaf = leaves.find(
    (l) => l.address.toLowerCase() === address.toLowerCase() && l.amount === amount
  );

  if (!leaf) {
    return null;
  }

  const proof = tree.getHexProof(leaf.leaf);

  return {
    proof,
    root,
  };
}

/**
 * Sync off-chain points to claim records
 * This should be called periodically or when points are awarded
 */
export async function syncPointsToClaims(userId: string): Promise<void> {
  if (!isTokenDeployed()) {
    // Token not deployed yet, skip sync
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { claims: { where: { isClaimed: false } } },
  });

  if (!user) {
    return;
  }

  // Fetch custody address from Neynar
  let custodyAddress: string | null = null;
  try {
    const { fetchUser } = await import('./neynar');
    const neynarUser = await fetchUser(user.fid.toString());
    custodyAddress = neynarUser.custody_address || null;
  } catch (error) {
    console.error(`Failed to fetch address for user ${user.fid}:`, error);
  }

  if (!custodyAddress) {
    // User has no custody address, can't claim on-chain
    return;
  }

  const totalUnclaimed = user.claims.reduce((sum, claim) => sum + claim.amount, 0);
  const pendingPoints = user.lorePoints - totalUnclaimed;

  if (pendingPoints > 0) {
    // Create new claim record for pending points
    await prisma.claim.create({
      data: {
        userId: user.id,
        amount: pendingPoints,
      },
    });
  }
}

/**
 * Batch sync all users' points to claims
 */
export async function batchSyncPointsToClaims(): Promise<{
  synced: number;
  totalClaims: number;
}> {
  if (!isTokenDeployed()) {
    return { synced: 0, totalClaims: 0 };
  }

  const users = await prisma.user.findMany({
    where: {
      lorePoints: { gt: 0 },
    },
    include: { claims: { where: { isClaimed: false } } },
  });

  let synced = 0;
  let totalClaims = 0;
  const { fetchUser } = await import('./neynar');

  for (const user of users) {
    // Check if user has custody address
    let hasAddress = false;
    try {
      const neynarUser = await fetchUser(user.fid.toString());
      hasAddress = !!neynarUser.custody_address;
    } catch (error) {
      console.error(`Failed to fetch address for user ${user.fid}:`, error);
    }

    if (!hasAddress) {
      continue; // Skip users without custody addresses
    }

    const totalUnclaimed = user.claims.reduce((sum, claim) => sum + claim.amount, 0);
    const pendingPoints = user.lorePoints - totalUnclaimed;

    if (pendingPoints > 0) {
      await prisma.claim.create({
        data: {
          userId: user.id,
          amount: pendingPoints,
        },
      });
      synced++;
    }
    totalClaims += user.claims.length;
  }

  return { synced, totalClaims };
}

