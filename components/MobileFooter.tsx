"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Briefcase, PlusCircle, MessageSquare, User, Award } from "lucide-react";

export default function MobileFooter() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user as { role?: string } | undefined;

    // Don't show footer on login/register pages and individual chat pages
    const hiddenPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
    const isChatPage = pathname.startsWith("/messages/") && pathname.length > 10;

    if (hiddenPaths.some((p) => pathname.startsWith(p)) || isChatPage) {
        return null;
    }

    const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

    // Determine post link based on role
    const getPostLink = () => {
        if (user?.role === "EMPLOYER") return "/employer/jobs/new";
        return "/talent/new";
    };

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/jobs", icon: Briefcase, label: "Jobs" },
        { href: getPostLink(), icon: PlusCircle, label: "Post", isPrimary: true },
        { href: "/my-certificates", icon: Award, label: "Certs" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="mx-3 mb-3 bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        if (item.isPrimary) {
                            return (
                                <Link
                                    key={item.href}
                                    href={session ? item.href : "/login"}
                                    className="flex flex-col items-center justify-center -mt-8"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/40 active:scale-90 transition-all duration-200 border-4 border-background">
                                        <Icon size={24} className="text-primary-foreground" />
                                    </div>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={session ? item.href : item.href === "/" ? "/" : "/login"}
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
    );
}
