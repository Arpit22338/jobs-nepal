import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

async function updateReportStatus(formData: FormData) {
  "use server";
  const reportId = formData.get("reportId") as string;
  const status = formData.get("status") as string;
  
  if (!reportId || !status) return;

  await prisma.report.update({
    where: { id: reportId },
    data: { status },
  });
  
  revalidatePath("/admin/reports");
}

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: {
        select: { name: true, email: true },
      },
      targetJob: {
        select: { id: true, title: true },
      },
      targetUser: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm">{reports.length} reports</p>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-accent/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="bx bx-flag text-3xl text-muted-foreground"></i>
                    </div>
                    <p className="text-muted-foreground">No reports found.</p>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="text-foreground font-medium">{report.reporter.name}</div>
                      <div className="text-xs text-muted-foreground">{report.reporter.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.targetJob ? (
                        <Link href={`/jobs/${report.targetJob.id}`} className="text-primary hover:underline">
                          Job: {report.targetJob.title}
                        </Link>
                      ) : report.targetUser ? (
                        <Link href={`/profile/${report.targetUser.id}`} className="text-primary hover:underline">
                          User: {report.targetUser.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Unknown Target</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">
                      {report.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        report.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        report.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {report.status === 'PENDING' && (
                        <>
                          <form action={updateReportStatus} className="inline">
                            <input type="hidden" name="reportId" value={report.id} />
                            <input type="hidden" name="status" value="RESOLVED" />
                            <button type="submit" className="text-green-400 hover:text-green-300 transition-colors">Resolve</button>
                          </form>
                          <form action={updateReportStatus} className="inline">
                            <input type="hidden" name="reportId" value={report.id} />
                            <input type="hidden" name="status" value="DISMISSED" />
                            <button type="submit" className="text-muted-foreground hover:text-foreground transition-colors">Dismiss</button>
                          </form>
                        </>
                      )}
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
