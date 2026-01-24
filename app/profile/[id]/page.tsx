"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BadgeCheck } from "lucide-react";

import { toggleTrust } from "@/app/actions";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  isPremium?: boolean;
}

interface Profile {
  bio?: string;
  skills?: string;
  location?: string;
  companyName?: string;
  description?: string;
  website?: string;
  experience?: string;
  education?: string;
  resumeUrl?: string;
}

export default function PublicProfilePage() {
  const { data: session } = useSession();
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [trustCount, setTrustCount] = useState(0);
  const [isTrusted, setIsTrusted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/profile/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("User not found");
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        setUser(data.user);
        setProfile(data.profile);
        setTrustCount(data.trustCount || 0);
        setIsTrusted(data.isTrusted || false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleTrust = async () => {
    if (!user) return;
    try {
      const result = await toggleTrust(user.id);
      setIsTrusted(result.trusted);
      setTrustCount((prev) => (result.trusted ? prev + 1 : prev - 1));
    } catch (error) {
      console.error("Failed to toggle trust", error);
      alert("Failed to update trust status");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!user) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 glass-card rounded-2xl border border-border/50 my-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              fill
              className={`rounded-full object-cover border-4 ${user.isPremium ? 'border-yellow-500' : 'border-border'}`}
            />
          ) : (
            <div className={`w-full h-full rounded-full flex items-center justify-center text-muted-foreground text-4xl font-bold border-4 ${user.isPremium ? 'border-yellow-500 bg-yellow-50' : 'border-border bg-accent'}`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
              {user.isPremium && (
                <BadgeCheck className="text-blue-500" size={24} fill="currentColor" color="white" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
            <div className="text-center md:text-left">
              <span className="block text-xl font-bold text-foreground">{trustCount}</span>
              <span className="text-sm text-muted-foreground">Trusted</span>
            </div>
            <div className="text-center md:text-left">
              <span className="block text-xl font-bold text-foreground capitalize">{user.role.toLowerCase()}</span>
              <span className="text-sm text-muted-foreground">Role</span>
            </div>
          </div>

          {profile?.location && (
            <p className="text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-1 mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {profile.location}
            </p>
          )}

          {session?.user?.id !== user.id && (
            <div className="mt-4 flex gap-3 justify-center md:justify-start">
              <button
                onClick={handleTrust}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isTrusted
                  ? "bg-accent text-foreground hover:bg-accent/80 border border-border"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent shadow-lg shadow-primary/20"
                  }`}
              >
                {isTrusted ? "Trusted" : "Trust"}
              </button>
              <Link
                href={`/messages/${user.id}`}
                className="inline-flex items-center px-6 py-2 border border-input rounded-md shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent focus:outline-none"
              >
                Message
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 space-y-6">
        {user.role === "EMPLOYER" && profile?.companyName && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Company</h2>
            <p className="text-muted-foreground">{profile.companyName}</p>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm mt-1 block">
                Visit Website
              </a>
            )}
          </div>
        )}

        {profile?.bio && (
          <div>
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {profile?.description && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.description}</p>
          </div>
        )}

        {profile?.skills && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Skills</h2>
            {(() => {
              try {
                const skills = JSON.parse(profile.skills);
                if (Array.isArray(skills)) {
                  return (
                    <div className="space-y-4 mt-4">
                      {skills.map((skill: { name: string; level: number }, idx: number) => (
                        <div key={idx} className="group">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="font-semibold text-foreground text-sm tracking-wide uppercase">{skill.name}</span>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{skill.level}%</span>
                          </div>
                          <div className="h-2.5 bg-accent/50 rounded-full overflow-hidden border border-border/20">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                return <p>{profile.skills}</p>;
              } catch {
                // Try to regex extract if it looks like JSON but is broken
                // Handle missing commas between objects or properties
                // Pattern: {"name":"HMML" "level":100} or {"name":"HMML","level":100}
                if (profile.skills.includes('"name":')) {
                  const extractedSkills = [];
                  // Split by '}' to separate objects roughly
                  const parts = profile.skills.split('}');
                  for (const part of parts) {
                    const n = /"name"\s*:\s*"([^"]+)"/.exec(part);
                    const l = /"level"\s*:\s*(\d+)/.exec(part);
                    if (n) {
                      extractedSkills.push({ name: n[1], level: l ? parseInt(l[1]) : 50 });
                    }
                  }

                  if (extractedSkills.length > 0) {
                    return (
                      <div className="space-y-4 mt-4">
                        {extractedSkills.map((skill, idx) => (
                          <div key={idx} className="group">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-semibold text-foreground text-sm tracking-wide uppercase">{skill.name}</span>
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{skill.level}%</span>
                            </div>
                            <div className="h-2.5 bg-accent/50 rounded-full overflow-hidden border border-border/20">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                style={{ width: `${skill.level}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }
                }

                // Fallback for comma-separated or cleanup
                const skillsArray = profile.skills.split(',').map(s => s.trim()).filter(s => s);
                return (
                  <div className="space-y-4 mt-4">
                    {skillsArray.map((skill, index) => (
                      <div key={index} className="group">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="font-semibold text-foreground text-sm tracking-wide uppercase">
                            {skill.replace(/[\[\]"{}]/g, '').replace(/name:/g, '').replace(/level:\d+/g, '')}
                          </span>
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">90%</span>
                        </div>
                        <div className="h-2.5 bg-accent/50 rounded-full overflow-hidden border border-border/20">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                            style={{ width: `90%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }
            })()}
          </div>
        )}

        {profile?.experience && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Experience</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.experience}</p>
          </div>
        )}

        {profile?.education && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Education</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{profile.education}</p>
          </div>
        )}

        {profile?.resumeUrl && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Resume</h2>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
