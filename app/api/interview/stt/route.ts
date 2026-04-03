import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { speechToText, validateAudioFile } from '@/lib/ai/groq-stt-client';

export async function POST(req: Request) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || 'en';
    const prompt = (formData.get('prompt') as string) || '';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate audio file
    const validation = validateAudioFile(audioFile);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Transcribe speech
    const result = await speechToText({
      audioFile,
      language,
      prompt,
    });

    if (!result.success) {
      if (result.rateLimited) {
        return NextResponse.json(
          {
            error: 'Speech recognition service is currently busy. Please come back later.',
            rateLimited: true,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: result.error || 'Failed to transcribe speech' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transcript: result.transcript,
      confidence: result.confidence,
    });

  } catch (error) {
    console.error('STT API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
