"use client";

import { deleteJob } from "@/app/actions";
import { useState } from "react";

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job?")) return;

    setIsDeleting(true);
    try {
      await deleteJob(jobId);
    } catch (error) {
      alert("Failed to delete job");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "Delete"}
    </button>
  );
}
