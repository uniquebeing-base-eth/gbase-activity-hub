
import { useState, useEffect, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export function useFarcasterUser() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [context, setContext] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    try {
      // Check if we're in a Farcaster context with a timeout
      const contextPromise = sdk.context;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Context timeout")), 3000)
      );

      try {
        const ctx = await Promise.race([contextPromise, timeoutPromise]) as unknown;
        setContext(ctx);

        if (ctx && typeof ctx === 'object' && 'user' in ctx) {
          const ctxWithUser = ctx as { user: { fid: number; username?: string; displayName?: string; pfpUrl?: string } };
          setUser({
            fid: ctxWithUser.user.fid,
            username: ctxWithUser.user.username,
            displayName: ctxWithUser.user.displayName,
            pfpUrl: ctxWithUser.user.pfpUrl,
          });
        }
      } catch {
        // Not in Farcaster context, proceed without user
        console.log("Not in Farcaster context or timeout");
      }

      // Signal that the app is ready to display
      try {
        await sdk.actions.ready();
      } catch {
        // Ignore ready errors outside Farcaster
      }
      
      setIsLoaded(true);
    } catch (err) {
      console.error("Failed to initialize Farcaster SDK:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      // Still mark as loaded so the app shows
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const composeCast = useCallback(async (text: string, embeds?: string[]) => {
    try {
      const embedUrls = embeds?.slice(0, 2) as [] | [string] | [string, string] | undefined;
      await sdk.actions.composeCast({
        text,
        embeds: embedUrls,
      });
    } catch (err) {
      console.error("Failed to compose cast:", err);
    }
  }, []);

  return {
    isLoaded,
    user,
    context,
    error,
    composeCast,
  };
}
