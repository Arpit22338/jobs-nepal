"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, Users, DollarSign, Edit, PlusCircle, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
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

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground font-bold tracking-tight">Loading Teacher Portal...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground font-medium">Manage your knowledge and track your success.</p>
        </div>
        {course && (
          <div className="flex gap-3">
            <Link
              href="/teacher/course/exam-generator"
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold px-5 py-3 rounded-2xl transition-all"
            >
              <Sparkles size={18} /> AI Exam Generator
            </Link>
            <Link
              href="/teacher/course/edit"
              className="flex items-center gap-2 bg-accent hover:bg-primary/20 text-primary font-black px-6 py-3 rounded-2xl transition-all shadow-sm"
            >
              <Edit size={18} /> Edit Course
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-6 rounded-3xl border-l-4 border-l-blue-500 hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest">Enrollments</h3>
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600 outline-4 outline-blue-50">
              <Users size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-foreground">{stats.enrollments}</p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-tighter">Total Students Reached</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-l-4 border-l-green-500 hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest">Earnings</h3>
            <div className="p-2 bg-green-100 rounded-xl text-green-600 outline-4 outline-green-50">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-foreground">
            <span className="text-lg mr-1 text-green-600 font-bold">Rs.</span>{stats.earnings}
          </p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-tighter">Estimated Net Revenue</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border-l-4 border-l-purple-500 hover:scale-[1.02] transition-transform">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground text-xs font-black uppercase tracking-widest">Status</h3>
            <div className="p-2 bg-purple-100 rounded-xl text-purple-600 outline-4 outline-purple-50">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-4xl font-black text-foreground">
            {course ? (course.isPublished ? "Live" : "Draft") : "Offline"}
          </p>
          <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-tighter">Current Course State</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-white/40">
        <div className="p-8 border-b border-border/50 bg-accent/10">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="text-primary" />
            My Course
          </h2>
        </div>

        <div className="p-8 text-center bg-card/40">
          {course ? (
            <div className="text-left">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                <div className="relative group">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt="Thumbnail"
                      width={320}
                      height={180}
                      className="w-80 h-48 object-cover rounded-2xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-80 h-48 bg-accent flex items-center justify-center rounded-2xl">
                      <BookOpen size={48} className="text-primary/20" />
                    </div>
                  )}
                  {course.isPublished && (
                    <div className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full shadow-lg border-4 border-background">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <h3 className="text-3xl font-black text-foreground leading-tight">{course.title}</h3>
                  <p className="text-muted-foreground font-medium text-lg leading-relaxed line-clamp-3">{course.description}</p>

                  <div className="flex flex-wrap gap-4 pt-4 text-xs font-black uppercase tracking-widest">
                    <span className="px-4 py-2 bg-accent rounded-xl text-foreground/70">Rs. {course.priceNpr}</span>
                    <span className="px-4 py-2 bg-accent rounded-xl text-foreground/70">{Math.round(course.totalRequiredMinutes / 60)} Hours Duration</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 space-y-6">
              <div className="w-24 h-24 bg-accent rounded-3xl flex items-center justify-center mx-auto mb-4 border border-border/50 shadow-inner">
                <BookOpen className="text-primary/40" size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">Empty Curriculum</h3>
                <p className="text-muted-foreground font-medium max-w-sm mx-auto">You haven&apos;t created any educational content yet. Let&apos;s change that!</p>
              </div>
              <Link
                href="/teacher/course/create"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95"
              >
                <PlusCircle size={24} /> Create New Course
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border-white/40">
        <div className="p-8 border-b border-border/50 bg-accent/10 flex justify-between items-center">
          <h2 className="text-2xl font-black text-foreground">Recent Activity</h2>
          <Link href="/teacher/enrollments" className="text-primary font-black text-sm uppercase tracking-widest hover:underline flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          {course?.enrollments?.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-accent/20">
                <tr className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Verification Status</th>
                  <th className="px-8 py-4">Enrollment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {course.enrollments.slice(0, 5).map((enrollment: any) => (
                  <tr key={enrollment.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-8 py-6 font-bold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-primary font-black uppercase">
                          {(enrollment.user.name || enrollment.user.email).charAt(0)}
                        </div>
                        {enrollment.user.name || enrollment.user.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${enrollment.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                          enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-red-100 text-red-800 border-red-200'
                        }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-muted-foreground font-medium text-sm">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-muted-foreground font-medium">
              No student activity recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
