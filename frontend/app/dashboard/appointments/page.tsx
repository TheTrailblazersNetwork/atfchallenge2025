"use client";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import AppointmentCard from "@/components/dashboard/appointments/appointment-card";
import AppointmentFilters from "@/components/dashboard/appointments/appointment-filters";
import DashboardPageHeader from "@/components/dashboard/page-header";
import BookAppointment from "@/components/dashboard/appointments/book-appointment";
import AppointmentDetails from "@/components/dashboard/appointments/appointment-details";
import { AppointmentCardType } from "@/types/Appointment";
import { getPatientAppointments } from "@/services/appointmentService";
import {
  setAppointmentsData,
  setAppointmentsLoading,
} from "@/store/features/appointmentsReducer";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import LoadingIcon from "@/components/Loading-Icon";

const Page = () => {
  const dispatch = useDispatch();
  const { data: appointments, loading: isLoading } = useSelector(
    (state: any) => state.appointments
  );

  const [filterAppointments, setFilterAppointments] = useState<
    AppointmentCardType[]
  >([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentCardType | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [, setIsInitialLoad] = useState(true);

  // Initialize filter appointments when Redux appointments change
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      setFilterAppointments(appointments);
    }
  }, [appointments]);

  const fetchAppointments = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      dispatch(setAppointmentsLoading(true));
      const data = await getPatientAppointments();
      // console.log(data);
      dispatch(setAppointmentsData(data));
      if (showToast) {
        toast.success("Appointments refreshed", { richColors: true });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch appointments", {
        richColors: true,
      });
    } finally {
      dispatch(setAppointmentsLoading(false));
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  };

  // Fetch appointments on component mount with better dependency management
  useEffect(() => {
    // Only fetch if we don't have appointments in Redux state
    if (!appointments || appointments.length === 0) {
      fetchAppointments();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Separate useEffect to handle authentication state
  useEffect(() => {
    // If user navigates away and comes back, refresh if data is stale
    const lastUpdated = localStorage.getItem("appointments_last_updated");
    const now = new Date().getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (lastUpdated && now - parseInt(lastUpdated) > fiveMinutes) {
      fetchAppointments();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAppointmentCreated = () => {
    fetchAppointments(false);
  };

  const handleRefresh = () => {
    fetchAppointments(true);
  };

  const handleViewDetails = (appointment: AppointmentCardType) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  const handleAppointmentUpdated = () => {
    // Update filter appointments to reflect the changes from Redux state
    if (appointments && appointments.length > 0) {
      setFilterAppointments(appointments);
    }
  };

  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Appointments"
        subtitle="Manage your appointments, view upcoming schedules, and book new appointments with your healthcare provider."
      />

      <div className="h-max grid gap-2 xl:flex xl:justify-between xl:items-center md:grid-cols-1">
        <AppointmentFilters
          filter={appointments || []}
          filterFunction={setFilterAppointments}
        />
        <div className="flex max-sm:justify-between md:items-center sm:flex-row gap-4">
          <BookAppointment onAppointmentCreated={handleAppointmentCreated} />
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="nf-glass-bg flex flex-col gap-2 items-center justify-center">
          <LoadingIcon />
          <p className="text-muted-foreground">Loading Appointments</p>
        </div>
      ) : (
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
              <p className="text-gray-500 text-lg mb-4">
                {appointments && appointments.length > 0
                  ? "No appointments match your current filters."
                  : "No appointments found."}
              </p>
              <BookAppointment
                onAppointmentCreated={handleAppointmentCreated}
              />
            </div>
          )}
        </div>
      )}

      <AppointmentDetails
        appointment={selectedAppointment}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onAppointmentUpdated={handleAppointmentUpdated}
      />
    </div>
  );
};

export default Page;
