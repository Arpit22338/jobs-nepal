"use client";

import { Clock, User, Lock, Unlock, PlayCircle, Star } from "lucide-react";
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

    if (course.isUnlocked || course.price === 0) {
      if (course.id === "cv-building") {
        router.push("/courses/cv-building");
      } else if (course.id === "basic-python" || course.title === "Basic Python Programming") {
        router.push("/courses/basic-python");
      } else {
        router.push(`/courses/${course.id}`);
      }
    } else {
      setSelectedCourse(course);
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-20 glass-card rounded-3xl">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bx bx-book-open text-4xl text-muted-foreground"></i>
            </div>
            <h3 className="text-xl font-bold text-foreground">No courses available</h3>
            <p className="text-muted-foreground mt-2">Check back later for new skill-building content.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="glass-card rounded-3xl overflow-hidden group hover:border-primary/40 transition-all duration-300 flex flex-col shadow-xl hover:shadow-primary/5">
              <div className="h-52 relative overflow-hidden bg-accent/30">
                {course.thumbnail ? (
                  <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/40">
                    <i className="bx bx-book-open text-6xl"></i>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {course.price > 0 && (
                  <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center z-10 backdrop-blur-md border shadow-lg ${course.isUnlocked
                    ? "bg-green-500/90 text-white border-green-400"
                    : "bg-primary/90 text-white border-primary-foreground/20"
                    }`}>
                    {course.isUnlocked ? <Unlock size={12} className="mr-1.5" /> : <Lock size={12} className="mr-1.5" />}
                    {course.isUnlocked ? "Unlocked" : "Premium"}
                  </div>
                )}

                {course.price === 0 && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center z-10 backdrop-blur-md border border-green-500/40 bg-green-500/90 text-white shadow-lg">
                    <Star size={12} className="mr-1.5 fill-current" />
                    Free
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div>
                  <h2 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {course.title}
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="mt-auto space-y-4 pt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <User size={14} className="text-primary" />
                      {course.instructor || "Rojgaar Team"}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-primary" />
                      {course.duration || "Self-paced"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/40">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</span>
                      <span className="text-xl font-black text-foreground">
                        {course.price === 0 ? "FREE" : <><span className="text-xs mr-0.5 text-primary">Rs.</span>{course.price}</>}
                      </span>
                    </div>

                    <button
                      onClick={() => handleEnroll(course)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg active:scale-95 ${course.isUnlocked
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
                        }`}
                    >
                      {course.isUnlocked ? (
                        <>
                          <PlayCircle size={18} />
                          Continue
                        </>
                      ) : "Enroll Now"}
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
