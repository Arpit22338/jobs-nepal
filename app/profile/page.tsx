"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";

interface Profile {
  id: string;
  bio?: string;
  skills?: string;
  location?: string;
  companyName?: string;
  description?: string;
  website?: string;
  experience?: string;
  education?: string;
  resumeUrl?: string;
  image?: string;
}

interface AdminJob {
  id: string;
  title: string;
  location: string;
  createdAt: string;
  views: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminJobs, setAdminJobs] = useState<AdminJob[]>([]);
  const [adminJobsLoading, setAdminJobsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        setProfile(data.profile);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profile", error);
        setLoading(false);
      }
    };

    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchAdminJobs = async () => {
      if (session?.user?.role !== "ADMIN") return;
      setAdminJobsLoading(true);
      try {
        const res = await fetch("/api/admin/jobs");
        const data = await res.json();
        setAdminJobs(data.jobs || []);
      } catch (error) {
        console.error("Failed to fetch admin jobs", error);
      } finally {
        setAdminJobsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchAdminJobs();
    }
  }, [status, session]);

  const deleteAdminJob = async (jobId: string) => {
    if (!confirm("Delete this job post?")) return;
    try {
      const res = await fetch(`/api/admin/jobs?jobId=${jobId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete job");
      setAdminJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Failed to delete job", error);
      alert("Failed to delete job. Please try again.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Incomplete</h2>
        <p className="mb-6 text-muted-foreground">Please complete your profile to access all features.</p>
        <Link
          href="/profile/edit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Complete Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {profile.image ? (
            <Image
              src={profile.image}
              alt="Profile"
              width={64}
              height={64}
              className="rounded-full object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center border">
              <span className="text-lg font-bold">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              My Profile
            </h1>
          </div>
        </div>
        <Link
          href="/profile/edit"
          className="premium-button flex items-center gap-2 group"
        >
          Edit Profile
          <Plus size={14} className="group-hover:rotate-90 transition-transform" />
        </Link>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="font-medium">{session?.user?.name}</p>
        </div>
        <div className="border-b pb-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{session?.user?.email}</p>
        </div>
        <div className="border-b pb-4">
          <p className="text-sm text-muted-foreground">Role</p>
          <p className="font-medium">{session?.user?.role}</p>
        </div>

        {session?.user?.role === "EMPLOYER" ? (
          <>
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-medium">{profile.companyName}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{profile.description}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{profile.location}</p>
            </div>
            {profile.website && (
              <div className="border-b pb-4">
                <p className="text-sm text-muted-foreground">Website</p>
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {profile.website}
                </a>
              </div>
            )}
          </>
        ) : (
          <>
            {profile.bio && (
              <div className="border-b pb-4">
                <p className="text-sm text-muted-foreground">Bio</p>
                <p className="font-medium">{profile.bio}</p>
              </div>
            )}
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Skills</p>
              {(() => {
                if (!profile.skills) return <p className="font-medium text-muted-foreground">No skills added yet.</p>;

                let skills = [];
                try {
                  const parsed = JSON.parse(profile.skills);
                  skills = Array.isArray(parsed) ? parsed : [];
                } catch {
                  skills = profile.skills.split(',').map(s => ({
                    name: s.trim().replace(/[\[\]"{}]/g, '').replace(/name:/g, '').replace(/level:\d+/g, ''),
                    level: 90
                  })).filter(s => s.name);
                }

                return (
                  <div className="space-y-4 mt-4">
                    {skills.map((skill: any, idx: number) => (
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
              })()}
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{profile.location}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">Experience</p>
              <p className="font-medium">{profile.experience}</p>
            </div>
            {profile.education && (
              <div className="border-b pb-4">
                <p className="text-sm text-muted-foreground">Education</p>
                <p className="font-medium">{profile.education}</p>
              </div>
            )}
          </>
        )}
      </div>

      {session?.user?.role === "ADMIN" && (
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Admin Job Posts</h2>
            <Link href="/employer/jobs/new" className="text-sm text-primary hover:underline">
              Post New Job
            </Link>
          </div>

          {adminJobsLoading ? (
            <p className="text-muted-foreground text-sm">Loading job posts...</p>
          ) : adminJobs.length === 0 ? (
            <p className="text-muted-foreground text-sm">No admin job posts found.</p>
          ) : (
            <div className="space-y-3">
              {adminJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between border border-border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-foreground">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.location} • {new Date(job.createdAt).toLocaleDateString()} • {job.views} views
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/jobs/${job.id}`} className="text-sm text-primary hover:underline">
                      View
                    </Link>
                    <button
                      onClick={() => deleteAdminJob(job.id)}
                      className="text-sm text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
