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
      // Get the context from Farcaster
      const ctx = await sdk.context;
      setContext(ctx);

      if (ctx?.user) {
        setUser({
          fid: ctx.user.fid,
          username: ctx.user.username,
          displayName: ctx.user.displayName,
          pfpUrl: ctx.user.pfpUrl,
        });
      }

      // Signal that the app is ready to display
      await sdk.actions.ready();
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
