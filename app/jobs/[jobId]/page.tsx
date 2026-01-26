import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { applyForJob } from "@/app/actions";
import { MessageCircle, MapPin, Briefcase, Zap, Star, ShieldCheck } from "lucide-react";
import ReportButton from "@/components/ReportButton";
import SaveJobButton from "@/components/SaveJobButton";
import QnaSection from "@/components/QnaSection";
import { Metadata } from "next";

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const { jobId } = await params;
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { title: true, description: true, location: true }
  });

  if (!job) return { title: "Job Not Found" };

  return {
    title: `${job.title} in ${job.location}`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: `${job.title} | Rojgaar Nepal`,
      description: job.description.substring(0, 160),
      type: "article",
    },
  };
}

interface Props {
  params: Promise<{
    jobId: string;
  }>;
}

export default async function JobDetailsPage({ params }: Props) {
  const { jobId } = await params;
  const session = await getServerSession(authOptions);
  const job: any = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      employer: {
        include: {
          employerProfile: true,
        },
      },
      questions: {
        include: {
          user: true,
          answers: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  } as any);

  if (!job) {
    notFound();
  }

  // Increment views
  await prisma.job.update({
    where: { id: jobId },
    data: { views: { increment: 1 } },
  });

  // Check if user has completed profile
  let hasCompletedProfile = false;
  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { jobSeekerProfile: true },
    });

    if (user?.jobSeekerProfile && (user.jobSeekerProfile.skills || user.jobSeekerProfile.experience || user.jobSeekerProfile.bio)) {
      hasCompletedProfile = true;
    }
  }

  // Check if already applied
  let hasApplied = false;
  let isSaved = false;
  if (session?.user) {
    const application = await prisma.application.findFirst({
      where: {
        jobId: jobId,
        userId: session.user.id,
      },
    });
    if (application) hasApplied = true;

    const saved = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: session.user.id,
          jobId: jobId,
        },
      },
    });
    if (saved) isSaved = true;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "datePosted": job.createdAt.toISOString(),
    "validThrough": job.expiresAt?.toISOString(),
    "employmentType": job.type,
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.employer.employerProfile?.companyName || "Private Employer",
      "sameAs": job.employer.employerProfile?.website || "https://rojgaarnepal.com",
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "NP",
      },
    },
    "baseSalary": job.salaryMin ? {
      "@type": "MonetaryAmount",
      "currency": "NPR",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.salaryMin,
        "maxValue": job.salaryMax,
        "unitText": "MONTH"
      }
    } : undefined,
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Job Header Card */}
      <div className="glass-card p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-3xl font-black text-primary shadow-inner">
                {job.employer.employerProfile?.companyName?.charAt(0) || "C"}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                    {job.type}
                  </span>
                  {job.employer.employerProfile?.isVerified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                      <ShieldCheck size={14} /> Verified Employer
                    </span>
                  )}
                </div>
                <h1 className="text-4xl font-black text-foreground leading-tight tracking-tight">{job.title}</h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-muted-foreground font-bold text-sm uppercase tracking-wide">
              <Link href={`/profile/${job.employerId}`} className="text-primary hover:underline flex items-center gap-2">
                <Briefcase size={18} />
                {job.employer.employerProfile?.companyName || job.employer.name}
              </Link>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-primary" />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                {job.views} Views
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-6 w-full md:w-auto">
            {session?.user.id === job.employerId ? (
              <div className="bg-green-500/10 text-green-600 border border-green-200 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">
                Creator View
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full md:w-48">
                <div className="flex items-center justify-end gap-3">
                  <SaveJobButton jobId={job.id} initialSaved={isSaved} />
                  <ReportButton targetJobId={job.id} />
                </div>

                <div className="space-y-3">
                  {hasApplied ? (
                    <div className="w-full bg-green-500 text-white font-black px-6 py-4 rounded-2xl text-center shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                      <Star size={18} fill="currentColor" /> Already Applied
                    </div>
                  ) : hasCompletedProfile ? (
                    <form action={async () => {
                      "use server";
                      await applyForJob(job.id);
                    }}>
                      <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black px-6 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center">
                        Apply Instantly
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/profile/edit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-4 rounded-2xl shadow-xl shadow-orange-500/20 block text-center transform hover:scale-[1.02] transition-all">
                        Setup Profile
                      </Link>
                      <p className="text-[10px] text-red-500 font-bold text-center uppercase tracking-tighter">Requires Skills & Experience</p>
                    </div>
                  )}
                  <Link href={`/messages/${job.employerId}`} className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-primary/10 text-primary font-black px-6 py-3 rounded-2xl transition-all border border-transparent hover:border-primary/20">
                    <MessageCircle size={18} /> Chat
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-black text-foreground border-l-4 border-primary pl-4">Job Mission</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap glass-card p-6 md:p-8 rounded-3xl">
              {job.description}
            </div>
          </section>

          <QnaSection
            initialQuestions={job.questions}
            jobId={job.id}
            currentUserId={session?.user?.id}
            employerId={job.employerId}
            isAdmin={session?.user?.role === "ADMIN"}
          />
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <section className="glass-card p-8 rounded-[38px] space-y-8">
            <div className="space-y-2">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Compensation</h3>
              <p className="text-3xl font-black text-foreground">
                {job.salary ? <><span className="text-sm mr-1 text-muted-foreground">NPR</span>{job.salary}</> : "Negotiable"}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills ? job.requiredSkills.split(",").map((skill: any, index: number) => (
                  <span key={index} className="bg-accent/50 text-foreground font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider border border-border/40 hover:bg-primary/10 hover:border-primary/20 transition-all cursor-default">
                    {skill.trim()}
                  </span>
                )) : <span className="text-muted-foreground font-bold text-sm italic">General profile requirements</span>}
              </div>
            </div>

            <div className="pt-8 border-t border-border/40 space-y-4">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Employment Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-bold">Role Type</span>
                  <span className="text-foreground font-black">{job.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-bold">Location</span>
                  <span className="text-foreground font-black">{job.location}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-bold">Activity</span>
                  <span className="text-foreground font-black">{job.views} Views</span>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card p-8 rounded-[38px] bg-linear-to-br from-primary/5 to-transparent border-primary/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-black text-foreground leading-tight">Trust & Safety Shield</h3>
            </div>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Every company on RojgaarNepal undergoes a rigorous multi-step verification process. Your data and application status are encrypted and handled with the highest security standards.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
