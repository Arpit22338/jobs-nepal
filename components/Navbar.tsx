"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, MessageSquare, ChevronDown, Crown, Settings, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import { getCurrentUserImage } from "@/app/actions";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  // Cast user to include role to satisfy editor type checking
  const user = session?.user as { name?: string | null; email?: string | null; role?: string; isPremium?: boolean } | undefined;
  const [isOpen, setIsOpen] = useState(false);
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
    return `${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-600 font-medium"} text-[13px] transition-colors tracking-wide`;
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
    <>
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 flex-nowrap">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center mr-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/logo.png" alt="Rojgaar Logo" width={32} height={32} className="object-contain group-hover:scale-105 transition-transform" />
              <div className="text-xl font-bold flex items-center tracking-tight whitespace-nowrap">
                <span className="text-blue-600">Rojgaar</span>
                <span className="text-gray-900">Nepal</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Menu */}
          <div className="hidden lg:flex flex-1 justify-start items-center gap-6 ml-10">
            <Link href="/" className={`${getLinkClass("/")} whitespace-nowrap`}>
              Home
            </Link>
            <Link href="/jobs" className={`${getLinkClass("/jobs")} whitespace-nowrap`}>
              Find Jobs
            </Link>
            <Link href="/people" className={`${getLinkClass("/people")} whitespace-nowrap`}>
              Community
            </Link>
            <Link href="/talent" className={`${getLinkClass("/talent")} whitespace-nowrap`}>
              Find Talent
            </Link>
            <Link href="/courses" className={`${getLinkClass("/courses")} whitespace-nowrap`}>
              Skill Courses
            </Link>
            {session && (
              <Link href="/my-certificates" className={`${getLinkClass("/my-certificates")} whitespace-nowrap`}>
                Certificates
              </Link>
            )}
            {user?.role === "JOBSEEKER" && (
              <>
                <Link href="/talent/new" className={`${getLinkClass("/talent/new")} whitespace-nowrap`}>
                  Share My Talent
                </Link>
                <Link href="/my-applications" className={`${getLinkClass("/my-applications")} whitespace-nowrap`}>
                  My Applications
                </Link>
              </>
            )}
            {(user?.role === "EMPLOYER" || user?.role === "ADMIN") && (
              <>
                <Link href="/employer/jobs/new" className={`${getLinkClass("/employer/jobs/new")} whitespace-nowrap`}>
                  Post a Job
                </Link>
                <Link href="/employer/dashboard" className={`${getLinkClass("/employer/dashboard")} whitespace-nowrap`}>
                  Dashboard
                </Link>
              </>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/admin/dashboard" className={`${getLinkClass("/admin/dashboard")} whitespace-nowrap`}>
                Admin
              </Link>
            )}
          </div>

          {/* Right: Icons & Auth */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
            {session ? (
              <>
                <NotificationBell />
                <Link href="/messages" className="text-gray-500 hover:text-blue-600 relative transition-colors p-2 rounded-full hover:bg-gray-50">
                  <MessageSquare size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                
                <div className="relative ml-2">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 p-1.5 rounded-full transition-all border border-transparent hover:border-gray-200"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-sm ${user?.isPremium ? 'ring-2 ring-yellow-400 ring-offset-2' : 'bg-gray-100'}`}>
                       {userImage ? (
                          <Image src={userImage} alt={user?.name || "User"} width={32} height={32} className="object-cover w-full h-full" />
                       ) : (
                          <span className={`${user?.isPremium ? 'text-yellow-700' : 'text-gray-600'} font-bold text-xs`}>{getInitials(user?.name || "U")}</span>
                       )}
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="px-2 space-y-0.5">
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <User size={16} className="text-gray-400"/> Profile
                        </Link>
                        <Link href="/profile/edit" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <Settings size={16} className="text-gray-400"/> Edit Profile
                        </Link>
                        <Link href="/premium" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <Crown size={16} className="text-yellow-500"/> Buy Premium
                        </Link>
                        <Link href="/support" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <HelpCircle size={16} className="text-gray-400"/> Premium Support
                        </Link>
                      </div>
                      <div className="border-t border-gray-50 my-1 pt-1 px-2">
                        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                          <LogOut size={16}/> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            {!session && (
              <Link
                href="/register"
                className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition"
              >
                Register
              </Link>
            )}
            {session && (
              <>
                <NotificationBell />
                <Link href="/messages" className="text-gray-600 hover:text-blue-600 relative">
                  <MessageSquare size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-1 focus:outline-none"
                  >
                    <div className={`relative w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ${user?.isPremium ? 'border-2 border-yellow-500 bg-yellow-50' : 'border border-blue-200 bg-blue-100'}`}>
                       {userImage ? (
                          <Image src={userImage} alt={user?.name || "User"} fill className="object-cover" />
                       ) : (
                          <span className={`${user?.isPremium ? 'text-yellow-700' : 'text-blue-600'} font-bold text-xs`}>{getInitials(user?.name || "U")}</span>
                       )}
                    </div>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="px-2 space-y-0.5">
                        <Link href="/profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <User size={16} className="text-gray-400"/> Profile
                        </Link>
                        <Link href="/profile/edit" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <Settings size={16} className="text-gray-400"/> Edit Profile
                        </Link>
                        <Link href="/premium" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <Crown size={16} className="text-yellow-500"/> Buy Premium
                        </Link>
                        <Link href="/support" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                          <HelpCircle size={16} className="text-gray-400"/> Premium Support
                        </Link>
                      </div>
                      <div className="border-t border-gray-50 my-1 pt-1 px-2">
                        <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                          <LogOut size={16}/> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-full transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div 
            className="absolute inset-y-0 right-0 w-[280px] bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold text-lg text-gray-900">Menu</span>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              <Link href="/" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                Home
              </Link>
              <Link href="/jobs" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                Find Jobs
              </Link>
              <Link href="/people" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                Community
              </Link>
              <Link href="/talent" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                Find Talent
              </Link>
              <Link href="/courses" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                Skill Courses
              </Link>

              {user?.role === "JOBSEEKER" && (
                <>
                  <div className="my-2 border-t border-gray-100"></div>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Seeker</p>
                  <Link href="/talent/new" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                    Share My Talent
                  </Link>
                  <Link href="/my-applications" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                    My Applications
                  </Link>
                </>
              )}

              {(user?.role === "EMPLOYER" || user?.role === "ADMIN") && (
                <>
                  <div className="my-2 border-t border-gray-100"></div>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Employer</p>
                  <Link href="/employer/jobs/new" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                    Post a Job
                  </Link>
                  <Link href="/employer/dashboard" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Link>
                </>
              )}

              {user?.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setIsOpen(false)}>
                  Admin Panel
                </Link>
              )}
            </div>

            {!session && (
              <div className="p-4 border-t space-y-3">
                <Link href="/login" className="block w-full text-center px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link href="/register" className="block w-full text-center px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
