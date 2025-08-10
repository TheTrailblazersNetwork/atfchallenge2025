"use client"
import { useState, useEffect } from "react";
import AppointmentCard from "@/components/dashboard/appointments/appointment-card";
import AppointmentFilters from "@/components/dashboard/appointments/appointment-filters";
import DashboardPageHeader from "@/components/dashboard/page-header";
import BookAppointment from "@/components/dashboard/appointments/book-appointment";
import AppointmentDetails from "@/components/dashboard/appointments/appointment-details";
import { AppointmentCardType } from "@/types/Appointment";
import { getPatientAppointments } from "@/services/appointmentService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const page = () => {
  const [appointments, setAppointments] = useState<AppointmentCardType[]>([]);
  const [filterAppointments, setFilterAppointments] = useState<AppointmentCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentCardType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchAppointments = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      const data = await getPatientAppointments();
      setAppointments(data);
      setFilterAppointments(data);
      if (showToast) {
        toast.success("Appointments refreshed", { richColors: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch appointments", { 
        richColors: true 
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAppointmentCreated = () => {
    fetchAppointments(true);
  };

  const handleRefresh = () => {
    fetchAppointments(true);
  };

  const handleViewDetails = (appointment: AppointmentCardType) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  const handleAppointmentUpdated = () => {
    fetchAppointments(true);
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <DashboardPageHeader
          title="Appointments"
          subtitle="Manage your appointments, view upcoming schedules, and book new appointments with your healthcare provider."
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Appointments"
        subtitle="Manage your appointments, view upcoming schedules, and book new appointments with your healthcare provider."
      />

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <BookAppointment onAppointmentCreated={handleAppointmentCreated} />
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <AppointmentFilters filter={filterAppointments} filterFunction={setFilterAppointments} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filterAppointments && filterAppointments.length > 0 ? (
          filterAppointments.map((appointment) => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment}
              onViewDetails={handleViewDetails}
            />
          ))
        ) : (
          <div className="col-span-4 text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No appointments found.</p>
            <BookAppointment onAppointmentCreated={handleAppointmentCreated} />
          </div>
        )}
      </div>

      <AppointmentDetails
        appointment={selectedAppointment}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onAppointmentUpdated={handleAppointmentUpdated}
      />
    </div>
  );
};

export default page;
