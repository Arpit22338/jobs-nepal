"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationBell from "./NotificationBell";
import { ThemeToggle } from "./ui/theme-toggle";
import { getCurrentUserImage } from "@/app/actions";

// AI Tools menu items with boxicons
const aiToolsItems = [
  { name: "RojgaarAI Chat", href: "/messages/rojgaar-ai", icon: "bx-bot", description: "Your AI career assistant" },
  { name: "Resume Builder", href: "/ai-tools/resume-builder", icon: "bx-file", description: "Create ATS-optimized resumes" },
  { name: "Interview Prep", href: "/ai-tools/interview-prep", icon: "bx-microphone", description: "Practice with AI feedback" },
  { name: "Skills Gap", href: "/ai-tools/skills-gap", icon: "bx-trending-up", description: "Plan your career growth" },
  { name: "Job Matcher", href: "/ai-tools/job-matcher", icon: "bx-target-lock", description: "Find matching jobs" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAIToolsOpen, setIsAIToolsOpen] = useState(false);
  const [isAIToolsMobileOpen, setIsAIToolsMobileOpen] = useState(false);
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
    return `flex items-center gap-1.5 ${isActive ? "text-primary font-semibold" : "text-foreground/70 hover:text-primary"} text-[13px] transition-colors`;
  };

  const router = useRouter();
  const [teacherKycApproved, setTeacherKycApproved] = useState<boolean | null>(null);

  // Helper to close menus
  const closeMenus = () => {
    setIsOpen(false);
    setIsProfileOpen(false);
    setIsAIToolsOpen(false);
    setIsAIToolsMobileOpen(false);
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
        className={`fixed top-0 w-full z-50 transition-all duration-200 border-b ${scrolled
          ? "bg-background/90 backdrop-blur-lg border-border/30 shadow-sm"
          : "bg-background/70 backdrop-blur-md border-transparent"
          }`}
        style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Left: Logo */}
            <div className="shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-1.5 group transition-transform hover:scale-[1.02] active:scale-[0.98] duration-150">
                <div className="relative w-8 h-8">
                  <Image src="/logo.png" alt="Rojgaar Logo" fill className="object-contain" />
                </div>
                <div className="text-lg font-bold tracking-tight">
                  <span className="text-primary">Rojgaar</span>
                  <span className="text-foreground">Nepal</span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1">
              <Link href="/" className={`${getLinkClass("/")} px-3 py-1.5 rounded-lg hover:bg-accent/50`}>
                <i className="bx bx-home-alt text-base"></i>
                Home
              </Link>
              <Link href="/jobs" className={`${getLinkClass("/jobs")} px-3 py-1.5 rounded-lg hover:bg-accent/50`}>
                <i className="bx bx-briefcase text-base"></i>
                Jobs
              </Link>
              <Link href="/people" className={`${getLinkClass("/people")} px-3 py-1.5 rounded-lg hover:bg-accent/50`}>
                <i className="bx bx-group text-base"></i>
                Community
              </Link>
              <Link href="/courses" className={`${getLinkClass("/courses")} px-3 py-1.5 rounded-lg hover:bg-accent/50`}>
                <i className="bx bx-book-open text-base"></i>
                Courses
              </Link>
              <Link href="/talent" className={`${getLinkClass("/talent")} px-3 py-1.5 rounded-lg hover:bg-accent/50`}>
                <i className="bx bx-search-alt text-base"></i>
                Find Talent
              </Link>

              {/* AI Tools Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setIsAIToolsOpen(true)}
                onMouseLeave={() => setIsAIToolsOpen(false)}
              >
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors hover:bg-accent/50 ${pathname.startsWith('/ai-tools') || pathname === '/messages/rojgaar-ai'
                    ? "text-primary font-semibold"
                    : "text-foreground/70 hover:text-primary"
                    }`}
                >
                  <i className="bx bx-bot text-base text-primary"></i>
                  AI Tools
                  <ChevronDown size={12} className={`transition-transform duration-150 ${isAIToolsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAIToolsOpen && (
                  <div className="absolute top-full left-0 pt-1 z-50">
                    <div className="bg-card/95 backdrop-blur-lg border border-border/40 rounded-xl py-1.5 min-w-[220px] shadow-xl animate-in fade-in zoom-in-95 duration-150">
                      {aiToolsItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenus}
                          className="flex items-center gap-2.5 px-3 py-2 hover:bg-accent transition-colors group mx-1.5 rounded-lg"
                        >
                          <i className={`bx ${item.icon} text-lg text-primary`}></i>
                          <div>
                            <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide hover:bg-red-500 hover:text-white transition-all ml-1"
                >
                  Admin
                </Link>
              )}

              {user?.role === "EMPLOYER" && (
                <Link
                  href="/employer/dashboard"
                  className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide hover:bg-primary hover:text-primary-foreground transition-all ml-1"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* Right: Icons & Auth */}
            <div className="hidden lg:flex items-center gap-1">
              <ThemeToggle />
              {session ? (
                <>
                  <NotificationBell />
                  <Link href="/messages" className="text-muted-foreground hover:text-primary relative transition-colors p-2 rounded-lg hover:bg-accent/50">
                    <i className="bx bx-message-dots text-xl"></i>
                    {unreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <div className="relative ml-1">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-1.5 focus:outline-none hover:bg-accent/50 p-1 rounded-lg transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden ring-2 ring-primary/20">
                        {userImage ? (
                          <Image src={userImage} alt={user?.name || "User"} width={28} height={28} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold text-[10px]">{getInitials(user?.name || "U")}</span>
                          </div>
                        )}
                      </div>
                      <ChevronDown size={12} className={`text-muted-foreground transition-transform duration-150 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-card/95 backdrop-blur-lg border border-border/40 rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right shadow-xl">
                        <div className="px-3 py-3 border-b border-border/30 mb-1">
                          <p className="font-semibold text-foreground truncate text-[13px]">{user?.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                          <span className="inline-flex mt-1.5 items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                            {user?.role}
                          </span>
                        </div>
                        <div className="px-1.5 space-y-0.5">
                          <Link href="/messages/rojgaar-ai" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-colors mx-1 mb-1" onClick={closeMenus}>
                            <i className="bx bx-bot text-lg"></i> Chat with RojgaarAI
                          </Link>
                          <Link href="/profile" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-foreground/80 hover:bg-accent hover:text-primary rounded-lg transition-colors mx-1" onClick={closeMenus}>
                            <i className="bx bx-user text-base text-muted-foreground"></i> Profile
                          </Link>
                          <Link href="/my-applications" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-foreground/80 hover:bg-accent hover:text-primary rounded-lg transition-colors mx-1" onClick={closeMenus}>
                            <i className="bx bx-file text-base text-muted-foreground"></i> My Applications
                          </Link>
                          <Link href="/saved-jobs" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-foreground/80 hover:bg-accent hover:text-primary rounded-lg transition-colors mx-1" onClick={closeMenus}>
                            <i className="bx bx-bookmark text-base text-muted-foreground"></i> Saved Jobs
                          </Link>
                          <Link href="/profile/edit" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-foreground/80 hover:bg-accent hover:text-primary rounded-lg transition-colors mx-1" onClick={closeMenus}>
                            <i className="bx bx-cog text-base text-muted-foreground"></i> Settings
                          </Link>
                          {user?.role === "EMPLOYER" && (
                            <Link href="/employer/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-foreground/80 hover:bg-accent hover:text-primary rounded-lg transition-colors mx-1" onClick={closeMenus}>
                              <i className="bx bx-grid-alt text-base text-muted-foreground"></i> Dashboard
                            </Link>
                          )}
                          {user?.role === "ADMIN" && (
                            <>
                              <Link href="/employer/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-foreground/80 hover:bg-accent hover:text-primary rounded-lg transition-colors mx-1" onClick={closeMenus}>
                                <i className="bx bx-briefcase text-base text-muted-foreground"></i> Manage Posts
                              </Link>
                              <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mx-1" onClick={closeMenus}>
                                <i className="bx bx-shield text-base text-red-500"></i> Admin Panel
                              </Link>
                            </>
                          )}
                          <Link href="/support" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-foreground/80 hover:bg-accent hover:text-primary rounded-lg transition-colors mx-1" onClick={closeMenus}>
                            <i className="bx bx-help-circle text-base text-muted-foreground"></i> Support
                          </Link>
                          <Link href="/profile/blocked" className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mx-1" onClick={closeMenus}>
                            <i className="bx bx-user-minus text-base text-red-500"></i> Blocked Users
                          </Link>
                        </div>
                        <div className="border-t border-border/30 mt-1 pt-1 px-1.5">
                          <button onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-2.5 py-2 text-[13px] text-destructive hover:bg-destructive/10 rounded-lg transition-colors mx-1 text-left">
                            <i className="bx bx-log-out text-base"></i> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <Link href="/login" className="text-[13px] font-medium text-foreground/70 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-accent/50 transition-colors">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-[13px] font-medium bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-1.5">
              <ThemeToggle />
              {!session && (
                <Link
                  href="/login"
                  className="text-[13px] font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-lg transition"
                >
                  Login
                </Link>
              )}
              {session && (
                <>
                  <NotificationBell />
                  <Link href="/messages" className="text-muted-foreground hover:text-primary relative p-1.5">
                    <i className="bx bx-message-dots text-xl"></i>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-foreground/80 hover:text-primary hover:bg-accent/50 rounded-lg transition-colors focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-100 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeMenus} />
          <div
            className="absolute inset-y-0 right-0 w-[260px] bg-background/95 backdrop-blur-lg shadow-xl flex flex-col h-full animate-in slide-in-from-right duration-200 border-l border-border/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-border/40 flex items-center justify-between">
              <span className="font-semibold text-foreground">Menu</span>
              <button onClick={closeMenus} className="p-1.5 text-foreground/80 hover:bg-accent rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                <i className="bx bx-home-alt text-lg"></i> Home
              </Link>

              {user?.role === "TEACHER" ? (
                <>
                  <Link href="/teacher/course" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-plus-circle text-lg"></i> Add Course
                  </Link>
                  <Link href="/teacher/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-grid-alt text-lg"></i> Teacher Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/jobs" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-briefcase text-lg"></i> Find Jobs
                  </Link>
                  <Link href="/people" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-group text-lg"></i> Community
                  </Link>
                  <Link href="/talent" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-search-alt text-lg"></i> Find Talent
                  </Link>
                </>
              )}

              <Link href="/courses" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                <i className="bx bx-book-open text-lg"></i> Courses
              </Link>

              {/* AI Tools Section in Mobile */}
              <div className="my-2 border-t border-border/40 mx-2"></div>
              <button
                onClick={() => setIsAIToolsMobileOpen(!isAIToolsMobileOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[14px] font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <i className="bx bx-bot text-lg"></i>
                  AI Tools
                </span>
                <ChevronDown size={14} className={`transition-transform duration-150 ${isAIToolsMobileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAIToolsMobileOpen && (
                <div className="space-y-0.5 pl-3">
                  {aiToolsItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenus}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors"
                    >
                      <i className={`bx ${item.icon} text-base text-primary`}></i>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}

              {session && (
                <>
                  <Link href="/my-certificates" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-medal text-lg"></i> Certificates
                  </Link>
                  <div className="my-2 border-t border-border/40 mx-2"></div>
                  <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Quick Access</p>
                  <Link href="/my-applications" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-file text-lg"></i> My Applications
                  </Link>
                  <Link href="/saved-jobs" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-bookmark text-lg"></i> Saved Jobs
                  </Link>
                </>
              )}

              {user?.role === "JOBSEEKER" && (
                <>
                  <div className="my-2 border-t border-border/40 mx-2"></div>
                  <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Job Seeker</p>
                  <Link href="/talent/new" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-user-plus text-lg"></i> Share My Talent
                  </Link>
                </>
              )}

              {user?.role === "TEACHER" && (
                <>
                  <div className="my-2 border-t border-border/40 mx-2"></div>
                  <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Teacher</p>
                  <Link href="/teacher/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-grid-alt text-lg"></i> Dashboard
                  </Link>
                </>
              )}

              {(user?.role === "EMPLOYER" || user?.role === "ADMIN") && (
                <>
                  <div className="my-2 border-t border-border/40 mx-2"></div>
                  <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Employer</p>
                  <Link href="/employer/jobs/new" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-plus-circle text-lg"></i> Post a Job
                  </Link>
                  <Link href="/employer/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-grid-alt text-lg"></i> Dashboard
                  </Link>
                </>
              )}

              {user?.role === "ADMIN" && (
                <>
                  <div className="my-2 border-t border-border/40 mx-2"></div>
                  <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Admin</p>
                  <Link href="/employer/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-briefcase text-lg"></i> Manage Posts
                  </Link>
                  <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[14px] font-medium text-red-500 hover:bg-red-500/10 transition-colors" onClick={closeMenus}>
                    <i className="bx bx-shield text-lg"></i> Admin Panel
                  </Link>
                </>
              )}
            </div>

            {session && (
              <div className="p-3 border-t border-border/40 space-y-1">
                <Link href="/profile/blocked" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-red-500 hover:bg-red-500/10 transition-colors" onClick={closeMenus}>
                  <i className="bx bx-user-minus text-base"></i> Blocked Users
                </Link>
                <Link href="/profile/edit" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                  <i className="bx bx-cog text-base"></i> Settings
                </Link>
                <button onClick={() => { signOut(); closeMenus(); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-destructive hover:bg-destructive/10 transition-colors text-left">
                  <i className="bx bx-log-out text-base"></i> Sign Out
                </button>
              </div>
            )}

            {!session && (
              <div className="p-3 border-t border-border/40 space-y-2">
                <Link href="/login" className="block w-full text-center px-3 py-2 rounded-lg border border-border text-foreground text-[14px] font-medium hover:bg-accent" onClick={closeMenus}>
                  Login
                </Link>
                <Link href="/register" className="block w-full text-center px-3 py-2 rounded-lg bg-primary text-primary-foreground text-[14px] font-medium hover:bg-primary/90" onClick={closeMenus}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Tools Button for Mobile */}
      <FloatingAIButton />

      {/* Desktop Bottom Navigation Bar */}
      <DesktopBottomNav />
    </>
  );
}

// Desktop Bottom Navigation Component
function DesktopBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [showPostMenu, setShowPostMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hide on certain pages
  const hiddenPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null;

  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

  const navItems = [
    { href: "/jobs", icon: "bx-briefcase", label: "Jobs" },
    { href: "/my-certificates", icon: "bx-award", label: "Certs" },
    { href: "/saved-jobs", icon: "bx-bookmark", label: "Saved" },
    { href: "/my-applications", icon: "bx-file", label: "Applications" },
    { href: "/messages", icon: "bx-message-rounded-dots", label: "Chat" },
    { href: "/messages/rojgaar-ai", icon: "bx-bot", label: "RojgaarAI", highlight: true },
  ];

  useEffect(() => {
    if (!showPostMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      // Ignore click if it's on the toggle button
      if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
        return;
      }
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setShowPostMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPostMenu]);

  const handlePlusClick = () => {
    if (!session) {
      router.push("/login");
      return;
    }
    setShowPostMenu((prev) => !prev);
  };

  const handlePostOption = (path: string) => {
    setShowPostMenu(false);
    router.push(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 hidden lg:block">
      <div className="max-w-3xl mx-auto px-4 pb-4">
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl px-4 py-3 relative">
          {/* Post Menu Popup */}
          {showPostMenu && (
            <div
              ref={menuRef}
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-[340px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Create New</h3>
                <button
                  onClick={() => setShowPostMenu(false)}
                  className="p-2 rounded-full hover:bg-accent transition-colors"
                >
                  <i className="bx bx-x text-lg"></i>
                </button>
              </div>
              <div className="p-2">
                {(session?.user?.role === "EMPLOYER" || session?.user?.role === "ADMIN") && (
                  <button
                    onClick={() => handlePostOption("/employer/jobs/new")}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-accent transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <i className="bx bx-briefcase text-2xl text-primary"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Post a Job</p>
                      <p className="text-sm text-muted-foreground">Hire talented candidates</p>
                    </div>
                  </button>
                )}
                {(session?.user?.role === "ADMIN" || session?.user?.role === "USER" || session?.user?.role === "JOB_SEEKER" || session?.user?.role === "JOBSEEKER" || !session?.user?.role) && (
                  <button
                    onClick={() => handlePostOption("/talent/new")}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-accent transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <i className="bx bx-user-voice text-2xl text-cyan-500"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Post My Talent</p>
                      <p className="text-sm text-muted-foreground">Showcase your skills to employers</p>
                    </div>
                  </button>
                )}
                <Link
                  href="/messages/rojgaar-ai"
                  onClick={() => setShowPostMenu(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-linear-to-r from-primary/5 to-primary/10 border border-primary/20 hover:from-primary/10 hover:to-primary/20 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30">
                    <i className="bx bx-bot text-2xl text-white"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      RojgaarAI <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded">AI</span>
                    </p>
                    <p className="text-sm text-muted-foreground">Your AI career assistant</p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <div className="flex items-center justify-center gap-1">
            {navItems.slice(0, 3).map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={session ? item.href : "/login"}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${active ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                >
                  <i className={`bx ${item.icon} text-lg`}></i>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Center Plus Button - Inline like mobile */}
            <button
              ref={buttonRef}
              onClick={handlePlusClick}
              className={`mx-2 w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 ${showPostMenu ? 'rotate-45' : ''}`}
              aria-label="Create"
            >
              <i className="bx bx-plus text-2xl"></i>
            </button>

            {navItems.slice(3).map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={session ? item.href : "/login"}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${item.highlight
                    ? active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                    : active
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                >
                  <i className={`bx ${item.icon} text-lg`}></i>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating AI Tools Button Component
function FloatingAIButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the floating menu
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isExpanded]);

  // Hide on AI tools pages and post forms
  if (
    pathname.startsWith('/ai-tools') ||
    pathname.startsWith('/talent/new') ||
    pathname.startsWith('/employer/jobs/new')
  ) return null;

  const isMessages = pathname.startsWith("/messages");

  return (
    // Offset upward so it stays above the mobile bottom nav/footer
    <div
      ref={containerRef}
      className={`fixed right-6 z-50 lg:hidden ${isMessages ? "bottom-28" : "bottom-20"}`}
    >
      {/* Expanded Menu */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 mb-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl py-2 px-2 min-w-[220px] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="px-3 py-2 border-b border-border/40 mb-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={12} /> AI Tools
            </p>
          </div>
          {aiToolsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <i className={`bx ${item.icon} text-base text-primary`}></i>
              </div>
              <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative w-14 h-14 bg-linear-to-br from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="AI Tools"
      >
        <Sparkles size={24} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'animate-pulse'}`} />
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full bg-primary/50 animate-ping opacity-30" />
      </button>
    </div>
  );
}
