import { Button } from '@/components/ui/button'
import Link from 'next/link';
import React from 'react'

const page = () => {
  return (
    <div className="dashboard-page">
      <div>
        <h2 className="text-2xl font-bold">Appointments</h2>
        <p className="text-gray-600">
          Manage your appointments, view upcoming schedules, and book new
          appointments with your healthcare provider.
        </p>
      </div>
      <div>
        <Button asChild>
          <Link href={"/dashboard/appointments/create"}>Book an Appointment</Link>
        </Button>
      </div>
    </div>
  );
}

export default page