import DashboardPageHeader from "@/components/dashboard/page-header";
import React from "react";

export default function PatientsPage() {
  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Settings"
        subtitle="Manage your account preferences and configurations"
      />
    </div>
  );
}