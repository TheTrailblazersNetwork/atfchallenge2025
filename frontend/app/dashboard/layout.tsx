import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppSidebar } from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full p-3 md:p-5">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
      <Toaster />
    </AuthGuard>
  );
}
