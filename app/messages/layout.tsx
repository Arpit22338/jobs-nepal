"use client";

import ConversationList from "@/components/ConversationList";
import { usePathname } from "next/navigation";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isListPage = pathname === "/messages";

  return (
    <div className="fixed inset-0 top-16 z-40 flex flex-col md:flex-row bg-background md:static md:h-[calc(100vh-140px)] md:w-full md:max-w-7xl md:mx-auto glass-card md:rounded-[32px] md:overflow-hidden md:my-8 md:border md:border-white/40 shadow-2xl">
      {/* Sidebar (List) */}
      <div className={`w-full md:w-[320px] lg:w-[400px] border-r border-border/40 bg-card/30 backdrop-blur-md flex flex-col ${!isListPage ? "hidden md:flex" : "flex h-full"}`}>
        <ConversationList />
      </div>

      {/* Main Content (Chat) */}
      <div className={`flex-1 bg-accent/5 backdrop-blur-sm flex flex-col overflow-hidden ${isListPage ? "hidden md:flex" : "flex h-full"}`}>
        {children}
      </div>
    </div>
  );
}
