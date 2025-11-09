/**
 * Token Contract Integration
 * Interact with deployed Clanker token contract using wagmi/viem
 */

import { getTokenConfig } from './token-config';
import { createPublicClient, http, formatUnits, parseUnits, encodeFunctionData } from 'viem';
import { base, baseSepolia } from 'viem/chains';

// Standard ERC-20 ABI (Clanker tokens are standard ERC-20)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

/**
 * Get public client for the configured chain
 */
function getPublicClient() {
  const config = getTokenConfig();
  if (!config) {
    throw new Error('Token not configured');
  }

  const chain = config.chainId === 8453 ? base : baseSepolia;
  const rpcUrl = process.env.ALCHEMY_BASE_RPC || process.env.NEXT_PUBLIC_ALCHEMY_BASE_RPC;

  if (!rpcUrl) {
    throw new Error('RPC URL not configured');
  }

  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

/**
 * Get token balance for an address
 */
export async function getBalance(address: `0x${string}`): Promise<string> {
  const config = getTokenConfig();
  if (!config) {
    throw new Error('Token not configured');
  }

  const client = getPublicClient();
  const balance = await client.readContract({
    address: config.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address],
  }) as bigint;

  // Get decimals
  const decimals = await client.readContract({
    address: config.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'decimals',
  }) as number;

  return formatUnits(balance, decimals);
}

/**
 * Get token info (name, symbol, total supply)
 */
export async function getTokenInfo(): Promise<{
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
}> {
  const config = getTokenConfig();
  if (!config) {
    throw new Error('Token not configured');
  }

  const client = getPublicClient();
  const [name, symbol, totalSupply, decimals] = await Promise.all([
    client.readContract({
      address: config.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'name',
    }) as Promise<string>,
    client.readContract({
      address: config.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'symbol',
    }) as Promise<string>,
    client.readContract({
      address: config.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'totalSupply',
    }) as Promise<bigint>,
    client.readContract({
      address: config.address as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
    }) as Promise<number>,
  ]);

  return {
    name,
    symbol,
    totalSupply: formatUnits(totalSupply, decimals),
    decimals,
  };
}

/**
 * Prepare transfer transaction data
 * Note: Actual transaction execution should be done via wagmi hooks in the frontend
 */
export function prepareTransfer(
  to: `0x${string}`,
  amount: string,
  decimals: number = 18
): {
  to: `0x${string}`;
  data: `0x${string}`;
} {
  const config = getTokenConfig();
  if (!config) {
    throw new Error('Token not configured');
  }

  const amountWei = parseUnits(amount, decimals);

  // This would be used with wagmi's writeContract
  // For now, return the contract address and function data
  const data = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [to, amountWei],
  });

  return {
    to: config.address as `0x${string}`,
    data: data as `0x${string}`,
  };
}

