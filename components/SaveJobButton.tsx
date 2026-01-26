"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SaveJobButtonProps {
  jobId: string;
  initialSaved?: boolean;
}

// Animated Capsule Toast Component
function CapsuleToast({ 
  show, 
  isSaved, 
  onClose 
}: { 
  show: boolean; 
  isSaved: boolean; 
  onClose: () => void;
}) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div 
      className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-100 animate-in slide-in-from-bottom-4 fade-in duration-300`}
    >
      <div 
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-xl backdrop-blur-xl border ${
          isSaved 
            ? "bg-green-500/20 border-green-500/30 text-green-400" 
            : "bg-red-500/20 border-red-500/30 text-red-400"
        }`}
      >
        {/* Progress bar at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-full overflow-hidden">
          <div 
            className={`h-full rounded-full animate-[shrink_2.5s_linear_forwards] ${
              isSaved ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ 
              animation: "shrink 2.5s linear forwards",
            }}
          />
        </div>
        
        {/* Icon */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
          isSaved ? "bg-green-500" : "bg-red-500"
        }`}>
          {isSaved ? (
            <BookmarkCheck size={14} className="text-white" />
          ) : (
            <X size={14} className="text-white" />
          )}
        </div>
        
        {/* Text */}
        <span className="text-sm font-medium whitespace-nowrap">
          {isSaved ? "Job Saved!" : "Job Unsaved"}
        </span>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default function SaveJobButton({ jobId, initialSaved = false }: SaveJobButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastSavedState, setToastSavedState] = useState(false);

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
    const newState = !saved;
    setSaved(newState);

    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        throw new Error("Failed to toggle save");
      }
      
      // Show toast on success
      setToastSavedState(newState);
      setShowToast(true);
    } catch (error) {
      console.error(error);
      setSaved(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
      
      {/* Capsule Toast */}
      <CapsuleToast 
        show={showToast} 
        isSaved={toastSavedState} 
        onClose={() => setShowToast(false)} 
      />
    </>
  );
}
