"use client";

import { Patient, samplePatients } from "@/types/patient";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { OPDButton } from "@/components/ui/opdbutton";

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
    // Simulate API call with sample data
    const currentPatient = samplePatients.find(p => p.visitStatus === 'In Progress');
    const nextPatient = samplePatients.find(p => p.visitStatus === 'Waiting');
    const upcomingPatients = samplePatients.filter(
      p => p.visitStatus === 'Waiting' && p.queueNumber !== nextPatient?.queueNumber
    );

    setPatients({
      currentPatient: currentPatient || null,
      nextPatient: nextPatient || null,
      upcomingPatients
    });
  }, []);

  const handleSkipPatient = () => {
    if (!patients.currentPatient || !patients.nextPatient) return;
  
    setPatients(prev => ({
      ...prev,
      currentPatient: {
        ...prev.nextPatient!,
        visitStatus: 'In Progress'  // New current patient is now in progress
      },
      nextPatient: {
        ...prev.currentPatient,
        visitStatus: 'Waiting'  // Previous current patient goes back to waiting
      },
      // upcomingPatients remains unchanged
    }));
  };

  // const handleSkipPatient = () => {
  //   if (!patients.currentPatient || !patients.nextPatient) return;

  //   setPatients(prev => ({
  //     currentPatient: prev.nextPatient,
  //     nextPatient: prev.upcomingPatients[0] || null,
  //     upcomingPatients: prev.upcomingPatients.slice(1).concat({
  //       ...prev.currentPatient!,
  //       visitStatus: 'Waiting'
  //     })
  //   }));
  // };

  const handleUnavailablePatient = (patient: Patient) => {
    if (!patients.currentPatient) return;
  
    setPatients(prev => {
      // Mark current patient as unavailable
      const unavailablePatient = {
        ...patient,
        visitStatus: 'Unavailable'
      };
  
      return {
        currentPatient: prev.nextPatient 
          ? { ...prev.nextPatient, visitStatus: 'In Progress' } 
          : null,
        nextPatient: prev.upcomingPatients[0] || null,
        upcomingPatients: [
          ...prev.upcomingPatients.slice(1),
          unavailablePatient // Add to end of queue as unavailable
        ]
      };
    });
  };

  const handleCompletePatient = () => {
    if (!patients.currentPatient || !patients.nextPatient) return;
  
    setPatients(prev => ({
      currentPatient: {
        ...prev.nextPatient!,
        visitStatus: 'In Progress'  // New current patient is now in progress
      },
      nextPatient: prev.upcomingPatients[0] 
        ? {
            ...prev.upcomingPatients[0],
            visitStatus: 'Waiting'  // Next patient remains waiting
          } 
        : null,
      upcomingPatients: prev.upcomingPatients.slice(1)
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">OPD Dashboard</h1>
      
      {/* Current Patient */}
      <div className="grid gap-4">
        {patients.currentPatient && (
          <PatientCard 
            key={patients.currentPatient.id}
            patient={patients.currentPatient} 
            highlight 
            actions={
              <div className="flex gap-2">
                <OPDButton 
                  variant="outline" 
                  size="sm"
                  onClick={handleSkipPatient}
                >
                  Skip
                </OPDButton>
                <OPDButton 
                  variant="warning" 
                  size="sm"
                  onClick={() => handleUnavailablePatient(patients.currentPatient!)}
                >
                  Unavailable
                </OPDButton>
                <OPDButton 
                  variant="success" 
                  size="sm"
                  onClick={handleCompletePatient}
                >
                  Complete
                </OPDButton>
              </div>
            }
          />
        )}
      </div>

      {/* Next Patient */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Next Up</h2>
      <div className="grid gap-4">
        {patients.nextPatient && (
          <PatientCard 
            key={patients.nextPatient.id}
            patient={patients.nextPatient} 
          />
        )}
      </div>

      {/* Upcoming Patients */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Patients</h2>
      <div className="grid gap-4">
        {patients.upcomingPatients.map(patient => (
          <PatientCard 
            key={patient.id}
            patient={patient}
          />
        ))}
      </div>
    </div>
  );
}

interface PatientCardProps {
  patient: Patient;
  highlight?: boolean;
  actions?: React.ReactNode;
}

function PatientCard({ patient, highlight = false, actions }: PatientCardProps) {
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
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">#{patient.queueNumber}</p>
              <Badge variant={getStatusVariant(patient.visitStatus)}>
                {patient.visitStatus}
              </Badge>
            </div>
            <p className="font-medium text-lg">{patient.name}</p>
            <div className="text-sm text-muted-foreground mt-1">
              <p>{patient.gender} • {patient.age} years</p>
              <p className="font-medium mt-1">Condition: {patient.medicalCondition}</p>
              {patient.patientStatus && (
                <p className="mt-1">Patient Status: {patient.patientStatus}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="ml-4">
              {actions}
            </div>
          )}
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
    case 'Unavailable':
      return 'destructive'; // Red color for unavailable
    default:
      return 'secondary';
  }
}