"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface TogglePremiumButtonProps {
  userId: string;
  isPremium: boolean;
  premiumExpiresAt?: string | Date | null;
}

export default function TogglePremiumButton({ userId, isPremium, premiumExpiresAt }: TogglePremiumButtonProps) {
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("30");
  const router = useRouter();

  const handleSetPremium = async () => {
    if (!days) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/toggle-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPremium: true, durationDays: parseInt(days) }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to set premium");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePremium = async () => {
    if (!confirm("Are you sure you want to remove premium status?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/toggle-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPremium: false }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to remove premium");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (isPremium) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-600 font-medium">
          Premium 
          {premiumExpiresAt && ` (Exp: ${new Date(premiumExpiresAt).toLocaleDateString()})`}
        </span>
        <button
          onClick={handleRemovePremium}
          disabled={loading}
          className="p-1 text-red-500 hover:bg-red-50 rounded-full"
          title="Remove Premium"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        className="w-16 px-2 py-1 text-xs border rounded"
        placeholder="Days"
        min="1"
      />
      <button
        onClick={handleSetPremium}
        disabled={loading}
        className="p-1 text-green-600 hover:bg-green-50 rounded-full"
        title="Set Premium"
      >
        <Check size={16} />
      </button>
    </div>
  );
}
