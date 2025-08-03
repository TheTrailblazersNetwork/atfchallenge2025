import CreateAppointmentSteps from "@/components/dashboard/appointments/create-steps";

const page = () => {

  return (
    <div className="dashboard-page">
      <div>
        <h2 className="text-2xl text-center font-bold">Book an Appointment</h2>
      </div>
      <CreateAppointmentSteps />
    </div>
  );
};

export default page;
