import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CertificateTemplate from "@/components/CertificateTemplate";
import { redirect } from "next/navigation";

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600">Certificate Not Found</h1>
        <p className="text-gray-600">The certificate you are looking for does not exist.</p>
      </div>
    );
  }

  // Optional: Check if the user is allowed to view this certificate
  // For now, we allow anyone with the link to view it (common for verification), 
  // or you can restrict it to the owner and admins.
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
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
