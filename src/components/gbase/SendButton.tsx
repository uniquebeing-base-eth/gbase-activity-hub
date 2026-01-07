
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const SendButton = ({ onClick, disabled, loading, className }: SendButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "w-full max-w-sm py-4 px-8 rounded-xl text-xl font-semibold",
        "bg-primary text-primary-foreground",
        "gbase-gradient gbase-shadow",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.02] hover:gbase-shadow-lg",
        "active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        !loading && "pulse-animation",
        className
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Sending...
        </span>
      ) : (
        "Send gBase"
      )}
    </button>
  );
};

export default SendButton;
