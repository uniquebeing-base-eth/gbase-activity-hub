
import { Home, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: "home" | "stats";
  onTabChange: (tab: "home" | "stats") => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => onTabChange("home")}
          className={cn(
            "flex flex-col items-center gap-1 py-3 px-8 transition-colors",
            activeTab === "home" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-medium">Home</span>
        </button>
        <button
          onClick={() => onTabChange("stats")}
          className={cn(
            "flex flex-col items-center gap-1 py-3 px-8 transition-colors",
            activeTab === "stats" ? "text-primary" : "text-muted-foreground"
          )}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs font-medium">Stats</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
