import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/components/Redux-Provider";

export const metadata: Metadata = {
  title: "my_health",
  description: "health Booking App",
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
    <html lang="en">
      <ReduxProvider>
        <body className={`${interFont.className} bg-zinc-100 antialiased`}>
          {children}
          <Toaster />
        </body>
      </ReduxProvider>
    </html>
  );
}
