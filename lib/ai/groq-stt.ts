// Groq STT API - Speech-to-Text using Whisper
// Server-side fallback for when client-side Puter STT fails

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_STT_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_STT_MODEL = "whisper-large-v3-turbo"; // Fastest, accurate model

export async function transcribeAudio(
    audioBlob: Blob | Buffer,
    prompt?: string
): Promise<{ text: string; confidence?: number; language?: string }> {
    if (!GROQ_API_KEY) {
        throw new Error("GROQ_STT_NO_KEY");
    }

    try {
        const formData = new FormData();

        // Handle Blob or Buffer
        if (audioBlob instanceof Blob) {
            formData.append("file", audioBlob, "audio.webm");
        } else {
            // Node.js Buffer handling
            const blob = new Blob([audioBlob as any], { type: "audio/webm" });
            formData.append("file", blob, "audio.webm");
        }

        formData.append("model", GROQ_STT_MODEL);
        if (prompt) {
            formData.append("prompt", prompt);
        }
        formData.append("response_format", "json");

        const response = await fetch(GROQ_STT_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: formData,
        });

        if (response.status === 429) {
            throw new Error("GROQ_STT_RATE_LIMIT");
        }

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Groq STT API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        return {
            text: data.text || "",
            language: "en", // Groq doesn't always return language in simple JSON format
        };
    } catch (error) {
        console.error("Groq STT error:", error);
        return { text: "" }; // Return empty string on error to prevent crash
    }
}
