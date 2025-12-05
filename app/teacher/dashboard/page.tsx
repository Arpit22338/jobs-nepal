"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, DollarSign, Edit, PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [stats, setStats] = useState({ enrollments: 0, earnings: 0 });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "TEACHER") {
        router.push("/");
        return;
      }

      // Check Activation & KYC
      Promise.all([
        fetch("/api/teacher/activation").then(res => res.json()),
        fetch("/api/teacher/kyc").then(res => res.json()),
        fetch("/api/teacher/course").then(res => res.json())
      ]).then(([activationData, kycData, courseData]) => {
        
        if (!activationData.request || activationData.request.status !== "APPROVED") {
          router.push("/teacher/verification");
          return;
        }
        
        if (!kycData.record || kycData.record.status !== "APPROVED") {
          router.push("/teacher/kyc");
          return;
        }

        if (courseData.course) {
          setCourse(courseData.course);
          setStats({
            enrollments: courseData.course.enrollments.length,
            earnings: courseData.course.enrollments.filter((e: any) => e.status === "APPROVED").length * courseData.course.priceNpr
          });
        }
        setLoading(false);
      });
    }
  }, [status, session, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Enrollments</h3>
            <Users className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.enrollments}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Total Earnings (Est.)</h3>
            <DollarSign className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">Rs. {stats.earnings}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-medium">Course Status</h3>
            <BookOpen className="text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {course ? (course.isPublished ? "Published" : "Draft") : "No Course"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">My Course</h2>
          {course && (
            <Link 
              href="/teacher/course/edit" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Edit size={18} /> Edit Course
            </Link>
          )}
        </div>

        <div className="p-8 text-center">
          {course ? (
            <div className="text-left">
              <div className="flex gap-6">
                {course.thumbnailUrl && (
                  <Image 
                    src={course.thumbnailUrl} 
                    alt="Thumbnail" 
                    width={192} 
                    height={128} 
                    className="w-48 h-32 object-cover rounded-lg" 
                  />
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Price: Rs. {course.priceNpr}</span>
                    <span>Duration: {Math.round(course.totalRequiredMinutes / 60)} Hours</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">You haven&apos;t created a course yet</h3>
              <p className="text-gray-500 mb-6">Start sharing your knowledge by creating your first course.</p>
              <Link 
                href="/teacher/course/create" 
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={20} /> Create Course
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Recent Enrollments</h2>
          <Link href="/teacher/enrollments" className="text-blue-600 hover:underline text-sm">View All</Link>
        </div>
        <div className="p-6">
            {course?.enrollments?.length > 0 ? (
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b text-gray-500 text-sm">
                            <th className="pb-3">Student</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {course.enrollments.slice(0, 5).map((enrollment: any) => (
                            <tr key={enrollment.id} className="border-b last:border-0">
                                <td className="py-4 font-medium">{enrollment.user.name || enrollment.user.email}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        enrollment.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                        enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {enrollment.status}
                                    </span>
                                </td>
                                <td className="py-4 text-gray-500 text-sm">
                                    {new Date(enrollment.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-500 text-center py-4">No enrollments yet.</p>
            )}
        </div>
      </div>
    </div>
  );
}
