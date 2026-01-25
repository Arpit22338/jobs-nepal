"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, UserMinus, Loader2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/Toast";

interface BlockedUser {
  id: string;
  name: string | null;
  image: string | null;
}

export default function BlockedUsersPage() {
  const { status } = useSession();
  const router = useRouter();
  const { showToast, showConfirm } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  const fetchBlockedUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users/block");
      if (res.ok) {
        const data = await res.json();
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      showToast("Failed to load blocked users", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchBlockedUsers();
    }
  }, [status, router, fetchBlockedUsers]);

  const handleUnblock = async (userId: string, userName: string | null) => {
    showConfirm({
      title: "Unblock User",
      message: `Are you sure you want to unblock ${userName || "this user"}? They will be able to message you again.`,
      confirmText: "Unblock",
      onConfirm: async () => {
        setUnblocking(userId);
        try {
          const res = await fetch(`/api/users/block?userId=${userId}`, {
            method: "DELETE",
          });

          if (res.ok) {
            setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
            showToast(`${userName || "User"} has been unblocked`, "success");
          } else {
            showToast("Failed to unblock user", "error");
          }
        } catch (error) {
          console.error("Error unblocking user:", error);
          showToast("Failed to unblock user", "error");
        } finally {
          setUnblocking(null);
        }
      },
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <UserMinus className="w-6 h-6 text-red-500" />
              Blocked Users
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage users you&apos;ve blocked
            </p>
          </div>
        </div>

        {/* Blocked Users List */}
        {blockedUsers.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <UserX className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No blocked users
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              When you block someone, they won&apos;t be able to message you and will appear here.
            </p>
            <Link href="/messages">
              <Button className="mt-6">Go to Messages</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-red-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-red-500">
                        {user.name?.[0] || "U"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">
                      {user.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-red-500 font-medium">Blocked</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblock(user.id, user.name)}
                  disabled={unblocking === user.id}
                  className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                >
                  {unblocking === user.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Unblock"
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-border">
          <h4 className="font-semibold text-foreground mb-2">
            About Blocking
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Blocked users cannot send you messages</li>
            <li>• Previous conversations are deleted when you block someone</li>
            <li>• Blocked users won&apos;t be notified that you blocked them</li>
            <li>• You can unblock users at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
