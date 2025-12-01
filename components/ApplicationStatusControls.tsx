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
      case "ACCEPTED": return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
      case "SHORTLISTED": return "bg-purple-100 text-purple-800 border-purple-200";
      case "REVIEWING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={status}
        onChange={(e) => handleUpdate(e.target.value)}
        disabled={loading}
        className={`text-sm font-medium rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 py-1 pl-2 pr-8 cursor-pointer ${getStatusColor(status)}`}
      >
        <option value="PENDING">Pending</option>
        <option value="REVIEWING">Reviewing</option>
        <option value="SHORTLISTED">Shortlisted</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="REJECTED">Rejected</option>
      </select>
      {loading && <span className="text-xs text-gray-500 animate-pulse">Updating...</span>}
    </div>
  );
}

