"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteSavedJobButtonProps {
  jobId: string;
}

export default function DeleteSavedJobButton({ jobId }: DeleteSavedJobButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUnsave = async () => {
    if (!confirm("Remove this job from your saved list?")) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to remove saved job");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleUnsave}
      disabled={loading}
      className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
    >
      {loading ? "Removing..." : "Remove from Saved"}
    </button>
  );
}
