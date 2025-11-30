"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User, Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteMessage } from "@/app/actions";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatUser {
  id: string;
  name: string | null;
  image: string | null;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const params = useParams();
  const otherUserId = params.userId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageContent = (content: string, isMe: boolean) => {
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const href = part.startsWith("www.") ? `http://${part}` : part;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline break-all ${isMe ? 'text-white hover:text-blue-100' : 'text-blue-600 hover:text-blue-800'}`}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?userId=${otherUserId}`);
      const data = await res.json();
      setMessages(data.messages);
      if (data.otherUser) {
        setOtherUser(data.otherUser);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  }, [otherUserId]);

  const markAsRead = useCallback(async () => {
    try {
      await fetch("/api/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: otherUserId }),
      });
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  }, [otherUserId]);

  useEffect(() => {
    if (session) {
      const loadMessages = async () => {
        await fetchMessages();
        await markAsRead();
      };
      loadMessages();
      const interval = setInterval(async () => {
        await fetchMessages();
        await markAsRead();
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [session, fetchMessages, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: otherUserId,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center space-x-3 bg-gray-50 rounded-t-lg">
        {otherUser ? (
          <Link href={`/profile/${otherUser.id}`} className="flex items-center space-x-3 hover:opacity-80 transition">
            {otherUser.image ? (
              <Image
                src={otherUser.image}
                alt={otherUser.name || "User"}
                width={40}
                height={40}
                className="rounded-full object-cover border"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-800">{otherUser.name || "User"}</h2>
              <p className="text-xs text-gray-500">View Profile</p>
            </div>
          </Link>
        ) : (
          <h2 className="text-lg font-bold">Chat</h2>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isMe = msg.senderId === (session?.user as any)?.id;
          
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {/* Other User PFP (Left) */}
              {!isMe && (
                <div className="flex-shrink-0">
                  {otherUser?.image ? (
                    <Image
                      src={otherUser.image}
                      alt={otherUser.name || "User"}
                      width={32}
                      height={32}
                      className="rounded-full object-cover border"
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </div>
                  )}
                </div>
              )}

              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg relative group ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  <p>{formatMessageContent(msg.content, isMe)}</p>
                  {isMe && (
                    <button
                      onClick={async () => {
                        if (confirm("Delete this message?")) {
                          await deleteMessage(msg.id);
                          // Optimistic update or refetch
                          setMessages(prev => prev.filter(m => m.id !== msg.id));
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      title="Delete message"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className={`text-xs mt-1 ${isMe ? "text-gray-500" : "text-gray-500"} flex items-center gap-1`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && (
                    <span>
                      {msg.isRead ? (
                        <span title="Read">✓✓</span> 
                      ) : (
                        <span title="Sent">✓</span>
                      )}
                    </span>
                  )}
                </p>
              </div>

              {/* My PFP (Right) */}
              {isMe && (
                <div className="flex-shrink-0">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(session?.user as any)?.image ? (
                    <Image
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      src={(session?.user as any).image}
                      alt="Me"
                      width={32}
                      height={32}
                      className="rounded-full object-cover border"
                      unoptimized
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border-gray-300 border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
