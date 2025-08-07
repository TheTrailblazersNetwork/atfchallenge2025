"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChangeForm } from "@/components/forgot-password/change-form";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import system_api from "@/app/data/api";
import LoadingIcon from "@/components/Loading-Icon";

const page = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (slug && slug !== "null") {
      axios
        .get(system_api.patient.validateForgotPassword + slug)
        .then((res) => {
          if(res.status === 200) setIsValid(true);
        })
        .catch((err) => setIsValid(false))
        .finally(() => setLoading(false))
    } else {
      setLoading(false);
    }
  }, [slug]);

  return (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-svh w-full p-6 md:p-10">
          <div className="w-full max-w-sm rounded-lg bg-card shadow-lg p-8 text-center">
            <Logo classname="mb-6 h-10 mx-auto w-auto" />
            <LoadingIcon />
            <h1 className="text-xl font-semibold mt-2">
              Password Reset Request
            </h1>
            <p className="text-muted-foreground text-sm mb-4">
              Please wait while we verify your request.
            </p>
          </div>
        </div>
      ) : isValid ? (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <ChangeForm token={Array.isArray(slug) ? slug[0] : slug ?? ""} />
          </div>
        </div>
      ) : (
        invalidSlug()
      )}
    </>
  );
};

const invalidSlug = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh w-full p-6 md:p-10">
      <div className="w-full max-w-sm rounded-lg bg-card shadow-lg p-8 text-center">
        <Logo classname="mb-6 h-10 mx-auto w-auto" />
        <h1 className="text-xl font-semibold text-destructive mb-2">
          Invalid or Expired Link
        </h1>
        <p className="text-muted-foreground text-sm mb-4">
          The link you used is either invalid or has expired. Please request a
          new password reset link.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
};

export default page;
