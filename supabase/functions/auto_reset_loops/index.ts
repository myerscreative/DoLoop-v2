import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get current timestamp
    const now = new Date().toISOString();

    // Find loops that need to be reset
    const { data: loopsToReset, error: fetchError } = await supabaseClient
      .from("loops")
      .select("id, reset_rule, next_reset_at")
      .or("reset_rule.eq.daily,reset_rule.eq.weekly")
      .lte("next_reset_at", now);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${loopsToReset?.length || 0} loops to reset`);

    // Process each loop
    for (const loop of loopsToReset || []) {
      console.log(`Resetting loop ${loop.id}`);

      // Reset recurring tasks to pending
      const { error: resetError } = await supabaseClient
        .from("tasks")
        .update({ status: "pending" })
        .eq("loop_id", loop.id)
        .eq("is_recurring", true);

      if (resetError) {
        console.error(`Error resetting tasks for loop ${loop.id}:`, resetError);
        continue;
      }

      // Calculate next reset time
      let nextResetAt: string;
      if (loop.reset_rule === "daily") {
        nextResetAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (loop.reset_rule === "weekly") {
        nextResetAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else {
        continue; // Skip if not daily or weekly
      }

      // Update loop's next_reset_at
      const { error: updateError } = await supabaseClient
        .from("loops")
        .update({ next_reset_at: nextResetAt })
        .eq("id", loop.id);

      if (updateError) {
        console.error(`Error updating next_reset_at for loop ${loop.id}:`, updateError);
        continue;
      }

      // Get users to notify (loop owner and members)
      const { data: usersToNotify, error: usersError } = await supabaseClient
        .from("loop_members")
        .select("user_id")
        .eq("loop_id", loop.id);

      if (usersError) {
        console.error(`Error fetching users for loop ${loop.id}:`, usersError);
        continue;
      }

      // Add loop owner
      const { data: loopData } = await supabaseClient
        .from("loops")
        .select("owner_id, name")
        .eq("id", loop.id)
        .single();

      if (loopData) {
        const allUserIds = [
          loopData.owner_id,
          ...(usersToNotify?.map(u => u.user_id) || [])
        ];

        // Send push notifications
        for (const userId of [...new Set(allUserIds)]) {
          try {
            // Get user's push token from a hypothetical push_tokens table
            // You'll need to create this table and store tokens when users register for notifications
            const { data: pushToken } = await supabaseClient
              .from("push_tokens")
              .select("token")
              .eq("user_id", userId)
              .single();

            if (pushToken?.token) {
              // Send notification using Expo
              await fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  to: pushToken.token,
                  title: `${loopData.name} ready! 🌅`,
                  body: "Your loop has been reset and is ready for today.",
                  data: { loopId: loop.id },
                }),
              });
            }
          } catch (notificationError) {
            console.error(`Error sending notification to user ${userId}:`, notificationError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${loopsToReset?.length || 0} loop resets`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in auto_reset_loops function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
