"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, ExternalLink } from "lucide-react";
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

  if (status === "loading" || loading) return <div className="p-8 text-center">Loading...</div>;
  if (status === "unauthenticated") return <div className="p-8 text-center">Please login to view your certificates.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Award className="text-yellow-600" />
        My Certificates
      </h1>
      
      {certificates.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">You haven&apos;t earned any certificates yet.</p>
          <p className="text-sm text-gray-400 mb-6">Complete courses to earn certificates.</p>
          <Link href="/courses" className="text-blue-600 hover:underline">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{cert.course.title}</h3>
                  <p className="text-sm text-gray-500">Instructor: {cert.course.instructor || "Jobs Nepal"}</p>
                </div>
                <Award className="text-yellow-500 h-8 w-8" />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <span>Score: {cert.score}%</span>
                <span>•</span>
                <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-3">
                <Link href={`/certificate/${cert.id}`} className="flex-1">
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Certificate
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
