"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface TogglePremiumButtonProps {
  userId: string;
  isPremium: boolean;
}

export default function TogglePremiumButton({ userId, isPremium }: TogglePremiumButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/toggle-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPremium: !isPremium }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update premium status");
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
      onClick={handleToggle}
      disabled={loading}
      className={`p-1 rounded-full transition-colors ${
        isPremium ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100" : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      }`}
      title={isPremium ? "Remove Premium" : "Make Premium"}
    >
      <Star size={18} fill={isPremium ? "currentColor" : "none"} />
    </button>
  );
}
