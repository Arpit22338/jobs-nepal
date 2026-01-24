"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Briefcase, PlusCircle, MessageSquare, User } from "lucide-react";

export default function MobileFooter() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const user = session?.user as { role?: string } | undefined;

    // Don't show footer on login/register pages
    const hiddenPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
    if (hiddenPaths.some((p) => pathname.startsWith(p))) {
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
        { href: "/messages", icon: MessageSquare, label: "Messages" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border md:hidden">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    if (item.isPrimary) {
                        return (
                            <Link
                                key={item.href}
                                href={session ? item.href : "/login"}
                                className="flex flex-col items-center justify-center -mt-6"
                            >
                                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                                    <Icon size={24} className="text-primary-foreground" />
                                </div>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={session ? item.href : item.href === "/" ? "/" : "/login"}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${active ? "text-primary" : "text-muted-foreground"
                                }`}
                        >
                            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
