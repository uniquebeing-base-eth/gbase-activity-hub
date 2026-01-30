

import { ChevronLeft, BadgeCheck } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const Header = ({ title, showBack, onBack }: HeaderProps) => {
  if (showBack) {
    return (
      <header className="flex items-center justify-center py-4 px-4 relative">
        <button
          onClick={onBack}
          className="absolute left-4 p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-center py-4 px-4">
      <div className="flex items-center gap-1.5">
        <span className="text-xl font-bold">gBase</span>
        <BadgeCheck className="w-5 h-5 text-primary fill-primary stroke-primary-foreground" />
      </div>
    </header>
  );
};

export default Header;
