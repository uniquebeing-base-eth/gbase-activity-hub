
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fid } = await req.json();
    
    if (!fid) {
      return new Response(
        JSON.stringify({ error: "FID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const neynarApiKey = Deno.env.get("NEYNAR_API_KEY");
    if (!neynarApiKey) {
      return new Response(
        JSON.stringify({ error: "Neynar API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's verified addresses from Neynar
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          "accept": "application/json",
          "x-api-key": neynarApiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Neynar API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user data from Neynar" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get verified Ethereum addresses
    const verifiedAddresses = user.verified_addresses?.eth_addresses || [];
    const custodyAddress = user.custody_address;

    return new Response(
      JSON.stringify({
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        verifiedAddresses,
        custodyAddress,
        primaryAddress: verifiedAddresses[0] || custodyAddress,
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
