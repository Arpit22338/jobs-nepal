"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { toggleTrust } from "@/app/actions";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md my-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="relative w-32 h-32 flex-shrink-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              fill
              className="rounded-full object-cover border-4 border-gray-100"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <div className="flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-100">
              <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-green-700">{trustCount} Trusted</span>
            </div>
          </div>
          <p className="text-gray-600 mt-1 capitalize">{user.role.toLowerCase()}</p>
          {profile?.location && (
            <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-1">
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
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  isTrusted
                    ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                }`}
              >
                <svg className={`w-4 h-4 ${isTrusted ? "fill-current" : "none"}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isTrusted ? "Trusted" : "Trust"}
              </button>
              <Link
                href={`/messages/${user.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Message
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-6 space-y-6">
        {user.role === "EMPLOYER" && profile?.companyName && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Company</h2>
            <p className="text-gray-700">{profile.companyName}</p>
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1 block">
                Visit Website
              </a>
            )}
          </div>
        )}

        {profile?.bio && (
          <div>
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {profile?.description && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.description}</p>
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
                    <div className="space-y-2 mt-2">
                      {skills.map((skill: { name: string; level: number }, idx: number) => (
                        <div key={idx} className="flex items-center gap-4">
                          <span className="w-32 font-medium truncate">{skill.name}</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full" 
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{skill.level}%</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return <p>{profile.skills}</p>;
              } catch {
                // Try to regex extract if it looks like JSON but is broken
                if (profile.skills.includes('"name":')) {
                   const extractedSkills = [];
                   const parts = profile.skills.split('}');
                   for (const part of parts) {
                      const n = /"name":"([^"]+)"/.exec(part);
                      const l = /"level":(\d+)/.exec(part);
                      if (n) {
                        extractedSkills.push({ name: n[1], level: l ? parseInt(l[1]) : 50 });
                      }
                   }
                   
                   if (extractedSkills.length > 0) {
                      return (
                        <div className="space-y-2 mt-2">
                          {extractedSkills.map((skill, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <span className="w-32 font-medium truncate">{skill.name}</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full" 
                                  style={{ width: `${skill.level}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{skill.level}%</span>
                            </div>
                          ))}
                        </div>
                      );
                   }
                }

                // Fallback for comma-separated or cleanup
                return (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.split(',').map((skill, index) => {
                      const cleanSkill = skill.trim().replace(/[\[\]"{}]/g, '').replace(/name:/g, '').replace(/level:\d+/g, '');
                      if (!cleanSkill) return null;
                      return (
                        <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                          {cleanSkill}
                        </span>
                      );
                    })}
                  </div>
                );
              }
            })()}
          </div>
        )}

        {profile?.experience && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Experience</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.experience}</p>
          </div>
        )}

        {profile?.education && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Education</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{profile.education}</p>
          </div>
        )}
        
        {profile?.resumeUrl && (
           <div>
            <h2 className="text-xl font-semibold mb-2">Resume</h2>
            <a 
              href={profile.resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-2"
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
