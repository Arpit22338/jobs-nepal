import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login to Rojgaar Nepal - Access Jobs, AI Tools & Courses",
  description: "Sign in to your Rojgaar Nepal account. Access thousands of jobs in Nepal, AI career tools, free courses, and connect with top employers. Secure login for job seekers and employers.",
  keywords: [
    "rojgaar nepal login",
    "job portal login nepal",
    "sign in rojgaarnepal",
    "nepal jobs login",
    "employer login nepal"
  ],
  openGraph: {
    title: "Login | Rojgaar Nepal - Nepal's #1 Job Portal",
    description: "Access your Rojgaar Nepal account to find jobs, hire talent, and grow your career.",
    url: "https://rojgaarnepal.com/login",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
