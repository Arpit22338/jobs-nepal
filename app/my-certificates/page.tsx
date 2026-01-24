"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ExternalLink, ShieldCheck, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Certificate {
  id: string;
  score: number;
  issuedAt: string;
  course: {
    title: string;
    instructor: string | null;
  };
}

export default function MyCertificatesPage() {
  const { status } = useSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch("/api/certificates");
        if (res.ok) {
          const data = await res.json();
          setCertificates(data.certificates);
        }
      } catch (error) {
        console.error("Failed to fetch certificates", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchCertificates();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-primary" size={32} />
      <p className="text-muted-foreground font-bold tracking-tight">Verifying Credentials...</p>
    </div>
  );

  if (status === "unauthenticated") return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center">
      <div className="w-20 h-20 bg-accent rounded-[32px] flex items-center justify-center text-primary/40">
        <ShieldCheck size={40} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground font-medium">Please login to view your earned certificates.</p>
      </div>
      <Link href="/login">
        <Button className="rounded-xl px-8 font-bold">Login Now</Button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/40">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-amber-600">
            <Award size={28} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Achievements</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">My Certificates</h1>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-[40px] border-dashed border-2 border-border/50">
          <div className="w-24 h-24 bg-accent/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-black text-foreground mb-2">No Certificates Earned Yet</h3>
          <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto leading-relaxed">
            Start completing courses to earn industry-recognized certifications and boost your professional profile.
          </p>
          <Link href="/courses">
            <Button size="lg" className="rounded-2xl font-black px-8">Browse Course Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {certificates.map((cert) => (
            <div key={cert.id} className="glass-card rounded-[32px] p-8 border-2 border-transparent hover:border-primary/10 transition-all group relative overflow-hidden">
              {/* Ambient Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-2 py-1 bg-amber-500/10 rounded-lg">Verified</span>
                    <h3 className="text-xl font-black text-foreground leading-tight pt-2">{cert.course.title}</h3>
                    <p className="text-sm font-bold text-muted-foreground">Ins. {cert.course.instructor || "Jobs Nepal"}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <Award size={24} />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground bg-accent/30 p-4 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider opacity-60">Score</span>
                    <span className="text-foreground">{cert.score}%</span>
                  </div>
                  <div className="w-px h-6 bg-border/50"></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider opacity-60">Issued On</span>
                    <span className="text-foreground">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href={`/certificate/${cert.id}`} className="w-full">
                    <Button variant="outline" className="w-full rounded-xl font-bold border-2 hover:bg-accent hover:text-primary">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Verify
                    </Button>
                  </Link>
                  <Link href={`/certificate/${cert.id}`} className="w-full">
                    <Button className="w-full rounded-xl font-bold bg-primary hover:bg-primary/90">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
