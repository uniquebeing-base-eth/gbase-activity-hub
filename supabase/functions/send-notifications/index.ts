import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationToken {
  fid: number;
  token: string;
  url: string;
}

interface UserActivity {
  fid: number;
  created_at: string;
}

async function sendNotification(
  token: NotificationToken,
  title: string,
  body: string,
  targetUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(token.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title,
        body,
        targetUrl,
        tokens: [token.token],
      }),
    });

    if (!response.ok) {
      console.error(`Failed to send notification to fid ${token.fid}:`, await response.text());
      return false;
    }

    console.log(`Notification sent to fid ${token.fid}`);
    return true;
  } catch (error) {
    console.error(`Error sending notification to fid ${token.fid}:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, fid: targetFid } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get all notification tokens
    const { data: tokens, error: tokensError } = await supabase
      .from("notification_tokens")
      .select("fid, token, url");

    if (tokensError) {
      console.error("Error fetching tokens:", tokensError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch notification tokens" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log("No notification tokens found");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No notification tokens" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const targetUrl = "https://gbase.lovable.app";
    let sentCount = 0;
    let totalTargeted = 0;

    // If targeting a specific fid (for testing)
    if (targetFid) {
      const targetToken = tokens.find((t) => t.fid === targetFid);
      if (targetToken) {
        const success = await sendNotification(
          targetToken,
          "🔵 gBase Ready!",
          "Your gBase timer is ready. Tap to send now!",
          targetUrl
        );
        return new Response(
          JSON.stringify({ success, sent: success ? 1 : 0 }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Token not found for fid" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Daily notification at 00:00 UTC
    if (type === "daily") {
      console.log(`Sending daily notifications to ${tokens.length} users`);
      for (const token of tokens) {
        const success = await sendNotification(
          token,
          "🌅 Daily gBase Reminder",
          "Start your day by sending gBase! Build your streak.",
          targetUrl
        );
        if (success) sentCount++;
        totalTargeted++;
      }
    }
    // Hourly timer-ready notifications
    else if (type === "timer_ready" || !type) {
      // Get all user activities to check cooldowns
      const { data: activities } = await supabase
        .from("user_activities")
        .select("fid, created_at")
        .order("created_at", { ascending: false });

      // Group by fid to get last activity per user
      const lastActivityByFid = new Map<number, Date>();
      if (activities) {
        for (const activity of activities) {
          if (!lastActivityByFid.has(activity.fid)) {
            lastActivityByFid.set(activity.fid, new Date(activity.created_at));
          }
        }
      }

      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      for (const token of tokens) {
        const lastActivity = lastActivityByFid.get(token.fid);
        
        // If user has activity and it's been more than 1 hour, notify them
        if (lastActivity) {
          const timeSinceActivity = now - lastActivity.getTime();
          // Notify if timer just became ready (between 1 hour and 1 hour 10 minutes ago)
          // This gives a 10-minute window for the hourly cron job
          if (timeSinceActivity >= oneHour && timeSinceActivity < oneHour + 10 * 60 * 1000) {
            const success = await sendNotification(
              token,
              "⏰ Timer Ready!",
              "Your gBase cooldown is complete. Send now to keep your streak!",
              targetUrl
            );
            if (success) sentCount++;
            totalTargeted++;
          }
        }
      }
    }

    console.log(`Notifications sent: ${sentCount}/${totalTargeted}`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, total: totalTargeted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
