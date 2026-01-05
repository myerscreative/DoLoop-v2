// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

interface TemplateTask {
  id: string;
  template_id: string;
  description: string;
  hint?: string;
  is_recurring: boolean;
  display_order: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration missing");
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const body = await req.json();
    const { template_id } = body;

    if (!template_id) {
      return new Response(
        JSON.stringify({ success: false, error: "template_id is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // 1. Fetch template details and tasks
    const { data: template, error: templateError } = await supabase
      .from('loop_templates')
      .select(`
        title,
        description,
        book_course_title,
        creator:template_creators(name),
        tasks:template_tasks(*)
      `)
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${templateError?.message || "Unknown error"}`);
    }

    // 2. Identify tasks missing hints
    const tasksToProcess = template.tasks
      .filter(t => !t.hint || t.hint.trim() === '')
      .sort((a, b) => a.display_order - b.display_order);
    
    if (tasksToProcess.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "All tasks already have hints", tasks: template.tasks }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // 3. Generate hints via OpenAI
    const systemPrompt = `You are an expert productivity coach helping users understand how to complete tasks effectively. 
Your goal is to write concise, actionable information hints for specific steps in a productivity loop.

Each hint should be:
- 1-2 sentences max
- Specific and practical
- Motivational but not preachy
- Focus on HOW to do the task well, staying true to the teaching of the creator if applicable.

Template Info:
- Title: ${template.title}
- Creator: ${template.creator?.name || "Unknown"}
- Inspired by: ${template.book_course_title || "N/A"}
- Overall Description: ${template.description || "N/A"}

Respond ONLY with valid JSON in this exact format:
{
  "hints": [
    { "task_id": "uuid-here", "hint": "Your helpful hint here" },
    ...
  ]
}`;

    const taskListForPrompt = tasksToProcess
      .map((t, i) => `${i + 1}. [ID: ${t.id}] ${t.description}`)
      .join("\n");

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
          { role: "user", content: `Generate hints for these tasks:\n\n${taskListForPrompt}` },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = JSON.parse(openaiData.choices[0]?.message?.content);
    const hintsList = generatedContent.hints || [];

    if (!Array.isArray(hintsList)) {
      throw new Error("Invalid response format from AI");
    }

    // 4. Update the database
    const updatePromises = hintsList.map(async (item) => {
      if (item.task_id && item.hint) {
        return supabase
          .from('template_tasks')
          .update({ hint: item.hint })
          .eq('id', item.task_id);
      }
      return Promise.resolve({ error: null });
    });

    await Promise.all(updatePromises);

    // 5. Fetch updated tasks
    const { data: updatedTasks, error: fetchError } = await supabase
      .from('template_tasks')
      .select('*')
      .eq('template_id', template_id)
      .order('display_order', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch updated tasks: ${fetchError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully generated ${tasksToProcess.length} hints`,
        tasks: updatedTasks
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in generate_template_hints function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
