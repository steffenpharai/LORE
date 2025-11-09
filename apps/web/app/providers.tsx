'use client';

import { MiniAppProvider } from '@/contexts/miniapp-context';
import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base, baseSepolia } from 'viem/chains';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const chain = process.env.NEXT_PUBLIC_BASE_ENV === 'prod' ? base : baseSepolia;
  const projectId = process.env.NEXT_PUBLIC_MINIKIT_PROJECT_ID || '';

  return (
    <QueryClientProvider client={queryClient}>
      <MiniKitProvider
        projectId={projectId}
        notificationProxyUrl="/api/notification"
        chain={chain}
      >
        <MiniAppProvider>{children}</MiniAppProvider>
      </MiniKitProvider>
    </QueryClientProvider>
  );
}

