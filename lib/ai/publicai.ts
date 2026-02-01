/**
 * PublicAI Client
 * OpenAI-compatible API with various models
 * API Docs: https://publicai.io
 * 
 * PublicAI provides access to multiple models including:
 * - llama-3.1-70b-instruct (Recommended - best for general tasks)
 * - deepseek-chat (If available)
 * - mixtral-8x7b
 */

const PUBLICAI_API_KEY = process.env.PUBLICAI_API_KEY || "";

interface PublicAIOptions {
    temperature?: number;
    maxTokens?: number;
}

export async function callPublicAI(
    messages: { role: "system" | "user" | "assistant"; content: string }[],
    options: PublicAIOptions = {}
): Promise<string> {
    const { temperature = 0.7, maxTokens = 4096 } = options;

    if (!PUBLICAI_API_KEY) {
        throw new Error("PublicAI API key not configured");
    }

    // PublicAI uses OpenAI-compatible API
    const response = await fetch("https://api.pawan.krd/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${PUBLICAI_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "pai-001-rp", // PublicAI Roleplay model - reliable fallback
            messages,
            temperature,
            max_tokens: maxTokens,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("PublicAI API Error:", error);
        throw new Error(`PublicAI API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
}
