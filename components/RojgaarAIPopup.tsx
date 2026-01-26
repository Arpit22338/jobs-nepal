"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { X, Send, Loader2, ChevronRight, Sparkles } from "lucide-react";

// Helper function to parse message content and convert URLs to clickable links
function parseMessageWithLinks(content: string): React.ReactNode {
  // Match URLs in the text
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  if (parts.length === 1) {
    return content; // No URLs found
  }
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      // Extract the path from the URL for display text
      try {
        const url = new URL(part);
        const path = url.pathname;
        // Create friendly display text based on the path
        let displayText = "here";
        if (path.includes("resume-builder")) displayText = "Resume Builder";
        else if (path.includes("interview-prep")) displayText = "Interview Prep";
        else if (path.includes("skills-gap")) displayText = "Skills Gap Analysis";
        else if (path.includes("job-matcher")) displayText = "Job Matcher";
        else if (path.includes("ai-tools")) displayText = "AI Tools";
        else if (path.includes("jobs")) displayText = "Jobs";
        else if (path.includes("profile")) displayText = "Profile";
        else if (path.includes("courses")) displayText = "Courses";
        else if (path.includes("support")) displayText = "Support";
        else if (path.includes("talent")) displayText = "Talent";
        else if (path.includes("messages")) displayText = "Messages";
        else if (path === "/") displayText = "Home";
        else displayText = path.split("/").filter(Boolean).pop() || "here";
        
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline font-medium"
          >
            {displayText}
          </a>
        );
      } catch {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 underline font-medium"
          >
            here
          </a>
        );
      }
    }
    return part;
  });
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIFeature {
  name: string;
  description: string;
  path: string;
}

export default function RojgaarAIPopup() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [features, setFeatures] = useState<AIFeature[]>([]);
  const [showFeatures, setShowFeatures] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowFeatures(false);
        setShowBubble(false);
      }
    };

    if (isOpen || showFeatures || showBubble) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, showFeatures, showBubble]);

  // Fetch random tip on mount
  useEffect(() => {
    if (session) {
      const fetchTip = async () => {
        try {
          const res = await fetch("/api/ai/rojgaar-assistant");
          const data = await res.json();
          if (data.success) {
            setFeatures(data.allFeatures || []);
            // Show bubble after 5 seconds
            setTimeout(() => {
              setBubbleMessage(data.tip || "Try our AI tools!");
              setShowBubble(true);
              // Hide bubble after 8 seconds
              setTimeout(() => setShowBubble(false), 8000);
            }, 5000);
          }
        } catch (error) {
          console.error("Failed to fetch tip:", error);
        }
      };
      fetchTip();

      // Show random tips periodically (every 2 minutes)
      const interval = setInterval(async () => {
        if (!isOpen) {
          try {
            const res = await fetch("/api/ai/rojgaar-assistant");
            const data = await res.json();
            if (data.success && data.tip) {
              setBubbleMessage(data.tip);
              setShowBubble(true);
              setTimeout(() => setShowBubble(false), 8000);
            }
          } catch (error) {
            console.error("Failed to fetch tip:", error);
          }
        }
      }, 120000);

      return () => clearInterval(interval);
    }
  }, [session, isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/rojgaar-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages.slice(-6),
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        if (data.features) setFeatures(data.features);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.error || "Sorry, I couldn't process that. Please try again." 
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Oops! Something went wrong. Please try again." 
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

  const handleBubbleClick = () => {
    setShowBubble(false);
    setShowFeatures(true);
  };

  if (!session) return null;

  return (
    <>
      {/* Floating Button with Cloud Bubble */}
      <div ref={popupRef} className="fixed bottom-20 right-6 z-30 hidden md:block">
        {/* Cloud Tip Bubble */}
        {showBubble && !isOpen && (
          <div 
            onClick={handleBubbleClick}
            className="absolute bottom-16 right-0 w-64 bg-card border border-border rounded-2xl shadow-2xl p-4 cursor-pointer hover:scale-105 transition-transform animate-in slide-in-from-right-5 fade-in duration-300"
          >
            {/* Cloud tail */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border transform rotate-45" />
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <i className="bx bx-bot text-primary text-lg"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary mb-1">RojgaarAI</p>
                <p className="text-sm text-foreground line-clamp-3">{bubbleMessage}</p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-accent transition-colors"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
        )}

        {/* Features Panel (shows when bubble clicked) */}
        {showFeatures && !isOpen && (
          <div className="absolute bottom-16 right-0 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2">
                <i className="bx bx-bot text-primary text-xl"></i>
                <span className="font-bold text-foreground">AI Tools</span>
              </div>
              <button 
                onClick={() => setShowFeatures(false)}
                className="p-1 rounded-full hover:bg-accent transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-2 max-h-80 overflow-y-auto">
              {features.map((feature, i) => (
                <Link
                  key={i}
                  href={feature.path}
                  onClick={() => setShowFeatures(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{feature.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{feature.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
            <div className="p-3 border-t border-border">
              <button
                onClick={() => { setShowFeatures(false); setIsOpen(true); }}
                className="w-full py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <i className="bx bx-message-dots"></i>
                Chat with RojgaarAI
              </button>
            </div>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => { setIsOpen(!isOpen); setShowBubble(false); setShowFeatures(false); }}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? "bg-red-500 hover:bg-red-600 rotate-90" 
              : "bg-linear-to-br from-primary to-primary/80 hover:shadow-primary/40 hover:scale-110"
          }`}
        >
          {isOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <i className="bx bx-bot text-white text-2xl"></i>
          )}
        </button>

        {/* Chat Window */}
        {isOpen && (
          <div className="fixed bottom-36 right-6 w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 hidden md:flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
            {/* Header */}
            <div className="p-4 border-b border-border bg-linear-to-r from-primary/10 to-primary/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <i className="bx bx-bot text-primary text-xl"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">RojgaarAI</h3>
                <p className="text-xs text-muted-foreground">Your career assistant</p>
              </div>
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                title="AI Tools"
              >
                <Sparkles size={18} className="text-primary" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <i className="bx bx-bot text-primary text-3xl"></i>
                  </div>
                  <h4 className="font-bold text-foreground mb-2">Hi! I&apos;m RojgaarAI 👋</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    I can help you navigate RojgaarNepal and boost your career.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["What can you do?", "AI Tools", "Help with my profile"].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(q); setTimeout(handleSend, 100); }}
                        className="px-3 py-1.5 bg-accent rounded-full text-xs font-medium hover:bg-accent/80 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-accent text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <i className="bx bx-bot text-primary text-sm"></i>
                        <span className="text-xs font-semibold text-primary">RojgaarAI</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.role === "assistant" ? parseMessageWithLinks(msg.content) : msg.content}
                    </p>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-accent rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  maxLength={500}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
