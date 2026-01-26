"use client";

import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
      <div className="bg-muted p-4 rounded-full mb-4">
        <MessageSquare size={48} className="text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Your Messages</h2>
      <p className="mt-2">Select a conversation from the list to start chatting.</p>
    </div>
  );
}

