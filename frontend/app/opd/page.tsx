"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLoading from "@/components/Page-Loading";
import PageFull from "@/components/Page-Full";

export default function OPDPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/opd/dashboard");
  }, [router]);

  return (
    <PageFull alt={true}>
        <PageLoading title="OPD Dashboard" text="Loading" />
    </PageFull>
  );
}
