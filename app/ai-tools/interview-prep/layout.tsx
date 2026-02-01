import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Interview Practice Nepal - Prepare for Job Interviews",
  description: "Practice job interviews with AI-powered mock interviews. Get instant feedback, improve your answers, and ace your next interview. Free interview preparation tool for Nepal job seekers.",
  keywords: [
    "interview practice nepal",
    "mock interview ai",
    "job interview preparation nepal",
    "ai interview coach",
    "interview questions nepal",
    "practice interview online free",
    "job interview tips nepal",
    "interview preparation tool",
    "technical interview practice",
    "behavioral interview practice"
  ],
  openGraph: {
    title: "Free AI Interview Practice | Prepare for Jobs | Rojgaar Nepal",
    description: "Practice with AI-powered mock interviews. Get instant feedback and tips to ace your next job interview. 100% free!",
    url: "https://rojgaarnepal.com/ai-tools/interview-prep",
    type: "website",
  },
};

export default function InterviewPrepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
