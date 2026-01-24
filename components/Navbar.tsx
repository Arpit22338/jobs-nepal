"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, MessageSquare, ChevronDown, Settings, HelpCircle, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import { getCurrentUserImage } from "@/app/actions";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

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
    return `${isActive ? "text-primary font-bold" : "text-secondary/70 hover:text-secondary font-medium"} text-sm transition-all duration-200 tracking-wide`;
  };

  const router = useRouter();
  const [teacherKycApproved, setTeacherKycApproved] = useState<boolean | null>(null);

  // Helper to close menus
  const closeMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check teacher KYC status with polling
  useEffect(() => {
    if (session && user?.role === "TEACHER") {
      const checkKycStatus = () => {
        fetch("/api/teacher/kyc")
          .then(res => res.json())
          .then(data => {
            if (data.record && data.record.status === "APPROVED") {
              setTeacherKycApproved(true);
            } else {
              setTeacherKycApproved(false);
            }
          })
          .catch(() => setTeacherKycApproved(false));
      };

      checkKycStatus();
      const interval = setInterval(checkKycStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [session, user]);

  useEffect(() => {
    if (session && user?.role === "TEACHER") {
      if (teacherKycApproved === false) {
        const allowedPaths = ["/teacher/verification", "/teacher/kyc", "/login"];
        if (!allowedPaths.some(path => pathname.startsWith(path))) {
          router.push("/teacher/verification");
        }
      }
    }
  }, [session, user, pathname, router, teacherKycApproved]);

  useEffect(() => {
    if (session) {
      const fetchUserData = async () => {
        try {
          const res = await fetch("/api/messages");
          if (res.ok) {
            const data = await res.json();
            const totalUnread = data.conversations.reduce((acc: number, conv: any) => acc + conv.unreadCount, 0);
            setUnreadCount(totalUnread);
          }
          const image = await getCurrentUserImage();
          setUserImage(image || null);
        } catch (error) {
          console.error("Failed to fetch user data", error);
        }
      };

      fetchUserData();
      // Poll less frequently
      const interval = setInterval(fetchUserData, 20000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
          ? "bg-card/70 backdrop-blur-xl border-border/40 py-2 shadow-sm supports-[backdrop-filter]:bg-card/60"
          : "bg-transparent border-transparent py-4"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left: Logo */}
            <div className="flex-shrink-0 flex items-center mr-8">
              <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95 duration-200">
                <Image src="/logo.png" alt="Rojgaar Logo" width={36} height={36} className="object-contain" />
                <div className="text-2xl font-black tracking-tighter whitespace-nowrap hidden sm:block">
                  <span className="text-primary">Rojgaar</span>
                  <span className="text-foreground">Nepal</span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
              <Link href="/" className={`${getLinkClass("/")}`}>Home</Link>

              {user?.role === "TEACHER" ? (
                <>
                  <Link href="/teacher/course" className={`${getLinkClass("/teacher/course")}`}>Add Course</Link>
                  <Link href="/teacher/dashboard" className={`${getLinkClass("/teacher/dashboard")}`}>Teacher Dashboard</Link>
                </>
              ) : (
                <>
                  <Link href="/jobs" className={`${getLinkClass("/jobs")}`}>Find Jobs</Link>
                  <Link href="/people" className={`${getLinkClass("/people")}`}>Community</Link>
                  <Link href="/talent" className={`${getLinkClass("/talent")}`}>Find Talent</Link>
                </>
              )}

              <Link href="/courses" className={`${getLinkClass("/courses")}`}>Skill Courses</Link>

              {(user?.role === "EMPLOYER" || user?.role === "ADMIN") && (
                <div className="flex items-center gap-6 border-l border-border/50 pl-6 ml-2">
                  {user?.role === "EMPLOYER" && (
                    <Link href="/employer/jobs/new" className={`${getLinkClass("/employer/jobs/new")}`}>Post Job</Link>
                  )}
                  <Link href={user?.role === "ADMIN" ? "/admin/dashboard" : "/employer/dashboard"} className={`${getLinkClass(user?.role === "ADMIN" ? "/admin/dashboard" : "/employer/dashboard")}`}>
                    Dashboard
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Icons & Auth */}
            <div className="hidden lg:flex items-center gap-2">
              <ThemeToggle />
              {session ? (
                <>
                  <NotificationBell />
                  <Link href="/messages" className="text-muted-foreground hover:text-primary relative transition-colors p-2 rounded-full hover:bg-accent/50 group">
                    <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-background">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative ml-2">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-2 focus:outline-none hover:bg-accent/50 p-1.5 rounded-full transition-all duration-200 border border-transparent hover:border-border/50"
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden shadow-sm ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                        {userImage ? (
                          <Image src={userImage} alt={user?.name || "User"} width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-xs">{getInitials(user?.name || "U")}</span>
                          </div>
                        )}
                      </div>
                      <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-3 w-64 glass rounded-2xl shadow-2xl border border-white/20 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right backdrop-blur-xl">
                        <div className="px-4 py-4 border-b border-border/40 mb-1 bg-accent/20">
                          <p className="font-bold text-foreground truncate text-sm">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {user?.role}
                          </span>
                        </div>
                        <div className="px-2 space-y-0.5 mt-2">
                          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                            <User size={16} className="text-muted-foreground" /> Profile
                          </Link>
                          {user?.role === "JOBSEEKER" && (
                            <Link href="/my-applications" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                              <LayoutDashboard size={16} className="text-muted-foreground" /> My Applications
                            </Link>
                          )}
                          <Link href="/profile/edit" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                            <Settings size={16} className="text-muted-foreground" /> Settings
                          </Link>
                          <Link href="/support" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                            <HelpCircle size={16} className="text-muted-foreground" /> Support
                          </Link>
                        </div>
                        <div className="border-t border-border/40 my-1 pt-1 px-2">
                          <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors text-left">
                            <LogOut size={16} /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-1">
                  <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-primary px-4 py-2.5 rounded-full hover:bg-accent transition-colors">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              {!session && (
                <Link
                  href="/login"
                  className="text-sm font-medium bg-primary/10 text-primary px-4 py-2 rounded-full transition"
                >
                  Login
                </Link>
              )}
              {session && (
                <>
                  <NotificationBell />
                  <Link href="/messages" className="text-muted-foreground hover:text-primary relative p-1">
                    <MessageSquare size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-background">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-foreground/80 hover:text-primary hover:bg-accent rounded-full transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeMenus} />
          <div
            className="absolute inset-y-0 right-0 w-[280px] bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-accent/20">
              <span className="font-bold text-lg text-foreground">Menu</span>
              <button onClick={closeMenus} className="p-2 text-muted-foreground hover:bg-accent rounded-full text-foreground/80">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <Link href="/" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                Home
              </Link>

              {user?.role === "TEACHER" ? (
                <>
                  <Link href="/teacher/course" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Add Course
                  </Link>
                  <Link href="/teacher/dashboard" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Teacher Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/jobs" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Find Jobs
                  </Link>
                  <Link href="/people" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Community
                  </Link>
                  <Link href="/talent" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Find Talent
                  </Link>
                </>
              )}

              <Link href="/courses" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                Skill Courses
              </Link>

              {session && (
                <Link href="/my-certificates" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                  Certificates
                </Link>
              )}

              {user?.role === "JOBSEEKER" && (
                <>
                  <div className="my-2 border-t border-border/50 mx-4"></div>
                  <p className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Seeker</p>
                  <Link href="/talent/new" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Share My Talent
                  </Link>
                  <Link href="/my-applications" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    My Applications
                  </Link>
                </>
              )}

              {user?.role === "TEACHER" && (
                <>
                  <div className="my-2 border-t border-border/50 mx-4"></div>
                  <p className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Teacher</p>
                  <Link href="/teacher/dashboard" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Teacher Dashboard
                  </Link>
                </>
              )}

              {(user?.role === "EMPLOYER" || user?.role === "ADMIN") && (
                <>
                  <div className="my-2 border-t border-border/50 mx-4"></div>
                  <p className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Employer</p>
                  <Link href="/employer/jobs/new" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Post a Job
                  </Link>
                  <Link href="/employer/dashboard" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Dashboard
                  </Link>
                </>
              )}

              {user?.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                  Admin Panel
                </Link>
              )}
            </div>

            {session && (
              <div className="p-4 border-t border-border/50 space-y-2 bg-accent/10">
                <Link href="/profile/edit" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                  <Settings size={18} className="text-muted-foreground" /> Settings
                </Link>
                <button onClick={() => { signOut(); closeMenus(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-destructive hover:bg-destructive/10 transition-colors text-left">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            )}

            {!session && (
              <div className="p-4 border-t border-border/50 space-y-3">
                <Link href="/login" className="block w-full text-center px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold hover:bg-accent" onClick={closeMenus}>
                  Login
                </Link>
                <Link href="/register" className="block w-full text-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm" onClick={closeMenus}>
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
