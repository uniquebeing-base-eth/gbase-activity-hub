import { cn } from "@/lib/utils";

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const SendButton = ({ onClick, disabled, className }: SendButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full max-w-sm py-4 px-8 rounded-xl text-xl font-semibold",
        "bg-primary text-primary-foreground",
        "gbase-gradient gbase-shadow",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.02] hover:gbase-shadow-lg",
        "active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        "pulse-animation",
        className
      )}
    >
      Send gBase
    </button>
  );
};

export default SendButton;
