import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { applyForJob, deleteQuestion, createAnswer, deleteAnswer } from "@/app/actions";
import { Trash2, MessageCircle, MapPin, Briefcase, Zap, Star, ShieldCheck, Send } from "lucide-react";
import ReportButton from "@/components/ReportButton";
import SaveJobButton from "@/components/SaveJobButton";

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

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
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
                      await applyForJob(job.id, job.employerId);
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

          {/* QnA Section */}
          <section className="space-y-8 pt-8 border-t border-border/40">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-foreground">Community Q&A</h2>
              <div className="px-4 py-1.5 bg-accent rounded-full text-[10px] font-black text-primary uppercase tracking-widest">
                {job.questions.length} Discussion{job.questions.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Ask Question Form */}
            {session?.user.role === "JOBSEEKER" && (
              <form action={async (formData) => {
                "use server";
                const content = formData.get("content");
                if (!content) return;

                await prisma.question.create({
                  data: {
                    content: content as string,
                    jobId: job.id,
                    userId: session.user.id,
                  },
                });
              }} className="relative">
                <input
                  name="content"
                  type="text"
                  placeholder="Got a question? Ask the employer publicly..."
                  className="w-full pl-6 pr-24 py-5 bg-accent/20 border-2 border-transparent focus:border-primary/30 rounded-[28px] focus:outline-none focus:bg-background transition-all text-foreground font-bold placeholder:text-muted-foreground/50 shadow-inner"
                  required
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground font-black px-6 py-2.5 rounded-2xl hover:bg-primary/90 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20">
                  <Send size={16} /> Post
                </button>
              </form>
            )}

            <div className="space-y-8">
              {job.questions.length === 0 ? (
                <div className="text-center py-12 glass-card rounded-3xl border-dashed border-2">
                  <MessageCircle size={40} className="text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold">Be the first to start the conversation!</p>
                </div>
              ) : (
                job.questions.map((q: any) => (
                  <div key={q.id} className="space-y-4">
                    <div className="glass-card p-6 rounded-[32px] border-primary/10">
                      <div className="flex items-start gap-4 mb-4">
                        <Link href={`/profile/${q.userId}`} className="flex-shrink-0 group">
                          {q.user.image ? (
                            <Image
                              src={q.user.image}
                              alt={q.user.name || "User"}
                              width={48}
                              height={48}
                              className="rounded-2xl object-cover border-2 border-accent group-hover:border-primary transition-colors"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-primary font-black uppercase text-xl group-hover:bg-primary/10 transition-colors">
                              {q.user.name?.[0] || "U"}
                            </div>
                          )}
                        </Link>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <Link href={`/profile/${q.userId}`} className="font-black text-foreground hover:text-primary transition-colors">
                              {q.user.name}
                            </Link>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{q.createdAt.toLocaleDateString()}</span>
                              {(session?.user.id === q.userId || session?.user.id === job.employerId || session?.user.role === "ADMIN") && (
                                <form action={async () => {
                                  "use server";
                                  await deleteQuestion(q.id);
                                }}>
                                  <button type="submit" className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 size={16} />
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>
                          <p className="text-foreground/90 font-medium text-lg leading-relaxed mt-2">{q.content}</p>
                        </div>
                      </div>

                      {/* Answers Section */}
                      <div className="ml-16 space-y-4">
                        {q.answers.map((answer: any) => (
                          <div key={answer.id} className="bg-accent/30 p-4 rounded-2xl border border-border/40 relative">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                <span className="font-black text-sm text-foreground">
                                  {answer.user.name}
                                </span>
                                {answer.userId === job.employerId && (
                                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider border border-primary/20">
                                    Employer
                                  </span>
                                )}
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                  {answer.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                              {(session?.user.id === answer.userId || session?.user.role === "ADMIN") && (
                                <form action={async () => {
                                  "use server";
                                  await deleteAnswer(answer.id);
                                }}>
                                  <button type="submit" className="text-red-400 hover:text-red-600 p-1.5 transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                </form>
                              )}
                            </div>
                            <p className="text-muted-foreground font-medium text-base">{answer.content}</p>
                          </div>
                        ))}

                        {/* Reply Form */}
                        {session && (
                          <form action={async (formData) => {
                            "use server";
                            const content = formData.get("content");
                            if (!content) return;
                            await createAnswer(q.id, content as string);
                          }} className="flex gap-2 group">
                            <input
                              name="content"
                              type="text"
                              placeholder="Share your thoughts..."
                              className="flex-1 bg-accent/20 border-2 border-transparent focus:border-primary/20 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none transition-all"
                              required
                            />
                            <button type="submit" className="bg-accent hover:bg-primary/10 text-primary font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2">
                              <MessageCircle size={16} /> Reply
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
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

          <section className="glass-card p-8 rounded-[38px] bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
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
