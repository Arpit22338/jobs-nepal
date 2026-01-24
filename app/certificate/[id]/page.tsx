import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CertificateTemplate from "@/components/CertificateTemplate";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const certificate = await prisma.certificate.findUnique({
    where: { id },
    include: {
      user: true,
      course: true,
    },
  });

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center px-4">
        <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center text-red-500">
          <AlertTriangle size={48} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Certificate Not Found</h1>
          <p className="text-muted-foreground font-medium mt-2">The certificate ID you provided does not exist in our registry.</p>
        </div>
        <Link href="/">
          <Button className="rounded-xl font-bold px-8">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/20 flex flex-col items-center justify-center p-4 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>

      <CertificateTemplate
        studentName={certificate.user.name || "Student"}
        courseName={certificate.course.title}
        completionDate={certificate.issuedAt.toISOString()}
        instructorName={certificate.course.instructor || "Jobs Nepal Instructor"}
        certificateId={certificate.id}
      />
    </div>
  );
}
