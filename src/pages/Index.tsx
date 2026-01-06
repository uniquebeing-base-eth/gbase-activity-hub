import { useState, useCallback } from "react";
import Header from "@/components/gbase/Header";
import SendButton from "@/components/gbase/SendButton";
import CountdownTimer from "@/components/gbase/CountdownTimer";
import SharePopup from "@/components/gbase/SharePopup";
import StatRow from "@/components/gbase/StatRow";
import FAQSection from "@/components/gbase/FAQSection";
import LearnAboutBase from "@/components/gbase/LearnAboutBase";
import BottomNav from "@/components/gbase/BottomNav";

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
  const [activeTab, setActiveTab] = useState<"home" | "stats">("home");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [nextEligibleTime, setNextEligibleTime] = useState<Date | null>(null);

  // Demo stats (in a real app, these would come from blockchain/backend)
  const [stats, setStats] = useState({
    transactions: 1027,
    activeDays: 112,
    firstActivity: new Date("2026-01-06"),
    lastActivity: new Date(),
  });

  const handleSendGBase = useCallback(() => {
    // Simulate sending a transaction
    setStats((prev) => ({
      ...prev,
      transactions: prev.transactions + 1,
      lastActivity: new Date(),
    }));

    // Set next eligible time to 1 hour from now
    const nextTime = new Date();
    nextTime.setHours(nextTime.getHours() + 1);
    setNextEligibleTime(nextTime);

    // Show share popup
    setShowSharePopup(true);
  }, []);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {activeTab === "home" ? (
        <>
          <Header />
          <main className="flex flex-col items-center justify-center px-6 pt-8">
            {/* Transaction Counter */}
            <div className="text-center mb-12">
              <p className="text-muted-foreground text-sm mb-1">Base Transactions</p>
              <p className="text-5.5xl font-bold tracking-tight">
                {stats.transactions.toLocaleString()}
              </p>
            </div>

            {/* Send Button */}
            <div className="w-full flex flex-col items-center">
              <SendButton onClick={handleSendGBase} />
              <CountdownTimer nextEligibleTime={nextEligibleTime} />
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
              <StatRow label="Base Transactions" value={stats.transactions} />
              <StatRow label="Active Days" value={stats.activeDays} />
              <StatRow
                label="Wallet Strength"
                value={getWalletStrength(stats.transactions, stats.activeDays)}
                highlight
              />
              <StatRow label="First Activity" value={formatDate(stats.firstActivity)} />
              <StatRow label="Last Activity" value={formatDateTime(stats.lastActivity)} />
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
      />
    </div>
  );
};

export default Index;
