"use client";

import ConversationList from "@/components/ConversationList";
import { usePathname } from "next/navigation";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isListPage = pathname === "/messages";

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-7xl mx-auto bg-white shadow-sm rounded-lg overflow-hidden my-4 border">
      {/* Sidebar (List) */}
      {/* On mobile: Show only if on list page. On desktop: Always show. */}
      <div className={`w-full md:w-1/3 md:border-r bg-white flex flex-col ${!isListPage ? "hidden md:flex" : "flex"}`}>
         <ConversationList /> 
      </div>

      {/* Main Content (Chat) */}
      {/* On mobile: Show only if NOT on list page. On desktop: Always show. */}
      <div className={`w-full md:w-2/3 bg-gray-50 flex flex-col ${isListPage ? "hidden md:flex" : "flex"}`}>
        {children}
      </div>
    </div>
  );
}
