import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppSidebar } from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

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
