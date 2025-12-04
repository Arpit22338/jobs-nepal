"use client";

import { BookOpen, Clock, User, Lock } from "lucide-react";
import { useState } from "react";
import { PaymentModal } from "@/components/PaymentModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  instructor: string;
  duration: string;
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

    if (course.price > 0) {
      setSelectedCourse(course);
    } else {
      // Free course
      if (course.id === "cv-building") {
        router.push("/courses/cv-building");
      } else if (course.id === "basic-python") {
        router.push("/courses/basic-python");
      } else {
        router.push(`/courses/${course.id}`);
      }
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
                <BookOpen size={48} className="text-gray-400" />
                {course.price > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                    <Lock size={12} className="mr-1" /> Premium
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
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedCourse && (
        <PaymentModal
          isOpen={!!selectedCourse}
          onClose={() => setSelectedCourse(null)}
          planName={selectedCourse.title}
          amount={selectedCourse.price}
          onSuccess={() => {
            // In a real app, we would wait for admin approval.
            // For now, we can redirect them or just close the modal.
            // The user knows it takes 24 hours.
            setSelectedCourse(null);
          }}
        />
      )}
    </>
  );
}
