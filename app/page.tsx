import Link from "next/link";
import { Search, Briefcase, GraduationCap, Users } from "lucide-react";
import { prisma } from "../lib/prisma";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const jobCount = await prisma.job.count();
  const jobSeekerCount = await prisma.user.count({ where: { role: "JOBSEEKER" } });
  const courseCount = await prisma.course.count();

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
        <div className="bg-gray-200 rounded-lg h-64 md:h-96 flex items-center justify-center">
          <span className="text-gray-500">Image Placeholder</span>
        </div>
      </section>
    </div>
  );
}
