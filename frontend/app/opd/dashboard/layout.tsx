import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { OPDSidebar } from "@/components/ui/opdsidebar";
import OPDAuthGuard from "@/components/OPDAuthGuard";


export default function OPDDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <OPDAuthGuard>
      <SidebarProvider>
        <OPDSidebar />
        <div
          className="p-2 px-4 h-svh w-full overflow-y-scroll"
        >
          {children}
        </div>
      </SidebarProvider>
      <Toaster />
    </OPDAuthGuard>
  );
}
