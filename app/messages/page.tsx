"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

export default function MessagesPage() {
  const { status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        setConversations(data.conversations);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchConversations();
    }
  }, [status]);

  if (status === "loading" || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center">No conversations yet.</p>
        ) : (
          conversations.map((conv) => (
            <Link
              key={conv.user.id}
              href={`/messages/${conv.user.id}`}
              className={`block p-4 border rounded-lg hover:bg-gray-50 transition ${conv.unreadCount > 0 ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {conv.user.image ? (
                    <Image
                      src={conv.user.image}
                      alt={conv.user.name || "User"}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
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
                    <p className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {conv.user.name}
                    </p>
                    <span className="text-xs text-gray-500">
                      {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                    {conv.lastMessage.content}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
