"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function OnlineStatusTracker() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const updateOnlineStatus = async () => {
      try {
        await fetch("/api/users/online", { method: "POST" });
      } catch (error) {
        console.error("Failed to update online status", error);
      }
    };

    // Update immediately
    updateOnlineStatus();

    // Update every 2 minutes
    const interval = setInterval(updateOnlineStatus, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OnlineStatusTracker />
      {children}
    </SessionProvider>
  );
}

