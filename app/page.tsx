import Link from "next/link";
import Image from "next/image";
import { Search, Briefcase, GraduationCap, Users, MapPin, ArrowRight, Zap, Shield, Target } from "lucide-react";
import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;

  const jobCount = await prisma.job.count();
  const jobSeekerCount = await prisma.user.count({ where: { role: "JOBSEEKER" } });
  const courseCount = (await prisma.course.count()) - 1;

  // Fetch Latest Jobs (Instead of Premium)
  const latestJobs = await prisma.job.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { employer: { include: { employerProfile: true } } }
  });

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-background overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="text-center px-4 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/50 border border-primary/20 text-primary text-sm font-medium mb-4 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Your Career Starts Here
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-foreground leading-tight">
            Unlock Your <span className="text-primary">Potential</span>
            <br />
            Build Your <span className="text-primary">Future</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            Connecting ambitious talent with visionary employers across Nepal.
            Find meaningful work, master new skills, and accelerate your career growth.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            {user?.role === "TEACHER" ? (
              <>
                <Link
                  href="/teacher/course"
                  className="inline-flex h-14 items-center justify-center px-8 py-3 text-lg font-bold text-white bg-primary rounded-full hover:bg-primary/90 shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Briefcase className="mr-2" size={22} />
                  Start Teaching
                </Link>
                <Link
                  href="/teacher/dashboard"
                  className="inline-flex h-14 items-center justify-center px-8 py-3 text-lg font-bold text-foreground bg-white border border-input rounded-full hover:bg-accent hover:text-primary shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/jobs"
                  className="inline-flex h-14 items-center justify-center px-8 py-3 text-lg font-bold text-primary-foreground bg-primary rounded-full hover:bg-primary/90 shadow-lg hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 group"
                >
                  <Search className="mr-2 group-hover:rotate-12 transition-transform" size={22} />
                  Browse Jobs
                </Link>
                <Link
                  href="/talent"
                  className="inline-flex h-14 items-center justify-center px-8 py-3 text-lg font-bold text-primary bg-white border-2 border-primary/10 rounded-full hover:bg-accent hover:border-primary/30 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  Find Talent
                </Link>
              </>
            )}
          </div>


        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl border-white/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border/50">
            <div className="p-4 space-y-2 group cursor-default">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Briefcase size={32} />
              </div>
              <h3 className="text-4xl font-black text-foreground">{jobCount}+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wide text-sm">Active Job Listings</p>
            </div>
            <div className="p-4 space-y-2 group cursor-default">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <Users size={32} />
              </div>
              <h3 className="text-4xl font-black text-foreground">{jobSeekerCount}+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wide text-sm">Talented Individuals</p>
            </div>
            <div className="p-4 space-y-2 group cursor-default">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                <GraduationCap size={32} />
              </div>
              <h3 className="text-4xl font-black text-foreground">{courseCount}+</h3>
              <p className="text-muted-foreground font-medium uppercase tracking-wide text-sm">Skill Courses Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section (Replaced Premium Jobs) */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-4xl font-black text-foreground mb-4">Latest Opportunities</h2>
            <p className="text-muted-foreground text-lg">Fresh jobs from top companies added just now.</p>
          </div>
          <Link href="/jobs" className="group flex items-center font-bold text-primary hover:text-primary/80 transition-colors">
            View All Jobs <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
              <div className="glass-card rounded-2xl p-6 h-full flex flex-col group-hover:border-primary/30 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center text-2xl font-bold text-primary shadow-sm group-hover:scale-105 transition-transform">
                    {job.employer.employerProfile?.companyName?.charAt(0) || "C"}
                  </div>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">{job.type}</span>
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                <p className="text-muted-foreground text-sm font-medium mb-4 line-clamp-1">{job.employer.employerProfile?.companyName}</p>
                <div className="mt-auto pt-4 border-t border-border/50 flex items-center text-sm text-muted-foreground">
                  <MapPin size={16} className="mr-2 text-primary" />
                  {job.location}
                  <span className="ml-auto text-xs opacity-70">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {latestJobs.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-accent/20 rounded-2xl border border-dashed border-border">
              No jobs posted yet. Be the first to post!
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-transparent to-accent/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
                Why <span className="text-primary">RojgaarNepal</span> is the best choice?
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We&apos;ve built a platform that puts user experience first. No clutter, just connections.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Trusted & Verified</h3>
                    <p className="text-muted-foreground">Every employer and job posting is manually verified to ensure safety.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Smart Matching</h3>
                    <p className="text-muted-foreground">Our algorithm matches your skills directly with employer requirements.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Skill Development</h3>
                    <p className="text-muted-foreground">Free high-quality courses to help you upgrade your CV and get hired faster.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-3xl blur-2xl transform rotate-3"></div>
              <div className="relative h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 glass-card p-2">
                <div className="relative h-full w-full rounded-2xl overflow-hidden">
                  <Image
                    src="/remotejob.jpeg"
                    alt="Happy professional working"
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-8">
                    <p className="text-white font-medium text-lg">&quot;The best platform for connecting skills with opportunity in Nepal.&quot;</p>
                    <p className="text-white/70 text-sm mt-2">- Satisfied User</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 mb-10">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 md:px-12 md:py-20 text-center shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Ready to shape your career?
            </h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Join thousands of professionals and companies building the future of Nepal together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {!session ? (
                <>
                  <Link
                    href="/register"
                    className="inline-flex h-12 items-center justify-center px-8 text-lg font-bold text-primary bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 items-center justify-center px-8 text-lg font-bold text-white border-2 border-white/30 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link
                  href="/jobs"
                  className="inline-flex h-12 items-center justify-center px-8 text-lg font-bold text-primary bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Browse Opportunities
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
