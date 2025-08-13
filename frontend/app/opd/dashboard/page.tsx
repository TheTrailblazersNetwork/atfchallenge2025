"use client";

import { Patient, samplePatients } from "@/types/patient";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/opdbadge";
import { OPDButton } from "@/components/ui/opdbutton";
import { EndOfQueue } from "@/components/ui/end-of-queue";
import DashboardPageHeader from "@/components/dashboard/page-header";

type PatientsState = {
  currentPatient: Patient | null;
  nextPatient: Patient | null;
  upcomingPatients: Patient[];
};

export default function OPDQueueDashboard() {
  const [patients, setPatients] = useState<PatientsState>({
    currentPatient: null,
    nextPatient: null,
    upcomingPatients: [],
  });

  useEffect(() => {
    const sortedPatients = [...samplePatients].sort((a, b) => 
      parseInt(a.queueNumber) - parseInt(b.queueNumber)
    );

    const currentPatient = sortedPatients.length > 0 
      ? { ...sortedPatients[0], visitStatus: 'In Progress' } 
      : null;

    const nextPatient = sortedPatients.length > 1 
      ? { ...sortedPatients[1], visitStatus: 'Waiting' } 
      : null;

    const upcomingPatients = sortedPatients.length > 2 
      ? sortedPatients.slice(2).map(p => ({ ...p, visitStatus: 'Waiting' }))
      : [];

    setPatients({
      currentPatient,
      nextPatient,
      upcomingPatients
    });
  }, []);

  const handleSkipPatient = () => {
    if (!patients.currentPatient || !patients.nextPatient) return;
  
    setPatients(prev => ({
      ...prev,
      currentPatient: { ...prev.nextPatient as Patient, visitStatus: 'In Progress' },
      nextPatient: { ...prev.currentPatient as Patient, visitStatus: 'Waiting' },
    }));
  };

  const handleUnavailablePatient = () => {
    if (!patients.currentPatient) return;
  
    setPatients(prev => {
      const unavailablePatient = { 
        ...prev.currentPatient as Patient, 
        visitStatus: 'Unavailable' 
      };

      // Get all waiting patients (excluding unavailable ones)
      const waitingPatients = [
        ...(prev.nextPatient ? [prev.nextPatient] : []),
        ...prev.upcomingPatients.filter(p => p.visitStatus !== 'Unavailable')
      ].sort((a, b) => parseInt(a.queueNumber) - parseInt(b.queueNumber));

      const newCurrent = waitingPatients.length > 0
        ? { ...waitingPatients[0], visitStatus: 'In Progress' }
        : null;

      const newNext = waitingPatients.length > 1
        ? { ...waitingPatients[1], visitStatus: 'Waiting' }
        : null;

      // Get all unavailable patients (including the new one)
      const unavailablePatients = [
        ...prev.upcomingPatients.filter(p => p.visitStatus === 'Unavailable'),
        unavailablePatient
      ];

      return {
        currentPatient: newCurrent,
        nextPatient: newNext,
        upcomingPatients: [
          ...waitingPatients.slice(2),
          ...unavailablePatients
        ]
      };
    });
  };

  const handleCompletePatient = () => {
    if (!patients.currentPatient) return;
  
    setPatients(prev => {
      const waitingPatients = [
        ...(prev.nextPatient ? [prev.nextPatient] : []),
        ...prev.upcomingPatients.filter(p => p.visitStatus !== 'Unavailable')
      ].sort((a, b) => parseInt(a.queueNumber) - parseInt(b.queueNumber));

      const newCurrent = waitingPatients.length > 0
        ? { ...waitingPatients[0], visitStatus: 'In Progress' }
        : null;

      const newNext = waitingPatients.length > 1
        ? { ...waitingPatients[1], visitStatus: 'Waiting' }
        : null;

      return {
        currentPatient: newCurrent,
        nextPatient: newNext,
        upcomingPatients: [
          ...waitingPatients.slice(2),
          ...prev.upcomingPatients.filter(p => p.visitStatus === 'Unavailable')
        ]
      };
    });
  };

  const handleRestorePatient = (patient: Patient) => {
    setPatients(prev => {
      const restoredPatient = { ...patient, visitStatus: 'Waiting' };
      
      // Remove from unavailable list
      const unavailablePatients = prev.upcomingPatients.filter(
        p => p.id !== patient.id || p.visitStatus !== 'Unavailable'
      );

      // Add to waiting list and sort
      const waitingPatients = [
        ...(prev.nextPatient ? [prev.nextPatient] : []),
        ...unavailablePatients,
        restoredPatient
      ].sort((a, b) => parseInt(a.queueNumber) - parseInt(b.queueNumber));

      // If current slot is empty and we have waiting patients, promote first to current
      const needsPromotion = !prev.currentPatient && waitingPatients.length > 0;
      const newCurrent = needsPromotion
        ? { ...waitingPatients[0], visitStatus: 'In Progress' }
        : prev.currentPatient;

      const remainingPatients = needsPromotion 
        ? waitingPatients.slice(1)
        : waitingPatients;

      return {
        currentPatient: newCurrent,
        nextPatient: remainingPatients.length > 0
          ? { ...remainingPatients[0], visitStatus: 'Waiting' }
          : null,
        upcomingPatients: remainingPatients.slice(1)
      };
    });
  };

  const handleConfirmUnavailability = (patient: Patient) => {
    setPatients(prev => ({
      ...prev,
      upcomingPatients: prev.upcomingPatients.filter(p => p.id !== patient.id)
    }));
  };

  const isQueueEmpty = !patients.currentPatient && 
                      !patients.nextPatient && 
                      patients.upcomingPatients.length === 0;

  return (
    <div className="dashboard-page">
      <DashboardPageHeader
        title="Queue Dashboard"
        subtitle="Monitor patient queue and manage appointments in real-time"
      />
      
      <div className="p-4">
        {isQueueEmpty ? (
          <EndOfQueue />
        ) : (
          <>
            {/* Current Patient */}
            <div className="grid gap-4">
              {patients.currentPatient && (
                <PatientCard 
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
                        onClick={handleUnavailablePatient}
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
                  actions={patient.visitStatus === 'Unavailable' && (
                    <div className="flex gap-2">
                      <OPDButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRestorePatient(patient)}
                      >
                        Restore
                      </OPDButton>
                      <OPDButton 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleConfirmUnavailability(patient)}
                      >
                        Confirm Unavailability
                      </OPDButton>
                    </div>
                  )}
                />
              ))}
            </div>
          </>
        )}
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
  // Determine recommended doctors based on patientStatus
  const getRecommendedDoctors = () => {
    // Check if patientStatus contains "1st Timers"
    const isFirstTimer = patient.patientStatus.includes("1st Timers");
    
    if (isFirstTimer) {
      return "Resident and Consultant";
    } else {
      // For all other cases (Review, Follow-up, etc.)
      return "Consultant Only";
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border
      ${highlight ? 'bg-primary/5 border-primary' : 'bg-background'}`}>
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
          <div className="text-xs text-muted-foreground text-right">
              <p className="font-medium">Recommended Doctor(s):</p>
              <p>{getRecommendedDoctors()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusVariant(status: Patient['visitStatus']) {
  switch (status) {
    case 'In Progress': return 'default';
    case 'Completed': return 'success';
    case 'Unavailable': return 'destructive';
    default: return 'secondary';
  }
}
