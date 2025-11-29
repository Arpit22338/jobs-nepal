"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

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
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Profile Incomplete</h2>
        <p className="mb-6 text-gray-600">Please complete your profile to access all features.</p>
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {session?.user?.image && (
            <img 
              src={session.user.image} 
              alt="Profile" 
              className="w-16 h-16 rounded-full object-cover border"
            />
          )}
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
        <Link
          href="/profile/edit"
          className="text-blue-600 hover:underline"
        >
          Edit Profile
        </Link>
      </div>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <p className="text-sm text-gray-500">Name</p>
          <p className="font-medium">{session?.user?.name}</p>
        </div>
        <div className="border-b pb-4">
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{session?.user?.email}</p>
        </div>
        <div className="border-b pb-4">
          <p className="text-sm text-gray-500">Role</p>
          <p className="font-medium">{session?.user?.role}</p>
        </div>

        {session?.user?.role === "EMPLOYER" ? (
          <>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Company Name</p>
              <p className="font-medium">{profile.companyName}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{profile.description}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{profile.location}</p>
            </div>
            {profile.website && (
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Website</p>
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
                <p className="text-sm text-gray-500">Bio</p>
                <p className="font-medium">{profile.bio}</p>
              </div>
            )}
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Skills</p>
              <p className="font-medium">{profile.skills}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{profile.location}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-sm text-gray-500">Experience</p>
              <p className="font-medium">{profile.experience}</p>
            </div>
            {profile.education && (
              <div className="border-b pb-4">
                <p className="text-sm text-gray-500">Education</p>
                <p className="font-medium">{profile.education}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
