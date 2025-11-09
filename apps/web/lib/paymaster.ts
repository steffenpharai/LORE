import { type Address, type Hex } from 'viem';

export interface PaymasterRequest {
  chainId: number;
  entryPoint: Address;
  userOperation: {
    sender: Address;
    nonce: Hex;
    initCode: Hex;
    callData: Hex;
    callGasLimit: Hex;
    verificationGasLimit: Hex;
    preVerificationGas: Hex;
    maxFeePerGas: Hex;
    maxPriorityFeePerGas: Hex;
    paymasterAndData: Hex;
    signature: Hex;
  };
}

export interface PaymasterResponse {
  paymasterAndData: Hex;
  verificationGasLimit?: Hex;
  preVerificationGas?: Hex;
}

/**
 * Base Paymaster integration for gas sponsorship
 * Supports EIP-5792 batch transactions
 */
export class BasePaymaster {
  private paymasterUrl: string;

  constructor(paymasterUrl?: string) {
    this.paymasterUrl = paymasterUrl || process.env.BASE_PAYMASTER_URL || 'https://paymaster.base.org';
  }

  /**
   * Sponsor a user operation (EIP-4337)
   */
  async sponsorUserOperation(
    request: PaymasterRequest
  ): Promise<PaymasterResponse> {
    try {
      const response = await fetch(`${this.paymasterUrl}/v1/sponsor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Paymaster error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Paymaster sponsorship failed:', error);
      throw error;
    }
  }

  /**
   * Batch multiple operations for EIP-5792
   */
  async batchSponsorUserOperations(
    requests: PaymasterRequest[]
  ): Promise<PaymasterResponse[]> {
    try {
      const response = await fetch(`${this.paymasterUrl}/v1/batch-sponsor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operations: requests }),
      });

      if (!response.ok) {
        throw new Error(`Batch paymaster error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.responses || [];
    } catch (error) {
      console.error('Batch paymaster sponsorship failed:', error);
      throw error;
    }
  }

  /**
   * Check if paymaster is available for a given chain
   */
  async isAvailable(chainId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.paymasterUrl}/v1/status?chainId=${chainId}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const paymaster = new BasePaymaster();

