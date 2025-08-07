export interface Patient {
  id: string;
  queueNumber: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  medicalCondition: string;
  visitStatus: 'Waiting' | 'In Progress' | 'Completed';
  patientStatus: string;
}

export const samplePatients: Patient[] = [
  {
    id: "p1",
    queueNumber: "001",
    name: "John Smith",
    gender: "Male",
    age: 45,
    medicalCondition: "Migraine",
    visitStatus: "In Progress",
    patientStatus: "Discharged Inpatients(1 week early review)"
  },
  {
    id: "p2",
    queueNumber: "002",
    name: "Sarah Johnson",
    gender: "Female",
    age: 32,
    medicalCondition: "Chronic Headache",
    visitStatus: "Waiting",
    patientStatus: "Discharged Inpatients(1 week early review)"
  },
  {
    id: "p3",
    queueNumber: "003",
    name: "Michael Brown",
    gender: "Male",
    age: 58,
    medicalCondition: "Vertigo",
    visitStatus: "Waiting",
    patientStatus: "Discharged Inpatients(2 weeks post discharge)"
  },
  {
    id: "p4",
    queueNumber: "004",
    name: "Emma Davis",
    gender: "Female",
    age: 28,
    medicalCondition: "Epilepsy",
    visitStatus: "Waiting",
    patientStatus: "External Referrals(1st Timers)"
  },
  {
    id: "p5",
    queueNumber: "005",
    name: "Raymond Twist",
    gender: "Male",
    age: 28,
    medicalCondition: "Stomach Ulcer",
    visitStatus: "Waiting",
    patientStatus: "Internal Referrals(1st Timers)"
  },
  {
    id: "p6",
    queueNumber: "006",
    name: "Benedicta Davis",
    gender: "Female",
    age: 28,
    medicalCondition: "Neck Pain Follow-up",
    visitStatus: "Waiting",
    patientStatus: "Review Patients(Old Patients)"
  }

];