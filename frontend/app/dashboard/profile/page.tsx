import DashboardPageHeader from "@/components/dashboard/page-header";
import React from "react";

export default function ProfilePage() {
  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Profile"
        subtitle="View your profile information"
      />
    </div>
  );
}