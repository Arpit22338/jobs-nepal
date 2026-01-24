"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const talentPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  skills: z.string().min(2, "Skills are required"),
});

type TalentPostForm = z.infer<typeof talentPostSchema>;

export default function NewTalentPostPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TalentPostForm>({
    resolver: zodResolver(talentPostSchema),
  });

  const onSubmit = async (data: TalentPostForm) => {
    try {
      const res = await fetch("/api/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to create post");
      }

      router.push("/talent");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Create Talent Post</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow border border-border/50">
        <div>
          <label className="block text-sm font-medium text-foreground">Title</label>
          <input
            {...register("title")}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            placeholder="उदा. वरिष्ठ डिजाइनर (Senior Designer) नयाँ अवसरको खोजीमा"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Bio</label>
          <textarea
            {...register("bio")}
            rows={4}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            placeholder="आफ्नो बारेमा रोजगारदाताहरूलाई केही रोचक कुरा बताउनुहोस्..."
          />
          {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Skills (comma separated)</label>
          <input
            {...register("skills")}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            placeholder="Photoshop, Excel, Video Editing, Sales"
          />
          {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 font-bold"
        >
          {isSubmitting ? "Posting..." : "Post Profile"}
        </button>
      </form>
    </div>
  );
}
