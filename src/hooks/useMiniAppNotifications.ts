
import { useState, useCallback } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { supabase } from "@/integrations/supabase/client";

interface AddFrameResult {
  added: boolean;
  notificationDetails?: {
    url: string;
    token: string;
  };
  reason?: string;
}

export function useMiniAppNotifications(fid: number | undefined) {
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPrompted, setHasPrompted] = useState(false);

  const promptAddMiniApp = useCallback(async () => {
    if (!fid || hasPrompted) return;

    setIsLoading(true);
    setHasPrompted(true);

    try {
      // Use the Farcaster SDK to prompt adding the mini app
      const result = await sdk.actions.addFrame() as AddFrameResult;

      if (result.added && result.notificationDetails) {
        setIsAdded(true);

        // Save notification token to backend
        await supabase.functions.invoke("save-notification-token", {
          body: {
            fid,
            token: result.notificationDetails.token,
            url: result.notificationDetails.url,
          },
        });

        console.log("Mini app added with notifications enabled");
      } else if (!result.added) {
        console.log("User declined to add mini app:", result.reason);
      }
    } catch (err) {
      console.error("Failed to add mini app:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fid, hasPrompted]);

  return {
    isAdded,
    isLoading,
    promptAddMiniApp,
    hasPrompted,
  };
}
