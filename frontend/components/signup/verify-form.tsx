"use client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { CircleCheckBig } from "lucide-react";
import PageLoading from "../Page-Loading";
import PageError from "../Page-Error";
import system_api from "@/app/data/api";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TLHeader from "../TLHeader";

const RESEND_TIMEOUT = 15 * 60; // 15 minutes in seconds

function useResendTimer() {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [targetMinute, setTargetMinute] = useState<number | null>(null);
  const [targetSecond, setTargetSecond] = useState<number | null>(null);
  const [targetTime, setTargetTime] = useState<string | null>(null); // full time part after 'T'

  // Start timer
  // If isoDate is provided, countdown until that exact moment.
  // Otherwise fall back to fixed RESEND_TIMEOUT.
  const start = (isoDate?: string) => {
    if (isoDate) {
      try {
        // Expecting something like "2025-08-09T21:56:43.574Z"
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) {
          // Fallback if invalid
          setSecondsLeft(RESEND_TIMEOUT);
          setTargetMinute(null);
          setTargetSecond(null);
          setTargetTime(null);
          return;
        }

        // Extract time portion after 'T'
        // Keep everything up to (but not including) 'Z'
        const timePartRaw = isoDate.split("T")[1] || "";
        const timePart = timePartRaw.replace(/Z$/, ""); // remove trailing Z if present
        // timePart might include milliseconds; take the HH:MM:SS portion
        const hms = timePart.split(".")[0]; // "21:56:43"
        const hmsParts = hms.split(":");
        const mm = hmsParts[1] ? parseInt(hmsParts[1], 10) : null;
        const ss = hmsParts[2] ? parseInt(hmsParts[2], 10) : null;

        setTargetMinute(mm ?? null);
        setTargetSecond(ss ?? null);
        setTargetTime(hms); // store HH:MM:SS (without ms)

        const diffMs = date.getTime() - Date.now();
        const diffSec = Math.max(0, Math.ceil(diffMs / 1000));
        setSecondsLeft(diffSec);
        return;
      } catch {
        // Fallback to default timeout
      }
    }

    // Default path (no valid date passed)
    setSecondsLeft(RESEND_TIMEOUT);
    setTargetMinute(null);
    setTargetSecond(null);
    setTargetTime(null);
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
    targetTime, // "HH:MM:SS" if a date was supplied
    targetMinute, // minute from supplied date
    targetSecond, // second from supplied date
  };
}

export function VerifyForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(false);

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("verificationId");
      const e = localStorage.getItem("verificationEmail");
      const m = localStorage.getItem("verificationPhone");
      if (stored && stored.trim() !== "") {
        axios
          .get(system_api.patient.getVerificationStatus + stored)
          .then((res) => {
            if (res.status === 200) {
              setVerificationId(stored);
              setSmsVerified(res.data.phone);
              setMailVerified(res.data.email);
              setEmail(e as string);
              setMobile(m as string);
            } else {
              setError(true);
              localStorage.clear();
            }
          })
          .catch(() => {
            localStorage.clear();
            setError(true);
          })
          .finally(() => setLoading(false));
        setVerificationId(stored);
      } else {
        localStorage.clear();
        setError(true);
      }
    } catch (e) {
      console.log(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // State for OTP verified status
  const [mailVerified, setMailVerified] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);
  // State for OTP inputs
  const [mailOtp, setMailOtp] = useState("");
  const [smsOtp, setSmsOtp] = useState("");
  // Resend timers for email and SMS
  const otpTimer = useResendTimer();

  const requestResend = () => {
    if (otpTimer.disabled) return;
    setVerifying(true);
    axios
      .post(system_api.patient.resendOTP + verificationId)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
        if (err.response) {
          const expiry = err.response.data.expiresAt;
          otpTimer.start(expiry || undefined);
        } else {
          toast.error("Failed to resend OTP. Please try again.", {
            richColors: true,
          });
        }
      })
      .finally(() => {
        setVerifying(false);
      });
  };

  const verfiyEmail = async () => {
    setVerifying(true);
    axios
      .post(system_api.patient.mailVerify + verificationId, {
        otp: mailOtp,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(res.data.message || "Email verified successfully.", {
            richColors: true,
          });
          setMailVerified(true);
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response) {
          toast.error(err.response.data.error || "Email verification failed", {
            richColors: true,
          });
        } else {
          toast.error("An error occurred while verifying email", {
            richColors: true,
          });
        }
      })
      .finally(() => {
        setVerifying(false);
      });
  };

  const verifySms = async () => {
    setVerifying(true);
    axios
      .post(system_api.patient.smsVerify + verificationId, {
        otp: smsOtp,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success(
            res.data.message || "Phone number verified successfully.",
            { richColors: true }
          );
          setSmsVerified(true);
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response) {
          toast.error(err.response.data.error || "SMS verification failed", {
            richColors: true,
          });
        } else {
          toast.error("An error occurred while verifying SMS", {
            richColors: true,
          });
        }
      })
      .finally(() => {
        setVerifying(false);
      });
  };

  const doLogin = () => {
    router.push("/login");
    localStorage.clear();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {loading ? (
        <PageLoading text="Loading verification..." />
      ) : error ? (
        <PageError
          title="Invalid Request"
          text="Failed to load verification data"
          link="/login"
          linkText="Go to Login"
        />
      ) : (
        <Card className="nf-glass-bg">
          <TLHeader
            title="Account Verification"
            desc="Verify your email and mobile number"
          />
          <CardContent>
            <div>
              <div className="flex flex-col gap-6">
                <div className="*:not-first:mt-2">
                  {mailVerified ? (
                    <VerifiedComponent text="Email Verified" />
                  ) : (
                    <form
                      className="grid gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        verfiyEmail();
                      }}
                    >
                      <Label className="text-center block">
                        Email Verification
                      </Label>
                      <div className="flex items-center justify-center gap-2">
                        <InputOTP
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
                            const sanitized = input.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            setMailOtp(sanitized);
                          }}
                          disabled={verifying}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <span className="text-xs text-center text-muted-foreground">
                        Your code will be sent to <b>{email}</b>
                      </span>
                      <Button
                        variant={"outline"}
                        disabled={verifying}
                        type="submit"
                      >
                        Verify
                      </Button>
                    </form>
                  )}
                </div>
                <div className="*:not-first:mt-2">
                  {smsVerified ? (
                    <VerifiedComponent text="Phone Number Verified" />
                  ) : (
                    <form
                      className="grid gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        verifySms();
                      }}
                    >
                      <Label className="text-center block">
                        SMS Verification
                      </Label>
                      <div className="flex items-center justify-center gap-2">
                        <InputOTP
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
                            const sanitized = input.value.replace(
                              /[^0-9]/g,
                              ""
                            );
                            setSmsOtp(sanitized);
                          }}
                          disabled={verifying}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <span className="text-xs text-center text-muted-foreground">
                        Your code will be sent to <b>{mobile}</b>
                      </span>
                      <Button
                        variant={"outline"}
                        disabled={verifying}
                        type="submit"
                      >
                        Verify
                      </Button>
                    </form>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={
                      otpTimer.disabled ||
                      (mailVerified && smsVerified) ||
                      verifying
                    }
                    onClick={requestResend}
                  >
                    {otpTimer.disabled
                      ? `Resend in (${otpTimer.formatted})`
                      : "Resend OTP"}
                  </Button>
                  <Button
                    type="button"
                    onClick={doLogin}
                    disabled={!mailVerified || !smsVerified}
                  >
                    Login
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const VerifiedComponent = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-col gap-1 items-center justify-center rounded">
      <CircleCheckBig className="text-green-700" size={40} />
      <span className="text-green-700 font-medium tracking-wide">{text}</span>
    </div>
  );
};
