"use client";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentCardType } from "@/types/Appointment";
import { updateAppointment } from "@/store/features/appointmentsReducer";
import { Calendar, FileText, AlertCircle, User, Clock } from "lucide-react";
import { toast } from "sonner";
import { cancelAppointment } from "@/services/appointmentService";

interface AppointmentDetailsProps {
  appointment: AppointmentCardType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppointmentUpdated?: () => void;
}

export default function AppointmentDetails({
  appointment,
  open,
  onOpenChange,
  onAppointmentUpdated,
}: AppointmentDetailsProps) {
  const dispatch = useDispatch();
  const [isCancelling, setIsCancelling] = useState(false);

  if (!appointment) return null;

  const formatVisitingStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      discharged_inpatient_2weeks: "Discharged Inpatient (2 weeks)",
      discharged_inpatient_1week: "Discharged Inpatient (1 week)",
      external_referral: "External Referral",
      internal_referral: "Internal Referral",
      review_patient: "Review Patient",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCancel = async () => {
    if (appointment.status.toLowerCase() === "cancelled") {
      toast.error("Appointment is already cancelled", { richColors: true });
      return;
    }

    if (appointment.status.toLowerCase() === "completed") {
      toast.error("Cannot cancel a completed appointment", {
        richColors: true,
      });
      return;
    }

    if (appointment.status.toLowerCase() === "approved") {
      toast.error("Cannot cancel an approved appointment", {
        richColors: true,
      });
      return;
    }

    if (appointment.status.toLowerCase() === "rebook") {
      toast.error("Cannot cancel a rebook appointment", { richColors: true });
      return;
    }

    setIsCancelling(true);

    const cancelPromise = async () => {
      await cancelAppointment(appointment.id);

      // Update the appointment in Redux state
      const updatedAppointment = {
        ...appointment,
        status: "cancelled",
        updated_at: new Date().toISOString(),
      };
      dispatch(updateAppointment(updatedAppointment));

      // Trigger update callback to refresh any filtered views
      onAppointmentUpdated?.();

      // Close the modal
      onOpenChange(false);

      return "Appointment cancelled successfully";
    };

    try {
      await toast.promise(cancelPromise(), {
        loading: "Cancelling appointment...",
        success: "Appointment cancelled successfully",
        error: (error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to cancel appointment";
          return errorMessage;
        },
      });
    } catch (error) {
      console.log(error);
      // Error handling is done by toast.promise
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Appointment Details
          </DialogTitle>
          <DialogDescription>
            View and manage your appointment information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                appointment.status
              )}`}
            >
              {appointment.status.charAt(0).toUpperCase() +
                appointment.status.slice(1)}
            </span>
            {appointment.priority_rank && (
              <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                Priority: {appointment.priority_rank}
              </span>
            )}
          </div>

          {/* Appointment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.created_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(appointment.updated_at).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Visiting Status</p>
                  <p className="text-sm text-muted-foreground">
                    {formatVisitingStatus(appointment.visiting_status)}
                  </p>
                </div>
              </div>

              {appointment.discharge_type && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Discharge Type</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.discharge_type}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medical Description */}
          <div>
            <p className="text-sm font-medium mb-2">Medical Description</p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">{appointment.medical_description}</p>
            </div>
          </div>

          {/* Appointment ID */}
          <div>
            <p className="text-sm font-medium mb-1">Appointment ID</p>
            <p className="text-xs text-muted-foreground font-mono">
              {appointment.id}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {appointment.status.toLowerCase() !== "cancelled" &&
            appointment.status.toLowerCase() !== "completed" &&
            appointment.status.toLowerCase() !== "approved" &&
            appointment.status.toLowerCase() !== "rebook" && (
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel Appointment"}
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
