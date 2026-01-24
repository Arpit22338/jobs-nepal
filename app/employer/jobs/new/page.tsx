"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const jobSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  location: z.string().min(2, "Location is required"),
  salary: z.string().optional(),
  type: z.string().min(1, "Job type is required"),
  requiredSkills: z.string().optional(),
});

type JobForm = z.infer<typeof jobSchema>;

export default function NewJobPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobForm>({
    resolver: zodResolver(jobSchema),
  });

  const onSubmit = async (data: JobForm) => {
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to post job");
      }

      router.push("/jobs");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Post a New Job</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg shadow border border-border/50">
        <div>
          <label className="block text-sm font-medium text-foreground">Job Title</label>
          <input
            {...register("title")}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            placeholder="उदा. वरिष्ठ प्रोग्रामर (Senior Programmer)"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Description</label>
          <textarea
            {...register("description")}
            rows={5}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            placeholder="कामको जिम्मेवारी, आवश्यक योग्यता, आदि"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground">Location</label>
            <input
              {...register("location")}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              placeholder="काठमाडौं, रिमोट, ललितपुर"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Job Type</label>
            <select
              {...register("type")}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="">Select Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Salary Range (Optional)</label>
          <input
            {...register("salary")}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            placeholder="उदा. NRs. ५०,००० - ८०,००० / महिना"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground">Required Skills (comma separated)</label>
          <input
            {...register("requiredSkills")}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            placeholder="React, Node.js, Photoshop, Excel"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 font-bold"
        >
          {isSubmitting ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
