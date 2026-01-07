import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserStats {
  transactions: number;
  activeDays: number;
  firstActivity: Date | null;
  lastActivity: Date | null;
}

export function useUserStats(fid: number | undefined) {
  const [stats, setStats] = useState<UserStats>({
    transactions: 0,
    activeDays: 0,
    firstActivity: null,
    lastActivity: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [nextEligibleTime, setNextEligibleTime] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    if (!fid) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: activities, error } = await supabase
        .from("user_activities")
        .select("created_at")
        .eq("fid", fid)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching stats:", error);
        return;
      }

      if (activities && activities.length > 0) {
        // Calculate unique active days
        const uniqueDays = new Set(
          activities.map((a) => new Date(a.created_at).toDateString())
        );

        const firstActivity = new Date(activities[0].created_at);
        const lastActivity = new Date(activities[activities.length - 1].created_at);

        // Check if within 1-hour cooldown
        const timeSinceLastActivity = Date.now() - lastActivity.getTime();
        if (timeSinceLastActivity < 60 * 60 * 1000) {
          const nextTime = new Date(lastActivity.getTime() + 60 * 60 * 1000);
          setNextEligibleTime(nextTime);
        } else {
          setNextEligibleTime(null);
        }

        setStats({
          transactions: activities.length,
          activeDays: uniqueDays.size,
          firstActivity,
          lastActivity,
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [fid]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!fid) return;

    const channel = supabase
      .channel("user-activities")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_activities",
          filter: `fid=eq.${fid}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fid, fetchStats]);

  return {
    stats,
    isLoading,
    nextEligibleTime,
    setNextEligibleTime,
    refreshStats: fetchStats,
  };
}
