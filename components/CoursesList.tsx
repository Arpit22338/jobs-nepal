"use client";

import { Lock, Unlock, Star } from "lucide-react";
import { useState } from "react";
import { CourseEnrollmentModal } from "@/components/CourseEnrollmentModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Boxicon mapping for courses
const courseIcons: Record<string, { icon: string; gradient: string }> = {
  "cv-building": { icon: "bx-file-blank", gradient: "from-cyan-500 to-blue-600" },
  "basic-python": { icon: "bxl-python", gradient: "from-yellow-400 to-amber-500" },
  "default": { icon: "bx-book-reader", gradient: "from-violet-500 to-purple-600" },
};

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

  const getIconConfig = (courseId: string) => {
    return courseIcons[courseId] || courseIcons.default;
  };

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-20 glass-card rounded-2xl">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bx bx-book-open text-3xl text-muted-foreground"></i>
            </div>
            <h3 className="text-lg font-bold text-foreground">No courses available</h3>
            <p className="text-muted-foreground mt-1 text-sm">Check back later for new skill-building content.</p>
          </div>
        ) : (
          courses.map((course) => {
            const iconConfig = getIconConfig(course.id);
            return (
              <div key={course.id} className="glass-card rounded-2xl overflow-hidden group hover:border-primary/40 transition-all duration-300 flex flex-col hover:shadow-lg hover:shadow-primary/5">
                {/* Icon Thumbnail */}
                <div className={`h-40 relative overflow-hidden bg-linear-to-br ${iconConfig.gradient}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className={`bx ${iconConfig.icon} text-7xl text-white/90 group-hover:scale-110 transition-transform duration-500`}></i>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12"></div>

                  {/* Badge */}
                  {course.price > 0 ? (
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center backdrop-blur-sm ${
                      course.isUnlocked
                        ? "bg-green-500/90 text-white"
                        : "bg-white/20 text-white"
                    }`}>
                      {course.isUnlocked ? <Unlock size={10} className="mr-1" /> : <Lock size={10} className="mr-1" />}
                      {course.isUnlocked ? "Unlocked" : "Premium"}
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center bg-green-500 text-white">
                      <Star size={10} className="mr-1 fill-current" />
                      Free
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <i className="bx bx-user text-sm"></i>
                        {course.instructor}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="bx bx-time text-sm"></i>
                        {course.duration}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-lg font-bold text-foreground">
                          {course.price === 0 ? "FREE" : <><span className="text-xs text-muted-foreground">Rs.</span>{course.price}</>}
                        </span>
                      </div>

                      <button
                        onClick={() => handleEnroll(course)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          course.isUnlocked || course.price === 0
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-accent text-foreground hover:bg-accent/80"
                        }`}
                      >
                        {course.isUnlocked || course.price === 0 ? (
                          <>
                            <i className="bx bx-play-circle text-base"></i>
                            Start
                          </>
                        ) : (
                          <>
                            <i className="bx bx-lock-alt text-base"></i>
                            Enroll
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedCourse && (
        <CourseEnrollmentModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          price={selectedCourse.price}
        />
      )}
    </>
  );
}
