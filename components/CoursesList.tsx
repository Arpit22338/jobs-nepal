"use client";

import { BookOpen, Clock, User, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { CourseEnrollmentModal } from "@/components/CourseEnrollmentModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor: string;
  duration: string;
  thumbnail?: string | null;
  isUnlocked?: boolean;
}

export default function CoursesList({ courses }: { courses: Course[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleEnroll = (course: Course) => {
    if (!session) {
      router.push("/login");
      return;
    }

    // If course is unlocked or free, navigate to it
    if (course.isUnlocked || course.price === 0) {
      if (course.id === "cv-building") {
        router.push("/courses/cv-building");
      } else if (course.id === "basic-python" || course.title === "Basic Python Programming") {
        router.push("/courses/basic-python");
      } else {
        router.push(`/courses/${course.id}`);
      }
    } else {
      // Paid and locked -> Open Enrollment Modal
      setSelectedCourse(course);
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No courses available at the moment.
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition flex flex-col">
              <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                ) : (
                  <BookOpen size={48} className="text-gray-400" />
                )}
                {course.price > 0 && (
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold flex items-center z-10 ${course.isUnlocked ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
                    {course.isUnlocked ? <Unlock size={12} className="mr-1" /> : <Lock size={12} className="mr-1" />}
                    {course.isUnlocked ? "Unlocked" : "Premium"}
                  </div>
                )}
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
                    <button
                      onClick={() => handleEnroll(course)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        course.isUnlocked 
                          ? "bg-green-600 hover:bg-green-700 text-white" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {course.isUnlocked ? "Enter Course" : "Enroll Now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCourse && (
        <CourseEnrollmentModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          price={selectedCourse.price}
        />
      )}
    </>
  );
}
