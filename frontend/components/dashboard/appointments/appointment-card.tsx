import { Button } from "@/components/ui/button";
import { AppointmentCardType } from "@/types/Appointment";
import clsx from "clsx";
import { Info, Calendar, FileText, AlertCircle } from "lucide-react";

const AppointmentCard = ({
  appointment,
  onViewDetails,
}: {
  appointment: AppointmentCardType;
  onViewDetails?: (appointment: AppointmentCardType) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
      case "approved":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      case "completed":
        return "blue";
      default:
        return "gray";
    }
  };

  const formatVisitingStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      discharged_inpatient_2weeks: "Discharged (2 weeks)",
      discharged_inpatient_1week: "Discharged (1 week)",
      external_referral: "External Referral",
      internal_referral: "Internal Referral",
      review_patient: "Review Patient",
    };
    return statusMap[status] || status;
  };

  const color = getStatusColor(appointment.status);

  return (
    <div
      key={appointment.id}
      className={clsx(
        "cursor-default bg-white p-4 rounded-lg border-2 m-2 duration-300 transition-all",
        color === "green"
          ? "hover:bg-green-50/90 hover:border-green-600"
          : color === "yellow"
          ? "hover:bg-yellow-50/90 hover:border-yellow-600"
          : color === "red"
          ? "hover:bg-red-50/90 hover:border-red-600"
          : "hover:bg-blue-50/90 hover:border-blue-600"
      )}
    >
      <Button
        className={clsx(
          "float-right",
          color === "green"
            ? "text-green-600"
            : color === "yellow"
            ? "text-yellow-600"
            : color === "red"
            ? "text-red-600"
            : "text-blue-500"
        )}
        variant={"ghost"}
        onClick={() => onViewDetails?.(appointment)}
      >
        <Info />
      </Button>
      
      <h3 className="capitalize font-medium text-lg mb-2">
        {appointment.status} appointment
      </h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {new Date(appointment.created_at)
              .toLocaleString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {formatVisitingStatus(appointment.visiting_status)}
          </p>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-gray-700 line-clamp-2">
            {appointment.medical_description}
          </p>
        </div>
        
        {appointment.priority_rank && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Priority: {appointment.priority_rank}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
