"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import system_data from "@/app/data/system";
import { CircleCheckBig } from "lucide-react";
import Link from "next/link";

const RESEND_TIMEOUT = 15 * 60; // 15 minutes in seconds

function useResendTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Start timer
  const start = () => {
    setSecondsLeft(RESEND_TIMEOUT);
  };

  // Tick down every second
  useEffect(() => {
    if (secondsLeft === 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  return {
    secondsLeft,
    start,
    disabled: secondsLeft > 0,
    formatted:
      secondsLeft > 0
        ? `${Math.floor(secondsLeft / 60)
            .toString()
            .padStart(2, "0")}:${(secondsLeft % 60)
            .toString()
            .padStart(2, "0")}`
        : "",
  };
}

export function VerifyForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // State for OTP verified status
  const [mailVerified, setMailVerified] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  // State for OTP inputs
  const [mailOtp, setMailOtp] = useState("");
  const [smsOtp, setSmsOtp] = useState("");
  // Resend timers for email and SMS
  const mailTimer = useResendTimer();
  const smsTimer = useResendTimer();

  const verfiyEmail = async () => {
    try {
      const response = await fetch(`/api/verify/email/${mailOtp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: mailOtp }),
      });

      const data = await response.json();
      if (data.success) {
        setMailVerified(true);
        alert("Email verified successfully!");
      } else {
        alert(data.error || "Email verification failed.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      alert("An error occurred while verifying email.");
    }
  };

  const verifySms = async () => {
    try {
      const response = await fetch(`/api/verify/sms/${smsOtp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: smsOtp }),
      });

      const data = await response.json();
      if (data.success) {
        setSmsVerified(true);
        alert("SMS verified successfully!");
      } else {
        alert(data.error || "SMS verification failed.");
      }
    } catch (error) {
      console.error("Error verifying SMS:", error);
      alert("An error occurred while verifying SMS.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{system_data.name} Account Verification</CardTitle>
          <CardDescription>Verify your email and mobile number</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex flex-col gap-6">
              <div className="*:not-first:mt-2">
                {mailVerified ? (
                  <VerifiedComponent text="Email Verified" />
                ) : (
                  <form className="grid gap-2" onSubmit={verfiyEmail}>
                    <Label htmlFor="mail">Mail Verification</Label>
                    <div className="flex gap-2">
                      <Input
                        id="mail"
                        className="flex-1"
                        placeholder="XXXXXX"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        minLength={6}
                        maxLength={6}
                        value={mailOtp}
                        required
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          const sanitized = input.value.replace(/[^0-9]/g, "");
                          setMailOtp(sanitized);
                        }}
                      />
                      <Button
                        variant="outline"
                        type="button"
                        disabled={mailTimer.disabled}
                        onClick={mailTimer.start}
                      >
                        {mailTimer.disabled
                          ? `Resend (${mailTimer.formatted})`
                          : "Resend"}
                      </Button>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      Your code will be sent to <b>testing@gmail.com</b>
                    </span>
                    <Button
                      className="w-full"
                      variant={"outline"}
                      type="submit"
                    >
                      Verify Email
                    </Button>
                  </form>
                )}
              </div>
              <div className="*:not-first:mt-2">
                {smsVerified ? (
                  <VerifiedComponent text="SMS Verified" />
                ) : (
                  <form className="grid gap-2" onSubmit={verifySms}>
                    <Label htmlFor="sms">SMS Verification</Label>
                    <div className="flex gap-2">
                      <Input
                        id="sms"
                        className="flex-1"
                        placeholder="XXXXXX"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        minLength={6}
                        maxLength={6}
                        value={smsOtp}
                        required
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          const sanitized = input.value.replace(/[^0-9]/g, "");
                          setSmsOtp(sanitized);
                        }}
                      />
                      <Button
                        variant="outline"
                        type="button"
                        disabled={smsTimer.disabled}
                        onClick={smsTimer.start}
                      >
                        {smsTimer.disabled
                          ? `Resend (${smsTimer.formatted})`
                          : "Resend"}
                      </Button>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      Your code will be sent to <b>+233534155475</b>
                    </span>
                    <Button
                      className="w-full"
                      variant={"outline"}
                      type="submit"
                    >
                      Verify SMS
                    </Button>
                  </form>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  className="w-full"
                  disabled={!mailVerified || !smsVerified}
                  asChild
                >
                  <Link href="/login">Go to Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const VerifiedComponent = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col gap-1 items-center justify-center rounded">
      <CircleCheckBig className="text-green-600" size={40} />
      <span className="text-green-600 font-medium tracking-wide">{text}</span>
    </div>
  );
};
