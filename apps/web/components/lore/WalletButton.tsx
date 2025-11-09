"use client";

import { useAccount, useConnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAddress } from '@/lib/utils';

interface WalletButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'default' | 'lg';
}

export function WalletButton({ 
  className, 
  variant = 'default',
  size = 'default' 
}: WalletButtonProps) {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();

  if (isConnected && address) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn("font-mono", className)}
        disabled
      >
        <Check className="mr-2 h-4 w-4" />
        {formatAddress(address)}
      </Button>
    );
  }

  const handleConnect = () => {
    if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      className={className}
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}

