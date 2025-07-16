import React from "react";

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome to the Patients Dashboard</h2>
      <p className="text-gray-600">
        Here you can book your appointments and more..
      </p>

      {/* Example card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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