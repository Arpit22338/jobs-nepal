import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Resume Builder Nepal - Create Professional Resume Online",
  description: "Create a professional ATS-friendly resume in minutes with our FREE AI Resume Builder. Get AI-powered content suggestions, multiple templates, and instant PDF download. Perfect for job seekers in Nepal.",
  keywords: [
    "free resume builder nepal",
    "ai resume builder",
    "cv maker nepal",
    "resume maker online free",
    "ats friendly resume",
    "professional resume template nepal",
    "cv builder free",
    "create resume online nepal",
    "resume generator ai",
    "job application resume nepal"
  ],
  openGraph: {
    title: "Free AI Resume Builder | Create Professional CV Online | Rojgaar Nepal",
    description: "Build your perfect resume with AI assistance. ATS-optimized templates, instant PDF download. 100% free!",
    url: "https://rojgaarnepal.com/ai-tools/resume-builder",
    type: "website",
  },
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
