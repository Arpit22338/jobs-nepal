import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Clock, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Hardcoded CV Course
  const cvCourse = {
    id: "cv-building",
    title: "CV Building Masterclass",
    description: "Learn how to craft a professional CV that stands out. Includes video tutorials and templates.",
    price: 0,
    instructor: "Rojgaar Team",
    duration: "1 Hour",
  };

  const allCourses = [cvCourse, ...courses];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Skill Courses</h1>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allCourses.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No courses available at the moment.
          </div>
        ) : (
          allCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition flex flex-col">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {course.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <User size={16} className="mr-1" />
                      {course.instructor || "Unknown"}
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {course.duration || "Self-paced"}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-lg font-bold text-blue-600">
                      {course.price === 0 ? "Free" : `Rs. ${course.price}`}
                    </span>
                    <Link
                      href={course.id === "cv-building" ? "/courses/cv-building" : `/courses/${course.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Enroll Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
