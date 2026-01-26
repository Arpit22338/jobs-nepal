"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User, LogOut, MessageSquare, ChevronDown, Settings, HelpCircle, LayoutDashboard, UserMinus, Sparkles, FileText, MessageCircle, Target, TrendingUp } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import NotificationBell from "./NotificationBell";
import { ThemeToggle } from "./ui/theme-toggle";
import { getCurrentUserImage } from "@/app/actions";

// AI Tools menu items
const aiToolsItems = [
  { name: "RojgaarAI Chat", href: "/messages/rojgaar-ai", icon: MessageCircle, description: "Your AI career assistant" },
  { name: "Resume Builder", href: "/ai-tools/resume-builder", icon: FileText, description: "Create ATS-optimized resumes" },
  { name: "Interview Prep", href: "/ai-tools/interview-prep", icon: MessageCircle, description: "Practice with AI feedback" },
  { name: "Skills Gap Analysis", href: "/ai-tools/skills-gap", icon: TrendingUp, description: "Plan your career growth" },
  { name: "Job Matcher", href: "/ai-tools/job-matcher", icon: Target, description: "Find jobs matching your skills" },
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
    return `${isActive ? "text-primary font-bold" : "text-foreground/80 hover:text-primary font-medium"} text-sm transition-all duration-200 tracking-wide`;
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
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
          ? "bg-background/80 backdrop-blur-xl border-border/40 py-2 shadow-lg"
          : "bg-background/50 backdrop-blur-md border-transparent py-4"
          }`}
        style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left: Logo */}
            <div className="shrink-0 flex items-center mr-8">
              <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105 active:scale-95 duration-200">
                <div className="hidden md:block relative w-10 h-10 md:w-14 md:h-14">
                  <Image src="/logo.png" alt="Rojgaar Logo" fill className="object-contain" />
                </div>
                <div className="text-xl md:text-2xl font-black tracking-tighter whitespace-nowrap">
                  <span className="text-primary">Rojgaar</span>
                  <span className="text-foreground">Nepal</span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Menu */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/" className={getLinkClass("/")}>Home</Link>
              <Link href="/jobs" className={getLinkClass("/jobs")}>Jobs</Link>
              <Link href="/people" className={getLinkClass("/people")}>Community</Link>
              <Link href="/courses" className={getLinkClass("/courses")}>Courses</Link>
              <Link href="/talent" className={getLinkClass("/talent")}>Find Talent</Link>

              {/* AI Tools Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsAIToolsOpen(true)}
                onMouseLeave={() => setIsAIToolsOpen(false)}
              >
                <button
                  className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 tracking-wide ${
                    pathname.startsWith('/ai-tools') 
                      ? "text-primary font-bold" 
                      : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  <Sparkles size={16} className="text-primary" />
                  AI Tools
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isAIToolsOpen ? 'rotate-180' : ''}`} />
                </button>

                {isAIToolsOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                    <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl py-2 px-2 min-w-[280px] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-3 py-2 border-b border-border/40 mb-2">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                          <Sparkles size={12} /> AI-Powered Tools
                        </p>
                      </div>
                      {aiToolsItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenus}
                          className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-accent transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <item.icon size={18} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
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
                  className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  Admin Panel
                </Link>
              )}

              {user?.role === "EMPLOYER" && (
                <Link
                  href="/employer/dashboard"
                  className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                >
                  Dashboard
                </Link>
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
                      <div className="absolute right-0 mt-3 w-64 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right shadow-2xl" style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}>
                        <div className="px-4 py-4 border-b border-border/40 mb-1 bg-accent/20">
                          <p className="font-bold text-foreground truncate text-sm">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {user?.role}
                          </span>
                        </div>
                        <div className="px-2 space-y-0.5 mt-2">
                          {/* RojgaarAI Quick Access */}
                          <Link href="/messages/rojgaar-ai" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium bg-primary/5 border border-primary/20 hover:bg-primary/10 text-primary rounded-xl transition-colors mb-2" onClick={closeMenus}>
                            <i className="bx bx-bot text-lg"></i> Chat with RojgaarAI
                          </Link>
                          <Link href="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                            <User size={16} className="text-muted-foreground" /> Profile
                          </Link>
                          <Link href="/my-applications" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                            <LayoutDashboard size={16} className="text-muted-foreground" /> My Applications
                          </Link>
                          <Link href="/saved-jobs" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                            <i className="bx bx-bookmark text-lg text-muted-foreground"></i> Saved Jobs
                          </Link>
                          <Link href="/profile/edit" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                            <Settings size={16} className="text-muted-foreground" /> Settings
                          </Link>
                          {user?.role === "EMPLOYER" && (
                            <Link href="/employer/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                              <LayoutDashboard size={16} className="text-muted-foreground" /> Dashboard
                            </Link>
                          )}
                          {user?.role === "ADMIN" && (
                            <>
                              <Link href="/employer/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                                <i className="bx bx-briefcase text-lg text-muted-foreground"></i> Manage Posts
                              </Link>
                              <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded-xl transition-colors" onClick={closeMenus}>
                                <LayoutDashboard size={16} className="text-red-500" /> Admin Panel
                              </Link>
                            </>
                          )}
                          <Link href="/support" className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-primary rounded-xl transition-colors" onClick={closeMenus}>
                            <HelpCircle size={16} className="text-muted-foreground" /> Support
                          </Link>
                          <Link href="/profile/blocked" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors" onClick={closeMenus}>
                            <UserMinus size={16} className="text-red-500" /> Blocked Users
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
              <ThemeToggle />
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
        <div className="fixed inset-0 z-100 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeMenus} />
          <div
            className="absolute inset-y-0 right-0 w-[280px] bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-border/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-accent/20">
              <span className="font-bold text-lg text-foreground">Menu</span>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={closeMenus} className="p-2 text-foreground/80 hover:bg-accent rounded-full">
                  <X size={20} />
                </button>
              </div>
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

              {/* AI Tools Section in Mobile */}
              <div className="my-2 border-t border-border/50 mx-4"></div>
              <button
                onClick={() => setIsAIToolsMobileOpen(!isAIToolsMobileOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-primary hover:bg-primary/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={18} />
                  AI Tools
                </span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isAIToolsMobileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isAIToolsMobileOpen && (
                <div className="space-y-1 pl-4">
                  {aiToolsItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenus}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors"
                    >
                      <item.icon size={16} className="text-primary" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}

              {session && (
                <>
                  <Link href="/my-certificates" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Certificates
                  </Link>
                  <div className="my-2 border-t border-border/50 mx-4"></div>
                  <p className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Quick Access</p>
                  <Link href="/my-applications" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-file text-lg"></i> My Applications
                  </Link>
                  <Link href="/saved-jobs" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-bookmark text-lg"></i> Saved Jobs
                  </Link>
                </>
              )}

              {user?.role === "JOBSEEKER" && (
                <>
                  <div className="my-2 border-t border-border/50 mx-4"></div>
                  <p className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Job Seeker</p>
                  <Link href="/talent/new" className="block px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    Share My Talent
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
                <>
                  <div className="my-2 border-t border-border/50 mx-4"></div>
                  <p className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Admin</p>
                  <Link href="/employer/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-foreground/80 hover:text-primary hover:bg-accent transition-colors" onClick={closeMenus}>
                    <i className="bx bx-briefcase text-lg"></i> Manage My Posts
                  </Link>
                  <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-red-500 hover:bg-red-500/10 transition-colors" onClick={closeMenus}>
                    <i className="bx bx-shield text-lg"></i> Admin Panel
                  </Link>
                </>
              )}
            </div>

            {session && (
              <div className="p-4 border-t border-border/50 space-y-2 bg-accent/10">
                <Link href="/profile/blocked" className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-red-500 hover:bg-red-500/10 transition-colors" onClick={closeMenus}>
                  <UserMinus size={18} className="text-red-500" /> Blocked Users
                </Link>
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
  
  // Hide on certain pages
  const hiddenPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null;
  
  const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));
  
  const navItems = [
    { href: "/my-certificates", icon: "bx-award", label: "Certs" },
    { href: "/saved-jobs", icon: "bx-bookmark", label: "Saved" },
    { href: "/my-applications", icon: "bx-file", label: "Apps" },
    { href: "/messages", icon: "bx-message-rounded-dots", label: "Chat" },
    { href: "/messages/rojgaar-ai", icon: "bx-bot", label: "RojgaarAI", highlight: true },
  ];

  useEffect(() => {
    if (!showPostMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                    active ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <i className={`bx ${item.icon} text-lg`}></i>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Center Plus Button - Inline like mobile */}
            <button
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                    item.highlight
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
                <item.icon size={16} className="text-primary" />
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
