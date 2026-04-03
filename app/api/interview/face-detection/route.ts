import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { detectFaces, analyzeCheatingIndicators, validateImageData, getServiceStatus } from '@/lib/ai/face-detection-client';
import { z } from 'zod';

const faceDetectionSchema = z.object({
  imageData: z.string().min(1),
  enableAnalysis: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { imageData, enableAnalysis = true } = faceDetectionSchema.parse(body);

    // Validate image data
    const validation = validateImageData(imageData);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Detect faces
    const result = await detectFaces({ imageData });

    // If server is down or rate limited
    if (result.serverDown || result.rateLimited) {
      return NextResponse.json({
        success: false,
        serverDown: true,
        message: 'Face detection server is down. Proceeding with camera only (no face monitoring).',
        proceedWithoutDetection: true,
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Face detection failed' },
        { status: 500 }
      );
    }

    // Analyze for cheating if enabled
    let analysis = null;
    if (enableAnalysis && result.faces) {
      analysis = analyzeCheatingIndicators(result.faces);
    }

    return NextResponse.json({
      success: true,
      faceCount: result.faceCount,
      faces: result.faces,
      warnings: result.warnings,
      analysis,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error('Face Detection API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to check service status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = getServiceStatus();

    return NextResponse.json(status);
  } catch (error) {
    console.error('Face Detection Status Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
