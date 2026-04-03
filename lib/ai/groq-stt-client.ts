/**
 * Groq Speech-to-Text (STT) Client with Rate Limit Handling
 * Converts speech to text for AI interview feature
 * Model: whisper-large-v3-turbo (Fast & accurate)
 */

const GROQ_STT_API_KEY = process.env.GROQ_STT_API_KEY;
const GROQ_STT_ENDPOINT = 'https://api.groq.com/openai/v1/audio/transcriptions';

interface STTOptions {
  audioFile: File | Blob;
  language?: string;
  prompt?: string;
  temperature?: number;
}

interface STTResult {
  success: boolean;
  transcript?: string;
  error?: string;
  rateLimited?: boolean;
  confidence?: number;
}

/**
 * Convert speech to text using Groq STT (Whisper)
 */
export async function speechToText(options: STTOptions): Promise<STTResult> {
  const {
    audioFile,
    language = 'en', // English
    prompt = '', // Optional context for better accuracy
    temperature = 0.0, // 0 = more deterministic
  } = options;

  if (!GROQ_STT_API_KEY) {
    return {
      success: false,
      error: 'Speech recognition not configured. Please contact support.',
    };
  }

  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', audioFile, 'audio.webm');
    formData.append('model', 'whisper-large-v3-turbo'); // Fast & accurate model
    formData.append('language', language);
    formData.append('temperature', temperature.toString());
    
    if (prompt) {
      formData.append('prompt', prompt);
    }

    const response = await fetch(GROQ_STT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_STT_API_KEY}`,
      },
      body: formData,
    });

    // Handle rate limiting (429 status)
    if (response.status === 429) {
      return {
        success: false,
        error: 'Speech recognition service is currently busy. Please come back later.',
        rateLimited: true,
      };
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error?.message || 'Failed to transcribe speech. Please try again.',
      };
    }

    // Parse transcription result
    const result = await response.json();

    return {
      success: true,
      transcript: result.text || '',
      confidence: result.confidence || 1.0,
    };
  } catch (error) {
    console.error('STT Error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
}

/**
 * Validate audio file for STT
 */
export function validateAudioFile(file: File | Blob): { valid: boolean; error?: string } {
  const maxSize = 25 * 1024 * 1024; // 25MB max

  if (file.size > maxSize) {
    return { valid: false, error: 'Audio file too large (max 25MB)' };
  }

  // Check if it's an audio file
  if (file instanceof File) {
    const validTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!validTypes.some(type => file.type.startsWith(type) || file.type === type)) {
      return { valid: false, error: 'Invalid audio format. Use WebM, MP4, MP3, WAV, or OGG.' };
    }
  }

  return { valid: true };
}

/**
 * Estimate STT cost (for monitoring)
 */
export function estimateSTTCost(audioLengthSeconds: number): number {
  // Groq STT pricing: ~$0.0002 per second
  return audioLengthSeconds * 0.0002;
}

/**
 * Convert audio duration from milliseconds to seconds
 */
export function audioDurationToSeconds(durationMs: number): number {
  return Math.ceil(durationMs / 1000);
}
