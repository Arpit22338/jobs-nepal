"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Zap, BellOff } from "lucide-react";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  content: string;
  isRead: boolean;
  link: string | null;
  createdAt: Date | string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data: any = await getNotifications();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-accent/30 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-2xl transition-all shadow-sm active:scale-90"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-lg min-w-[18px] h-4.5 px-1 flex items-center justify-center ring-4 ring-background shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-4 right-4 top-20 mt-2 md:absolute md:right-0 md:left-auto md:w-[360px] glass-card rounded-[32px] shadow-2xl py-2 z-[60] border-white/40 ring-1 ring-primary/5 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-border/40 flex justify-between items-center bg-accent/10">
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Activity</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="px-8 py-12 text-center space-y-3">
                <BellOff size={32} className="text-muted-foreground/20 mx-auto" />
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No news is good news</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-6 py-4 border-b border-border/20 last:border-b-0 cursor-pointer transition-colors hover:bg-primary/5 flex gap-4 items-start ${!notification.isRead ? "bg-primary/[0.03]" : ""
                    }`}
                >
                  <div className={`mt-1 shrink-0 p-2 rounded-xl border ${!notification.isRead ? "bg-primary/10 border-primary/20 text-primary" : "bg-accent/50 border-transparent text-muted-foreground"}`}>
                    <Zap size={14} fill={!notification.isRead ? "currentColor" : "none"} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm leading-relaxed ${!notification.isRead ? "font-black text-foreground" : "font-medium text-muted-foreground"}`}>
                      {notification.content}
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">
                      {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="mt-2 w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/40"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
