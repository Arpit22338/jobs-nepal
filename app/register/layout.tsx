import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Account - Join Rojgaar Nepal Today",
  description: "Register on Rojgaar Nepal for FREE. Access thousands of jobs in Nepal, AI resume builder, free Python & CV courses, and connect with top employers. Join Nepal's #1 job portal.",
  keywords: [
    "rojgaar nepal register",
    "create account job portal nepal",
    "sign up rojgaarnepal",
    "free job portal account nepal",
    "employer registration nepal",
    "job seeker signup nepal"
  ],
  openGraph: {
    title: "Join Rojgaar Nepal Free | Create Your Account",
    description: "Sign up for Nepal's leading job portal. Free access to jobs, AI tools, and courses. Start your career journey today!",
    url: "https://rojgaarnepal.com/register",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
