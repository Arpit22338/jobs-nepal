import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(userId);
  
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 30) { // 30 requests per minute for STT
    return false;
  }
  
  limit.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Speech service not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "audio/mp3", "audio/mpeg", "audio/mp4", "audio/m4a", 
      "audio/ogg", "audio/wav", "audio/webm", "audio/x-wav",
      "video/webm", "audio/x-m4a"
    ];
    
    if (!allowedTypes.some(type => audioFile.type.includes(type.split("/")[1]))) {
      return NextResponse.json(
        { error: `Unsupported audio format: ${audioFile.type}. Supported: mp3, mp4, m4a, ogg, wav, webm` },
        { status: 400 }
      );
    }

    // Validate file size (25MB max)
    const maxSize = 25 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: "Audio file too large. Maximum size is 25MB." },
        { status: 400 }
      );
    }

    // Create form data for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append("file", audioFile, audioFile.name || "audio.webm");
    openaiFormData.append("model", "whisper-1");
    openaiFormData.append("response_format", "json");
    openaiFormData.append("language", "en");

    // Call OpenAI's Whisper API for transcription
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI STT Error:", errorText);
      return NextResponse.json(
        { error: "Failed to transcribe audio. Please try again." },
        { status: 500 }
      );
    }

    const result = await response.json();
    
    return NextResponse.json({
      transcript: result.text || "",
      duration: result.duration || null,
    });
  } catch (error) {
    console.error("Speech-to-text error:", error);
    return NextResponse.json(
      { error: "Failed to process audio. Please try again." },
      { status: 500 }
    );
  }
}
