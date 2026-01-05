// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TemplateTask {
  id: string;
  template_id: string;
  description: string;
  hint?: string;
  is_recurring: boolean;
  is_one_time: boolean;
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
    const { template_id } = await req.json();

    if (!template_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "template_id is required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Fetch template and its tasks
    const { data: template, error: templateError } = await supabase
      .from("loop_templates")
      .select("id, title, description")
      .eq("id", template_id)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${templateError?.message || "Unknown error"}`);
    }

    const { data: tasks, error: tasksError } = await supabase
      .from("template_tasks")
      .select("*")
      .eq("template_id", template_id)
      .order("display_order");

    if (tasksError) {
      throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
    }

    // Filter tasks that need hints
    const tasksNeedingHints = (tasks || []).filter(
      (t: TemplateTask) => !t.hint || t.hint.trim() === ""
    );

    if (tasksNeedingHints.length === 0) {
      // All tasks already have hints
      return new Response(
        JSON.stringify({
          success: true,
          tasks: tasks,
          message: "All tasks already have hints",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Build task descriptions for the prompt
    const taskDescriptions = tasksNeedingHints
      .map((t: TemplateTask, i: number) => `${i + 1}. ${t.description}`)
      .join("\n");

    // Call OpenAI API to generate hints
    const systemPrompt = `You are an expert productivity coach helping users understand how to complete tasks effectively.

Given a loop template titled "${template.title}" with description "${template.description || "N/A"}", generate helpful, actionable hints for each task listed below.

Each hint should be:
- 1-2 sentences max
- Specific and practical
- Motivational but not preachy
- Focus on HOW to do the task well

Respond ONLY with valid JSON in this exact format:
{
  "hints": [
    { "task_index": 1, "hint": "Your helpful hint here" },
    { "task_index": 2, "hint": "Your helpful hint here" }
  ]
}`;

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
          { role: "user", content: `Generate hints for these tasks:\n\n${taskDescriptions}` },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const openaiData = await openaiResponse.json();
    const generatedContent = openaiData.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated from OpenAI");
    }

    // Parse the generated JSON
    let hintsData: { hints: Array<{ task_index: number; hint: string }> };
    try {
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                       [null, generatedContent];
      const jsonString = jsonMatch[1].trim();
      hintsData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", generatedContent);
      throw new Error("Failed to parse AI response");
    }

    // Update tasks with hints in database
    const updatePromises = hintsData.hints.map(async ({ task_index, hint }) => {
      const task = tasksNeedingHints[task_index - 1];
      if (task) {
        const { error } = await supabase
          .from("template_tasks")
          .update({ hint })
          .eq("id", task.id);

        if (error) {
          console.error(`Failed to update task ${task.id}:`, error);
        }
        return { ...task, hint };
      }
      return null;
    });

    await Promise.all(updatePromises);

    // Fetch updated tasks
    const { data: updatedTasks, error: fetchError } = await supabase
      .from("template_tasks")
      .select("*")
      .eq("template_id", template_id)
      .order("display_order");

    if (fetchError) {
      throw new Error(`Failed to fetch updated tasks: ${fetchError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        tasks: updatedTasks,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in generate_template_hints function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
