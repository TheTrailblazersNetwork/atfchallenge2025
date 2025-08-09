"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "sonner";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const patient = useSelector((state: any) => state.patient);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please log in to access the dashboard", { richColors: true });
      router.push("/login");
    }
  }, [router]);

  // Show loading while checking authentication
  if (!isAuthenticated()) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
}
