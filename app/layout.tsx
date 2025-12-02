import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roojgaar",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 flex flex-col min-h-screen`}
      >
        <Providers>
          <Navbar />
          <main className="container mx-auto px-4 py-8 flex-grow">
            {children}
          </main>
          <footer className="bg-white border-t py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>&copy; {new Date().getFullYear()} Roojgaar. All rights reserved.</p>
              <p className="text-sm mt-2">Developed by <span className="font-semibold text-blue-600">Arpit Kafle</span></p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
