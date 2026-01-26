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

  const [paymentPhone, setPaymentPhone] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "TEACHER") {
        router.push("/");
      } else {
        // Check for pending request
        fetch("/api/teacher/activation")
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
    if (!paymentPhone || paymentPhone.length < 10) {
      setError("Please enter a valid phone number used for payment");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/teacher/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          paymentScreenshotUrl: screenshot,
          paymentPhone: paymentPhone
        }),
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Activation Approved!</h1>
        <p className="text-gray-600 mb-8">Your teacher account is now active. Next step: Verify your identity (KYC).</p>
        <button 
          onClick={() => router.push("/teacher/kyc")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Proceed to KYC
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
          Usually approved within 24 hours.
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
        <h1 className="text-3xl font-bold text-foreground mb-4">Teacher Verification</h1>
        <p className="text-muted-foreground">
          To maintain quality, we require a one-time verification fee of <span className="font-bold text-foreground">Rs. 499</span>.
        </p>
      </div>

      <div className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border">
        <div className="p-6 bg-muted border-b border-border">
          <h2 className="font-semibold text-lg mb-2 text-foreground">Step 1: Make Payment</h2>
          <p className="text-sm text-muted-foreground mb-4">Scan the QR code or use the details below to pay.</p>
          
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center bg-card p-6 rounded-lg border border-border">
            <div className="flex gap-4">
                <button 
                  type="button"
                  className="flex flex-col items-center cursor-zoom-in group focus:outline-none" 
                  onClick={() => setZoomedImage("/esewa-qr.jpg")}
                >
                    <div className="relative w-32 h-32 mb-2 transition-transform group-hover:scale-105">
                        <Image src="/esewa-qr.jpg" alt="eSewa QR" fill className="object-contain" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">eSewa (Tap to zoom)</span>
                </button>
                <button 
                  type="button"
                  className="flex flex-col items-center cursor-zoom-in group focus:outline-none" 
                  onClick={() => setZoomedImage("/khalti-qr.jpg")}
                >
                    <div className="relative w-32 h-32 mb-2 transition-transform group-hover:scale-105">
                        <Image src="/khalti-qr.jpg" alt="Khalti QR" fill className="object-contain" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">Khalti (Tap to zoom)</span>
                </button>
            </div>
            
            <div className="text-left space-y-3">
              <div>
                  <p className="font-semibold text-foreground">E-Wallet Payment</p>
                  <p className="text-sm text-muted-foreground">Send Rs. 499 to:</p>
              </div>
              <div className="bg-muted p-3 rounded border border-border">
                  <p className="text-lg font-mono font-bold text-primary">9808467028</p>
                  <p className="text-xs text-muted-foreground">(eSewa / Khalti)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-semibold text-lg mb-4 text-foreground">Step 2: Verify Payment</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Payment Phone Number
            </label>
            <input
              type="text"
              placeholder="e.g. 98XXXXXXXX"
              value={paymentPhone}
              onChange={(e) => setPaymentPhone(e.target.value)}
              className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter the phone number used to make the payment.</p>
          </div>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/50 transition-colors relative">
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
              <div className="flex flex-col items-center text-muted-foreground">
                <Upload size={48} className="mb-4" />
                <p className="font-medium">Click to upload payment screenshot</p>
                <p className="text-xs mt-2">Supports JPG, PNG (Max 5MB)</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 flex items-center text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
              <AlertCircle size={16} className="mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !screenshot}
            className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black bg-opacity-90 p-4 cursor-pointer"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <Image 
              src={zoomedImage} 
              alt="Zoomed QR Code" 
              width={500}
              height={500}
              className="object-contain max-h-[80vh] w-auto bg-white rounded-lg"
            />
            <p className="text-white text-center mt-4 text-lg font-medium">Tap anywhere to close</p>
          </div>
          {/* Close button for accessibility/clarity */}
          <button 
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={() => setZoomedImage(null)}
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      )}
    </div>
  );
}
