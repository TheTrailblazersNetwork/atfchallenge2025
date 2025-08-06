import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { AppSidebar } from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full p-3 md:p-5">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
      <Toaster />
    </>
    // <div className="flex min-h-screen">
    //   {/* Sidebar */}
    //   <aside className="w-64 bg-white shadow-md p-6">
    //     <h2 className="text-xl font-bold mb-6">Dashboard</h2>
    //     <nav className="space-y-2">
    //       <Link href="/dashboard/patients" className="block text-blue-600 hover:underline">
    //         Patients
    //       </Link>
    //       <Link href="/dashboard/appointments" className="block text-blue-600 hover:underline">
    //         Appointments
    //       </Link>
    //     </nav>
    //   </aside>

    //   {/* Main Content */}
    //   <main className="flex-1 p-8 bg-gray-50">
    //     {children}
    //   </main>
    // </div>
  );
}
