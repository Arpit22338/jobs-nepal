import { prisma } from "@/lib/prisma";
import CoursesList from "@/components/CoursesList";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const courses = await prisma.course.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  let unlockedTitles: string[] = [];
  if (session?.user) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: (session.user as any).id,
        status: "APPROVED"
      } as any,
      include: { course: true }
    });
    unlockedTitles = enrollments.map((e: any) => e.course.title);
  }

  const cvCourse = {
    id: "cv-building",
    title: "CV Building Masterclass",
    description: "Learn how to craft a professional CV that stands out. Includes certificate and templates.",
    price: 0,
    instructor: "RojgaarNepal Team",
    duration: "1 Hour",
    thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=500&auto=format&fit=crop",
    isUnlocked: true // Free course
  };

  const pythonCourse = {
    id: "basic-python",
    title: "Basic Python Programming",
    description: "Master the fundamentals of Python programming. Includes certificate.",
    price: 299,
    instructor: "RojgaarNepal Team",
    duration: "2 Hours",
    thumbnail: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
    isUnlocked: unlockedTitles.includes("Basic Python Programming")
  };

  // Filter out DB courses that duplicate the hardcoded ones
  const filteredDbCourses = courses.filter(c =>
    c.title !== "Basic Python Programming" &&
    c.title !== "CV Building Masterclass"
  );

  const allCourses = [
    cvCourse,
    pythonCourse,
    ...filteredDbCourses.map(c => ({
      ...c,
      instructor: c.instructor || "Unknown",
      duration: c.duration || "Self-paced",
      price: c.price || (c as any).priceNpr || 0,
      isUnlocked: unlockedTitles.includes(c.title)
    }))
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 pb-20">
      <div className="text-center md:text-left space-y-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
          Level Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Career</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
          Master in-demand skills with our curated selection of professional courses. Get certified and boost your chances of getting hired.
        </p>
      </div>

      <CoursesList courses={allCourses} />
    </div>
  );
}
