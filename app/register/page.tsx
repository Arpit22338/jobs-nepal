"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AvatarUpload from "@/components/AvatarUpload";
import { getSetting } from "@/lib/settings";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  role: z.enum(["JOBSEEKER", "EMPLOYER", "TEACHER"]),
  image: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [teacherLoginEnabled, setTeacherLoginEnabled] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "JOBSEEKER",
    },
  });
  useEffect(() => {
    // Initial fetch with error handling
    const fetchSetting = async () => {
      try {
        const val = await getSetting("teacher_login_enabled");
        setTeacherLoginEnabled(val !== "false");
      } catch (error) {
        // Silently handle error - keep default value
        console.error("Failed to fetch teacher login setting:", error);
      }
    };
    
    fetchSetting();
    
    // Poll less frequently (10 seconds instead of 2)
    const interval = setInterval(fetchSetting, 10000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || "Registration failed");
      }

      // Success - redirect to verify email
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes("already exists") || err.message.includes("already registered")) {
          setError("This email is already registered. Please login instead.");
        } else if (err.message.includes("network") || err.message.includes("fetch")) {
          setError("Network error. Please check your connection and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
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
          <p className="text-muted-foreground text-sm mt-3">Create your account to get started</p>
        </div>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center">
            <AvatarUpload
              onImageChange={(base64) => setValue("image", base64)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name / Company Name</label>
            <input
              type="text"
              placeholder="Aakash Rijal"
              {...register("name")}
              className="mt-1 block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.name.message}</p>
            )}
          </div>
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
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
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
            <p className="text-muted-foreground text-xs mt-1.5 ml-1">Min 8 chars, with uppercase, lowercase & number</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">I am a...</label>
            <select
              {...register("role")}
              className="mt-1 block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="JOBSEEKER">Job Seeker</option>
              <option value="EMPLOYER">Employer</option>
              {teacherLoginEnabled && false && <option value="TEACHER">Skill Teacher</option>}
            </select>
            {errors.role && (
              <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.role.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
