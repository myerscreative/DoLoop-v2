// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RecommendLoopsRequest {
  prompt: string;
  mode: 'quick' | 'thorough';  // Quick = 2 loops, Thorough = 4-6 loops
}

interface LoopRecommendation {
  course: 'starter' | 'main' | 'side' | 'dessert';
  courseEmoji: string;
  courseName: string;
  template_id?: string;
  loop: {
    name: string;
    description: string;
    color: string;
    resetRule: 'manual' | 'daily' | 'weekly';
    tasks: Array<{ description: string; notes?: string }>;
    expertName?: string;        // Name of the expert/trainer
    expertTitle?: string;       // Their title/credentials
    bookOrCourse?: string;      // Source material (book, course, training)
    affiliateLink?: string;     // If known, pre-populate
    needsAffiliateSetup?: boolean; // Flag for admin to set up affiliate
  };
  explanation: string;
  isTemplate: boolean;
}

interface RecommendationsResponse {
  success: boolean;
  goal: string;
  summary: string;
  mode: 'quick' | 'thorough';
  recommendations: LoopRecommendation[];
  adminNotes?: string[];  // Notes for admin about affiliate setup needed
}

const COURSE_CONFIG = {
  starter: { emoji: '🥗', name: 'Starter', order: 1 },
  main: { emoji: '🍽️', name: 'Main Course', order: 2 },
  side: { emoji: '🥙', name: 'Side Dish', order: 3 },
  dessert: { emoji: '🍰', name: 'Dessert', order: 4 },
};

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
    
    // Parse request body
    const { prompt, mode = 'thorough' }: RecommendLoopsRequest = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Prompt is required",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Determine loop count based on mode
    const loopCount = mode === 'quick' ? '2' : '4-6';
    const modeDescription = mode === 'quick' 
      ? 'Recommend exactly 2 essential loops - one main activity and one supporting habit.'
      : 'Recommend 4-6 loops covering different aspects: a quick starter, core main course loops, supporting side dishes, and an optional dessert/reward.';

    // Fetch existing templates for context
    let templateContext = "";
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: templates } = await supabase
        .from('loop_templates')
        .select(`
          id,
          title,
          description,
          book_course_title,
          affiliate_link,
          category,
          color,
          creator:template_creators(name, title)
        `)
        .order('popularity_score', { ascending: false })
        .limit(20);

      if (templates && templates.length > 0) {
        templateContext = `
AVAILABLE TEMPLATES FROM OUR LIBRARY (prefer these when they match):
${templates.map(t => `- "${t.title}" by ${t.creator?.name || 'Unknown'} (${t.creator?.title || ''}) - Book: "${t.book_course_title}" - ID: ${t.id}${t.affiliate_link ? ' [HAS AFFILIATE]' : ''}`).join('\n')}

When a template matches the user's needs, use it (include template_id). For topics NOT covered by our templates, search your knowledge for real experts/trainers who teach on that subject.
`;
      }
    }

    // Build the enhanced AI prompt
    const systemPrompt = `You are an AI Loop Recommender - a personal productivity concierge that creates curated loop collections based on user goals. 

MODE: ${mode.toUpperCase()} - ${modeDescription}

COURSES (for thorough mode):
- starter: Quick wins and warmup routines (🥗 Starter) - 5-10 minute activities
- main: Core activity loops (🍽️ Main Course) - The primary loops for the goal
- side: Supporting habits (🥙 Side Dish) - Complementary routines
- dessert: Rewards and wind-down (🍰 Dessert) - Celebration or reflection

${templateContext}

CRITICAL INSTRUCTIONS:
1. Analyze the user's goal and understand their specific intent
2. ${mode === 'quick' ? 'Recommend exactly 2 loops: one "main" and one "side"' : 'Recommend 4-6 loops distributed across courses (at least 1 main)'}
3. For each loop, SEARCH YOUR KNOWLEDGE for real experts, trainers, authors, or coaches who specialize in that topic
4. Include the expert's name, title, and their book/course/training if applicable
5. For templates that match (from our library), include the template_id
6. For NEW custom loops (no template match), set:
   - expertName: The real expert's name (e.g., "James Clear", "Tim Ferriss")
   - expertTitle: Their credentials (e.g., "Habit Expert & Author", "Entrepreneur & Podcaster")  
   - bookOrCourse: Their book or training (e.g., "Atomic Habits", "Deep Work")
   - needsAffiliateSetup: true (so admin can add affiliate link later)
7. Provide clear explanations for WHY each loop helps achieve their goal
8. Use colors: #10b981 (productivity), #f59e0b (energy), #8b5cf6 (wellness), #3b82f6 (focus), #ec4899 (creativity)
9. Set resetRule: daily for habits, weekly for reviews, manual for projects

Respond ONLY with valid JSON:
{
  "goal": "Brief summary of user's goal",
  "summary": "One sentence overview of the recommendation set",
  "adminNotes": ["List of affiliates to set up, e.g. 'Set up affiliate for James Clear - Atomic Habits'"],
  "recommendations": [
    {
      "course": "main",
      "template_id": null,
      "loop": {
        "name": "Loop Name (max 40 chars)",
        "description": "Brief description incorporating the expert's methodology",
        "color": "#10b981",
        "resetRule": "daily",
        "expertName": "Expert Name",
        "expertTitle": "Expert's Title/Credentials",
        "bookOrCourse": "Book or Course Title",
        "needsAffiliateSetup": true,
        "tasks": [
          {"description": "Task 1 based on expert's method", "notes": "Optional context"},
          {"description": "Task 2"}
        ]
      },
      "explanation": "Why this loop and this expert's approach helps achieve their goal"
    }
  ]
}`;

    // Call OpenAI API
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
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
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
    let parsedResponse: { 
      goal: string; 
      summary: string; 
      adminNotes?: string[];
      recommendations: any[] 
    };
    try {
      const jsonMatch = generatedContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
                       [null, generatedContent];
      const jsonString = jsonMatch[1].trim();
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", generatedContent);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    // Validate and enhance recommendations with course metadata
    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      throw new Error("Invalid recommendations structure");
    }

    const enhancedRecommendations: LoopRecommendation[] = parsedResponse.recommendations.map(rec => {
      const courseConfig = COURSE_CONFIG[rec.course as keyof typeof COURSE_CONFIG] || COURSE_CONFIG.main;
      return {
        course: rec.course || 'main',
        courseEmoji: courseConfig.emoji,
        courseName: courseConfig.name,
        template_id: rec.template_id || undefined,
        loop: {
          ...rec.loop,
          needsAffiliateSetup: rec.loop.needsAffiliateSetup || (!rec.template_id && !rec.loop.affiliateLink),
        },
        explanation: rec.explanation || 'Recommended for your goal',
        isTemplate: !!rec.template_id,
      };
    });

    // Sort by course order
    enhancedRecommendations.sort((a, b) => {
      const orderA = COURSE_CONFIG[a.course as keyof typeof COURSE_CONFIG]?.order || 99;
      const orderB = COURSE_CONFIG[b.course as keyof typeof COURSE_CONFIG]?.order || 99;
      return orderA - orderB;
    });

    return new Response(
      JSON.stringify({
        success: true,
        goal: parsedResponse.goal || prompt,
        summary: parsedResponse.summary || "Here are your personalized loop recommendations",
        mode,
        recommendations: enhancedRecommendations,
        adminNotes: parsedResponse.adminNotes || [],
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error in recommend_loops function:", error);

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
