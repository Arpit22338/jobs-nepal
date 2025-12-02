import Link from "next/link";
import Image from "next/image";
import { Search, Briefcase, GraduationCap, Users, Crown, MapPin } from "lucide-react";
import { prisma } from "../lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const jobCount = await prisma.job.count();
  const jobSeekerCount = await prisma.user.count({ where: { role: "JOBSEEKER" } });
  const courseCount = await prisma.course.count();

  // Fetch Premium Jobs
  const premiumJobs = await prisma.job.findMany({
    where: { employer: { isPremium: true } },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { employer: { include: { employerProfile: true } } }
  });

  // Fetch Premium Talent
  const premiumTalent = await prisma.user.findMany({
    where: { role: "JOBSEEKER", isPremium: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { jobSeekerProfile: true }
  });

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
          Find Your Dream Job in <span className="text-blue-600">Nepal</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connecting talented youth with top employers. Browse jobs, upgrade your skills, and build your career today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Search className="mr-2" size={20} />
            Browse Jobs
          </Link>
          <Link
            href="/talent"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Find Talent
          </Link>
        </div>
      </section>

      {/* Premium Jobs Section */}
      {premiumJobs.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Crown className="text-yellow-500" size={28} fill="currentColor" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {premiumJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200 hover:shadow-md transition-all h-full flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl font-bold text-gray-500">
                      {job.employer.employerProfile?.companyName?.charAt(0) || "C"}
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{job.type}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-1">{job.employer.employerProfile?.companyName}</p>
                  <div className="mt-auto flex items-center text-gray-500 text-sm">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Premium Talent Section */}
      {premiumTalent.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Crown className="text-yellow-500" size={28} fill="currentColor" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Talent</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {premiumTalent.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`} className="block group">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200 hover:shadow-md transition-all h-full flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-200 mb-4 overflow-hidden relative border-2 border-yellow-400">
                    {user.image ? (
                      <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
                        {(user.name || "U").charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors flex items-center gap-1">
                    {user.name}
                    <Crown size={14} className="text-yellow-500" fill="currentColor" />
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{user.jobSeekerProfile?.bio?.substring(0, 60)}...</p>
                  <div className="mt-auto flex flex-wrap justify-center gap-1">
                    {user.jobSeekerProfile?.skills?.split(",").slice(0, 3).map((skill, i) => (
                      <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <Briefcase className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">{jobCount}+</h3>
          <p className="text-gray-600">Active Job Listings</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <Users className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">{jobSeekerCount}+</h3>
          <p className="text-gray-600">Job Seekers</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <GraduationCap className="mx-auto h-12 w-12 text-purple-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900">{courseCount}+</h3>
          <p className="text-gray-600">Skill Courses</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose JobNepal?</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <p className="ml-4 text-lg text-gray-600">Verified employers and legitimate job postings.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <p className="ml-4 text-lg text-gray-600">Skill-based matching to find the perfect fit.</p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <span className="text-blue-600 font-bold">✓</span>
              </div>
              <p className="ml-4 text-lg text-gray-600">Integrated courses to upskill and boost your CV.</p>
            </li>
          </ul>
        </div>
        <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden shadow-lg">
          <Image 
            src="/remotejob.jpeg" 
            alt="Remote Work in Nepal" 
            fill
            className="object-cover"
          />
        </div>
      </section>
    </div>
  );
}
