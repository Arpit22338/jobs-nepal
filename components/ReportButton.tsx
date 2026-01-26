"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

interface ReportButtonProps {
  targetJobId?: string;
  targetUserId?: string;
}

export default function ReportButton({ targetJobId, targetUserId }: ReportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    const reason = prompt("Please provide a reason for reporting:");
    if (!reason) return;

    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetJobId, targetUserId, reason }),
      });

      if (res.ok) {
        alert("Report submitted. Thank you.");
      } else {
        alert("Failed to submit report.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReport}
      disabled={loading}
      className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 text-sm"
      title="Report"
    >
      <Flag size={16} />
      <span>Report</span>
    </button>
  );
}
