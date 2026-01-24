import React from "react";
import Image from "next/image";
import { Target, Heart, Globe, Award, Users } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="space-y-20 pb-20">
            {/* Hero */}
            <section className="relative py-20 bg-accent/30 overflow-hidden">
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6">
                        Building Nepal's <span className="text-primary">Future</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        We are on a mission to bridge the gap between talent and opportunity. RojgaarNepal is more than just a job board; it's a movement to empower the workforce of tomorrow.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
                            Our Mission
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                            Empowering Every Individual
                        </h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            We believe that every individual possesses unique talents that deserve to be discovered. Our platform is designed to make the connection between skills and needs seamless, transparent, and fair.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <div className="flex-1 p-4 bg-card rounded-xl border shadow-sm">
                                <Target className="text-primary mb-2" size={32} />
                                <h3 className="font-bold text-foreground">Focus</h3>
                                <p className="text-sm text-muted-foreground">Laser-focused on local opportunities.</p>
                            </div>
                            <div className="flex-1 p-4 bg-card rounded-xl border shadow-sm">
                                <Globe className="text-primary mb-2" size={32} />
                                <h3 className="font-bold text-foreground">Reach</h3>
                                <p className="text-sm text-muted-foreground">Connecting every corner of Nepal.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-[400px] w-full rounded-3xl overflow-hidden glass-card p-2">
                        <div className="relative h-full w-full rounded-2xl overflow-hidden bg-accent">
                            {/* Placeholder for About Image if we had one, or a nice gradient/pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
                                <span className="text-primary font-black text-2xl">RojgaarNepal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-foreground mb-12">Our Core Values</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-card border hover:shadow-lg transition-all text-center space-y-4">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                            <Heart size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Integrity</h3>
                        <p className="text-muted-foreground">We operate with total transparency and honesty in every interaction.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-card border hover:shadow-lg transition-all text-center space-y-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                            <Award size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Excellence</h3>
                        <p className="text-muted-foreground">We strive for the highest quality in our platform and support.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-card border hover:shadow-lg transition-all text-center space-y-4">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                            <Users size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Community</h3>
                        <p className="text-muted-foreground">We are built by the community, for the community.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
