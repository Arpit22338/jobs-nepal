"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        // Handle specific error messages
        if (result.error.includes("not verified")) {
          setError("Please verify your email first. Check your inbox.");
        } else if (result.error.includes("disabled")) {
          setError(result.error);
        } else {
          setError("Invalid email or password");
        }
      } else if (result?.ok) {
        // Small delay to ensure session is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push("/");
        router.refresh();
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card border border-border/50 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl invisible dark:visible"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl invisible dark:visible"></div>

        <div className="text-center mb-8 relative">
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-primary">Rojgaar</span>
            <span className="text-foreground">Nepal</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-3">Welcome back! Sign in to continue</p>
        </div>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              {...register("email")}
              className="mt-1 block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="mt-1 block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-xl`}></i>
              </button>
            </div>
            {errors.password && (
              <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
