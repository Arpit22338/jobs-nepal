import Link from "next/link";
import Image from "next/image";
import { Search, Briefcase, MapPin, ArrowRight, Zap, Shield, Target, Sparkles, FileText, MessageCircle, TrendingUp } from "lucide-react";
import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Meteors from "@/components/Meteors";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string } | undefined;

  // Fetch Latest Jobs
  const latestJobs = await prisma.job.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { employer: { include: { employerProfile: true } } }
  });

  return (
    <div className="space-y-20 pb-20 page-enter">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-full -z-10 bg-background overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          {/* Meteor particles */}
          <Meteors number={15} />
        </div>

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-5 gap-16 items-center relative z-10">
          <div className="lg:col-span-3 space-y-8 stagger-1">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              The Professional Portal of Nepal
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
              Connecting <span className="text-primary">Ambition</span> <br />
              with <span className="text-primary">Global Standards</span>
            </h1>

            <p className="text-xl text-muted-foreground font-medium max-w-xl leading-relaxed opacity-90">
              The premier professional freelancing hub and job portal for Nepal. Discover elite jobs, master modern skills, and hire the best experts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {user?.role === "TEACHER" ? (
                <>
                  <Link
                    href="/teacher/course"
                    className="inline-flex h-14 items-center justify-center px-10 text-lg font-bold text-white bg-primary rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                  >
                    <Briefcase className="mr-2" size={22} />
                    Start Teaching
                  </Link>
                  <Link
                    href="/teacher/dashboard"
                    className="inline-flex h-14 items-center justify-center px-10 text-lg font-bold text-foreground bg-accent/50 border border-border rounded-2xl hover:bg-accent transition-all hover:scale-105 active:scale-95"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/jobs"
                    className="inline-flex h-14 items-center justify-center px-10 text-lg font-bold text-primary-foreground bg-primary rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <Search className="mr-2 group-hover:rotate-12 transition-transform" size={22} />
                    Find Work
                  </Link>
                  <Link
                    href="/talent"
                    className="inline-flex h-14 items-center justify-center px-10 text-lg font-bold text-foreground bg-card border border-border rounded-2xl hover:bg-accent hover:border-primary/30 transition-all hover:scale-105 active:scale-95"
                  >
                    Hire Talent
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 relative hidden lg:block animate-in fade-in slide-in-from-right-5 duration-700">
            <div className="relative rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/50 dark:border-white/10 aspect-4/5">
              <Image
                src="/premium-workspace.jpg"
                alt="Professional Workspace in Nepal"
                fill
                className="object-cover"
                priority
              />
              {/* Translucent overlay to reduce brightness */}
              <div className="absolute inset-0 bg-black/25 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>



      {/* Mission Section (Search Engine Optimized) */}
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto glass-card rounded-[40px] p-8 md:p-16 border-primary/5 bg-accent/5">
          <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-6">Our Mission & Vision</h2>
          <h3 className="sr-only">Rojgaar Nepal: The ultimate freelancing site and job portal for finding jobs in Nepal and learning professional skills.</h3>

          <div className="space-y-6 text-lg md:text-xl text-foreground font-medium leading-relaxed">
            <p>
              Welcome to <strong className="text-primary font-bold">Rojgaar Nepal</strong>, the premier professional freelancing site and job portal connecting ambitious talent with visionary employers across the region.
            </p>
            <p className="text-muted-foreground">
              Whether you are looking for top <span className="text-primary font-bold">Jobs in Nepal</span>, high-paying remote freelancing opportunities, or professional skill development, our portal provides the refined tools you need to succeed.
            </p>
            <p className="text-muted-foreground border-t border-border/50 pt-6 text-base italic">
              Our mission is to bridge the gap between skilled individuals and the ever-growing demand for experts in sectors ranging from Tech and Finance to Creative Arts. With a focus on the local economy, we empower every job seeker and freelancer to build a sustainable career right here in Nepal.
            </p>
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
            Discover More Opportunities <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestJobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block group" aria-label={`View details for ${job.title} at ${job.employer.employerProfile?.companyName}`}>
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
      <section className="bg-background dark:bg-linear-to-b dark:from-transparent dark:to-accent/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
                Why <span className="text-primary">Rojgaar Nepal</span> is the Trusted Choice
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-normal">
                We have meticulously built a professional landscape that prioritizes transparency and efficiency above all else. Unlike traditional job boards, our <strong className="text-foreground">Freelancing Portal</strong> specifically caters to the unique needs of the Nepalese market—offering a clutter-free interface where real connections are made between visionaries and builders.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Trusted & Verified</h3>
                    <p className="text-muted-foreground">Every employer and job posting is manually verified to ensure safety.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
                    <Target size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Smart Matching</h3>
                    <p className="text-muted-foreground">Our algorithm matches your skills directly with employer requirements.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Professional Growth</h3>
                    <p className="text-muted-foreground">Beyond just job listings, our portal acts as a comprehensive career hub. We provide free high-quality courses to help you upgrade your CV, master the latest technologies, and ultimately get hired faster by top-tier firms.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50">
                <h4 className="text-lg font-bold text-foreground mb-3">Empowering the Local Workforce</h4>
                <p className="text-muted-foreground leading-relaxed italic">
                  At Rojgaar Nepal, we believe that the next big innovation will come from local talent. By providing a dedicated space for freelancing and formal jobs in Nepal, we help reduce the brain drain and foster a thriving digital ecosystem that benefits everyone from startup founders to independent consultants.
                </p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="w-14 h-14 mx-auto mb-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center">
                  <i className="bx bx-briefcase text-3xl text-blue-600 dark:text-blue-400"></i>
                </div>
                <div className="text-foreground font-bold text-lg">Free Job Posting</div>
                <p className="text-muted-foreground text-sm mt-2">Post & apply for free</p>
              </div>
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="w-14 h-14 mx-auto mb-3 bg-green-100 dark:bg-green-500/20 rounded-2xl flex items-center justify-center">
                  <i className="bx bx-shield-quarter text-3xl text-green-600 dark:text-green-400"></i>
                </div>
                <div className="text-foreground font-bold text-lg">Secure</div>
                <p className="text-muted-foreground text-sm mt-2">Your data is protected</p>
              </div>
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="w-14 h-14 mx-auto mb-3 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center">
                  <i className="bx bx-map-pin text-3xl text-red-600 dark:text-red-400"></i>
                </div>
                <div className="text-foreground font-bold text-lg">Made for Nepal</div>
                <p className="text-muted-foreground text-sm mt-2">Local talent focused</p>
              </div>
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 text-center hover:scale-105 transition-transform duration-300 shadow-lg">
                <div className="w-14 h-14 mx-auto mb-3 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center">
                  <i className="bx bx-book-open text-3xl text-purple-600 dark:text-purple-400"></i>
                </div>
                <div className="text-foreground font-bold text-lg">Skill Courses</div>
                <p className="text-muted-foreground text-sm mt-2">Learn & get certified</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI-Powered Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={14} className="mr-2" />
            AI-Powered Career Tools
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4">
            Supercharge Your <span className="text-primary">Career</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Leverage cutting-edge AI to build your resume, prepare for interviews, and find your perfect job match.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Resume Builder */}
          <Link href="/ai-tools/resume-builder" className="group">
            <div className="glass-card rounded-2xl p-6 h-full border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 mb-4 bg-linear-to-br from-blue-500/20 to-blue-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={28} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                AI Resume Builder
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create an ATS-optimized, professional resume in minutes with AI assistance.
              </p>
              <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Build Now <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Interview Prep */}
          <Link href="/ai-tools/interview-prep" className="group">
            <div className="glass-card rounded-2xl p-6 h-full border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 mb-4 bg-linear-to-br from-purple-500/20 to-purple-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle size={28} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                Interview Prep
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Practice with AI-generated questions and get instant feedback on your answers.
              </p>
              <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Practice Now <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Job Matcher */}
          <Link href="/ai-tools/job-matcher" className="group">
            <div className="glass-card rounded-2xl p-6 h-full border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 mb-4 bg-linear-to-br from-green-500/20 to-green-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target size={28} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                Job Matcher
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Find jobs that perfectly match your skills with AI-powered compatibility scoring.
              </p>
              <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Find Matches <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Skills Gap Analysis */}
          <Link href="/ai-tools/skills-gap" className="group">
            <div className="glass-card rounded-2xl p-6 h-full border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
              <div className="w-14 h-14 mb-4 bg-linear-to-br from-orange-500/20 to-orange-600/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={28} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                Skills Gap Analysis
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get a personalized learning roadmap to reach your career goals faster.
              </p>
              <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Analyze Skills <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        </div>

        {/* CTA for AI Tools */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
            <Sparkles size={32} className="text-primary" />
            <div className="text-left">
              <p className="font-bold text-foreground">All AI tools are completely free!</p>
              <p className="text-sm text-muted-foreground">No hidden charges, no premium tiers. Just powerful AI at your fingertips.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 mb-20">
        <div className="relative overflow-hidden rounded-[40px] border border-border/50 bg-card dark:bg-linear-to-br dark:from-card/80 dark:via-primary/5 dark:to-card px-6 py-16 md:px-12 md:py-24 text-center shadow-2xl backdrop-blur-3xl">
          <div className="absolute top-0 left-0 w-full h-full -z-10 group">
            <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] transition-transform duration-1000 group-hover:scale-110"></div>
            <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px] transition-transform duration-1000 group-hover:scale-95"></div>
          </div>

          <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tight leading-tight">
              Ready to shape <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">your career?</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Join thousands of professionals and visionary companies building the future of Nepal together.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
              {!session ? (
                <>
                  <Link
                    href="/register"
                    className="premium-button text-lg group inline-flex items-center justify-center"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex h-12 md:h-14 items-center justify-center px-10 text-lg font-bold text-foreground border border-border hover:bg-accent rounded-full transition-all backdrop-blur-sm"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <Link
                  href="/jobs"
                  className="inline-flex h-12 md:h-14 items-center justify-center px-10 text-lg font-bold text-primary-foreground bg-primary/80 hover:bg-primary border border-primary/20 rounded-full transition-all backdrop-blur-sm shadow-lg shadow-primary/10 group"
                >
                  Browse Opportunities
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
