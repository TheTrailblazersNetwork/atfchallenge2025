import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/components/Redux-Provider";

export const metadata: Metadata = {
  title: "NeuroFlow - AI-Powered Hospital Queue Management",
  description: "AI-powered hospital queue management system that streamlines patient flow through intelligent triaging and real-time queue management.",
};

const interFont = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ReduxProvider>
        <body
          className={`${interFont.className} bg-gradient-to-br from-cyan-100 via-zinc-100 to-cyan-100 antialiased`}
        >
          <Toaster />
          {children}
        </body>
      </ReduxProvider>
    </html>
  );
}
