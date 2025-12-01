import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { applyForJob, deleteQuestion, createAnswer, deleteAnswer } from "@/app/actions";
import { Trash2, MessageCircle } from "lucide-react";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    
    console.log("User Profile Check:", user?.jobSeekerProfile);

    // Relaxed check: just ensure the profile record exists and has at least one field filled
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
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md border">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <div className="text-gray-600 mb-4">
              <Link href={`/profile/${job.employerId}`} className="font-semibold hover:underline hover:text-blue-600">
                {job.employer.employerProfile?.companyName || job.employer.name}
              </Link>
              <span className="mx-2">•</span>
              <span>{job.location}</span>
              <span className="mx-2">•</span>
              <span>{job.type}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            {session?.user.id === job.employerId ? (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Your Job Post
                </span>
            ) : (
                <>
                  <div className="flex items-center gap-2">
                      <SaveJobButton jobId={job.id} initialSaved={isSaved} />
                      <ReportButton targetJobId={job.id} />
                  </div>
                  
                  <div className="flex flex-col gap-2 items-end">
                    {hasApplied ? (
                      <button disabled className="bg-green-600 text-white px-6 py-2 rounded-md cursor-not-allowed opacity-80">
                        Applied
                      </button>
                    ) : hasCompletedProfile ? (
                      <form action={async () => {
                        "use server";
                        await applyForJob(job.id, job.employerId);
                      }}>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-full">
                          Apply Now
                        </button>
                      </form>
                    ) : (
                      <div className="text-right">
                        <Link href="/profile/edit" className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 inline-block mb-1">
                          Complete Profile to Apply
                        </Link>
                        <p className="text-xs text-red-500">Skills & Experience required</p>
                      </div>
                    )}
                    <Link href={`/messages/${job.employerId}`} className="text-blue-600 text-sm hover:underline text-center border border-blue-600 rounded px-4 py-1">
                      Message Employer
                    </Link>
                  </div>
                </>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Job Description</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Salary</h2>
          <p className="text-gray-700">{job.salary ? `Rs. ${job.salary}` : "Not specified"}</p>
        </div>

        {job.requiredSkills && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {job.requiredSkills.split(",").map((skill: any, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* QnA Section */}
        <div className="mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Questions & Answers</h2>
          
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
              // In a real app, use revalidatePath
            }} className="mb-8">
              <div className="flex gap-4">
                <input
                  name="content"
                  type="text"
                  placeholder="Ask a question about this job..."
                  className="flex-1 border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                  Ask
                </button>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {job.questions.length === 0 ? (
              <p className="text-gray-500 italic">No questions yet. Be the first to ask!</p>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              job.questions.map((q: any) => (
                <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3 mb-2">
                    <Link href={`/profile/${q.userId}`} className="flex-shrink-0">
                      {q.user.image ? (
                        <Image
                          src={q.user.image}
                          alt={q.user.name || "User"}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {q.user.name?.[0] || "U"}
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <Link href={`/profile/${q.userId}`} className="font-semibold text-gray-900 hover:underline">
                          {q.user.name}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{q.createdAt.toLocaleDateString()}</span>
                          {(session?.user.id === q.userId || session?.user.id === job.employerId || session?.user.role === "ADMIN") && (
                            <form action={async () => {
                              "use server";
                              await deleteQuestion(q.id);
                            }}>
                              <button type="submit" className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={14} />
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-800 mt-1">{q.content}</p>
                    </div>
                  </div>
                  
                  {/* Answers Section */}
                  <div className="ml-14 space-y-3 mt-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {q.answers.map((answer: any) => (
                      <div key={answer.id} className="bg-white p-3 rounded border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">
                              {answer.user.name}
                              {answer.userId === job.employerId && (
                                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                  Employer
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-gray-500">
                              {answer.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                          {(session?.user.id === answer.userId || session?.user.role === "ADMIN") && (
                            <form action={async () => {
                              "use server";
                              await deleteAnswer(answer.id);
                            }}>
                              <button type="submit" className="text-red-500 hover:text-red-700 p-1">
                                <Trash2 size={12} />
                              </button>
                            </form>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm">{answer.content}</p>
                      </div>
                    ))}

                    {/* Reply Form */}
                    {session && (
                      <form action={async (formData) => {
                        "use server";
                        const content = formData.get("content");
                        if (!content) return;
                        await createAnswer(q.id, content as string);
                      }} className="mt-2">
                        <div className="flex gap-2">
                          <input
                            name="content"
                            type="text"
                            placeholder="Reply to this question..."
                            className="flex-1 border rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
                            required
                          />
                          <button type="submit" className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 flex items-center gap-1">
                            <MessageCircle size={14} />
                            Reply
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
