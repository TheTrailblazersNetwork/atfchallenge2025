"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import PageFull from "./Page-Full";
import PageLoading from "./Page-Loading";

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
      <PageFull alt={true}>
        <PageLoading title="Authenticating" text="checking for authentication" />
      </PageFull>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will redirect to login
  }

  return <>{children}</>;
}
