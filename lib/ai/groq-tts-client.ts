/**
 * Groq Text-to-Speech (TTS) Client with Rate Limit Handling
 * Converts text to speech for AI interview feature
 * Model: canopylabs/orpheus-v1-english (High-quality English voice)
 */

const GROQ_TTS_API_KEY = process.env.GROQ_TTS_API_KEY;
const GROQ_TTS_ENDPOINT = 'https://api.groq.com/openai/v1/audio/speech';

interface TTSOptions {
  text: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  model?: string;
  speed?: number;
}

interface TTSResult {
  success: boolean;
  audioBuffer?: ArrayBuffer;
  error?: string;
  rateLimited?: boolean;
}

/**
 * Convert text to speech using Groq TTS
 */
export async function textToSpeech(options: TTSOptions): Promise<TTSResult> {
  const {
    text,
    voice = 'nova', // Female voice for interview
    model = 'canopylabs/orpheus-v1-english', // High-quality English voice model
    speed = 1.0,
  } = options;

  if (!GROQ_TTS_API_KEY) {
    return {
      success: false,
      error: 'TTS service not configured. Please contact support.',
    };
  }

  try {
    const response = await fetch(GROQ_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_TTS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: text,
        voice,
        speed,
        response_format: 'mp3',
      }),
    });

    // Handle rate limiting (429 status)
    if (response.status === 429) {
      return {
        success: false,
        error: 'Our voice service is currently busy. Please come back later.',
        rateLimited: true,
      };
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || 'Failed to generate speech. Please try again.',
      };
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();

    return {
      success: true,
      audioBuffer,
    };
  } catch (error) {
    console.error('TTS Error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Convert audio buffer to base64 for frontend playback
 */
export function audioBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Estimate TTS cost (for monitoring)
 */
export function estimateTTSCost(text: string): number {
  // Groq TTS pricing: ~$0.015 per 1000 characters
  const chars = text.length;
  return (chars / 1000) * 0.015;
}

/**
 * Validate text length for TTS
 */
export function validateTTSInput(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Text is required' };
  }

  if (text.length > 4096) {
    return { valid: false, error: 'Text too long (max 4096 characters)' };
  }

  return { valid: true };
}
