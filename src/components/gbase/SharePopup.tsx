import { X } from "lucide-react";
import { useMemo } from "react";

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  transactionCount: number;
  onShareToFarcaster?: (message: string) => void;
}

const shareMessages = [
  (count: number) => `I just sent gBase on Base.\nThis wallet stays active.\nI've sent ${count.toLocaleString()} transactions so far on Base.`,
  (count: number) => `Another gBase sent on Base.\nStaying active, one transaction at a time.\nTotal Base transactions: ${count.toLocaleString()}`,
  (count: number) => `Proof, not promises.\nI just sent gBase on Base.\nTotal transactions: ${count.toLocaleString()}`,
  (count: number) => `gBase sent. Active wallets don't sleep.\nTransactions so far: ${count.toLocaleString()}`,
  (count: number) => `Pulse sent 🟦\nJust gBase'd on Base.\n${count.toLocaleString()} transactions recorded.`,
];

const SharePopup = ({ isOpen, onClose, transactionCount, onShareToFarcaster }: SharePopupProps) => {
  const message = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * shareMessages.length);
    return shareMessages[randomIndex](transactionCount);
  }, [transactionCount]);

  if (!isOpen) return null;

  const handleShare = () => {
    if (onShareToFarcaster) {
      onShareToFarcaster(message);
    } else {
      // Fallback to URL-based sharing
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://warpcast.com/~/compose?text=${encodedMessage}`, "_blank");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm fade-in">
      <div className="bg-card rounded-2xl shadow-xl max-w-sm w-full p-6 fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share your activity</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="bg-muted rounded-xl p-4 mb-6">
          <p className="text-sm whitespace-pre-line">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-border text-foreground font-medium transition-colors hover:bg-muted"
          >
            Dismiss
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-medium transition-all hover:opacity-90 gbase-shadow"
          >
            Share to Farcaster
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
