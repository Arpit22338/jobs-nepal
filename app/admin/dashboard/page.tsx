import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteUserButton from "@/components/DeleteUserButton";
import Link from "next/link";
import { Users, FileText, GraduationCap } from "lucide-react";
import TeacherLoginToggle from "@/app/admin/settings/TeacherLoginToggle";
import { getSetting } from "@/lib/settings";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const userCount = await prisma.user.count();
  const jobCount = await prisma.job.count();
  const courseCount = await prisma.course.count();

  // Get pending counts
  const pendingActivations = await (prisma as any).teacherActivationRequest.count({ where: { status: "PENDING" } });
  const pendingKyc = await (prisma as any).kycRecord.count({ where: { status: "PENDING" } });
  const pendingEnrollments = await prisma.enrollment.count({ where: { status: "PENDING" } });

  const users = await prisma.user.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  const teacherLoginEnabled = (await getSetting("teacher_login_enabled")) !== "false";

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-black text-foreground">Admin Dashboard</h1>
      <div className="glass-card p-6 rounded-2xl">
        <TeacherLoginToggle initialValue={teacherLoginEnabled} />
      </div>

      {/* Quick Actions / Management Links */}
      <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/teacher-activation" className="block p-6 glass-card rounded-2xl hover:border-blue-500/30 transition group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            {pendingActivations > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-md shadow-red-500/20">
                {pendingActivations} Pending
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-blue-600 transition-colors">Teacher Activations</h3>
          <p className="text-sm text-muted-foreground">Approve teacher payments</p>
        </Link>

        <Link href="/admin/kyc" className="block p-6 glass-card rounded-2xl hover:border-purple-500/30 transition group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            {pendingKyc > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-md shadow-red-500/20">
                {pendingKyc} Pending
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-purple-600 transition-colors">KYC Requests</h3>
          <p className="text-sm text-muted-foreground">Verify teacher documents</p>
        </Link>

        <Link href="/admin/enrollments" className="block p-6 glass-card rounded-2xl hover:border-green-500/30 transition group">
          <div className="flex items-center justify-between mb-2">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-600">
              <GraduationCap className="w-6 h-6" />
            </div>
            {pendingEnrollments > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-md shadow-red-500/20">
                {pendingEnrollments} Pending
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-foreground group-hover:text-green-600 transition-colors">Course Enrollments</h3>
          <p className="text-sm text-muted-foreground">Approve student payments</p>
        </Link>
      </div>

      <h2 className="text-xl font-bold text-foreground">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-blue-500">
          <h3 className="text-lg font-semibold text-muted-foreground">Total Users</h3>
          <p className="text-4xl font-black text-foreground mt-2">{userCount}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-green-500">
          <h3 className="text-lg font-semibold text-muted-foreground">Total Jobs</h3>
          <p className="text-4xl font-black text-foreground mt-2">{jobCount}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-purple-500">
          <h3 className="text-lg font-semibold text-muted-foreground">Total Courses</h3>
          <p className="text-4xl font-black text-foreground mt-2">{courseCount}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-border/50 bg-accent/10">
          <h3 className="text-lg font-bold">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border/50">
            <thead className="bg-accent/20">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-accent/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500 dark:text-red-400' :
                        user.role === 'EMPLOYER' ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' :
                          'bg-green-500/10 text-green-500 dark:text-green-400'
                      }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.role !== "ADMIN" && <DeleteUserButton userId={user.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

