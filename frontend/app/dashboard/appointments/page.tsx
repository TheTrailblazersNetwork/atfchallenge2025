"use client"
import { useState } from "react";
import appointments from "@/app/data/appointments";
import AppointmentCard from "@/components/dashboard/appointments/appointment-card";
import AppointmentFilters from "@/components/dashboard/appointments/appointment-filters";
import DashboardPageHeader from "@/components/dashboard/page-header";
import { AppointmentCardType } from "@/types/Appointment";

const page = () => {

  const [filterAppointments, setFilterAppointments] = useState<Array<AppointmentCardType>>(appointments);
  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Appointments"
        subtitle="Manage your appointments, view upcoming schedules, and book new
          appointments with your healthcare provider."
      />

      <AppointmentFilters filter={filterAppointments} filterFunction={setFilterAppointments} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {appointments && appointments.length > 0 ? (
          appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <div className="col-span-4 text-center text-gray-500">
            No appointments found.
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
