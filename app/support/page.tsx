"use client";

import { useState, useEffect } from "react";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  reply: string | null;
  status: string;
  createdAt: string;
}

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/support");
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    }
  };

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
        setSubject("");
        setMessage("");
        fetchTickets(); // Refresh list
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
    <div className="min-h-[calc(100vh-80px)] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-black text-foreground mb-4">Help & Support</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Need assistance? Our support team is here to help you.
            Submit a ticket and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Submit a Ticket
            </h2>
            <div className="glass-card p-8 rounded-3xl border border-border/50 shadow-xl relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>

              <form onSubmit={handleSubmit} className="space-y-6 relative">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-background/50 border border-input rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
                    placeholder="Brief summary of the issue"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-background/50 border border-input rounded-xl px-4 py-3 h-40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none placeholder:text-muted-foreground/50 font-medium"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground font-black py-4 rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Submitting..." : "Submit Ticket"}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
              Your History
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {tickets.length === 0 ? (
                <div className="glass-card p-10 rounded-3xl border-dashed border-2 flex flex-col items-center justify-center text-center">
                  <p className="text-muted-foreground font-medium italic">No tickets submitted yet.</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div key={ticket.id} className="glass-card p-6 rounded-3xl border border-border/50 shadow-sm group hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-black text-lg text-foreground group-hover:text-primary transition-colors">{ticket.subject}</h3>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ticket.status === "OPEN" ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-muted text-muted-foreground border border-border"
                        }`}>
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-1.5">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                    <div className="bg-accent/30 p-4 rounded-2xl text-sm text-foreground/80 font-medium mb-4 border border-border/20">
                      {ticket.message}
                    </div>

                    {ticket.reply && (
                      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 relative">
                        <div className="absolute top-0 left-6 -translate-y-1/2 bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                          Admin Reply
                        </div>
                        <p className="text-sm text-foreground/90 font-bold ">{ticket.reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
