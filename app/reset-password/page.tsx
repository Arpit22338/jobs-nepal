"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }
  }, [email, router]);

  const onSubmit = async (data: ResetPasswordForm) => {
    setServerError("");
    setSuccessMessage("");

    if (!email) return;

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: data.otp,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card border border-border/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl invisible dark:visible"></div>

        <div>
          <Link href="/login" className="inline-flex items-center text-primary font-bold hover:underline mb-6 transition-all">
            <ArrowLeft size={18} className="mr-2" />
            Back to Login
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-foreground text-center">
            Reset Password
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Enter the OTP sent to <strong className="text-foreground">{email}</strong> and your new password.
          </p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">OTP Code</label>
            <input
              type="text"
              {...register("otp")}
              className="block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none sm:text-sm tracking-widest text-center"
              placeholder="000000"
              maxLength={6}
            />
            {errors.otp && <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.otp.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="password"
                {...register("newPassword")}
                className="block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 pl-11 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.newPassword && <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="password"
                {...register("confirmPassword")}
                className="block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 pl-11 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.confirmPassword.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
