"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-card/50 border-t border-border pt-16 pb-20 md:pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <Image src="/logo.png" alt="Rojgaar Logo" width={40} height={40} className="object-contain" />
                            <div className="text-2xl font-black tracking-tighter whitespace-nowrap">
                                <span className="text-primary">Rojgaar</span>
                                <span className="text-foreground">Nepal</span>
                            </div>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed">
                            Empowering Nepal's digital workforce by connecting talented individuals with visionary employers. Build your future with Rojgaar Nepal today.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://facebook.com/rojgaarnepal" target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" aria-label="Follow us on Facebook">
                                <Facebook size={18} />
                            </a>
                            <a href="https://twitter.com/rojgaarnepal" target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" aria-label="Follow us on Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="https://linkedin.com/company/rojgaarnepal" target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" aria-label="Follow us on LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="https://instagram.com/rojgaarnepal" target="_blank" rel="noopener noreferrer" className="size-10 rounded-full bg-accent/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" aria-label="Follow us on Instagram">
                                <Instagram size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/jobs" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    Explore Job Openings
                                </Link>
                            </li>
                            <li>
                                <Link href="/talent" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    Hire Professional Talent
                                </Link>
                            </li>
                            <li>
                                <Link href="/courses" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    Browse Skill Courses
                                </Link>
                            </li>
                            <li>
                                <Link href="/employer/jobs/new" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                                    Publish a New Listing
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-6">Support</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                                    Contact Support
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-muted-foreground">
                                <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                                <span>Nepal</span>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Mail size={20} className="text-primary flex-shrink-0" />
                                <a href="mailto:arpitkafle468@gmail.com" className="hover:text-primary transition-colors">arpitkafle468@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-3 text-muted-foreground">
                                <Phone size={20} className="text-primary flex-shrink-0" />
                                <span>currently unavailable</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        &copy; {currentYear} RojgaarNepal. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Developed with ❤️ by <span className="font-medium text-foreground">Arpit Kafle</span>
                    </p>
                </div>
            </div>
        </footer>
    );
}
