"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle } from "lucide-react";

export default function PremiumPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const plans = [
    {
      id: "15_UPLOADS",
      title: "15 Uploads Pack",
      price: 200,
      duration: "30 Days",
      description: "Increase your posting limit by 15. Valid for 30 days.",
      benefits: [
        "Post 15 additional jobs/talents",
        "Valid for 30 days",
        "Standard visibility",
        "No Verified Badge"
      ]
    },
    {
      id: "7_DAYS",
      title: "7 Days Premium",
      price: 299,
      duration: "7 Days",
      description: "Short-term boost for urgent hiring or job seeking.",
      benefits: [
        "Verified Badge",
        "Unlimited Job/Talent Posts",
        "Top Search Results",
        "Premium Customer Support",
        "Access to Premium Filters"
      ]
    },
    {
      id: "30_DAYS",
      title: "30 Days Premium",
      price: 499,
      duration: "30 Days",
      description: "Standard monthly premium plan for consistent growth.",
      benefits: [
        "Verified Badge",
        "Unlimited Job/Talent Posts",
        "Top Search Results",
        "Premium Customer Support",
        "Access to Premium Filters"
      ]
    },
    {
      id: "75_DAYS",
      title: "75 Days Premium",
      price: 999,
      duration: "75 Days",
      description: "Best value for quarterly planning.",
      benefits: [
        "Verified Badge",
        "Unlimited Job/Talent Posts",
        "Top Search Results",
        "Premium Customer Support",
        "Access to Premium Filters",
        "Featured Profile"
      ]
    },
    {
      id: "6_MONTHS",
      title: "6 Months Premium",
      price: 1999,
      duration: "6 Months",
      description: "Long-term commitment for serious businesses.",
      benefits: [
        "Verified Badge",
        "Unlimited Job/Talent Posts",
        "Top Search Results",
        "Premium Customer Support",
        "Access to Premium Filters",
        "Featured Profile",
        "Priority Email Support"
      ]
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert("File size too large. Max 4MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setScreenshot(data.url);
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  const handleSubmit = async () => {
    if (!selectedPlan || !screenshot) return;

    setLoading(true);
    try {
      const plan = plans.find((p) => p.id === selectedPlan);
      const res = await fetch("/api/premium/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan,
          amount: plan?.price,
          screenshotUrl: screenshot,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Failed to submit request");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting request");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
        <p className="text-gray-600 mb-6">
          Your premium application has been received. It usually gets accepted within 24 hours.
        </p>
        <button
          onClick={() => router.push("/profile")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 relative">
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <Image 
              src={zoomedImage} 
              alt="Zoomed QR" 
              width={500} 
              height={500} 
              className="object-contain max-h-[90vh]"
            />
            <p className="text-white text-center mt-4">Click anywhere to close</p>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center mb-8">Upgrade to Premium</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Plans */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">1. Select a Plan</h2>
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{plan.title}</h3>
                <span className="text-blue-600 font-bold">Rs. {plan.price}</span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
              
              {selectedPlan === plan.id && (
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside bg-white p-3 rounded-lg border border-blue-100">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {/* Payment & Upload */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">2. Pay & Upload Screenshot</h2>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="mb-4 text-sm text-gray-600">Click QR to Zoom & Scan via eSewa or Khalti</p>
            <div className="flex gap-4 justify-center mb-6">
              <div className="text-center cursor-pointer" onClick={() => setZoomedImage("/esewa-qr.jpg")}>
                <div className="w-32 h-32 relative rounded-lg overflow-hidden mb-2 border hover:opacity-80 transition-opacity">
                  <Image 
                    src="/esewa-qr.jpg" 
                    alt="eSewa QR" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium">eSewa (Click to Zoom)</span>
              </div>
              <div className="text-center cursor-pointer" onClick={() => setZoomedImage("/khalti-qr.jpg")}>
                <div className="w-32 h-32 relative rounded-lg overflow-hidden mb-2 border hover:opacity-80 transition-opacity">
                  <Image 
                    src="/khalti-qr.jpg" 
                    alt="Khalti QR" 
                    fill 
                    className="object-cover"
                  />
                </div>
                <span className="text-sm font-medium">Khalti (Click to Zoom)</span>
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Screenshot
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {screenshot ? (
                      <div className="text-green-600 flex items-center gap-2">
                        <CheckCircle size={24} />
                        <span className="text-sm">Screenshot Uploaded</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="text-sm text-gray-500">Click to upload</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedPlan || !screenshot || loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
