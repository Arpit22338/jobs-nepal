"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SaveJobButtonProps {
  jobId: string;
  initialSaved?: boolean;
}

export default function SaveJobButton({ jobId, initialSaved = false }: SaveJobButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  // If initialSaved is not provided/reliable, we might want to check it, 
  // but usually we'll pass it from the parent which fetches the list of saved IDs.
  // For now, we rely on the parent to set the initial state correctly or we can fetch it if needed.
  // But to keep it simple and performant, we'll assume the parent handles the "is this saved?" check 
  // or we just toggle from the current state.
  
  // Actually, for the list view, passing `initialSaved` is best.
  // If the user is not logged in, clicking should redirect to login.

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if inside a card
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
    // Optimistic update
    const previousState = saved;
    setSaved(!saved);

    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle save");
      }
    } catch (error) {
      console.error(error);
      setSaved(previousState); // Revert on error
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${
        saved ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      }`}
      title={saved ? "Unsave Job" : "Save Job"}
    >
      {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
    </button>
  );
}
