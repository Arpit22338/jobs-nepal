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
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Creative background elements */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md w-full relative">
        {/* Glass card with refined borders */}
        <div className="glass-card border border-border/30 rounded-3xl shadow-2xl p-10 relative overflow-hidden backdrop-blur-xl bg-background/80">
          
          {/* Subtle accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>

          {/* Header with better typography */}
          <div className="text-center mb-10 relative">
            <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
              <span className="bg-gradient-to-r from-primary via-primary/80 to-blue-500 bg-clip-text text-transparent">
                Rojgaar
              </span>
              <span className="text-foreground">Nepal</span>
            </h1>
            <div className="h-0.5 w-16 bg-gradient-to-r from-primary to-blue-500 mx-auto mb-4 rounded-full"></div>
            <p className="text-muted-foreground text-sm font-medium">Welcome back! Sign in to continue</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3.5 rounded-xl mb-6 text-sm font-medium backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <i className='bx bx-error-circle text-lg mt-0.5'></i>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <i className='bx bx-envelope text-xl'></i>
                </div>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  {...register("email")}
                  className="w-full rounded-xl border border-border/50 bg-background/60 pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium ml-1 flex items-center gap-1">
                  <i className='bx bx-error-circle text-sm'></i>
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-foreground">Password</label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <i className='bx bx-lock-alt text-xl'></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password")}
                  className="w-full rounded-xl border border-border/50 bg-background/60 pl-12 pr-12 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <i className={`bx ${showPassword ? 'bx-hide' : 'bx-show'} text-xl`}></i>
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-2 font-medium ml-1 flex items-center gap-1">
                  <i className='bx bx-error-circle text-sm'></i>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-3.5 px-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <i className='bx bx-loader-alt animate-spin text-xl'></i>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className='bx bx-log-in text-xl'></i>
                    Sign In
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link 
                href="/register" 
                className="text-primary font-bold hover:underline transition-all hover:text-primary/80"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60"></div>
        </div>

        {/* Decorative element */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl -z-10"></div>
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -z-10"></div>
      </div>
    </div>
  );
}
