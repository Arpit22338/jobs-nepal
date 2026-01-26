"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, ArrowUpRight, Briefcase, Users, GraduationCap, Heart, Sparkles } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { href: "/jobs", label: "Find Jobs", icon: Briefcase },
        { href: "/talent", label: "Hire Talent", icon: Users },
        { href: "/courses", label: "Courses", icon: GraduationCap },
        { href: "/ai-tools", label: "AI Tools", icon: Sparkles },
    ];

    const supportLinks = [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
    ];

    const socialLinks = [
        { href: "https://facebook.com/rojgaarnepal", icon: Facebook, label: "Facebook" },
        { href: "https://twitter.com/rojgaarnepal", icon: Twitter, label: "Twitter" },
        { href: "https://linkedin.com/company/rojgaarnepal", icon: Linkedin, label: "LinkedIn" },
        { href: "https://instagram.com/rojgaarnepal", icon: Instagram, label: "Instagram" },
    ];

    return (
        <footer className="relative bg-linear-to-b from-card/30 to-card/80 border-t border-border/50 pt-16 pb-24 md:pb-8 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="container mx-auto px-4 relative z-10">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="relative">
                                <Image src="/logo.png" alt="Rojgaar Logo" width={48} height={48} className="object-contain" />
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-3xl font-black tracking-tighter">
                                <span className="text-primary">Rojgaar</span>
                                <span className="text-foreground">Nepal</span>
                            </div>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed max-w-md text-lg">
                            Empowering Nepal's digital workforce by connecting talented individuals with visionary employers.
                        </p>
                        
                        {/* Social Links */}
                        <div className="flex items-center gap-3 pt-2">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group size-11 rounded-xl bg-accent/30 hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/25"
                                        aria-label={social.label}
                                    >
                                        <Icon size={18} />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Explore</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="group flex items-center gap-3 p-3 rounded-xl bg-accent/20 hover:bg-accent/40 transition-all duration-300"
                                    >
                                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Icon size={18} />
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact & Support */}
                    <div className="lg:col-span-3 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Contact</h3>
                            <div className="space-y-3">
                                <a
                                    href="mailto:arpitkafle468@gmail.com"
                                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
                                >
                                    <Mail size={16} className="text-primary" />
                                    <span className="text-sm">arpitkafle468@gmail.com</span>
                                </a>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin size={16} className="text-primary" />
                                    <span className="text-sm">Nepal</span>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Support</h3>
                            <div className="flex flex-wrap gap-2">
                                {supportLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-accent/30 hover:bg-accent hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                        <ArrowUpRight size={12} />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} RojgaarNepal. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        Made with <Heart size={14} className="text-red-500 fill-red-500" /> by
                        <span className="font-semibold text-foreground">Arpit Kafle</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
