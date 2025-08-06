"use client";
import { useParams } from "next/navigation";
import { ChangeForm } from "@/components/forgot-password/change-form";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const page = () => {
  const { slug } = useParams();
  
  if (!slug || slug === "null") {
    return invalidSlug();
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ChangeForm />
      </div>
    </div>
  );
};

const invalidSlug = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh w-full p-6 md:p-10">
      <div className="w-full max-w-sm rounded-lg bg-card shadow-lg p-8 text-center">
      <Logo classname="mb-6 h-10 mx-auto w-auto" />
      <h1 className="text-xl font-semibold text-destructive mb-2">Invalid or Expired Link</h1>
      <p className="text-muted-foreground text-sm mb-4">
        The link you used is either invalid or has expired. Please request a new password reset link.
      </p>
      <Button asChild size="lg" className="w-full">
        <Link href="/">Go to Homepage</Link>
      </Button>
      </div>
    </div>
  );
}

export default page;