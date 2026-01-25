import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import CourseClient from "./CourseClient";

interface Props {
    params: Promise<{
        courseId: string;
    }>;
}

export async function generateMetadata(
    { params }: Props,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _parent: ResolvingMetadata
): Promise<Metadata> {
    const { courseId } = await params;
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, description: true }
    });

    if (!course) return { title: "Course Not Found" };

    return {
        title: `${course.title} Course in Nepal`,
        description: course.description.substring(0, 160),
        openGraph: {
            title: `${course.title} | Rojgaar Nepal`,
            description: course.description.substring(0, 160),
            type: "video.movie", // Courses are often video-based
        },
    };
}

export default async function CoursePage({ params }: Props) {
    const { courseId } = await params;
    const course = await prisma.course.findUnique({
        where: { id: courseId },
    });

    if (!course) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.description,
        "provider": {
            "@type": "Organization",
            "name": "Rojgaar Nepal",
            "sameAs": "https://rojgaarnepal.com"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CourseClient />
        </>
    );
}
