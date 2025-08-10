import DashboardPageHeader from "@/components/dashboard/page-header";
import React from "react";

export default function SettingsPage() {
  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Settings"
        subtitle="Manage your account settings and preferences"
      />
    </div>
  );
}