import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteJobButton from "@/components/DeleteJobButton";
import RepostJobButton from "@/components/RepostJobButton";
import { PlusCircle, Briefcase, Eye, Users, Search } from "lucide-react";

export default async function EmployerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const jobs = await prisma.job.findMany({
    where: { employerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Employer Dashboard</h1>
          <p className="text-muted-foreground font-medium">Manage your job postings and find top talent.</p>
        </div>
        <Link
          href="/employer/jobs/new"
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          <PlusCircle size={24} /> Post New Job
        </Link>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-white/40">
        <div className="p-8 border-b border-border/50 bg-accent/10 flex items-center gap-2">
          <Briefcase className="text-primary" />
          <h2 className="text-2xl font-black text-foreground">Active Listings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/30">
            <thead className="bg-accent/20 font-black uppercase tracking-widest text-[10px] text-muted-foreground">
              <tr>
                <th className="px-8 py-4 text-left">Job Position</th>
                <th className="px-8 py-4 text-left">Posted Date</th>
                <th className="px-8 py-4 text-left">Engagement</th>
                <th className="px-8 py-4 text-left">Status</th>
                <th className="px-8 py-4 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="bg-card/40 divide-y divide-border/30">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-muted-foreground font-bold">
                    <div className="w-20 h-20 bg-accent/50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-dashed border-border/50">
                      <Search size={32} className="opacity-20" />
                    </div>
                    You haven&apos;t posted any opportunities yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-accent/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="text-lg font-black text-foreground group-hover:text-primary transition-colors">{job.title}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full"></div>
                        {job.location}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-muted-foreground">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <Link href={`/employer/jobs/${job.id}/applications`} className="flex items-center gap-2 text-primary font-black text-sm hover:underline">
                          <Users size={16} />
                          {job._count.applications} Applicants
                        </Link>
                        <div className="flex items-center gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-wider">
                          <Eye size={12} />
                          {job.views} Social Reach
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-600 border border-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                        >
                          View Live
                        </Link>
                        <div className="h-4 w-px bg-border/40"></div>
                        <RepostJobButton jobId={job.id} />
                        <div className="h-4 w-px bg-border/40"></div>
                        <DeleteJobButton jobId={job.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
