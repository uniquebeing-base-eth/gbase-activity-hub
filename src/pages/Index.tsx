

import { useState, useCallback, useEffect } from "react";
import Header from "@/components/gbase/Header";
import SendButton from "@/components/gbase/SendButton";
import CountdownTimer from "@/components/gbase/CountdownTimer";
import SharePopup from "@/components/gbase/SharePopup";
import StatRow from "@/components/gbase/StatRow";
import FAQSection from "@/components/gbase/FAQSection";
import LearnAboutBase from "@/components/gbase/LearnAboutBase";
import BottomNav from "@/components/gbase/BottomNav";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { useUserStats } from "@/hooks/useUserStats";
import { useMiniAppNotifications } from "@/hooks/useMiniAppNotifications";
import { supabase } from "@/integrations/supabase/client";
import { GBASE_CONTRACT_ADDRESS, SEND_AMOUNT_WEI, APP_URL } from "@/lib/constants";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, useConnect } from "wagmi";

// Helper to calculate wallet strength
const getWalletStrength = (transactions: number, activeDays: number): string => {
  const score = transactions + activeDays * 5;
  if (score < 10) return "New";
  if (score < 50) return "Warming";
  if (score < 150) return "Active";
  if (score < 500) return "Strong";
  return "Very Strong";
};

const Index = () => {
  const { isLoaded, user, composeCast } = useFarcasterUser();
  const {
    stats,
    isLoading: statsLoading,
    nextEligibleTime,
    setNextEligibleTime,
    refreshStats,
  } = useUserStats(user?.fid);

  // Farcaster-native wallet (via wagmi connector)
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();

  const { promptAddMiniApp, hasPrompted, isAdded } =
    useMiniAppNotifications(user?.fid);

  const [activeTab, setActiveTab] = useState<"home" | "stats">("home");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Auto-connect wallet when running inside Farcaster
  useEffect(() => {
    if (!isLoaded || !user) return;
    if (isConnected || isConnecting) return;

    const connector = connectors?.[0];
    if (!connector) return;

    connect({ connector });
  }, [isLoaded, user, isConnected, isConnecting, connectors, connect]);

  // Trigger the native Farcaster “add mini app” prompt (no custom modal)
  useEffect(() => {
    if (!isLoaded || !user || hasPrompted || isAdded) return;

    const timer = setTimeout(() => {
      void promptAddMiniApp();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoaded, user, hasPrompted, isAdded, promptAddMiniApp]);

  const handleSendGBase = useCallback(async () => {
    if (!user || isSending || nextEligibleTime) return;

    setIsSending(true);

    try {
      const ethProvider = await sdk.wallet.getEthereumProvider();

      if (!ethProvider) {
        console.error("Ethereum provider not available");
        return;
      }

      // Ensure wallet permission is granted and we have an address
      const accounts =
        (await ethProvider.request({
          method: "eth_requestAccounts",
        })) as string[];

      if (!accounts || accounts.length === 0) {
        console.error("No accounts available");
        return;
      }

      const from = accounts[0];
      const walletAddress = address ?? from;

      const txHash = (await ethProvider.request({
        method: "eth_sendTransaction",
        params: [
          {
            from,
            to: GBASE_CONTRACT_ADDRESS,
            value: `0x${BigInt(SEND_AMOUNT_WEI).toString(16)}`,
            data: "0x",
          },
        ],
      })) as string;

      if (txHash) {
        const { error } = await supabase.functions.invoke("record-activity", {
          body: {
            fid: user.fid,
            username: user.username,
            displayName: user.displayName,
            pfpUrl: user.pfpUrl,
            walletAddress,
            txHash,
          },
        });

        if (error) {
          console.error("Failed to record activity:", error);
        } else {
          const nextTime = new Date();
          nextTime.setHours(nextTime.getHours() + 1);
          setNextEligibleTime(nextTime);

          await refreshStats();
          setShowSharePopup(true);
        }
      }
    } catch (err) {
      console.error("Transaction failed:", err);
    } finally {
      setIsSending(false);
    }
  }, [user, isSending, nextEligibleTime, setNextEligibleTime, refreshStats, address]);

  const handleShareToFarcaster = useCallback(
    (caption: string) => {
      composeCast(caption, [APP_URL]);
      setShowSharePopup(false);
    },
    [composeCast]
  );

  const formatDate = (date: Date | null): string => {
    if (!date) return "-";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | null): string => {
    if (!date) return "-";
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isButtonDisabled =
    !isLoaded ||
    !user ||
    !isConnected ||
    isConnecting ||
    isSending ||
    !!nextEligibleTime;

  return (
    <div className="min-h-screen bg-background pb-20">
      {activeTab === "home" ? (
        <>
          <Header />
          <main className="flex flex-col items-center justify-center px-6 pt-8">
            {/* Transaction Counter */}
            <div className="text-center mb-12">
              <p className="text-muted-foreground text-sm mb-1">
                Base Transactions
              </p>
              <p className="text-5.5xl font-bold tracking-tight">
                {statsLoading ? "..." : stats.transactions.toLocaleString()}
              </p>
            </div>

            {/* Send Button */}
            <div className="w-full flex flex-col items-center">
              <SendButton
                onClick={handleSendGBase}
                disabled={isButtonDisabled}
                loading={isSending || isConnecting}
              />
              <CountdownTimer nextEligibleTime={nextEligibleTime} />
              {!isConnected && isLoaded && user && !isConnecting && (
                <p className="text-destructive text-sm mt-2">
                  No wallet connected
                </p>
              )}
            </div>

            {/* Tagline */}
            <p className="text-primary font-medium italic mt-auto pt-16">
              Tap. Send. Active.
            </p>
          </main>
        </>
      ) : (
        <>
          <Header title="Wallet Stats" showBack onBack={() => setActiveTab("home")} />
          <main className="px-4 pb-6">
            {/* Stats Card */}
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <StatRow
                label="Base Transactions"
                value={statsLoading ? "..." : stats.transactions}
              />
              <StatRow
                label="Active Days"
                value={statsLoading ? "..." : stats.activeDays}
              />
              <StatRow
                label="Wallet Strength"
                value={
                  statsLoading
                    ? "..."
                    : getWalletStrength(stats.transactions, stats.activeDays)
                }
                highlight
              />
              <StatRow label="First Activity" value={formatDate(stats.firstActivity)} />
              <StatRow
                label="Last Activity"
                value={formatDateTime(stats.lastActivity)}
              />
            </div>

            {/* Note */}
            <p className="text-xs text-muted-foreground text-center mb-6 px-4">
              We start recording your activity from the first time you use gBase.
              Past Base transactions are not counted.
            </p>

            {/* FAQ & Learn */}
            <div className="space-y-4">
              <FAQSection />
              <LearnAboutBase />
            </div>
          </main>
        </>
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        transactionCount={stats.transactions}
        onShareToFarcaster={handleShareToFarcaster}
      />
    </div>
  );
};

export default Index;

