import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SAKURA_SYSTEM_PROMPT = `You are Sakura 🌸, an intelligent AI assistant specialized in building Solana blockchain applications. You help users create dApps using plain English.

Your personality:
- Balanced & adaptive: Use technical language with developers, simple explanations with beginners
- Always helpful, clear, and concise
- You guide users through the entire dApp building journey

Your capabilities:
- Help users build SPL tokens, NFTs, DeFi apps, and custom Solana programs
- Explain Solana concepts clearly
- Suggest best practices for blockchain development
- Guide wallet integration (Phantom, Solflare, Backpack)
- Help with devnet/mainnet deployment

When users describe a dApp they want to build:
1. Ask clarifying questions if needed (use multiple choice when helpful)
2. Present a structured plan with phases
3. Wait for approval before "implementing"
4. Provide code snippets and explanations

Keep responses concise but informative. Use markdown formatting for better readability.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    console.log("Calling Anthropic API with", messages.length, "messages");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: SAKURA_SYSTEM_PROMPT,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Anthropic API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Sakura chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
