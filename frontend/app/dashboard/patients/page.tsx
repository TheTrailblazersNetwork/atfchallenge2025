import DashboardPageHeader from "@/components/dashboard/page-header";
import React from "react";

export default function PatientsPage() {
  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Patient's Dashboard"
        subtitle="Book Appointments, View Medical Records, and Manage Your Health"
      />
      {/* Example card */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card title="Available Doctors" value="4" />
        <Card title="Appointments Today" value="8" />
        <Card title="Pending Requests" value="6" />
      </div>
    </div>
  );
}

// Simple reusable Card component
function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <h3 className="text-sm text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}