"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  // Cast user to include role to satisfy editor type checking
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const getLinkClass = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return `${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"} text-lg transition-colors`;
  };

  useEffect(() => {
    if (session) {
      const fetchUnreadCount = async () => {
        try {
          const res = await fetch("/api/messages");
          if (res.ok) {
            const data = await res.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const totalUnread = data.conversations.reduce((acc: number, conv: any) => acc + conv.unreadCount, 0);
            setUnreadCount(totalUnread);
          }
        } catch (error) {
          console.error("Failed to fetch unread count", error);
        }
      };
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="JobNepal Logo" width={40} height={40} className="object-contain" />
            <div className="text-2xl font-bold flex items-center">
              <span className="text-blue-600">Job</span>
              <span className="text-black">Nepal</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={getLinkClass("/")}>
              Home
            </Link>
            <Link href="/jobs" className={getLinkClass("/jobs")}>
              Find Jobs
            </Link>
            <Link href="/people" className={getLinkClass("/people")}>
              Community
            </Link>
            <Link href="/talent" className={getLinkClass("/talent")}>
              Find Talent
            </Link>
            <Link href="/courses" className={getLinkClass("/courses")}>
              Skill Courses
            </Link>
            {user?.role === "JOBSEEKER" && (
              <>
                <Link href="/talent/new" className={getLinkClass("/talent/new")}>
                  Share My Talent
                </Link>
                <Link href="/my-applications" className={getLinkClass("/my-applications")}>
                  My Applications
                </Link>
              </>
            )}
            {(user?.role === "EMPLOYER" || user?.role === "ADMIN") && (
              <>
                <Link href="/employer/jobs/new" className={getLinkClass("/employer/jobs/new")}>
                  Post a Job
                </Link>
                <Link href="/employer/dashboard" className={getLinkClass("/employer/dashboard")}>
                  Dashboard
                </Link>
              </>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/admin/dashboard" className={getLinkClass("/admin/dashboard")}>
                Admin
              </Link>
            )}
            
            {session ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <Link href="/messages" className="text-gray-600 hover:text-blue-600 relative">
                  <MessageSquare size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                  <User size={20} />
                  <span>{user?.name || "Profile"}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {session && (
              <>
                <NotificationBell />
                <Link href="/messages" className="text-gray-600 hover:text-blue-600 relative">
                  <MessageSquare size={24} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/jobs"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Find Jobs
            </Link>
            <Link
              href="/people"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Community
            </Link>
            <Link
              href="/talent"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Find Talent
            </Link>
            <Link
              href="/courses"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              onClick={() => setIsOpen(false)}
            >
              Skill Courses
            </Link>
            
            {user?.role === "JOBSEEKER" && (
              <>
                <Link
                  href="/talent/new"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Share My Talent
                </Link>
                <Link
                  href="/my-applications"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  My Applications
                </Link>
              </>
            )}

            {(user?.role === "EMPLOYER" || user?.role === "ADMIN") && (
              <>
                <Link
                  href="/employer/jobs/new"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Post a Job
                </Link>
                <Link
                  href="/employer/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              </>
            )}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Admin
              </Link>
            )}

            {session ? (
              <>
                {/* Messages link removed from hamburger as it is now in the top bar */}
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={20} className="mr-2" />
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
