"use client";

import { useForm } from "react-hook-form";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function ContactPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = (data: any) => {
        // In a real app, you would send this to your data API
        console.log(data);
        alert("Message sent! We will get back to you soon.");
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">Get in Touch</h1>
                    <p className="text-xl text-muted-foreground">Have questions? We'd love to hear from you.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="glass-card p-8 rounded-3xl space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary flex-shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground mb-1">Email Us</h3>
                                    <p className="text-muted-foreground mb-2">Our friendly team is here to help.</p>
                                    <a href="mailto:rojggaarnepall@gmail.com" className="text-primary font-medium hover:underline">rojggaarnepall@gmail.com</a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground mb-1">Visit Us</h3>
                                    <p className="text-muted-foreground mb-2">Come say hello at our office headquarters.</p>
                                    <p className="text-foreground font-medium">Nepal</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground mb-1">Call Us</h3>
                                    <p className="text-muted-foreground mb-2">Mon-Fri from 8am to 5pm.</p>
                                    <p className="text-foreground font-medium">currently unavailable</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">First Name</label>
                                    <input
                                        {...register("firstName", { required: true })}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="John"
                                    />
                                    {errors.firstName && <span className="text-xs text-red-500">Required</span>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Last Name</label>
                                    <input
                                        {...register("lastName", { required: true })}
                                        className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Doe"
                                    />
                                    {errors.lastName && <span className="text-xs text-red-500">Required</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Email</label>
                                <input
                                    type="email"
                                    {...register("email", { required: true })}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    placeholder="you@company.com"
                                />
                                {errors.email && <span className="text-xs text-red-500">Required</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Message</label>
                                <textarea
                                    {...register("message", { required: true })}
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                    placeholder="Tell us what you need help with..."
                                />
                                {errors.message && <span className="text-xs text-red-500">Required</span>}
                            </div>

                            <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                <Send size={18} /> Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
