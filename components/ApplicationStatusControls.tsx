"use client";

import { updateApplicationStatus } from "@/app/actions/application";
import { useState } from "react";
import { Check, X } from "lucide-react";

interface Props {
  applicationId: string;
  currentStatus: string;
}

export default function ApplicationStatusControls({ applicationId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (newStatus: "ACCEPTED" | "REJECTED") => {
    setLoading(true);
    const result = await updateApplicationStatus(applicationId, newStatus);
    if (result.success) {
      setStatus(newStatus);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <Check size={14} className="mr-1" /> Accepted
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        <X size={14} className="mr-1" /> Rejected
      </span>
    );
  }

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => handleUpdate("ACCEPTED")}
        disabled={loading}
        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
      >
        Accept
      </button>
      <button
        onClick={() => handleUpdate("REJECTED")}
        disabled={loading}
        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
