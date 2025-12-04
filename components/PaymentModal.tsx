"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Upload, ZoomIn, CheckCircle, Loader2, X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  onSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, planName, amount, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<"qr" | "form" | "success">("qr");
  const [zoomedQr, setZoomedQr] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot || !phoneNumber) return;

    setIsSubmitting(true);

    try {
      // 1. Upload Screenshot
      const formData = new FormData();
      formData.append("file", screenshot);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      // 2. Submit Request
      const res = await fetch("/api/premium/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: planName,
          amount,
          screenshotUrl: url,
          phoneNumber,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      setStep("success");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <AlertDialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <div className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground cursor-pointer" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle>Enroll in {planName}</AlertDialogTitle>
            <AlertDialogDescription>
              Complete the payment to access this course.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {step === "qr" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold">Amount to Pay: <span className="text-blue-600">Rs. {amount}</span></p>
                <p className="text-sm text-gray-500">Scan any QR code below to pay</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="relative group cursor-pointer" onClick={() => setZoomedQr("/esewa-qr.jpg")}>
                  <div className="aspect-square relative border rounded-lg overflow-hidden">
                    <Image src="/esewa-qr.jpg" alt="eSewa QR" fill className="object-contain" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="opacity-0 group-hover:opacity-100 text-white drop-shadow-md" />
                    </div>
                  </div>
                  <p className="text-center mt-2 font-medium text-green-600">eSewa (Tap to zoom)</p>
                </div>

                <div className="relative group cursor-pointer" onClick={() => setZoomedQr("/khalti-qr.jpg")}>
                  <div className="aspect-square relative border rounded-lg overflow-hidden">
                    <Image src="/khalti-qr.jpg" alt="Khalti QR" fill className="object-contain" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <ZoomIn className="opacity-0 group-hover:opacity-100 text-white drop-shadow-md" />
                    </div>
                  </div>
                  <p className="text-center mt-2 font-medium text-purple-600">Khalti (Tap to zoom)</p>
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStep("form")}>
                I have made payment now move to next step
              </Button>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                <strong>Important:</strong> Verification may take up to 24 hours. Providing your phone number is mandatory so we can call you to confirm your enrollment.
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={phoneNumber}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-xs text-gray-500">We will call this number to verify your payment.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="proof" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment Screenshot <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      id="proof"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      required
                    />
                    {screenshot ? (
                      <div className="flex items-center justify-center text-green-600">
                        <CheckCircle className="mr-2" size={20} />
                        <span className="truncate max-w-[200px]">{screenshot.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-500">
                        <Upload className="mb-2" size={24} />
                        <span>Click to upload transaction proof</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("qr")} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Verification"
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="text-center space-y-6 py-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Request Submitted!</h3>
                <p className="text-gray-500 mt-2">
                  We have received your payment details. Our team will verify your transaction and approve your enrollment within 24 hours.
                </p>
              </div>
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Zoom Modal */}
      {zoomedQr && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setZoomedQr(null)}
        >
          <div className="relative max-w-full max-h-full aspect-square w-[500px] bg-white p-2 rounded-lg">
            <Image src={zoomedQr} alt="Zoomed QR" fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  );
}
