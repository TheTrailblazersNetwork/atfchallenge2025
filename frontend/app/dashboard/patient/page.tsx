/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DashboardPageHeader from "@/components/dashboard/page-header";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPatientData } from "@/store/features/patientReducer";
import { getAppointmentsData } from "@/store/features/appointmentsReducer";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

export default function PatientPage() {
  const dispatch = useDispatch();
  const patient = useSelector((state: any) => state.patient);
  const appointments = useSelector((state: any) => state.appointments);

  useEffect(() => {
    dispatch(getPatientData());
    dispatch(getAppointmentsData());
  }, [dispatch]);

  // Calculate appointment statistics
  const appointmentStats = {
    total: appointments.data?.length || 0,
    pending:
      appointments.data?.filter((apt: any) => apt.status === "pending")
        ?.length || 0,
    approved:
      appointments.data?.filter((apt: any) => apt.status === "approved")
        ?.length || 0,
    confirmed:
      appointments.data?.filter((apt: any) => apt.status === "confirmed")
        ?.length || 0,
    completed:
      appointments.data?.filter((apt: any) => apt.status === "completed")
        ?.length || 0,
    cancelled:
      appointments.data?.filter((apt: any) => apt.status === "cancelled")
        ?.length || 0,
  };

  // Get recent appointments (last 3)
  const recentAppointments = appointments.data?.slice(0, 3) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "text-red-600 font-semibold";
    if (priority >= 5) return "text-yellow-600 font-medium";
    return "text-green-600";
  };

  // Only show loading if we're actually fetching data and patient is authenticated
  // For new accounts with no data, we should show the dashboard with empty state
  const isActuallyLoading = (patient.loading && patient.isAuthenticated) || 
                           (appointments.loading && appointments.data.length === 0 && patient.isAuthenticated);

  if (isActuallyLoading) {
    return (
      <div className="dashboard-page">
        <DashboardPageHeader
          title="Patient Dashboard"
          subtitle="Your health information at a glance"
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page space-y-6">
      <DashboardPageHeader
        title="Patient Dashboard"
        subtitle="Your health information at a glance"
      />

      {/* Patient Information Card */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center mb-4">
          <User className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            Patient Information
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">
                {patient.data?.first_name} {patient.data?.last_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{patient.data?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{patient.data?.phone_number}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">
                {patient.data?.dob ? formatDate(patient.data.dob) : "Not set"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Patient ID</p>
              <p className="font-medium text-xs">{patient.data?.id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Appointments"
          value={appointmentStats.total.toString()}
          icon={<CalendarDays className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Pending"
          value={appointmentStats.pending.toString()}
          icon={<Clock className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={appointmentStats.approved.toString()}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Cancelled"
          value={appointmentStats.cancelled.toString()}
          icon={<CheckCircle className="h-5 w-5" />}
          color="blue"
        />
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <CalendarDays className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Appointments
            </h2>
          </div>
          <span className="text-sm text-gray-500">
            {recentAppointments.length} of {appointmentStats.total}
          </span>
        </div>

        {recentAppointments.length > 0 ? (
          <div className="space-y-4">
            {recentAppointments.map((appointment: any) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(appointment.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                      {appointment.priority_rank && (
                        <span
                          className={`text-xs ${getPriorityColor(
                            appointment.priority_rank
                          )}`}
                        >
                          Priority: {appointment.priority_rank}/10
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Medical Consultation
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {appointment.medical_description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {formatDate(appointment.created_at)}</span>
                      <span>
                        Visiting Status: {appointment.visiting_status}
                      </span>
                      {appointment.severity_score && (
                        <span>Severity: {appointment.severity_score}/10</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments found</p>
            <p className="text-sm text-gray-400">
              Book your first appointment to get started
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Book Appointment"
            description="Schedule a new medical consultation"
            href="/dashboard/appointments"
            color="blue"
          />
          <QuickActionCard
            title="View All Appointments"
            description="See your complete appointment history"
            href="/dashboard/appointments"
            color="green"
          />
        </div>
      </div>
    </div>
  );
}

// StatCard component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`p-2 rounded-lg ${
            colorClasses[color as keyof typeof colorClasses]
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// QuickActionCard component
function QuickActionCard({
  title,
  description,
  href,
  color,
}: {
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: "hover:bg-blue-50 border-blue-200",
    green: "hover:bg-green-50 border-green-200",
    purple: "hover:bg-purple-50 border-purple-200",
  };

  return (
    <a
      href={href}
      className={`block p-4 border rounded-lg transition-colors ${
        colorClasses[color as keyof typeof colorClasses]
      }`}
    >
      <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </a>
  );
}
