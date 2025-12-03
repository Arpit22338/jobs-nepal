"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, MessageSquare, ChevronDown, Crown, Settings, HelpCircle, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import { getCurrentUserImage } from "@/app/actions";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  // Cast user to include role to satisfy editor type checking
  const user = session?.user as { name?: string | null; email?: string | null; role?: string; isPremium?: boolean } | undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userImage, setUserImage] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getLinkClass = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);
    return `${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600"} text-base transition-colors`;
  };

  const router = useRouter();

  useEffect(() => {
    if (session && user?.role === "TEACHER" && !user.isPremium) {
      if (pathname !== "/teacher/verification" && pathname !== "/login") {
        router.push("/teacher/verification");
      }
    }
  }, [session, user, pathname, router]);

  useEffect(() => {
    if (session) {
      const fetchUserData = async () => {
        try {
          // Fetch unread messages
          const res = await fetch("/api/messages");
          if (res.ok) {
            const data = await res.json();
            const totalUnread = data.conversations.reduce((acc: number, conv: any) => acc + conv.unreadCount, 0);
            setUnreadCount(totalUnread);
          }
          
          // Fetch user image
          const image = await getCurrentUserImage();
          setUserImage(image || null);
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      };
      fetchUserData();
      const interval = setInterval(fetchUserData, 10000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Rojgaar Logo" width={40} height={40} className="object-contain" />
            <div className="text-2xl font-bold flex items-center">
              <span className="text-blue-600">Rojgaar</span>
              <span className="text-black">Nepal</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
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
                
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 p-1 rounded-full transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${user?.isPremium ? 'border-2 border-yellow-500 bg-yellow-50' : 'border border-blue-200 bg-blue-100'}`}>
                       {userImage ? (
                          <Image src={userImage} alt={user?.name || "User"} width={32} height={32} className="object-cover w-full h-full" />
                       ) : (
                          <span className={`${user?.isPremium ? 'text-yellow-700' : 'text-blue-600'} font-bold text-xs`}>{getInitials(user?.name || "U")}</span>
                       )}
                    </div>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-2 border-b mb-1">
                        <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <User size={16} className="text-gray-400"/> Profile
                      </Link>
                      <Link href="/profile/edit" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <Settings size={16} className="text-gray-400"/> Edit Profile
                      </Link>
                      <Link href="/premium" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <Crown size={16} className="text-yellow-500"/> Buy Premium
                      </Link>
                      <Link href="/support" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <HelpCircle size={16} className="text-gray-400"/> Premium Support
                      </Link>
                      <div className="border-t my-1"></div>
                      <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left">
                        <LogOut size={16}/> Sign Out
                      </button>
                    </div>
                  )}
                </div>
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
          <div className="md:hidden flex items-center gap-2">
            {!session && (
              <div className="flex items-center gap-2 mr-1">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-2 py-1">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
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
                <button 
                  onClick={() => {
                    setIsMobileProfileOpen(!isMobileProfileOpen);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1 focus:outline-none"
                >
                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${user?.isPremium ? 'border-2 border-yellow-500 bg-yellow-50' : 'border border-blue-200 bg-blue-100'}`}>
                       {userImage ? (
                          <Image src={userImage} alt={user?.name || "User"} fill className="object-cover" />
                       ) : (
                          <span className={`${user?.isPremium ? 'text-yellow-700' : 'text-blue-600'} font-bold text-xs`}>{getInitials(user?.name || "U")}</span>
                       )}
                    </div>
                    <ChevronDown size={16} className="text-gray-500" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-800 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} strokeWidth={2.5} /> : <Menu size={28} strokeWidth={2.5} />}
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

            {session && (
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
      {/* Mobile Profile Menu */}
      {isMobileProfileOpen && session && (
        <div className="md:hidden bg-white border-t absolute top-16 left-0 w-full z-50 shadow-lg animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-4 space-y-1">
             <div className="px-3 mb-4 flex items-center gap-3">
                  <div className={`relative w-12 h-12 rounded-full flex items-center justify-center overflow-hidden ${user?.isPremium ? 'border-2 border-yellow-500 bg-yellow-50' : 'border border-blue-200 bg-blue-100'}`}>
                      {userImage ? (
                          <Image src={userImage} alt={user?.name || "User"} fill className="object-cover" />
                       ) : (
                          <span className={`${user?.isPremium ? 'text-yellow-700' : 'text-blue-600'} font-bold text-lg`}>{getInitials(user?.name || "U")}</span>
                       )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMobileProfileOpen(false)}
                >
                  <User size={20} className="mr-3" />
                  Profile
                </Link>
                <Link
                  href="/profile/edit"
                  className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMobileProfileOpen(false)}
                >
                  <Settings size={20} className="mr-3" />
                  Edit Profile
                </Link>
                <Link
                  href="/profile/change-password"
                  className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMobileProfileOpen(false)}
                >
                  <Lock size={20} className="mr-3" />
                  Change Password
                </Link>
                <Link
                  href="/premium"
                  className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMobileProfileOpen(false)}
                >
                  <Crown size={20} className="mr-3 text-yellow-500" />
                  Buy Premium
                </Link>
                <Link
                  href="/support"
                  className="flex items-center px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setIsMobileProfileOpen(false)}
                >
                  <HelpCircle size={20} className="mr-3" />
                  Premium Support
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={20} className="mr-3" />
                  Sign Out
                </button>
          </div>
        </div>
      )}
    </nav>
  );
}
