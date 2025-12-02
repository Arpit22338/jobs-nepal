"use client";

import { useEffect, useState } from "react";

interface Ticket {
  id: string;
  user: {
    name: string;
    email: string;
  };
  subject: string;
  message: string;
  reply: string | null;
  status: string;
  createdAt: string;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/admin/support");
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (ticketId: string) => {
    const reply = replyText[ticketId];
    if (!reply) return;

    try {
      const res = await fetch("/api/admin/support", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, reply }),
      });

      if (res.ok) {
        alert("Reply sent");
        fetchTickets();
      } else {
        alert("Failed to send reply");
      }
    } catch (error) {
      console.error(error);
      alert("Error sending reply");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading tickets...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Premium Customer Support</h1>
      <div className="space-y-6">
        {tickets.length === 0 ? (
          <p className="text-gray-500">No support tickets found.</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-white p-6 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500">
                    From: {ticket.user.name} ({ticket.user.email})
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  ticket.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {ticket.status}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded mb-4">
                <p className="text-gray-800 whitespace-pre-wrap">{ticket.message}</p>
              </div>

              {ticket.reply ? (
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                  <p className="text-sm font-bold text-blue-800 mb-1">Admin Reply:</p>
                  <p className="text-gray-800">{ticket.reply}</p>
                </div>
              ) : (
                <div className="mt-4">
                  <textarea
                    className="w-full border rounded p-2 mb-2 text-sm"
                    placeholder="Write a reply..."
                    rows={3}
                    value={replyText[ticket.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                  />
                  <button
                    onClick={() => handleReply(ticket.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Send Reply & Close
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
