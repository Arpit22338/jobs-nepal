"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send, Loader2, Sparkles, ChevronRight, Info } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIFeature {
  name: string;
  description: string;
  path: string;
}

const quickActions = [
  { text: "What can you do?", icon: "bx-help-circle" },
  { text: "Help me find a job", icon: "bx-briefcase" },
  { text: "Show me AI tools", icon: "bx-bot" },
  { text: "Improve my profile", icon: "bx-user" },
  { text: "Use RojgaarAI CV generator — click here", icon: "bx-file" },
  { text: "Interview prep", icon: "bx-conversation" },
];

export default function RojgaarAIChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<AIFeature[]>([]);
  const [showFeatures, setShowFeatures] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("rojgaarAI_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error("Failed to load messages:", e);
      }
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("rojgaarAI_messages", JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // Fetch features
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const res = await fetch("/api/ai/rojgaar-assistant");
        const data = await res.json();
        if (data.allFeatures) {
          setFeatures(data.allFeatures);
        }
      } catch (e) {
        console.error("Failed to fetch features:", e);
      }
    };
    if (session) fetchFeatures();
  }, [session]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    setInput("");
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/rojgaar-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.success ? data.message : (data.error || "Sorry, I couldn't process that. Please try again."),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (data.features) setFeatures(data.features);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Oops! Something went wrong. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("rojgaarAI_messages");
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-primary/5 to-transparent">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/40 bg-card/80 backdrop-blur-md flex items-center gap-3 sticky top-0 z-10">
        <Link
          href="/messages"
          className="md:hidden p-2 hover:bg-accent rounded-xl transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
          <i className="bx bx-bot text-white text-xl"></i>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-foreground">RojgaarAI</h2>
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">AI Assistant</span>
          </div>
          <p className="text-xs text-muted-foreground">Always here to help with your career</p>
        </div>
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="p-2 hover:bg-accent rounded-xl transition-colors"
          title="AI Tools"
        >
          <Sparkles size={20} className="text-primary" />
        </button>
        <button
          onClick={clearChat}
          className="p-2 hover:bg-accent rounded-xl transition-colors text-muted-foreground"
          title="Clear chat"
        >
          <i className="bx bx-trash text-lg"></i>
        </button>
      </div>

      {/* Features Panel */}
      {showFeatures && (
        <div className="absolute top-16 right-4 w-72 bg-card border border-border rounded-2xl shadow-2xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-border bg-primary/5 flex items-center justify-between">
            <span className="font-bold text-sm">AI Tools</span>
            <button onClick={() => setShowFeatures(false)} className="text-muted-foreground hover:text-foreground">
              <i className="bx bx-x text-lg"></i>
            </button>
          </div>
          <div className="p-2 max-h-60 overflow-y-auto">
            {features.map((f, i) => (
              <Link
                key={i}
                href={f.path}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{f.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{f.description}</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
              <i className="bx bx-bot text-white text-4xl"></i>
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Hi! I&apos;m RojgaarAI 👋</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              I&apos;m your personal career assistant at RojgaarNepal. I can help you find jobs, improve your profile, and navigate all our AI tools.
            </p>
            
            {/* Info Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 max-w-sm mx-auto text-left">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">What I can help with:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Navigate RojgaarNepal features</li>
                    <li>• Career advice and job search tips</li>
                    <li>• Guide you to our AI tools</li>
                    <li>• Profile improvement suggestions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action.text)}
                  className="px-3 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-accent hover:border-primary/30 transition-all flex items-center gap-2"
                >
                  <i className={`bx ${action.icon} text-primary`}></i>
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                  <i className="bx bx-bot text-white text-sm"></i>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border rounded-bl-md shadow-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <p className="text-xs font-bold text-primary mb-1">RojgaarAI</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-primary/70 flex items-center justify-center">
                <i className="bx bx-bot text-white text-sm"></i>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/40 bg-card/80 backdrop-blur-md">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about jobs, your profile, or our AI tools..."
            className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            maxLength={500}
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          RojgaarAI can make mistakes. For critical decisions, please verify information.
        </p>
      </div>
    </div>
  );
}
