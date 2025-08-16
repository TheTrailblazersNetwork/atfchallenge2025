export interface Patient {
  id: string;
  queueNumber: string;
  name: string;
  gender: "Male" | "Female";
  age: number;
  medicalCondition: string;
  patientStatus: string;
  visitStatus: string;
  estimatedWaitTime?: string;
}