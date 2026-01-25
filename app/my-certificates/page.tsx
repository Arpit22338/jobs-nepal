"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ExternalLink, ShieldCheck, Download, Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Certificate {
  id: string;
  score: number;
  issuedAt: string;
  course: {
    title: string;
    instructor: string | null;
  };
}

interface ValidatedCertificate {
  valid: boolean;
  certificate?: {
    id: string;
    holderName: string;
    courseTitle: string;
    score: number;
    issuedAt: string;
  };
}

export default function MyCertificatesPage() {
  const { status } = useSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidatedCertificate | null>(null);

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
    } else {
      setLoading(false);
    }
  }, [status]);

  const handleValidate = async () => {
    if (!searchId.trim()) return;
    
    setValidating(true);
    setValidationResult(null);
    
    try {
      const res = await fetch(`/api/certificates/validate?id=${encodeURIComponent(searchId.trim())}`);
      const data = await res.json();
      setValidationResult(data);
    } catch {
      setValidationResult({ valid: false });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/40">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-amber-600">
            <Award size={28} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Achievements</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Certificates</h1>
        </div>
      </div>

      {/* Certificate Validation Section - Compact */}
      <div className="glass-card rounded-2xl p-4 border border-border/50 bg-linear-to-br from-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="text-primary" size={16} />
            </div>
            <span className="text-sm font-bold text-foreground">Validate</span>
          </div>
          <div className="flex gap-2 flex-1 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Enter certificate ID"
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value);
                  setValidationResult(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                className="pl-10 h-10 rounded-lg border bg-background/50 text-sm"
              />
            </div>
            <Button 
              onClick={handleValidate} 
              disabled={validating || !searchId.trim()}
              size="sm"
              className="h-10 px-4 rounded-lg font-bold"
            >
              {validating ? <Loader2 className="animate-spin" size={16} /> : "Check"}
            </Button>
          </div>
        </div>

        {/* Compact Validation Result */}
        {validationResult && (
          <div className={`mt-3 p-3 rounded-xl border ${validationResult.valid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3">
              {validationResult.valid ? (
                <CheckCircle className="text-green-500 shrink-0" size={20} />
              ) : (
                <XCircle className="text-red-500 shrink-0" size={20} />
              )}
              <div className="flex-1 min-w-0">
                {validationResult.valid && validationResult.certificate ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold text-green-600 text-sm">Valid</span>
                    <span className="text-foreground font-medium text-sm truncate">{validationResult.certificate.courseTitle}</span>
                    <span className="text-muted-foreground text-xs">{validationResult.certificate.holderName} • {validationResult.certificate.score}%</span>
                    <Link href={`/certificate/${validationResult.certificate.id}`} className="text-primary text-xs font-bold hover:underline ml-auto">
                      View →
                    </Link>
                  </div>
                ) : (
                  <span className="text-red-600 font-medium text-sm">Invalid certificate ID</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User's Certificates */}
      {status === "unauthenticated" ? (
        <div className="glass-card rounded-4xl p-12 text-center border border-border/50">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} className="text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">View Your Certificates</h2>
          <p className="text-muted-foreground mb-6">Login to see your earned certificates</p>
          <Link href="/login">
            <Button className="rounded-xl px-8 font-bold">Login</Button>
          </Link>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-muted-foreground font-medium">Loading certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-4xl border-dashed border-2 border-border/50">
          <div className="w-24 h-24 bg-accent/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No Certificates Earned Yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Complete courses to earn industry-recognized certifications.
          </p>
          <Link href="/courses">
            <Button size="lg" className="rounded-2xl font-bold px-8">Browse Courses</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Your Certificates ({certificates.length})</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="glass-card rounded-[28px] p-6 border border-border/50 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-2 py-1 bg-amber-500/10 rounded-lg">Verified</span>
                      <h3 className="text-lg font-bold text-foreground leading-tight pt-2">{cert.course.title}</h3>
                      <p className="text-sm text-muted-foreground">By {cert.course.instructor || "RojgaarNepal"}</p>
                    </div>
                    <div className="w-11 h-11 bg-linear-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                      <Award size={20} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground bg-accent/30 p-3 rounded-xl">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider opacity-60">Score</span>
                      <span className="text-foreground font-bold">{cert.score}%</span>
                    </div>
                    <div className="w-px h-6 bg-border/50" />
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider opacity-60">Issued</span>
                      <span className="text-foreground font-bold">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex-1" />
                    <span className="text-[10px] text-muted-foreground/60 font-mono">{cert.id.slice(0, 12)}...</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link href={`/certificate/${cert.id}`}>
                      <Button variant="outline" className="w-full rounded-xl font-bold border-2 hover:bg-accent">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/certificate/${cert.id}`}>
                      <Button className="w-full rounded-xl font-bold">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
