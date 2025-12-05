"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  certificateId: string;
}

export default function CertificateTemplate({
  studentName,
  courseName,
  completionDate,
  instructorName,
  certificateId,
}: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      setIsGenerating(true);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Certificate-${studentName}-${courseName}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-end w-full max-w-4xl">
        <Button onClick={handleDownload} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </>
          )}
        </Button>
      </div>

      {/* Certificate Container */}
      <div
        ref={certificateRef}
        className="relative w-[800px] h-[600px] bg-white text-gray-900 font-serif border-8 border-double border-gray-800 p-12 flex flex-col items-center justify-between shadow-2xl"
        style={{
          backgroundImage: "radial-gradient(circle, #fdfbf7 0%, #f4f1ea 100%)",
        }}
      >
        {/* Decorative Corners */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-600" />
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-600" />
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-600" />
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-600" />

        {/* Header */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
             {/* Logo Placeholder */}
             <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
                JN
             </div>
             <h1 className="text-2xl font-bold text-blue-900 tracking-widest uppercase">Jobs Nepal</h1>
          </div>
          <h2 className="text-5xl font-bold text-gray-800 mb-2 uppercase tracking-wide" style={{ fontFamily: 'serif' }}>
            Certificate
          </h2>
          <p className="text-xl text-gray-600 uppercase tracking-widest">of Completion</p>
        </div>

        {/* Body */}
        <div className="text-center w-full max-w-2xl">
          <p className="text-lg text-gray-500 italic mb-4">This is to certify that</p>
          <h3 className="text-4xl font-bold text-blue-900 mb-2 border-b-2 border-gray-300 pb-2 inline-block min-w-[400px]">
            {studentName}
          </h3>
          <p className="text-lg text-gray-500 italic mt-4 mb-2">has successfully completed the course</p>
          <h4 className="text-3xl font-bold text-gray-800 mb-6">
            {courseName}
          </h4>
          <p className="text-gray-600">
            Demonstrating dedication and proficiency in the subject matter.
          </p>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-between items-end mt-8 px-12">
          <div className="text-center">
            <div className="w-48 border-b border-gray-400 mb-2 pb-1">
              <p className="font-signature text-2xl text-blue-900">{instructorName}</p>
            </div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Instructor</p>
          </div>

          <div className="text-center">
             {/* Seal */}
             <div className="w-24 h-24 rounded-full border-4 border-yellow-600 flex items-center justify-center text-yellow-700 font-bold text-xs uppercase tracking-widest text-center p-2 rotate-12 opacity-80">
                Official<br/>Seal
             </div>
          </div>

          <div className="text-center">
            <div className="w-48 border-b border-gray-400 mb-2 pb-1">
              <p className="text-lg text-gray-800">{new Date(completionDate).toLocaleDateString()}</p>
            </div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Date</p>
          </div>
        </div>

        {/* ID */}
        <div className="absolute bottom-2 right-4 text-[10px] text-gray-400">
          ID: {certificateId}
        </div>
      </div>
    </div>
  );
}
