"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ChangeForm } from "@/components/forgot-password/change-form";
import axios from "axios";
import system_api from "@/app/data/api";
import PageLoading from "@/components/Page-Loading";
import PageError from "@/components/Page-Error";
import PageFull from "@/components/Page-Full";

const page = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (slug && slug !== "null") {
      axios
        .get(system_api.patient.validateForgotPassword + slug)
        .then((res) => {
          if (res.status === 200) setIsValid(true);
        })
        .catch((err) => setIsValid(false))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [slug]);

  return (
    <div className="h-svh w-full">
      {loading ? (
        <PageLoading
          title="Validating Request"
          text="Please wait while we verify your request."
        />
      ) : isValid ? (
        <div className="flex h-full w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <ChangeForm token={Array.isArray(slug) ? slug[0] : slug ?? ""} />
          </div>
        </div>
      ) : (
        invalidSlug()
      )}
    </div>
  );
};

const invalidSlug = () => {
  return (
    <PageFull>
      <PageError
        title="Invalid or Expired Link"
        text="Please request a new password reset link."
        link="/forgot-password"
        linkText="Request New Link"
      />
    </PageFull>
  );
};

export default page;
