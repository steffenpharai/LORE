'use client';

import { MiniAppProvider } from '@/contexts/miniapp-context';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'viem/chains';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const chain = process.env.NEXT_PUBLIC_BASE_ENV === 'prod' ? base : baseSepolia;

  return (
    <QueryClientProvider client={queryClient}>
      <OnchainKitProvider
        chain={chain}
        miniKit={{
          enabled: true,
          notificationProxyUrl: '/api/notification',
        }}
      >
        <MiniAppProvider>{children}</MiniAppProvider>
      </OnchainKitProvider>
    </QueryClientProvider>
  );
}

