import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import MobileFooter from "../components/MobileFooter";
import Footer from "../components/Footer";
import CursorGlow from "../components/CursorGlow";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rojgaarnepal.com"),
  title: {
    default: "Rojgaar Nepal - Top Job & Freelancing Site in Nepal",
    template: "%s | Rojgaar Nepal"
  },
  description: "Rojgaar Nepal is the #1 platform for finding jobs in Nepal, freelancing opportunities, and professional skill courses. Hire experts or find your dream career today.",
  keywords: [
    "job in nepal",
    "freelancing in nepal",
    "freelancing site in nepal",
    "hire experts nepal",
    "rojgar",
    "rojgarnepal",
    "rojgaarnepal",
    "python basic course in nepal",
    "nepal job portal",
    "online jobs nepal"
  ],
  authors: [{ name: "Rojgaar Nepal Team" }],
  creator: "Rojgaar Nepal",
  openGraph: {
    type: "website",
    locale: "en_NP",
    url: "https://rojgaarnepal.com",
    siteName: "Rojgaar Nepal",
    title: "Rojgaar Nepal - Jobs, Freelancing & Courses",
    description: "Connect with the best opportunities in Nepal. Find jobs, hire talent, and learn new skills.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rojgaar Nepal - Career Opportunities Waiting",
    description: "Launch your career or find the best talent in Nepal.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              })()
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <AnimatedShaderBackground />
          <CursorGlow />
          <div className="min-h-screen flex flex-col bg-background relative">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-20 pb-24 md:pb-8">
              {children}
            </main>

            {/* Static Footer - Desktop only */}
            <Footer />

            {/* Mobile Footer Navigation */}
            <MobileFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}

