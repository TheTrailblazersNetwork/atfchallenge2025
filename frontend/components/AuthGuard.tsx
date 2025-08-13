/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
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

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access the dashboard", {
        richColors: true,
      });
      router.push("/login");
    } else {
      // Only initialize data from localStorage if authenticated
      // Don't fetch from API here to avoid conflicts with page-level fetching
      dispatch(getPatientData());
      dispatch(getAppointmentsData());
    }
  }, [router, dispatch]);

  // Show loading while checking authentication
  if (!isAuthenticated()) {
    return null; // Return null immediately for unauthenticated users
  }

  return <>{children}</>;
}
