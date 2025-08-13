"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface OPDAuthGuardProps {
  children: ReactNode;
}

export default function OPDAuthGuard({ children }: OPDAuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const opdAuth = localStorage.getItem("opdAuth");
        if (opdAuth) {
          const authData = JSON.parse(opdAuth);
          if (authData.authenticated && authData.type === "opd" && authData.token) {
            setIsAuthenticated(true);
          } else {
            router.push("/opd/login");
          }
        } else {
          router.push("/opd/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/opd/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will redirect to login
  }

  return <>{children}</>;
}
