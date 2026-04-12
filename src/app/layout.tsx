import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers/Providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";

const inter = localFont({
  src: "./fonts/inter.woff2",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zaprill — Resume Analyzer & Career GPS",
  description:
    "Upload your resume and let Zaprill find the best job matches, reveal skill gaps, and build a personalized learning roadmap to land your dream role.",
  keywords: [
    "resume analyzer",
    "job matching",
    "skill gap analysis",
    "career guidance",
    "AI job search",
  ],
  openGraph: {
    title: "Zaprill — Your Career GPS",
    description:
      "Stop guessing. Let Zaprill analyze your resume, match real jobs, and tell you exactly what to learn next.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", GeistSans.variable, inter.variable)}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Providers>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!} />
      </body>
    </html>
  );
}
