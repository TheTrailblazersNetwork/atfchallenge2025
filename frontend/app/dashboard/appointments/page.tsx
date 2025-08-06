import DashboardPageHeader from '@/components/dashboard/page-header';
import { Button } from '@/components/ui/button'
import Link from 'next/link';
import React from 'react'

const page = () => {
  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Appointments"
        subtitle="Manage your appointments, view upcoming schedules, and book new
          appointments with your healthcare provider."
      />
      <div>
        <Button asChild>
          <Link href={"/dashboard/appointments/create"}>
            Book an Appointment
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default page