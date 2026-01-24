"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, Star } from "lucide-react";
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

  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    setLoading(true);
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
      setSaved(previousState);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleSave}
      disabled={loading}
      className={`p-2.5 rounded-2xl transition-all duration-300 scale-100 active:scale-90 border shadow-sm ${saved
          ? "text-primary bg-primary/10 border-primary/20"
          : "text-muted-foreground/40 bg-accent/40 border-transparent hover:text-primary hover:bg-primary/5 hover:border-primary/10"
        }`}
      title={saved ? "Unsave Job" : "Save Job"}
    >
      {saved ? (
        <div className="relative">
          <BookmarkCheck size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping"></span>
        </div>
      ) : <Bookmark size={20} />}
    </button>
  );
}
