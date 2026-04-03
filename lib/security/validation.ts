import { z } from "zod";
import sanitizeHtml from "sanitize-html";

// ==== Input Sanitization ====

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // Strip all HTML tags
    allowedAttributes: {},
  });
}

/**
 * Sanitize rich text content (allows safe HTML tags)
 */
export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3', 'h4'],
    allowedAttributes: {
      'a': ['href', 'title', 'target'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

// ==== Validation Schemas ====

/**
 * Email validation schema with strict format
 */
export const emailSchema = z
  .string()
  .min(5, "Email must be at least 5 characters")
  .max(255, "Email must not exceed 255 characters")
  .email("Invalid email format")
  .toLowerCase()
  .trim();

/**
 * Password validation schema - strong password requirements
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must not exceed 100 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
  .trim();

/**
 * ID validation schema (UUID or MongoDB ObjectId)
 */
export const idSchema = z
  .string()
  .min(1, "ID is required")
  .max(100, "Invalid ID format");

/**
 * Job title validation
 */
export const jobTitleSchema = z
  .string()
  .min(3, "Title must be at least 3 characters")
  .max(200, "Title must not exceed 200 characters")
  .trim();

/**
 * Job description validation
 */
export const jobDescriptionSchema = z
  .string()
  .min(10, "Description must be at least 10 characters")
  .max(5000, "Description must not exceed 5000 characters")
  .trim();

/**
 * Location validation
 */
export const locationSchema = z
  .string()
  .min(2, "Location must be at least 2 characters")
  .max(200, "Location must not exceed 200 characters")
  .trim();

/**
 * Salary validation
 */
export const salarySchema = z
  .number()
  .int("Salary must be a whole number")
  .min(0, "Salary cannot be negative")
  .max(100000000, "Salary exceeds maximum allowed")
  .optional();

/**
 * URL validation schema
 */
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .max(2000, "URL too long")
  .optional();

/**
 * Phone number validation (Nepal format)
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+?977)?[9][6-9]\d{8}$/, "Invalid Nepal phone number")
  .optional();

/**
 * Text area validation (generic)
 */
export const textAreaSchema = z
  .string()
  .min(1, "This field is required")
  .max(10000, "Text exceeds maximum length")
  .trim();

// ==== Rate Limiting Helper ====

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

/**
 * Simple rate limiting function
 * @param key Unique identifier (e.g., IP address or user ID)
 * @param maxRequests Maximum requests allowed
 * @param windowMs Time window in milliseconds
 * @returns true if rate limit exceeded, false otherwise
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore[key];

  if (!record || now > record.resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return false;
  }

  if (record.count >= maxRequests) {
    return true; // Rate limit exceeded
  }

  record.count++;
  return false;
}

/**
 * Clean up expired rate limit records (run periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

// ==== IDOR Prevention Helper ====

/**
 * Verify user owns the resource or is admin
 * @param userId Current user's ID
 * @param resourceOwnerId Resource owner's ID
 * @param userRole Current user's role
 * @returns true if authorized, false otherwise
 */
export function verifyOwnership(
  userId: string,
  resourceOwnerId: string,
  userRole?: string
): boolean {
  return userId === resourceOwnerId || userRole === "ADMIN";
}

/**
 * Sanitize object to remove sensitive fields before sending to client
 */
export function sanitizeUserObject(user: any) {
  const { password, resetToken, resetTokenExpiry, verificationToken, ...safeUser } = user;
  return safeUser;
}
