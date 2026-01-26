"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Home, Briefcase, PlusCircle, User, Award, X, Building2, Sparkles } from "lucide-react";

export default function MobileFooter() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user as { role?: string } | undefined;
    const [showPostMenu, setShowPostMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Don't show footer on login/register pages and individual chat pages
    const hiddenPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
    const isChatPage = pathname.startsWith("/messages/") && pathname.length > 10;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowPostMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (hiddenPaths.some((p) => pathname.startsWith(p)) || isChatPage) {
        return null;
    }

    const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

    const handlePostClick = () => {
        if (!session) {
            router.push("/login");
            return;
        }
        setShowPostMenu(true);
    };

    const handlePostOption = (path: string) => {
        setShowPostMenu(false);
        router.push(path);
    };

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/jobs", icon: Briefcase, label: "Jobs" },
        { icon: PlusCircle, label: "Post", isPrimary: true },
        { href: "/my-certificates", icon: Award, label: "Certs" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <>
            {/* Post Menu Overlay */}
            {showPostMenu && (
                <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
                    <div 
                        ref={menuRef}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
                    >
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-foreground">Create New</h3>
                            <button 
                                onClick={() => setShowPostMenu(false)}
                                className="p-2 rounded-full hover:bg-accent transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-2">
                            {/* Show based on user role */}
                            {(user?.role === "EMPLOYER" || user?.role === "ADMIN") && (
                                <button
                                    onClick={() => handlePostOption("/employer/jobs/new")}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-accent transition-colors text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Building2 size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">Post a Job</p>
                                        <p className="text-sm text-muted-foreground">Hire talented candidates</p>
                                    </div>
                                </button>
                            )}
                            {(user?.role === "USER" || user?.role === "JOB_SEEKER" || !user?.role || user?.role === "ADMIN") && (
                                <button
                                    onClick={() => handlePostOption("/talent/new")}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-accent transition-colors text-left"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                        <Sparkles size={24} className="text-cyan-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">Post My Talent</p>
                                        <p className="text-sm text-muted-foreground">Showcase your skills to employers</p>
                                    </div>
                                </button>
                            )}
                            {/* RojgaarAI Quick Access */}
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
                </div>
            )}

            {/* Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                <div className="mx-3 mb-3 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
                    <div className="flex justify-around items-center h-16 px-2">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const active = item.href ? isActive(item.href) : false;

                            if (item.isPrimary) {
                                return (
                                    <button
                                        key={`post-${index}`}
                                        onClick={handlePostClick}
                                        className="flex flex-col items-center justify-center -mt-8"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/40 active:scale-90 transition-all duration-200 border-4 border-background ${showPostMenu ? 'rotate-45' : ''}`}>
                                            <Icon size={24} className="text-primary-foreground" />
                                        </div>
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={session ? item.href! : item.href === "/" ? "/" : "/login"}
                                    className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 transition-all duration-200 rounded-xl ${active 
                                        ? "text-primary bg-primary/10" 
                                        : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    <Icon 
                                        size={20} 
                                        strokeWidth={active ? 2.5 : 1.5} 
                                        className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}
                                    />
                                    <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
}
