"use client";

import { useRouter } from "next/navigation";
import { Crown } from "lucide-react";

export default function GetPremiumButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/premium")}
      className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-md hover:from-yellow-600 hover:to-amber-700 transition-all shadow-md"
    >
      <Crown size={18} />
      Get Premium
    </button>
  );
}
