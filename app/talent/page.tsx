"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, MapPin } from "lucide-react";

interface TalentPost {
  id: string;
  title: string;
  bio: string;
  skills: string;
  userId: string;
  user: {
    name: string | null;
    image: string | null;
    jobSeekerProfile: {
      location: string | null;
    } | null;
  };
}

export default function TalentPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<TalentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/talent");
        const data = await res.json();
        setPosts(data.posts);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch talent posts", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Find Talent</h1>
        {session?.user.role === "JOBSEEKER" && (
          <Link
            href="/talent/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Post Your Profile
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 col-span-full text-center py-10">No talent posts found.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0">
                  {post.user.image ? (
                    <Image
                      src={post.user.image}
                      alt={post.user.name || "User"}
                      width={48}
                      height={48}
                      className="rounded-full object-cover border"
                      unoptimized
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={24} className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{post.user.name}</h2>
                  <p className="text-sm text-gray-500">{post.title}</p>
                  <Link href={`/profile/${post.userId}`} className="text-xs text-blue-600 hover:underline">
                    View Profile
                  </Link>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">{post.bio}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {post.skills.split(",").map((skill: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {skill.trim()}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={16} className="mr-1" />
                  {post.user.jobSeekerProfile?.location || "Nepal"}
                </div>
                {session && (
                  <Link
                    href={`/messages/${post.userId}`}
                    className="text-blue-600 text-sm font-medium hover:underline"
                  >
                    Message
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
