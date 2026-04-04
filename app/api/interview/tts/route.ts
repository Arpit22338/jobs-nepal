import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { textToSpeech, validateTTSInput, audioBufferToBase64 } from '@/lib/ai/groq-tts-client';
import { z } from 'zod';

const ttsSchema = z.object({
  text: z.string().min(1).max(4096),
  voice: z.enum(['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']).optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
});

export async function POST(req: Request) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { text, voice, speed } = ttsSchema.parse(body);

    // Validate text
    const validation = validateTTSInput(text);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate speech
    const result = await textToSpeech({ text, voice, speed });

    if (!result.success) {
      if (result.rateLimited) {
        return NextResponse.json(
          { 
            error: 'Our voice service is currently busy. Please come back later.',
            rateLimited: true 
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: result.error || 'Failed to generate speech' },
        { status: 500 }
      );
    }

    // Convert to base64 for JSON response
    const audioBase64 = audioBufferToBase64(result.audioBuffer!);

    return NextResponse.json({
      success: true,
      audio: `data:audio/mp3;base64,${audioBase64}`,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('TTS API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
