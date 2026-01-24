"use client";

import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import CertificateLayout from "@/components/CertificateLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Maximize2 } from "lucide-react";

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  certificateId?: string;
}

export default function CertificateTemplate({
  studentName,
  courseName,
  completionDate,
  instructorName,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [signBase64, setSignBase64] = useState<string>("");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.offsetWidth;
        const certWidth = 800;
        // Calculate scale needed to fit 800px into parent width, max 1
        const newScale = Math.min(parentWidth / certWidth, 1);
        setScale(newScale);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Convert logo to base64 to avoid CORS issues in html2canvas
    const getBase64FromUrl = async (url: string) => {
      try {
        const data = await fetch(url);
        if (!data.ok) throw new Error(`Failed to fetch ${url}`);
        const blob = await data.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            const base64data = reader.result;
            resolve(base64data);
          };
        });
      } catch (e) {
        console.error("Error loading image:", url, e);
        return "";
      }
    };

    // Replace these URLs with your actual assets logic or keep them empty to use default icons
    // getBase64FromUrl('/logo.png').then((base64) => setLogoBase64(base64 as string));
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const el = certificateRef.current as HTMLDivElement;

      // Temporarily reset transform for capture
      const originalTransform = el.style.transform;
      const originalMargin = el.style.margin;

      el.style.transform = "none";
      el.style.margin = "0";

      const canvas = await html2canvas(el, {
        scale: 4, // Ultra high quality
        logging: false,
        backgroundColor: '#FFFAF0',
        useCORS: true,
        allowTaint: true,
        width: 800,
        height: 600,
        windowWidth: 800,
        windowHeight: 600,
        onclone: (doc) => {
          // Ensure fonts and styles are loaded in the clone
          const clonedEl = doc.querySelector('[data-certificate="true"]') as HTMLElement;
          if (clonedEl) {
            clonedEl.style.transform = "none";
            clonedEl.style.margin = "0";
          }
        }
      });

      // Restore preview styles
      el.style.transform = originalTransform;
      el.style.margin = originalMargin;

      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Certificate-${studentName.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to generate certificate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto" ref={containerRef}>
      {/* Certificate Preview Stage */}
      <div className="relative w-full flex justify-center items-center bg-slate-900/5 rounded-[40px] p-4 md:p-12 overflow-hidden border border-border/10 inner-shadow">
        <div className="absolute top-4 right-6 flex items-center gap-2 text-muted-foreground/40 font-black uppercase tracking-widest text-[10px] pointer-events-none">
          <Maximize2 size={12} /> Live Preview
        </div>

        {/* Certificate Wrapper for Scaling */}
        <div
          style={{
            width: 800,
            height: 600,
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease-out",
            boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
        >
          <div data-certificate="true" ref={certificateRef}>
            <CertificateLayout
              studentName={studentName}
              courseTitle={courseName}
              completionDate={completionDate}
              instructorName={instructorName}
              logoSrc={logoBase64}
              signSrc={signBase64}
            />
          </div>
        </div>
      </div>

      {/* Download Controls */}
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={handleDownload}
          disabled={isGenerating}
          className="px-10 py-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Processing High-Res...
            </>
          ) : (
            <>
              <Download className="mr-3 h-5 w-5" />
              Download Official Certificate
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground font-medium">
          High-quality PNG • 3200x2400px • Verified
        </p>
      </div>
    </div>
  );
}
