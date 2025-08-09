import { Button } from "@/components/ui/button";
import { AppointmentCardType } from "@/types/Appointment";
import clsx from "clsx";
import { Info } from "lucide-react";

const AppointmentCard = ({
  appointment,
}: {
  appointment: AppointmentCardType;
}) => {
  return (
    <div
      key={appointment.id}
      className={clsx(
        "cursor-default bg-white/50 p-4 rounded-lg border-2 m-2 duration-300 transition-all",
        appointment.status === "approved"
          ? "hover:bg-green-600/5 hover:border-green-600"
          : appointment.status === "pending"
          ? "hover:bg-yellow-500/5 hover:border-yellow-600"
          : appointment.status === "cancelled"
          ? "hover:bg-red-500/5 hover:border-red-600"
          : "hover:bg-blue-500/5 hover:border-blue-600"
      )}
    >
      <Button
        className={clsx(
          "float-right",
          appointment.status === "approved"
            ? "text-green-600"
            : appointment.status === "pending"
            ? "text-yellow-600"
            : appointment.status === "cancelled"
            ? "text-red-600"
            : "text-blue-500"
        )}
        variant={"ghost"}
      >
        <Info />
      </Button>
      <h3 className="capitalize">{appointment.status} appointment</h3>
      <p className="text-xs text-muted-foreground">
        {new Date(appointment.created_at)
          .toLocaleString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
          .replace(
            /(\d{1,2}) (\w+) (\d{4}), (\d{2}):(\d{2})/,
            (_, d, m, y, h, min) => {
              // Add ordinal suffix to day
              const day = Number(d);
              const suffix =
                day === 1 || day === 21 || day === 31
                  ? "st"
                  : day === 2 || day === 22
                  ? "nd"
                  : day === 3 || day === 23
                  ? "rd"
                  : "th";
              return `${day}${suffix} ${m} ${y}, ${h}:${min} ${
                new Date(appointment.date)
                  .toLocaleString("en-US", {
                    hour: "2-digit",
                    hour12: true,
                  })
                  .split(" ")[1]
              }`;
            }
          )}
      </p>
      {/* <h3 className="text-lg font-medium">
                {appointment.patientName}
              </h3> */}
      <p className="line-clamp-3 text-[15px] mt-2 text-black/90">
        {appointment.condition} Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Nobis eum illum officia, incidunt molestias fugiat
        maxime numquam optio natus! Sit!
      </p>
    </div>
  );
};

export default AppointmentCard;
