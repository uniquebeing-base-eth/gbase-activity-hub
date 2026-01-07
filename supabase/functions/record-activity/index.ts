import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fid, username, displayName, pfpUrl, walletAddress, txHash } = await req.json();

    if (!fid || !txHash) {
      return new Response(
        JSON.stringify({ error: "FID and txHash are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing activity within the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentActivity } = await supabase
      .from("user_activities")
      .select("id")
      .eq("fid", fid)
      .gte("created_at", oneHourAgo)
      .limit(1);

    if (recentActivity && recentActivity.length > 0) {
      return new Response(
        JSON.stringify({ error: "You can only record one activity per hour", cooldown: true }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the activity
    const { data, error } = await supabase
      .from("user_activities")
      .insert({
        fid,
        username,
        display_name: displayName,
        pfp_url: pfpUrl,
        wallet_address: walletAddress,
        tx_hash: txHash,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to record activity" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get updated stats for the user
    const { data: activities } = await supabase
      .from("user_activities")
      .select("created_at")
      .eq("fid", fid)
      .order("created_at", { ascending: true });

    const transactions = activities?.length || 0;
    const firstActivity = activities?.[0]?.created_at;
    const lastActivity = activities?.[activities.length - 1]?.created_at;

    // Calculate active days (unique days with activity)
    const uniqueDays = new Set(
      activities?.map((a) => new Date(a.created_at).toDateString()) || []
    );
    const activeDays = uniqueDays.size;

    return new Response(
      JSON.stringify({
        success: true,
        activity: data,
        stats: {
          transactions,
          activeDays,
          firstActivity,
          lastActivity,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
