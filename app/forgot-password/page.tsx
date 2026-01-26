"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to send OTP");
      }

      setSuccessMessage("OTP sent to your email. Redirecting...");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong");
    }
  };

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
            Forgot Password
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you an OTP to reset your password.
          </p>
        </div>

        {serverError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm text-center border border-destructive/20">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 text-green-500 dark:text-green-400 p-3 rounded-lg text-sm text-center border border-green-500/20">
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="block w-full rounded-xl border border-input bg-background/50 px-4 py-3 pl-11 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none sm:text-sm"
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.email.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending..." : "Send OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
