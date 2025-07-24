import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="space-y-2">
          <Link href="/dashboard/patients" className="block text-blue-600 hover:underline">
            Patients
          </Link>
          <Link href="/dashboard/appointments" className="block text-blue-600 hover:underline">
            Appointments
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}