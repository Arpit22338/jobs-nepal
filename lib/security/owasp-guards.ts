import { NextRequest, NextResponse } from "next/server";

// OWASP Security Guards
// Centralized security logic for input sanitization and rate limiting

// 1. Rate Limiting (Token Bucket / Window Counter)
// In production, use Redis. For now using Map.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const DEFAULT_LIMIT = 20; // requests per minute
const DEFAULT_WINDOW = 60000; // 1 minute

export function checkRateLimit(key: string, limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    return true;
}

// 2. Input Sanitization & Injection Protection
const BLOCKED_PATTERNS = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /disregard\s+(all\s+)?above/i,
    /forget\s+(all\s+)?your\s+instructions/i,
    /you\s+are\s+now\s+/i,
    /system\s*:\s*/i,
    /\[\s*SYSTEM\s*\]/i,
    /jailbreak/i,
    /execute\s+code/i,
    /run\s+command/i,
    /<script>/i,
    /javascript:/i,
    /data:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /\.\.\//g, // Path traversal
    /\/etc\/passwd/i,
];

export interface SanitizeResult {
    safe: boolean;
    sanitized: string;
    reason?: string;
}

export function sanitizeInput(input: string, maxLength = 2000): SanitizeResult {
    if (!input || typeof input !== "string") {
        return { safe: false, sanitized: "", reason: "Invalid input type" };
    }

    // Length check (Buffer overflow protection)
    if (input.length > maxLength) {
        return { safe: false, sanitized: input.slice(0, maxLength), reason: "Input too long - truncated" };
    }

    // Check for malicious patterns
    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(input)) {
            return { safe: false, sanitized: "", reason: "Security Policy Violation: Blocked pattern detected" };
        }
    }

    // Basic HTML Entity Encoding (Defense against XSS)
    // Note: Modern frameworks like React handle XSS in rendering, but good to sanitize API inputs
    const sanitized = input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;")
        // Remove null bytes and control characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .trim();

    return { safe: true, sanitized };
}

// 3. API Key Guard (Server-Side Only Check)
export function ensureServerSide(): void {
    if (typeof window !== "undefined") {
        throw new Error("Security Violation: This function handles secrets and must NOT run on the client.");
    }
}

// 4. Content Security Policy (Optional Helper)
// Can be used in middleware
export const SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data: https:;",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(self), microphone=(self), geolocation=()",
};
