import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text?.slice(0, 500); // Limit text length

    if (!text) {
      return NextResponse.json(
        { success: false, error: "Text is required" },
        { status: 400 }
      );
    }

    // Use Web Speech API on client side for TTS
    // The client will use the browser's Speech Synthesis API
    return NextResponse.json({
      success: true,
      text: text,
      useClientTTS: true, // Flag to use browser's Speech Synthesis
    });

  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}
