"use client";
import { setSetting } from "@/lib/settings";
import { useState } from "react";

export default function TeacherLoginToggle({ initialValue }: { initialValue: boolean }) {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleToggle() {
    setLoading(true);
    await setSetting("teacher_login_enabled", (!enabled).toString());
    setEnabled(!enabled);
    setMessage(`Teacher login is now ${!enabled ? "enabled" : "disabled"}`);
    setLoading(false);
    setTimeout(() => setMessage(null), 2000);
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="flex items-center gap-4">
        <label className="font-semibold text-gray-700">Enable Teacher Login</label>
        <button
          className={`px-4 py-2 rounded transition-colors duration-200 ${enabled ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}
          onClick={handleToggle}
          disabled={loading}
        >
          {enabled ? "ON" : "OFF"}
        </button>
      </div>
      {message && (
        <div className="text-sm text-green-600 font-semibold">{message}</div>
      )}
    </div>
  );
}
