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
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["JOBSEEKER", "EMPLOYER", "TEACHER"]),
  image: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
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
    const interval = setInterval(() => {
      getSetting("teacher_login_enabled").then((val) => {
        setTeacherLoginEnabled(val !== "false");
      });
    }, 2000);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
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
              placeholder="John Doe"
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
              placeholder="name@example.com"
              {...register("email")}
              className="mt-1 block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="mt-1 block w-full rounded-xl border border-input bg-background/50 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1.5 font-medium ml-1">{errors.password.message}</p>
            )}
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
