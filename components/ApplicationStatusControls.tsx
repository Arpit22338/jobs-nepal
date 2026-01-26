"use client";

import { updateApplicationStatus } from "@/app/actions/application";
import { useState } from "react";

interface Props {
  applicationId: string;
  currentStatus: string;
}

export default function ApplicationStatusControls({ applicationId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus: string) => {
    setLoading(true);
    // @ts-expect-error: status type mismatch
    const result = await updateApplicationStatus(applicationId, newStatus);
    if (result.success) {
      setStatus(newStatus);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "ACCEPTED": return "bg-green-500/10 text-green-500 border-green-500/20 dark:bg-green-500/20 dark:text-green-400";
      case "REJECTED": return "bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-500/20 dark:text-red-400";
      case "SHORTLISTED": return "bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400";
      case "REVIEWING": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={status}
        onChange={(e) => handleUpdate(e.target.value)}
        disabled={loading}
        className={`text-sm font-medium rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary py-1.5 pl-3 pr-8 cursor-pointer ${getStatusColor(status)}`}
      >
        <option value="PENDING">Pending</option>
        <option value="REVIEWING">Reviewing</option>
        <option value="SHORTLISTED">Shortlisted</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="REJECTED">Rejected</option>
      </select>
      {loading && <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>}
    </div>
  );
}

