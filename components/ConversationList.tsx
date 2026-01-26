"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, MessageSquare, Zap, MoreVertical, Trash2, Flag, UserX, Sparkles, Pin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/Toast";

interface Conversation {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

export default function ConversationList() {
  const { status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { showToast, showConfirm } = useToast();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        setConversations(data.conversations || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchConversations();
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleDeleteConversation = async (userId: string, userName: string) => {
    showConfirm({
      title: "Delete Conversation",
      message: `Are you sure you want to delete your conversation with ${userName}? This cannot be undone.`,
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/messages/conversation?userId=${userId}`, { method: "DELETE" });
          if (res.ok) {
            setConversations(prev => prev.filter(c => c.user.id !== userId));
            showToast("Conversation deleted", "success");
          } else {
            showToast("Failed to delete conversation", "error");
          }
        } catch {
          showToast("Something went wrong", "error");
        }
      }
    });
  };

  const handleReportUser = async (userId: string, userName: string) => {
    showConfirm({
      title: "Report User",
      message: `Report ${userName} for inappropriate behavior?`,
      type: "warning",
      confirmText: "Report",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/reports", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetType: "USER", targetId: userId, reason: "Reported from messages" })
          });
          if (res.ok) {
            showToast("User reported successfully", "success");
          } else {
            const data = await res.json();
            showToast(data.error || "Failed to report user", "error");
          }
        } catch {
          showToast("Something went wrong", "error");
        }
      }
    });
  };

  const handleBlockUser = async (userId: string, userName: string) => {
    showConfirm({
      title: "Block User",
      message: `Block ${userName}? They won't be able to message you anymore.`,
      type: "danger",
      confirmText: "Block",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/users/block", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId })
          });
          if (res.ok) {
            setConversations(prev => prev.filter(c => c.user.id !== userId));
            showToast(`${userName} has been blocked`, "success");
          } else {
            showToast("Failed to block user", "error");
          }
        } catch {
          showToast("Something went wrong", "error");
        }
      }
    });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading") return <div className="p-8 text-center animate-pulse font-black text-muted-foreground uppercase text-xs">Syncing...</div>;
  if (status === "unauthenticated") return <div className="p-8 text-center text-muted-foreground font-bold">Please login to view messages.</div>;

  if (loading) return (
    <div className="p-8 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="w-12 h-12 bg-accent rounded-full"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-accent rounded w-1/2"></div>
            <div className="h-3 bg-accent rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-transparent">
      <div className="p-8 pb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-foreground tracking-tight">Inbox</h2>
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <MessageSquare size={18} />
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
          <input
            type="text"
            placeholder="Filter chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-accent/20 border-2 border-transparent focus:border-primary/20 rounded-2xl text-xs font-bold focus:outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
        {/* RojgaarAI - Pinned at top */}
        <Link
          href="/messages/rojgaar-ai"
          className={`relative p-4 rounded-3xl transition-all duration-300 group flex items-center gap-4 ${
            pathname === "/messages/rojgaar-ai"
              ? 'bg-linear-to-r from-primary to-primary/80 text-white shadow-xl shadow-primary/20 scale-[1.02]'
              : 'bg-linear-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 border border-primary/20'
          }`}
        >
          <div className="relative shrink-0">
            <div className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center ring-4 transition-all ${
              pathname === "/messages/rojgaar-ai" ? 'bg-white/20 ring-white/20' : 'bg-primary/10 ring-primary/10'
            }`}>
              <i className={`bx bx-bot text-2xl ${pathname === "/messages/rojgaar-ai" ? 'text-white' : 'text-primary'}`}></i>
            </div>
            <span className="absolute -top-1 -right-1 p-1 bg-yellow-500 rounded-lg">
              <Pin size={10} className="text-white" />
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <div className="flex items-center gap-2">
                <p className={`text-sm font-black truncate tracking-tight ${
                  pathname === "/messages/rojgaar-ai" ? 'text-white' : 'text-foreground'
                }`}>
                  RojgaarAI
                </p>
                <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] font-bold rounded-md uppercase">AI</span>
              </div>
              <Sparkles size={14} className={pathname === "/messages/rojgaar-ai" ? 'text-white/60' : 'text-primary/60'} />
            </div>
            <p className={`text-xs truncate font-medium ${
              pathname === "/messages/rojgaar-ai" ? 'text-white/70' : 'text-muted-foreground'
            }`}>
              Your career assistant • Always here to help
            </p>
          </div>
        </Link>

        <div className="h-px bg-border/50 my-2" />

        {filteredConversations.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Zap size={24} className="text-muted-foreground/20 mx-auto" />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-loose">
              {searchQuery ? "No matches found" : "No active\nconversations"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = pathname === `/messages/${conv.user.id}`;
            return (
              <div
                key={conv.user.id}
                className={`relative p-4 rounded-3xl transition-all duration-300 group ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'hover:bg-accent/40'
                  } ${conv.unreadCount > 0 && !isActive ? 'bg-primary/5' : ''}`}
              >
                <Link
                  href={`/messages/${conv.user.id}`}
                  className="flex items-center gap-4"
                >
                  <div className="relative shrink-0">
                    {conv.user.image ? (
                      <Image
                        src={conv.user.image}
                        alt={conv.user.name || "User"}
                        width={52}
                        height={52}
                        className={`rounded-2xl object-cover ring-4 transition-all ${isActive ? 'ring-white/20' : 'ring-accent group-hover:ring-primary/10'}`}
                      />
                    ) : (
                      <div className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center font-black text-xl transition-all ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary group-hover:bg-primary/20'}`}>
                        {conv.user.name?.[0] || "U"}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black rounded-lg min-w-5 h-5 px-1 flex items-center justify-center ring-4 ring-background shadow-lg">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`text-sm font-black truncate tracking-tight transition-colors ${isActive ? 'text-white' : 'text-foreground'}`}>
                        {conv.user.name}
                      </p>
                      <span className={`text-[10px] font-black uppercase tracking-tighter opacity-40 ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className={`text-xs truncate font-medium transition-colors ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </Link>

                {/* 3-dot menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className={`absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-accent text-muted-foreground'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem 
                      onClick={() => handleDeleteConversation(conv.user.id, conv.user.name || "User")}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 size={14} className="mr-2" /> Delete Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReportUser(conv.user.id, conv.user.name || "User")}>
                      <Flag size={14} className="mr-2" /> Report User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleBlockUser(conv.user.id, conv.user.name || "User")}
                      className="text-destructive focus:text-destructive"
                    >
                      <UserX size={14} className="mr-2" /> Block User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
