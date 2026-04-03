import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Job God — Resume Analyzer & Career GPS",
  description:
    "Upload your resume and let AI find the best job matches, reveal skill gaps, and build a personalized learning roadmap to land your dream role.",
  keywords: [
    "resume analyzer",
    "job matching",
    "skill gap analysis",
    "career guidance",
    "AI job search",
  ],
  openGraph: {
    title: "AI Job God — Your AI Career GPS",
    description:
      "Stop guessing. Let AI analyze your resume, match real jobs, and tell you exactly what to learn next.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
