/**
 * Token Configuration
 * Stores deployed Clanker token contract information
 * Configured after manual deployment via Clanker.World UI
 */

export interface TokenConfig {
  address: string;
  clankerTokenId?: string;
  chainId: number;
  liquidityPoolAddress?: string;
  name: string;
  symbol: string;
  deployedAt?: Date;
  isActive: boolean;
}

/**
 * Get token configuration from environment variables
 * These should be set after deploying via Clanker.World UI
 */
export function getTokenConfig(): TokenConfig | null {
  const address = process.env.LORE_TOKEN_ADDRESS;
  const chainId = process.env.LORE_TOKEN_CHAIN_ID 
    ? parseInt(process.env.LORE_TOKEN_CHAIN_ID, 10)
    : null;
  const name = process.env.LORE_TOKEN_NAME || 'LORE Token';
  const symbol = process.env.LORE_TOKEN_SYMBOL || 'LORE';

  if (!address || !chainId) {
    return null;
  }

  return {
    address,
    clankerTokenId: process.env.LORE_TOKEN_CLANKER_ID,
    chainId,
    liquidityPoolAddress: process.env.LORE_TOKEN_LIQUIDITY_POOL,
    name,
    symbol,
    deployedAt: process.env.LORE_TOKEN_DEPLOYED_AT 
      ? new Date(process.env.LORE_TOKEN_DEPLOYED_AT)
      : undefined,
    isActive: process.env.LORE_TOKEN_IS_ACTIVE === 'true',
  };
}

/**
 * Check if token is deployed and configured
 */
export function isTokenDeployed(): boolean {
  const config = getTokenConfig();
  return config !== null && config.isActive;
}

/**
 * Get token address for current network
 */
export function getTokenAddress(): string | null {
  const config = getTokenConfig();
  return config?.address || null;
}

