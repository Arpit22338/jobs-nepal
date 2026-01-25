"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/components/Toast";

interface RepostJobButtonProps {
  jobId: string;
}

export default function RepostJobButton({ jobId }: RepostJobButtonProps) {
  const router = useRouter();
  const { showToast, showConfirm } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRepost = () => {
    showConfirm({
      title: "Repost Job Listing",
      message: "This will create a duplicate of this job posting. The new listing will appear as a fresh posting with today's date.",
      confirmText: "Repost",
      type: "info",
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/jobs/${jobId}/repost`, {
            method: "POST",
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to repost job");
          }

          const data = await res.json();
          showToast("Job reposted successfully!", "success");
          router.push(`/jobs/${data.job.id}`);
          router.refresh();
        } catch (error) {
          console.error("Repost error:", error);
          showToast(error instanceof Error ? error.message : "Failed to repost job", "error");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <button
      onClick={handleRepost}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
      title="Repost this job"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Copy size={14} />
      )}
      Repost
    </button>
  );
}
