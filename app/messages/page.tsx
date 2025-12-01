"use client";

import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        <MessageSquare size={48} className="text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700">Your Messages</h2>
      <p className="mt-2">Select a conversation from the list to start chatting.</p>
    </div>
  );
}

