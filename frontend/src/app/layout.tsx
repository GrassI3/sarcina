import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import { MainLayout } from "../components/layout/MainLayout";
import { ThemeProvider } from "../components/ThemeProvider";
import { cn } from "@/lib/utils";
import { FocusProvider } from "@/lib/FocusContext";
import { HabitProvider } from "@/lib/HabitContext";
import { AuthProvider } from "@/lib/AuthContext";

const headingFont = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FlowState - Productivity Reimagined",
  description: "A smart task manager, focus timer, and daily planner with an ambient dark design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased", headingFont.variable, bodyFont.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-hidden transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <FocusProvider>
              <HabitProvider>
                <MainLayout>{children}</MainLayout>
              </HabitProvider>
            </FocusProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
