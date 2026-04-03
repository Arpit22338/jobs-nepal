import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

/**
 * API Security Middleware
 * Provides common security checks for API routes
 */

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 }),
      session: null,
    };
  }
  
  return { error: null, session };
}

export async function requireRole(allowedRoles: string[]) {
  const { error, session } = await requireAuth();
  
  if (error) {
    return { error, session: null };
  }
  
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 }
      ),
      session: null,
    };
  }
  
  return { error: null, session };
}

export async function requireAdmin() {
  return requireRole(["ADMIN"]);
}

export async function requireEmployer() {
  return requireRole(["EMPLOYER", "ADMIN"]);
}

export async function requireTeacher() {
  return requireRole(["TEACHER", "ADMIN"]);
}

/**
 * Verify user owns resource or is admin
 */
export async function verifyOwnership(resourceUserId: string) {
  const { error, session } = await requireAuth();
  
  if (error) {
    return { error, session: null, isOwner: false };
  }
  
  const isOwner = session?.user?.id === resourceUserId;
  const isAdmin = session?.user?.role === "ADMIN";
  
  if (!isOwner && !isAdmin) {
    return {
      error: NextResponse.json(
        { error: "Forbidden - You don't have access to this resource" },
        { status: 403 }
      ),
      session: null,
      isOwner: false,
    };
  }
  
  return { error: null, session, isOwner: isOwner || isAdmin };
}

/**
 * Rate limiting check
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { limited: boolean; error: NextResponse | null } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { limited: false, error: null };
  }
  
  if (record.count >= maxRequests) {
    return {
      limited: true,
      error: NextResponse.json(
        { error: "Too many requests - Please try again later" },
        { status: 429 }
      ),
    };
  }
  
  record.count++;
  return { limited: false, error: null };
}

// Clean up expired rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client IP address for rate limiting
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}

/**
 * Sanitize user data before sending to client
 */
export function sanitizeUser(user: any) {
  const {
    password,
    resetToken,
    resetTokenExpiry,
    verificationToken,
    ...safeUser
  } = user;
  return safeUser;
}
