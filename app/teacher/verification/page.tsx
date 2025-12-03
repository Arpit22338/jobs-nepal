"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function TeacherVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null); // PENDING, APPROVED, REJECTED, NONE
  const [error, setError] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "TEACHER") {
        router.push("/");
      } else if (session.user.isPremium) {
        // Already approved
        setVerificationStatus("APPROVED");
      } else {
        // Check for pending request
        fetch("/api/teacher/verify")
          .then((res) => res.json())
          .then((data) => {
            if (data.request) {
              setVerificationStatus(data.request.status);
            } else {
              setVerificationStatus("NONE");
            }
          });
      }
    }
  }, [status, session, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError("File size too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!screenshot) {
      setError("Please upload a screenshot");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teacher/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshotUrl: screenshot }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setVerificationStatus("PENDING");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || verificationStatus === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (verificationStatus === "APPROVED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <CheckCircle className="text-green-500 w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Verified!</h1>
        <p className="text-gray-600 mb-8">You are now a verified Skill Teacher.</p>
        <button 
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (verificationStatus === "PENDING") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Clock className="text-yellow-500 w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Pending</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          We have received your payment screenshot. Our team will verify it shortly. 
          This usually takes 1-2 hours.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
          Please check back later or wait for an email confirmation.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Teacher Verification</h1>
        <p className="text-gray-600">
          To maintain quality, we require a one-time verification fee of <span className="font-bold text-gray-900">Rs. 499</span>.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-lg mb-2">Step 1: Make Payment</h2>
          <p className="text-sm text-gray-600 mb-4">Scan the QR code or use the details below to pay.</p>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex gap-4">
                <div className="flex flex-col items-center cursor-pointer group" onClick={() => setZoomedImage("/esewa-qr.jpg")}>
                    <div className="relative w-32 h-32 mb-2 transition-transform group-hover:scale-105">
                        <Image src="/esewa-qr.jpg" alt="eSewa QR" fill className="object-contain" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">eSewa (Tap to zoom)</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer group" onClick={() => setZoomedImage("/khalti-qr.jpg")}>
                    <div className="relative w-32 h-32 mb-2 transition-transform group-hover:scale-105">
                        <Image src="/khalti-qr.jpg" alt="Khalti QR" fill className="object-contain" />
                    </div>
                    <span className="text-xs font-medium text-gray-500">Khalti (Tap to zoom)</span>
                </div>
            </div>
            
            <div className="text-left space-y-3">
              <div>
                  <p className="font-semibold text-gray-900">E-Wallet Payment</p>
                  <p className="text-sm text-gray-600">Send Rs. 499 to:</p>
              </div>
              <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-lg font-mono font-bold text-blue-600">9808467028</p>
                  <p className="text-xs text-gray-500">(eSewa / Khalti)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-semibold text-lg mb-4">Step 2: Upload Screenshot</h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {screenshot ? (
              <div className="relative h-64 w-full">
                <Image 
                  src={screenshot} 
                  alt="Payment Screenshot" 
                  fill 
                  className="object-contain" 
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white py-2 text-sm">
                  Click to change
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload size={48} className="mb-4 text-gray-400" />
                <p className="font-medium">Click to upload payment screenshot</p>
                <p className="text-xs mt-2">Supports JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !screenshot}
            className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative w-full max-w-md aspect-square">
            <Image 
              src={zoomedImage} 
              alt="Zoomed QR Code" 
              fill 
              className="object-contain bg-white rounded-lg"
            />
            <div className="absolute -bottom-12 left-0 right-0 text-center text-white">
              <p className="text-lg font-medium">Tap anywhere to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
