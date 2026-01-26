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

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Premium Customer Support</h1>
        <p className="text-muted-foreground text-sm">{tickets.length} tickets</p>
      </div>
      
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bx bx-support text-3xl text-muted-foreground"></i>
            </div>
            <p className="text-muted-foreground">No support tickets found.</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="bg-card p-6 rounded-2xl border border-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    From: {ticket.user.name} ({ticket.user.email})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  ticket.status === "OPEN" ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                }`}>
                  {ticket.status}
                </span>
              </div>

              <div className="bg-accent/50 p-4 rounded-xl mb-4">
                <p className="text-foreground whitespace-pre-wrap">{ticket.message}</p>
              </div>

              {ticket.reply ? (
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <p className="text-sm font-bold text-primary mb-1">Admin Reply:</p>
                  <p className="text-foreground">{ticket.reply}</p>
                </div>
              ) : (
                <div className="mt-4">
                  <textarea
                    className="w-full border border-border rounded-xl p-3 mb-2 text-sm bg-background text-foreground focus:ring-2 focus:ring-primary/50"
                    placeholder="Write a reply..."
                    rows={3}
                    value={replyText[ticket.id] || ""}
                    onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                  />
                  <button
                    onClick={() => handleReply(ticket.id)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
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
