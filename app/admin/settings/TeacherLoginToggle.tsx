import { setSetting } from "@/lib/settings";
import { useState } from "react";

export default function TeacherLoginToggle({ initialValue }: { initialValue: boolean }) {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    await setSetting("teacher_login_enabled", (!enabled).toString());
    setEnabled(!enabled);
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <label className="font-semibold text-gray-700">Enable Teacher Login</label>
      <button
        className={`px-4 py-2 rounded ${enabled ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}
        onClick={handleToggle}
        disabled={loading}
      >
        {enabled ? "ON" : "OFF"}
      </button>
    </div>
  );
}
