"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, Clock, AlertCircle, Shield } from "lucide-react";
import Image from "next/image";

export default function TeacherKycPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("citizenship");
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null); // PENDING, APPROVED, REJECTED, NONE
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "TEACHER") {
        router.push("/");
      } else {
        // Check activation status first
        fetch("/api/teacher/activation")
          .then((res) => res.json())
          .then((data) => {
            if (!data.request || data.request.status !== "APPROVED") {
              router.push("/teacher/verification");
            } else {
              // Check KYC status
              fetch("/api/teacher/kyc")
                .then((res) => res.json())
                .then((data) => {
                  if (data.record) {
                    setKycStatus(data.record.status);
                  } else {
                    setKycStatus("NONE");
                  }
                });
            }
          });
      }
    }
  }, [status, session, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "front") setFrontImage(reader.result as string);
      else setBackImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage) {
      setError("Please upload both front and back images");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teacher/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          documentType,
          frontImageUrl: frontImage,
          backImageUrl: backImage
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setKycStatus("PENDING");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || kycStatus === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (kycStatus === "APPROVED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Shield className="text-green-500 w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verified!</h1>
        <p className="text-gray-600 mb-8">Your identity has been verified. You can now create courses.</p>
        <button 
          onClick={() => router.push("/teacher/dashboard")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (kycStatus === "PENDING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Clock className="text-yellow-500 w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Verification Pending</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          We have received your documents. Our team will verify your identity shortly.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
          Please check back later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Identity Verification (KYC)</h1>
        <p className="text-gray-600">
          Please upload a valid government-issued ID to verify your identity.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
          <select 
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="citizenship">Citizenship</option>
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Front Side</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative h-48 flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "front")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {frontImage ? (
                <Image src={frontImage} alt="Front" fill className="object-contain p-2" />
              ) : (
                <div className="text-gray-400">
                  <Upload className="mx-auto mb-2" />
                  <span className="text-sm">Upload Front</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Back Side</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative h-48 flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "back")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {backImage ? (
                <Image src={backImage} alt="Back" fill className="object-contain p-2" />
              ) : (
                <div className="text-gray-400">
                  <Upload className="mx-auto mb-2" />
                  <span className="text-sm">Upload Back</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !frontImage || !backImage}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Submitting..." : "Submit KYC"}
        </button>
      </div>
    </div>
  );
}
