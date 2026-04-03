# AI Interview Features - Documentation

## Overview
RojgaarNepal includes an advanced AI-powered interview system with:
- **Voice-based Interviews**: Text-to-Speech (TTS) and Speech-to-Text (STT)
- **Anti-Cheat Monitoring**: Face detection with multi-person detection
- **Graceful Degradation**: Automatic fallback when services are rate-limited

---

## Features

### 1. Text-to-Speech (TTS)
- **Provider**: Groq API (Whisper Large v3)
- **Voices Available**: alloy, echo, fable, onyx, nova, shimmer
- **Rate Limit Handling**: Shows "Please come back later" message
- **Use Case**: AI interviewer asks questions via voice

### 2. Speech-to-Text (STT)
- **Provider**: Groq API (Whisper Large v3)
- **Languages**: English (default), supports multiple languages
- **Rate Limit Handling**: Shows "Please come back later" message
- **Use Case**: Candidate responds via voice, transcribed to text

### 3. Face Detection (Anti-Cheat)
- **Provider**: API Ninja Face Detection
- **Redundancy**: 2 API keys with automatic failover
- **Rate Limit Handling**: Falls back to camera-only mode
- **Features**:
  - Detects number of faces
  - Warns if multiple people present
  - Monitors if face is visible
  - Optional: User can disable face detection

---

## Environment Variables

Add these to your `.env` file:

```bash
# Groq TTS/STT Keys (Interview AI)
GROQ_TTS_API_KEY="your_groq_tts_api_key_here"
GROQ_STT_API_KEY="your_groq_stt_api_key_here"

# API Ninja Keys (Face Detection for Interview Anti-Cheat)
API_NINJA_KEY_1="your_api_ninja_key_1_here"
API_NINJA_KEY_2="your_api_ninja_key_2_here"  # Backup key
```

---

## API Endpoints

### 1. Text-to-Speech
**Endpoint**: `POST /api/interview/tts`

**Request**:
```json
{
  "text": "Hello! Welcome to your interview.",
  "voice": "nova",  // optional: alloy, echo, fable, onyx, nova, shimmer
  "speed": 1.0      // optional: 0.25 to 4.0
}
```

**Success Response** (200):
```json
{
  "success": true,
  "audio": "data:audio/mp3;base64,..."
}
```

**Rate Limited Response** (429):
```json
{
  "error": "Our voice service is currently busy. Please come back later.",
  "rateLimited": true
}
```

---

### 2. Speech-to-Text
**Endpoint**: `POST /api/interview/stt`

**Request** (FormData):
```
audio: File (audio file - webm, mp4, mp3, wav, ogg)
language: "en" (optional)
prompt: "" (optional - context for better accuracy)
```

**Success Response** (200):
```json
{
  "success": true,
  "transcript": "I have 5 years of experience in web development.",
  "confidence": 0.95
}
```

**Rate Limited Response** (429):
```json
{
  "error": "Speech recognition service is currently busy. Please come back later.",
  "rateLimited": true
}
```

---

### 3. Face Detection
**Endpoint**: `POST /api/interview/face-detection`

**Request**:
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "enableAnalysis": true
}
```

**Success Response** (200):
```json
{
  "success": true,
  "faceCount": 1,
  "faces": [
    {
      "confidence": 0.99,
      "box": { "x": 100, "y": 50, "width": 200, "height": 250 }
    }
  ],
  "warnings": [],
  "analysis": {
    "suspicious": false,
    "reasons": [],
    "severity": "low"
  }
}
```

**Server Down Response** (200):
```json
{
  "success": false,
  "serverDown": true,
  "message": "Face detection server is down. Proceeding with camera only (no face monitoring).",
  "proceedWithoutDetection": true
}
```

**Check Service Status**:
```
GET /api/interview/face-detection
```

Response:
```json
{
  "available": true,
  "activeKeys": 2,
  "message": "Face detection fully operational"
}
```

---

## Rate Limit Behavior

### TTS/STT (Groq):
- **When rate limited**: User sees error message
- **Message**: "Please come back later"
- **Recovery**: Automatic after Groq resets quota
- **No fallback**: Only 1 key per service

### Face Detection (API Ninja):
- **Primary key rate limited**: Automatically switches to secondary key
- **Both keys rate limited**: Falls back to camera-only mode
- **Message**: "Face detection server is down. Proceeding without face detection."
- **Recovery**: Automatic after 60 seconds
- **User Experience**: Interview continues seamlessly

---

## Cheating Detection Logic

The system detects:
1. **No face visible** → HIGH severity
2. **Multiple people** → HIGH severity
3. **Face partially visible** (confidence < 0.5) → MEDIUM severity
4. **Looking away frequently** → Tracked over time

### Severity Levels:
- **LOW**: All good, single face detected
- **MEDIUM**: Face partially visible or looking away
- **HIGH**: No face or multiple people detected

---

## Frontend Integration Example

### Using TTS (AI asks question):
```typescript
async function speakQuestion(text: string) {
  const response = await fetch('/api/interview/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: 'nova' })
  });

  const data = await response.json();
  
  if (data.rateLimited) {
    alert('Voice service busy. Please come back later.');
    return;
  }

  // Play audio
  const audio = new Audio(data.audio);
  audio.play();
}
```

### Using STT (User responds):
```typescript
async function transcribeAnswer(audioBlob: Blob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'answer.webm');
  formData.append('language', 'en');

  const response = await fetch('/api/interview/stt', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  
  if (data.rateLimited) {
    alert('Speech recognition busy. Please come back later.');
    return;
  }

  console.log('User said:', data.transcript);
}
```

### Using Face Detection:
```typescript
async function detectCheating(imageData: string, faceDetectionEnabled: boolean) {
  if (!faceDetectionEnabled) {
    // User disabled face detection
    return { proceedWithoutDetection: true };
  }

  const response = await fetch('/api/interview/face-detection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, enableAnalysis: true })
  });

  const data = await response.json();

  if (data.serverDown) {
    console.warn(data.message);
    // Continue interview without face detection
    return { proceedWithoutDetection: true };
  }

  if (data.analysis?.suspicious) {
    showWarning(data.analysis.reasons.join(', '));
  }

  return data;
}
```

---

## User Settings

Allow users to control face detection:

```typescript
interface InterviewSettings {
  enableFaceDetection: boolean;  // User can toggle
  enableVoice: boolean;           // TTS/STT
  recordingQuality: 'low' | 'medium' | 'high';
}

// Save to localStorage or user profile
localStorage.setItem('interviewSettings', JSON.stringify(settings));
```

---

## Error Messages (User-Friendly)

### TTS Rate Limited:
> "Our voice service is currently busy. Please come back later and try again."

### STT Rate Limited:
> "Speech recognition is temporarily unavailable. Please come back later."

### Face Detection Down:
> "Face detection server is down. Your interview will proceed with camera only (no face monitoring)."

### No Camera Access:
> "Camera access is required for this interview. Please enable camera permissions."

---

## Cost Estimation

### Groq TTS:
- ~$0.015 per 1,000 characters
- Example: 500-char question = $0.0075

### Groq STT:
- ~$0.0002 per second
- Example: 30-second answer = $0.006

### API Ninja Face Detection:
- Free tier: 50,000 requests/month
- Paid: $0.002 per request
- With 2 keys: 100,000 free requests/month

**Monthly estimate** (1000 interviews):
- TTS: $7.50
- STT: $6.00  
- Face Detection: FREE (under 100k)
- **Total**: ~$13.50/month

---

## Security Features

1. **Authentication Required**: All endpoints require valid session
2. **Input Validation**: Zod schemas validate all inputs
3. **File Size Limits**: Audio max 25MB, Image max 5MB
4. **Rate Limiting**: Built-in protection against abuse
5. **No Data Storage**: Audio/images not saved to database
6. **Privacy**: Face detection can be disabled by user

---

## Troubleshooting

### "Please come back later" appearing frequently?
- Check Groq API quota usage
- Consider upgrading Groq plan
- Add more API keys for redundancy

### Face detection always shows "server down"?
- Verify API_NINJA_KEY_1 and API_NINJA_KEY_2 are set
- Check API Ninja dashboard for quota
- Ensure keys are not revoked

### Audio not playing?
- Check browser supports MP3 playback
- Verify TTS endpoint returns data:audio/mp3 format
- Check browser console for errors

### Transcription inaccurate?
- Ensure good microphone quality
- Check for background noise
- Verify correct language parameter
- Consider adding context in prompt field

---

## Future Enhancements

- [ ] Real-time face tracking (continuous monitoring)
- [ ] Eye gaze detection (looking at second screen)
- [ ] Audio analysis (background voices)
- [ ] Session recording for review
- [ ] AI-generated interview questions based on job description
- [ ] Sentiment analysis on answers
- [ ] Multi-language support (Hindi, Nepali)

---

## Support

For issues or questions:
- Email: support@rojgaarnepal.com
- Documentation: /docs/ai-interview
- API Reference: This document

---

**Last Updated**: April 3, 2026  
**Version**: 1.0.0
