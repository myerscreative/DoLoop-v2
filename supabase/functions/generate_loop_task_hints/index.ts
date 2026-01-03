// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-my-custom-header",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface HintRequest {
  loop_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get API keys from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { loop_id }: HintRequest = await req.json();

    if (!loop_id) {
      return new Response(
        JSON.stringify({ success: false, error: "loop_id is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 1. Fetch loop details and tasks
    const { data: loop, error: loopError } = await supabase
      .from('loops')
      .select(`
        name,
        description,
        tasks:tasks(*)
      `)
      .eq('id', loop_id)
      .single();

    if (loopError || !loop) {
      throw new Error(loopError?.message || "Loop not found");
    }

    // 2. Identify tasks missing hints (where notes are null or empty)
    const tasksToProcess = loop.tasks.filter(t => !t.notes || t.notes.trim() === '');

    if (tasksToProcess.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "All tasks already have hints",
          tasks: loop.tasks
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 3. Generate hints via OpenAI
    const systemPrompt = `You are an expert productivity coach and assistant. Your goal is to write concise, actionable "information hints" or "synopses" for specific tasks in a productivity loop.

Each hint should be 1-2 sentences long and provide context, a "why", or a "how-to" tip for the specific task.

Loop Info:
- Name: ${loop.name}
- Description: ${loop.description || 'A custom productivity loop'}

You will be given a list of task descriptions. Respond with a JSON object with a "hints" key containing an array of objects, each containing the original description and the generated hint.

Format:
{
  "hints": [
    { "description": "...", "hint": "..." },
    ...
  ]
}`;

    const userPrompt = `Generate helpful hints for these tasks:
${tasksToProcess.map(t => `- ${t.description}`).join('\n')}`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = JSON.parse(openaiData.choices[0]?.message?.content);

    const hintsList = generatedContent.hints || [];

    if (!Array.isArray(hintsList)) {
      throw new Error("Invalid response format from AI");
    }

    // 4. Update the database with generated hints
    const now = new Date().toISOString();
    const updatePromises = tasksToProcess.map(task => {
      const generated = hintsList.find(h => h.description === task.description);
      if (generated && generated.hint) {
        return supabase
          .from('tasks')
          .update({
            notes: generated.hint,
            ai_generated_at: now
          })
          .eq('id', task.id);
      }
      return Promise.resolve({ error: null });
    });

    await Promise.all(updatePromises);

    // 5. Fetch updated tasks
    const { data: updatedTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('loop_id', loop_id)
      .order('order_index', { ascending: true });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated ${tasksToProcess.length} hints`,
        tasks: updatedTasks
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in generate_loop_task_hints function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
