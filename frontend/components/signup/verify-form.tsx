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
    formatted: secondsLeft > 0
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

  const mailTimer = useResendTimer();
  const smsTimer = useResendTimer();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{system_data.name} Account Verification</CardTitle>
          <CardDescription>Verify your email and mobile number</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="*:not-first:mt-2">
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
              </div>
              <div className="*:not-first:mt-2">
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
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Go to Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
