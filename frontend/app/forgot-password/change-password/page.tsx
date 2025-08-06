"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChangePasswordPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/forgot-password/change-password/null");
    }, [router]);

    return null;
}