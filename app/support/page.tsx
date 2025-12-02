"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      if (res.ok) {
        alert("Ticket submitted successfully! We will get back to you soon.");
        router.push("/profile");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit ticket");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Premium Customer Support</h1>
      <p className="text-gray-600 mb-8">
        As a premium member, you have access to our priority support channel. 
        Please describe your issue below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Brief summary of the issue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-md px-4 py-2 h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Describe your problem in detail..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}
