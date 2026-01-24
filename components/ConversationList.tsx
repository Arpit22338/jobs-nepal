"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, MessageSquare, Zap } from "lucide-react";

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
  const pathname = usePathname();

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
            className="w-full pl-10 pr-4 py-3 bg-accent/20 border-2 border-transparent focus:border-primary/20 rounded-2xl text-xs font-bold focus:outline-none transition-all placeholder:text-muted-foreground/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
        {conversations.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Zap size={24} className="text-muted-foreground/20 mx-auto" />
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest leading-loose">No active<br />conversations</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = pathname === `/messages/${conv.user.id}`;
            return (
              <Link
                key={conv.user.id}
                href={`/messages/${conv.user.id}`}
                className={`block p-4 rounded-3xl transition-all duration-300 group ${isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'hover:bg-accent/40'
                  } ${conv.unreadCount > 0 && !isActive ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-4">
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
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black rounded-lg min-w-[20px] h-5 px-1 flex items-center justify-center ring-4 ring-background shadow-lg">
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
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
