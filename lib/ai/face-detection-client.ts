/**
 * API Ninja Face Detection Client with Rate Limit Handling
 * Detects faces for anti-cheat monitoring in AI interviews
 * Features: Multiple faces detection, gaze direction, attention monitoring
 */

const API_NINJA_KEY_1 = process.env.API_NINJA_KEY_1;
const API_NINJA_KEY_2 = process.env.API_NINJA_KEY_2;
const API_NINJA_ENDPOINT = 'https://api.api-ninjas.com/v1/facedetect';

interface FaceDetectionOptions {
  imageData: string; // Base64 encoded image
  enableGazeDetection?: boolean;
}

interface Face {
  confidence: number;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    nose: { x: number; y: number };
    mouth: { x: number; y: number };
  };
}

interface FaceDetectionResult {
  success: boolean;
  faces?: Face[];
  faceCount?: number;
  error?: string;
  rateLimited?: boolean;
  serverDown?: boolean;
  warnings?: string[];
}

let currentKeyIndex = 0; // Track which API key to use (0 or 1)
let key1RateLimited = false;
let key2RateLimited = false;
let key1ResetTime = 0;
let key2ResetTime = 0;

/**
 * Reset rate limit flag after 60 seconds
 */
function resetRateLimitIfExpired() {
  const now = Date.now();
  if (key1RateLimited && now > key1ResetTime) {
    key1RateLimited = false;
  }
  if (key2RateLimited && now > key2ResetTime) {
    key2RateLimited = false;
  }
}

/**
 * Get next available API key
 */
function getAvailableApiKey(): { key: string | undefined; index: number } | null {
  resetRateLimitIfExpired();

  // Try key 1
  if (!key1RateLimited && API_NINJA_KEY_1) {
    return { key: API_NINJA_KEY_1, index: 0 };
  }

  // Try key 2
  if (!key2RateLimited && API_NINJA_KEY_2) {
    return { key: API_NINJA_KEY_2, index: 1 };
  }

  return null; // Both keys rate limited
}

/**
 * Detect faces in image using API Ninja
 */
export async function detectFaces(options: FaceDetectionOptions): Promise<FaceDetectionResult> {
  const { imageData } = options;

  // Check if service is configured
  if (!API_NINJA_KEY_1 && !API_NINJA_KEY_2) {
    return {
      success: false,
      serverDown: true,
      error: 'Face detection not configured',
    };
  }

  // Get available API key
  const apiKeyInfo = getAvailableApiKey();
  
  if (!apiKeyInfo) {
    return {
      success: false,
      rateLimited: true,
      serverDown: true,
      error: 'Face detection server is temporarily down. Proceeding without face detection.',
    };
  }

  try {
    // Convert base64 to blob for upload
    const response = await fetch(API_NINJA_ENDPOINT, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKeyInfo.key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
      }),
    });

    // Handle rate limiting (429 status)
    if (response.status === 429) {
      // Mark this key as rate limited
      const now = Date.now();
      if (apiKeyInfo.index === 0) {
        key1RateLimited = true;
        key1ResetTime = now + 60000; // Reset after 60 seconds
      } else {
        key2RateLimited = true;
        key2ResetTime = now + 60000;
      }

      // Try the other key
      const fallbackKeyInfo = getAvailableApiKey();
      if (fallbackKeyInfo) {
        return detectFaces(options); // Retry with fallback key
      }

      // Both keys exhausted
      return {
        success: false,
        rateLimited: true,
        serverDown: true,
        error: 'Face detection server is temporarily down. Proceeding without face detection.',
      };
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || 'Face detection failed. Camera will continue without monitoring.',
        serverDown: true,
      };
    }

    // Parse faces
    const faces: Face[] = await response.json();

    // Analyze results
    const warnings: string[] = [];
    if (faces.length === 0) {
      warnings.push('No face detected in frame');
    } else if (faces.length > 1) {
      warnings.push(`Multiple faces detected (${faces.length})`);
    }

    return {
      success: true,
      faces,
      faceCount: faces.length,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    console.error('Face Detection Error:', error);
    return {
      success: false,
      error: 'Network error during face detection',
      serverDown: true,
    };
  }
}

/**
 * Analyze face for cheating indicators
 */
export function analyzeCheatingIndicators(faces: Face[]): {
  suspicious: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high';
} {
  const reasons: string[] = [];
  let severity: 'low' | 'medium' | 'high' = 'low';

  // No face detected
  if (faces.length === 0) {
    reasons.push('No face visible');
    severity = 'high';
    return { suspicious: true, reasons, severity };
  }

  // Multiple people detected
  if (faces.length > 1) {
    reasons.push(`${faces.length} people detected (expected 1)`);
    severity = 'high';
    return { suspicious: true, reasons, severity };
  }

  // Low confidence detection (might be looking away)
  const face = faces[0];
  if (face.confidence < 0.5) {
    reasons.push('Face partially visible or looking away');
    severity = 'medium';
    return { suspicious: true, reasons, severity };
  }

  // All good
  return { suspicious: false, reasons: [], severity: 'low' };
}

/**
 * Validate image data for face detection
 */
export function validateImageData(imageData: string): { valid: boolean; error?: string } {
  if (!imageData || imageData.length === 0) {
    return { valid: false, error: 'No image data provided' };
  }

  // Check if it's base64
  const base64Regex = /^data:image\/(png|jpeg|jpg|webp);base64,/;
  if (!base64Regex.test(imageData)) {
    return { valid: false, error: 'Invalid image format (use base64 PNG/JPEG)' };
  }

  // Check size (max 5MB base64)
  const sizeInBytes = (imageData.length * 3) / 4;
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (sizeInBytes > maxSize) {
    return { valid: false, error: 'Image too large (max 5MB)' };
  }

  return { valid: true };
}

/**
 * Get service status
 */
export function getServiceStatus(): {
  available: boolean;
  activeKeys: number;
  message: string;
} {
  resetRateLimitIfExpired();

  const key1Available = !key1RateLimited && !!API_NINJA_KEY_1;
  const key2Available = !key2RateLimited && !!API_NINJA_KEY_2;
  const activeKeys = (key1Available ? 1 : 0) + (key2Available ? 1 : 0);

  if (activeKeys === 0) {
    return {
      available: false,
      activeKeys: 0,
      message: 'Face detection server is down. Interview will proceed with camera only.',
    };
  }

  return {
    available: true,
    activeKeys,
    message: activeKeys === 2 ? 'Face detection fully operational' : 'Face detection running on backup server',
  };
}
