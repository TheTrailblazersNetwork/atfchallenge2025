import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { OPDSidebar } from "@/components/ui/opdsidebar";
import OPDAuthGuard from "@/components/OPDAuthGuard";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function OPDDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <OPDAuthGuard>
      <SidebarProvider>
        <OPDSidebar />
        <div className={`${inter.className} p-5 h-svh w-full overflow-y-scroll`}>
          <SidebarTrigger />
          {children}
        </div>
      </SidebarProvider>
      <Toaster />
    </OPDAuthGuard>
  );
}
