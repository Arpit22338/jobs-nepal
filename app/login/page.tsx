"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSetting } from "@/lib/settings";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // Removed teacherLoginEnabled state since role dropdown is not used
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  useEffect(() => {
    getSetting("teacher_login_enabled").then((val) => {
      setTeacherLoginEnabled(val !== "false");
    });
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-600">Rojgaar</span>
            <span className="text-gray-900">Nepal</span>
          </h1>
          <p className="text-gray-600 text-sm mt-2">Sign in to your account</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register("email")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white text-gray-900"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              {...register("password")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white text-gray-900"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>
          {/* ...existing code... */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
