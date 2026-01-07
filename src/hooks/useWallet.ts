
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface WalletInfo {
  primaryAddress: string | null;
  verifiedAddresses: string[];
  custodyAddress: string | null;
}

export function useWallet(fid: number | undefined) {
  const [wallet, setWallet] = useState<WalletInfo>({
    primaryAddress: null,
    verifiedAddresses: [],
    custodyAddress: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    if (!fid) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("get-user-wallet", {
        body: { fid },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setWallet({
        primaryAddress: data.primaryAddress,
        verifiedAddresses: data.verifiedAddresses || [],
        custodyAddress: data.custodyAddress,
      });
    } catch (err) {
      console.error("Failed to fetch wallet:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch wallet");
    } finally {
      setIsLoading(false);
    }
  }, [fid]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return {
    wallet,
    isLoading,
    error,
    refreshWallet: fetchWallet,
  };
}
