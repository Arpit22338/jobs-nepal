import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteUserButton from "@/components/DeleteUserButton";
import TogglePremiumButton from "@/components/TogglePremiumButton";
import Link from "next/link";
import { Users, FileText, GraduationCap, CreditCard } from "lucide-react";
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <TeacherLoginToggle initialValue={teacherLoginEnabled} />
      {/* Quick Actions / Management Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/admin/teacher-activation" className="block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            {pendingActivations > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                {pendingActivations} Pending
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Teacher Activations</h3>
          <p className="text-sm text-gray-500">Approve teacher payments</p>
        </Link>

        <Link href="/admin/kyc" className="block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-6 h-6 text-purple-600" />
            {pendingKyc > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                {pendingKyc} Pending
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">KYC Requests</h3>
          <p className="text-sm text-gray-500">Verify teacher documents</p>
        </Link>

        <Link href="/admin/enrollments" className="block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="w-6 h-6 text-green-600" />
            {pendingEnrollments > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                {pendingEnrollments} Pending
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-green-600">Course Enrollments</h3>
          <p className="text-sm text-gray-500">Approve student payments</p>
        </Link>

        <Link href="/admin/premium-requests" className="block p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition group">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-600">Premium Requests</h3>
          <p className="text-sm text-gray-500">Approve job seeker premium</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600">{userCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-700">Total Jobs</h3>
          <p className="text-3xl font-bold text-green-600">{jobCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-700">Total Courses</h3>
          <p className="text-3xl font-bold text-purple-600">{courseCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'EMPLOYER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TogglePremiumButton 
                      userId={user.id} 
                      isPremium={user.isPremium} 
                      premiumExpiresAt={(user as any).premiumExpiresAt}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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

