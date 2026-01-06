import { useState, useEffect } from "react";

interface CountdownTimerProps {
  nextEligibleTime: Date | null;
}

const CountdownTimer = ({ nextEligibleTime }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isEligible, setIsEligible] = useState(true);

  useEffect(() => {
    if (!nextEligibleTime) {
      setIsEligible(true);
      setTimeLeft("");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const diff = nextEligibleTime.getTime() - now.getTime();

      if (diff <= 0) {
        setIsEligible(true);
        setTimeLeft("");
        return;
      }

      setIsEligible(false);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, "0")}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextEligibleTime]);

  if (isEligible) {
    return (
      <p className="text-muted-foreground text-sm mt-4">
        Ready to send gBase
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm mt-4">
      Next pulse in <span className="text-primary font-medium">{timeLeft}</span>
    </p>
  );
};

export default CountdownTimer;
