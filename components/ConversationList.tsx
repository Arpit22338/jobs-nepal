"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

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
      // Poll for updates
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === "loading") return <div className="p-4 text-center">Loading...</div>;
  if (status === "unauthenticated") return <div className="p-4 text-center text-gray-500">Please login to view messages.</div>;
  if (loading) return <div className="p-4 text-center">Loading conversations...</div>;
  if (conversations.length === 0) return <div className="p-4 text-center text-gray-500">No messages yet.</div>;

  return (
    <div className="h-full overflow-y-auto bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <div className="divide-y">
        {conversations.map((conv) => {
          const isActive = pathname === `/messages/${conv.user.id}`;
          return (
            <Link
              key={conv.user.id}
              href={`/messages/${conv.user.id}`}
              className={`block p-4 hover:bg-gray-50 transition ${isActive ? 'bg-blue-50' : ''} ${conv.unreadCount > 0 ? 'bg-blue-50/50' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  {conv.user.image ? (
                    <Image
                      src={conv.user.image}
                      alt={conv.user.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      {conv.user.name?.[0] || "U"}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <p className={`text-sm font-medium truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {conv.user.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    {conv.lastMessage.content}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
