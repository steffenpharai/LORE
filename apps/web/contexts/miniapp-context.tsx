'use client';

import { useAddFrame, useMiniKit } from '@coinbase/onchainkit/minikit';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';

interface MiniAppContextType {
  isFrameReady: boolean;
  setFrameReady: () => void;
  addFrame: () => Promise<{ url: string; token: string } | null>;
}

const MiniAppContext = createContext<MiniAppContextType | undefined>(undefined);

export function MiniAppProvider({ children }: { children: ReactNode }) {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const addFrame = useAddFrame();

  const handleAddFrame = useCallback(async () => {
    try {
      const result = await addFrame();
      // Handle case where result might be undefined or have different structure
      if (result && typeof result === 'object') {
        // Check if result has expected properties
        if ('url' in result && 'token' in result) {
          return result as { url: string; token: string };
        }
        // Handle case where result might be wrapped in a result property
        const resultObj = result as Record<string, unknown>;
        if ('result' in resultObj && resultObj.result && typeof resultObj.result === 'object') {
          const innerResult = resultObj.result as Record<string, unknown>;
          if ('url' in innerResult && 'token' in innerResult) {
            return innerResult as { url: string; token: string };
          }
        }
      }
      return null;
    } catch (error) {
      console.error('[error] adding frame', error);
      // Don't throw, just return null to prevent breaking the app
      return null;
    }
  }, [addFrame]);

  useEffect(() => {
    // on load, set the frame as ready
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [isFrameReady, setFrameReady]);

  useEffect(() => {
    // when the frame is ready, if the frame is not added, prompt the user to add the frame
    if (isFrameReady && !context?.client?.added) {
      handleAddFrame().catch((err) => {
        // Silently handle errors to prevent unhandled promise rejections
        console.debug('Frame add attempt failed:', err);
      });
    }
  }, [context?.client?.added, handleAddFrame, isFrameReady]);

  return (
    <MiniAppContext.Provider
      value={{
        isFrameReady,
        setFrameReady,
        addFrame: handleAddFrame,
      }}
    >
      {children}
    </MiniAppContext.Provider>
  );
}

export function useMiniApp() {
  const context = useContext(MiniAppContext);
  if (context === undefined) {
    throw new Error('useMiniApp must be used within a MiniAppProvider');
  }
  return context;
}

