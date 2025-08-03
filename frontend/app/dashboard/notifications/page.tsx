import DashboardPageHeader from "@/components/dashboard/page-header";
import React from "react";

export default function PatientsPage() {
  return (
    <div className="dashboard-page">
      <DashboardPageHeader title="Notifications" subtitle="View recent alerts and messages" />
    </div>
  );
}