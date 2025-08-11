"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import system_data from "@/app/data/system";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import system_api from "@/app/data/api";
import { MailCheck, MailWarning } from "lucide-react";
import TLHeader from "../TLHeader";

export function PreferenceForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [identifier, setIdentifier] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const loadingToast = toast.loading("Authenticating...", { richColors: true });
    axios
      .post(system_api.patient.forgotPassword, { identifier })
      .then((res) => {
        if (res.status === 200) {
          toast.success(
            "If an account exists, you'll receive a recovery link.",
            {
              richColors: true,
            }
          );
          setCompleted(true);
        } else {
          toast.error("Failed to send recovery link. Please try again.", {
            richColors: true,
          });
        }
      })
      .catch((err) => {
        console.error("Login failed:", err);
        toast.error("Couldn't send recovery link. Please try again", {
          richColors: true,
        });
        setError(true);
      })
      .finally(() => {
        toast.dismiss(loadingToast);
      });
  };

  return (
    <div
      className={cn("flex flex-col gap-6 select-none", className)}
      {...props}
    >
      {error ? (
        <Card className="gl-container">
          <div className="flex items-center justify-center">
            <MailWarning className="text-red-700" size={70} />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-700">
              Error Occurred
            </h3>
            <p className="text-sm text-muted-foreground">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                setError(false);
                setCompleted(false);
                setIdentifier("");
              }}
              className="cursor-pointer"
              variant="default"
            >
              Try Again
            </Button>
            <Button className="cursor-pointer" variant="outline" asChild>
              <Link href={"/login"}>Go to Login</Link>
            </Button>
          </div>
        </Card>
      ) : completed ? (
        <Card className="gl-container">
          <div className="flex items-center justify-center">
            <MailCheck className="text-green-700" size={70} />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-700">Link Sent</h3>
            <p className="text-sm text-muted-foreground">
              You&apos;ll receive a recovery link.
            </p>
          </div>
          <Button className="cursor-pointer" variant="outline" asChild>
            <Link href={"/login"}>Go to Login</Link>
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            You only receive a recovery link if an account exists with the
            provided email or mobile number.
          </p>
        </Card>
      ) : (
        <Card className="text-center">
          <TLHeader
            title="Password Recovery"
            desc="Choose your recovery method"
          />
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Input
                id="identifier"
                type="text"
                value={identifier}
                className="text-center"
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your email or mobile number"
                required
              />
              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2 mt-3"
                disabled={!identifier}
              >
                Send Recovery Link
              </Button>
              <p className="text-muted-foreground text-center text-xs mt-3">
                If an account exists with your email or mobile number, a
                recovery link will be sent to change your password. <br /> Click{" "}
                <Link href="/login" className="underline">
                  here
                </Link>{" "}
                if you remember your password.
              </p>

              <p className="text-muted-foreground text-center text-xs mt-3">
                You only receive sms links if you opt for SMS notifications
                during signup.
              </p>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
