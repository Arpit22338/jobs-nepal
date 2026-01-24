import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";
import MobileFooter from "../components/MobileFooter";

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 pt-20 pb-24 md:pb-8">
              {children}
            </main>

            {/* Static Footer - Desktop only */}
            <footer className="hidden md:block border-t border-border py-8 mt-auto bg-card/50">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-center md:text-left">
                    <div className="text-lg font-bold tracking-tight mb-1">
                      <span className="text-primary">Rojgaar</span>
                      <span className="text-foreground">Nepal</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      &copy; {new Date().getFullYear()} RojgaarNepal. Connecting talent with opportunity.
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-muted-foreground">
                      Developed by <span className="font-medium text-foreground">Arpit Kafle</span>
                    </p>
                  </div>
                </div>
              </div>
            </footer>

            {/* Mobile Footer Navigation */}
            <MobileFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}

