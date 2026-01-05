// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!openaiApiKey) throw new Error("OpenAI API key not configured");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase configuration missing");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { template_id } = await req.json();

    if (!template_id) {
      return new Response(
        JSON.stringify({ success: false, error: "template_id is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch template with creator
    const { data: template, error: templateError } = await supabase
      .from('loop_templates')
      .select(`
        id, title, description, book_course_title, affiliate_link,
        creator:template_creators(id, name, bio, title, photo_url, website_url, extended_bio)
      `)
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      throw new Error(`Template not found: ${templateError?.message || "Unknown error"}`);
    }

    // Check if extended_bio already exists
    if (template.creator?.extended_bio && template.creator.extended_bio.length > 200) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Extended bio already exists",
          extended_bio: template.creator.extended_bio
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Generate rich provenance content via OpenAI
    const systemPrompt = `You are a knowledgeable expert on personal development, productivity, and self-help authors. Your task is to write a comprehensive "About this Recipe" section for a productivity loop app.

Write approximately 300-400 words covering these sections IN THIS EXACT ORDER:

1. **About this Loop** (80-100 words): How following this specific routine can help the user achieve their goals. Be motivational but practical. Explain the benefits and what success looks like.

2. **About the Source** (80-100 words): Context about the book, course, or framework this loop is based on. Why it's valuable and respected in the field.

3. **About the Author** (100-150 words): Background, expertise, notable achievements, and why they are a trusted voice in this field.

IMPORTANT: Keep the sections in the exact order shown above (Loop first, Source second, Author third).
Write in a warm, professional tone. Use specific details when possible. Format as flowing paragraphs, not bullet points.`;

    const userPrompt = `Generate the "About this Recipe" content for:

Author: ${template.creator?.name || "Unknown"}
Author Bio (short): ${template.creator?.bio || "Not provided"}
Author Title: ${template.creator?.title || ""}

Source/Book: ${template.book_course_title || template.title}
Loop Title: ${template.title}
Loop Description: ${template.description}`;

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
        max_tokens: 800,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }

    const openaiData = await openaiResponse.json();
    const extendedBio = openaiData.choices[0]?.message?.content?.trim();

    if (!extendedBio) {
      throw new Error("No content generated from OpenAI");
    }

    // Save to database if creator exists
    if (template.creator?.id) {
      await supabase
        .from('template_creators')
        .update({ extended_bio: extendedBio })
        .eq('id', template.creator.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        extended_bio: extendedBio,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in generate_template_provenance:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "An unexpected error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
