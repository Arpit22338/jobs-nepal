"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Upload, Clock, AlertCircle, Shield } from "lucide-react";
import Image from "next/image";
import { validateFileSize, validateImageType } from "@/lib/fileValidation";

export default function TeacherKycPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("citizenship");
  const [contactNumber, setContactNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null); // PENDING, APPROVED, REJECTED, NONE
  const [error, setError] = useState<string | null>(null);
  const [checkingActivation, setCheckingActivation] = useState(true);

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
              setCheckingActivation(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back" | "face") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validateImageType(file)) {
      setError("Please upload a valid image file (JPEG, PNG, WebP, or GIF)");
      return;
    }

    // Validate file size
    const validation = validateFileSize(file);
    if (!validation.isValid) {
      setError(validation.error || "File size exceeds limit");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "front") setFrontImage(reader.result as string);
      else if (type === "back") setBackImage(reader.result as string);
      else setFaceImage(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!frontImage || !backImage || !faceImage) {
      setError("Please upload front document, back document, and full face image");
      return;
    }
    if (!contactNumber || contactNumber.length < 10) {
      setError("Please enter a valid contact number");
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
          backImageUrl: backImage,
          faceImageUrl: faceImage,
          phoneNumber: contactNumber,
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

  if (status === "loading" || checkingActivation || kycStatus === null) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (kycStatus === "APPROVED") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Shield className="text-green-500 w-20 h-20 mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">KYC Verified!</h1>
        <p className="text-muted-foreground mb-8">Your identity has been verified. You can now create courses.</p>
        <button 
          onClick={() => router.push("/teacher/dashboard")}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 font-medium"
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
        <h1 className="text-3xl font-bold text-foreground mb-2">KYC Verification Pending</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          We have received your documents. Our team will verify your identity shortly.
          Usually approved within 24 hours.
        </p>
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
          Please check back later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-4">Identity Verification (KYC)</h1>
        <p className="text-muted-foreground">
          Please complete the form below to verify your identity as a teacher.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border p-6 md:p-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Document Type</label>
            <select 
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            >
              <option value="citizenship">Citizenship</option>
              <option value="passport">Passport</option>
              <option value="driving_license">Driving License</option>
              <option value="national_id">National ID Card</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Contact Number</label>
            <input
              type="text"
              placeholder="e.g. 98XXXXXXXX"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Front Side (Required)</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors relative h-48 flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "front")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {frontImage ? (
                <Image src={frontImage} alt="Front" fill className="object-contain p-2" />
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="mx-auto mb-2" />
                  <span className="text-sm">Upload Front</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Back Side (Required)</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors relative h-48 flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "back")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {backImage ? (
                <Image src={backImage} alt="Back" fill className="object-contain p-2" />
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="mx-auto mb-2" />
                  <span className="text-sm">Upload Back</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">Full Face Image (Required)</label>
          <p className="text-xs text-muted-foreground mb-3">Upload a clear photo of your face to verify your authenticity as a teacher. This helps us maintain quality and build trust in our community.</p>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors relative h-48 flex items-center justify-center max-w-md mx-auto">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "face")}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {faceImage ? (
              <Image src={faceImage} alt="Face" fill className="object-contain p-2" />
            ) : (
              <div className="text-muted-foreground">
                <Upload className="mx-auto mb-2" />
                <span className="text-sm">Upload Your Face</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Max 1.5 MB. Use an image compressor if needed.</p>
        </div>

        {error && (
          <div className="mt-4 flex items-center text-destructive text-sm bg-destructive/10 p-3 rounded-lg mb-4">
            <AlertCircle size={16} className="mr-2" />
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !frontImage || !backImage || !faceImage || !contactNumber}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Submitting..." : "Submit KYC for Approval"}
        </button>
      </div>
    </div>
  );
}
