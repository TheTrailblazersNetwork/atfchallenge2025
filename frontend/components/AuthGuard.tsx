"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { getPatientData } from "@/store/features/patientReducer";
import { getAppointmentsData } from "@/store/features/appointmentsReducer";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const patient = useSelector((state: any) => state.patient);
  console.log(patient);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access the dashboard", { richColors: true });
      router.push("/login");
    } else {
      // Initialize data from localStorage if authenticated
      dispatch(getPatientData());
      dispatch(getAppointmentsData());
    }
  }, [router, dispatch]);

  // Show loading while checking authentication
  if (!isAuthenticated()) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
