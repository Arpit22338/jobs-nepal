import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import { BackgroundWrapper } from "@/components/ui/background-components";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "RojgaarNepal",
  description: "Connecting Nepali Youth with Opportunities",
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
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <BackgroundWrapper>
            <Navbar />
            <main className="container mx-auto px-4 py-8 flex-grow">
              {children}
            </main>
            <footer className="glass border-t border-border/40 py-12 mt-auto">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <div className="text-xl font-black tracking-tighter mb-2">
                      <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">Rojgaar</span>
                      <span className="text-foreground">Nepal</span>
                    </div>
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} RojgaarNepal. Connecting talent with opportunity.</p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      Developed with ❤️ by <span className="font-bold text-primary hover:underline cursor-pointer">Arpit Kafle</span>
                    </p>
                    <div className="flex justify-center md:justify-end gap-4 mt-4">
                      <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">fb</span>
                      <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">in</span>
                      <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">tw</span>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </BackgroundWrapper>
        </Providers>
      </body>
    </html>
  );
}
