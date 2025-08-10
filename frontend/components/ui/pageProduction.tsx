"use client";

import { Patient } from "@/types/patient";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function OPDDashboardPage() {
  const [patients, setPatients] = useState<{
    currentPatient: Patient | null;
    nextPatient: Patient | null;
    upcomingPatients: Patient[];
  }>({
    currentPatient: null,
    nextPatient: null,
    upcomingPatients: [],
  });

  useEffect(() => {
    // TODO: Replace with actual API call
    fetchPatientQueue();
  }, []);

  async function fetchPatientQueue() {
    try {
      const response = await fetch('/api/opd/queue');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patient queue:', error);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Patient Queue</h1>
          <p className="text-muted-foreground">Korle Bu Teaching Hospital</p>
        </div>
      </div>

      {/* Current Patient */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Now Serving</h2>
        {patients.currentPatient && (
          <PatientCard
            patient={patients.currentPatient}
            highlight
          />
        )}
      </section>

      {/* Next Patient */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Next Up</h2>
        {patients.nextPatient && (
          <PatientCard
            patient={patients.nextPatient}
          />
        )}
      </section>

      {/* Upcoming Patients */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Upcoming</h2>
        <div className="space-y-3">
          {patients.upcomingPatients.map((patient) => (
            <PatientCard
              key={patient.queueNumber}
              patient={patient}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface PatientCardProps {
  patient: Patient;
  highlight?: boolean;
}

function PatientCard({ patient, highlight = false }: PatientCardProps) {
  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-lg border
        ${highlight ? 'bg-primary/5 border-primary' : 'bg-background'}
      `}
    >
      <div className="size-10 rounded-full bg-muted/20 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">#{patient.queueNumber}</p>
              <Badge variant={getStatusVariant(patient.visitStatus)}>
                {patient.visitStatus}
              </Badge>
            </div>
            <p className="font-medium">{patient.name}</p>
            <div className="text-sm text-muted-foreground">
              <p>{patient.gender} • {patient.age} years</p>
              <p className="font-medium">Condition: {patient.medicalCondition}</p>
              {patient.estimatedWaitTime && (
                <p>Estimated Wait: {patient.estimatedWaitTime}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusVariant(status: Patient['visitStatus']) {
  switch (status) {
    case 'In Progress':
      return 'default';
    case 'Completed':
      return 'success';
    default:
      return 'secondary';
  }
}
