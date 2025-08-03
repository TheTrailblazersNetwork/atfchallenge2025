import CreateAppointmentSteps from "@/components/dashboard/appointments/create-steps";
import DashboardPageHeader from "@/components/dashboard/page-header";

const page = () => {
  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Book an Appointment"
        className="text-center"
        subtitle="Schedule your visit in just a few steps."
      />
      <CreateAppointmentSteps />
    </div>
  );
};

export default page;
