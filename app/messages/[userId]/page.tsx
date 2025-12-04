"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User, Trash2 } from "lucide-react";
import Image from "next/image";
import { deleteMessage } from "@/app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-sm">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        {otherUser ? (
          <Link href={`/profile/${otherUser.id}`} className="flex items-center space-x-4 group">
            <div className="relative">
              {otherUser.image ? (
                <Image
                  src={otherUser.image}
                  alt={otherUser.name || "User"}
                  width={44}
                  height={44}
                  className="rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all"
                  unoptimized
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner">
                  <User size={20} className="text-gray-500" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{otherUser.name || "User"}</h2>
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                Online
              </p>
            </div>
          </Link>
        ) : (
          <h2 className="text-lg font-bold text-gray-800">Chat</h2>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = msg.senderId === (session?.user as any)?.id;
          
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}
            >
              {/* Other User PFP (Left) */}
              {!isMe && (
                <div className="flex-shrink-0 mb-1">
                  {otherUser?.image ? (
                    <Image
                      src={otherUser.image}
                      alt={otherUser.name || "User"}
                      width={28}
                      height={28}
                      className="rounded-full object-cover ring-2 ring-white shadow-sm"
                      unoptimized
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={14} className="text-gray-500" />
                    </div>
                  )}
                </div>
              )}

              <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
                <div
                  className={`px-5 py-3 rounded-2xl relative group shadow-sm transition-all ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm hover:bg-blue-700"
                      : "bg-white text-gray-800 rounded-bl-sm border border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <p className="leading-relaxed text-[15px]">{formatMessageContent(msg.content, isMe)}</p>
                  {isMe && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-md border border-gray-100 hover:bg-red-50"
                          title="Delete message"
                        >
                          <Trash2 size={12} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this message from the conversation.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await deleteMessage(msg.id);
                              setMessages((prev) => prev.filter((m) => m.id !== msg.id));
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className={`text-[10px] mt-1.5 font-medium px-1 flex items-center gap-1 ${isMe ? "text-gray-400" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && (
                    <span>
                      {msg.isRead ? (
                        <span title="Read" className="text-blue-500">✓✓</span> 
                      ) : (
                        <span title="Sent" className="text-gray-300">✓</span>
                      )}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="flex gap-3 items-center max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full rounded-full bg-gray-100 border-transparent px-6 py-3 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
