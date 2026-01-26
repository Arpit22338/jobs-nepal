"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setServerError("");
    setSuccessMessage("");
    
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to update password");
      }

      setSuccessMessage("Password updated successfully!");
      reset();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <Link href="/profile" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Back to Profile
      </Link>

      <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Change Password</h1>
        </div>

        {serverError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm border border-destructive/20">
            {serverError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 text-green-500 dark:text-green-400 p-3 rounded-lg mb-4 text-sm border border-green-500/20">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
            <input
              type="password"
              {...register("oldPassword")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            {errors.oldPassword && <p className="text-destructive text-xs mt-1">{errors.oldPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
            <input
              type="password"
              {...register("newPassword")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            {errors.newPassword && <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 font-bold"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
