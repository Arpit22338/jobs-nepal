"use client";

// Force refresh
import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
// Force TS re-check
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

interface CourseEnrollmentModalProps {
  courseId: string;
  courseTitle: string;
  price: number;
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export function CourseEnrollmentModal({
  courseId,
  courseTitle,
  price,
  isOpen: controlledIsOpen,
  onClose,
  trigger,
}: CourseEnrollmentModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const { toast } = useToast();

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (isControlled) {
      if (!open && onClose) onClose();
    } else {
      setInternalIsOpen(open);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!paymentPhone || !paymentScreenshot) {
      toast({
        title: "Missing information",
        description: "Please provide your phone number and payment screenshot.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          paymentPhone,
          paymentScreenshot,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to enroll");
      }

      toast({
        title: "Enrollment Request Sent",
        description: "Your enrollment is pending approval. You will be notified soon.",
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll in {courseTitle}</DialogTitle>
          <DialogDescription>
            To enroll, please pay NPR {price} via eSewa/Khalti and upload the screenshot.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center cursor-pointer" onClick={() => setZoomedImage("/esewa-qr.jpg")}>
                <div className="w-44 h-44 relative border rounded-lg overflow-hidden mx-auto">
                  <Image src="/esewa-qr.jpg" alt="eSewa" fill className="object-contain" />
                </div>
                <div className="text-xs mt-2 font-medium text-green-600">eSewa (Tap to zoom)</div>
              </div>

              <div className="text-center cursor-pointer" onClick={() => setZoomedImage("/khalti-qr.jpg")}>
                <div className="w-44 h-44 relative border rounded-lg overflow-hidden mx-auto">
                  <Image src="/khalti-qr.jpg" alt="Khalti" fill className="object-contain" />
                </div>
                <div className="text-xs mt-2 font-medium text-purple-600">Khalti (Tap to zoom)</div>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="phone">Payment Phone Number</Label>
            <Input
              id="phone"
              placeholder="98XXXXXXXX"
              value={paymentPhone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentPhone(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="screenshot">Payment Screenshot</Label>
            <div className="flex items-center gap-2">
              <Input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label
                htmlFor="screenshot"
                className="flex items-center justify-center w-full h-32 px-4 transition bg-card border-2 border-border border-dashed rounded-md appearance-none cursor-pointer hover:border-primary/50 focus:outline-none"
              >
                {paymentScreenshot ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={paymentScreenshot}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <span className="flex items-center space-x-2">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">
                      Click to upload screenshot
                    </span>
                  </span>
                )}
              </Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Enrollment
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
      {/* Zoom Modal */}
      {zoomedImage && createPortal(
        <div 
          className="fixed inset-0 z-9999 bg-black/90 flex flex-col items-center justify-center p-4 cursor-pointer pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            setZoomedImage(null);
          }}
        >
          <div className="relative w-full max-w-[500px] aspect-square bg-white p-2 rounded-lg shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoomedImage} alt="Zoomed QR" className="w-full h-full object-contain" />
          </div>
          <p className="text-white mt-6 text-lg font-medium animate-pulse">Tap anywhere to go back</p>
        </div>,
        document.body
      )}
    </>
  );
}
