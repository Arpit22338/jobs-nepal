import React from "react";
import { Award } from "lucide-react";

export interface CertificateLayoutProps {
  studentName: string;
  courseTitle: string;
  completionDate?: string;
  instructorName?: string;
  logoSrc?: string; // base64 or url
  signSrc?: string; // base64 or url
  certificateId?: string;
}

// Forward ref to the certificate root so html2canvas can target it
const CertificateLayout = React.forwardRef<HTMLDivElement, CertificateLayoutProps>(
  (
    {
      studentName,
      courseTitle,
      completionDate,
      instructorName = "Arpit Kafle",
      logoSrc,
      signSrc,
      certificateId,
    },
    ref
  ) => {
    const dateText = completionDate ? new Date(completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString();

    return (
      <div className="w-full flex items-center justify-center p-8">
        <div
          ref={ref}
          className="relative bg-[#FFFAF0] text-slate-900 shadow-2xl"
          style={{
            width: 800,
            height: 600,
            maxWidth: "100%",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px",
          }}
        >
          {/* Decorative Border */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              right: 10,
              bottom: 10,
              border: "2px solid #B45309", // Amber-700
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 15,
              left: 15,
              right: 15,
              bottom: 15,
              border: "1px solid #B45309", // Amber-700
              opacity: 0.3,
              pointerEvents: "none",
            }}
          />

          {/* Corner Ornaments (CSS only for portability) */}
          <div style={{ position: "absolute", top: 10, left: 10, width: 60, height: 60, borderTop: "4px solid #B45309", borderLeft: "4px solid #B45309" }} />
          <div style={{ position: "absolute", top: 10, right: 10, width: 60, height: 60, borderTop: "4px solid #B45309", borderRight: "4px solid #B45309" }} />
          <div style={{ position: "absolute", bottom: 10, left: 10, width: 60, height: 60, borderBottom: "4px solid #B45309", borderLeft: "4px solid #B45309" }} />
          <div style={{ position: "absolute", bottom: 10, right: 10, width: 60, height: 60, borderBottom: "4px solid #B45309", borderRight: "4px solid #B45309" }} />

          {/* Background Pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "radial-gradient(#B45309 0.5px, transparent 0.5px), radial-gradient(#B45309 0.5px, #FFFAF0 0.5px)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
              opacity: 0.03,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />

          {/* Content Layer */}
          <div style={{ zIndex: 10, width: "100%", height: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
                {logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoSrc} alt="Logo" style={{ height: 40, width: "auto" }} />
                ) : (
                  <Award size={40} color="#B45309" />
                )}
                <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 3, color: "#B45309", textTransform: "uppercase" }}>RojgaarNepal Academy</div>
              </div>
              <h1 style={{ fontFamily: "serif", fontSize: 48, fontWeight: 700, color: "#1e3a8a", margin: 0, lineHeight: 1 }}>Certificate of Completion</h1>
            </div>

            {/* Main Body */}
            <div style={{ textAlign: "center", width: "80%" }}>
              <p style={{ fontFamily: "serif", fontSize: 18, fontStyle: "italic", color: "#4b5563", marginBottom: 16 }}>This credentials is proudly presented to</p>

              <div style={{
                fontFamily: "serif",
                fontSize: 42,
                fontWeight: 700,
                color: "#0f172a",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: 8,
                marginBottom: 24,
                width: "100%"
              }}>
                {studentName}
              </div>

              <p style={{ fontFamily: "serif", fontSize: 18, fontStyle: "italic", color: "#4b5563", marginBottom: 16 }}>
                for successfully completing the rigorous curriculum and demonstrating proficiency in
              </p>

              <div style={{
                fontFamily: "sans-serif",
                fontSize: 32,
                fontWeight: 800,
                color: "#B45309",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10
              }}>
                {courseTitle}
              </div>

              <p style={{ fontSize: 14, color: "#6b7280" }}>
                Verified Certificate ID: <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{certificateId || "OFFICIAL-RN-CERT"}</span>
              </p>
            </div>

            {/* Footer */}
            <div style={{
              width: "100%",
              marginTop: 50,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              padding: "0 60px"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#374151",
                  borderBottom: "2px solid #9ca3af",
                  paddingBottom: 4,
                  minWidth: 150,
                  marginBottom: 8
                }}>
                  {dateText}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: 1 }}>Date Issued</div>
              </div>

              {/* Gold Seal */}
              <div style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "conic-gradient(#D97706, #F59E0B, #D97706, #B45309, #D97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                border: "4px solid white"
              }}>
                <div style={{ width: 84, height: 84, borderRadius: "50%", border: "1px dashed rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Award size={40} color="white" />
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ minWidth: 150, display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "2px solid #9ca3af", paddingBottom: 4, marginBottom: 8 }}>
                  {signSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={signSrc} alt="Signature" style={{ height: 80, width: "auto" }} />
                  ) : (
                    <div style={{ fontFamily: "cursive", fontSize: 24, color: "#1e3a8a" }}>{instructorName}</div>
                  )}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#9ca3af", letterSpacing: 1 }}>
                  Arpit Kafle<br />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>CEO, RojgaarNepal</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
);

CertificateLayout.displayName = "CertificateLayout";

export default CertificateLayout;
