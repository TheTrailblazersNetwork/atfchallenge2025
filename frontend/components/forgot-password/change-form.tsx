"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import system_data from "@/app/data/system";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import system_api from "@/app/data/api";
import { Eye, EyeOff, MailCheck, MailWarning } from "lucide-react";
import { Label } from "../ui/label";

export function ChangeForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const loadingToast = toast.loading("Logging in...", { richColors: true });
    axios
      .post(system_api.patient.forgotPassword, { })
      .then((res) => {
        if (res.status === 200) {
          toast.success(
            "If an account exists, you'll receive a recovery link.",
            {
              richColors: true,
            }
          );
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
      <Card>
        <CardHeader>
          <CardTitle>{system_data.name} Password Recovery</CardTitle>
          <CardDescription>Set a new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="flex border pr-2 rounded-md shadow"
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  className="border-0 shadow-none"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  minLength={6}
                  disabled={loading}
                />
                {showPassword ? (
                  <EyeOff
                    size={20}
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-muted-foreground"
                  />
                ) : (
                  <Eye
                    size={20}
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-muted-foreground"
                  />
                )}
              </Label>
              <Label
                htmlFor="confirmPassword"
                className="flex border pr-2 rounded-md shadow"
              >
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  className="border-0 shadow-none"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  required
                  minLength={6}
                  disabled={loading}
                />
                {showConfirmPassword ? (
                  <EyeOff
                    size={20}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="cursor-pointer text-muted-foreground"
                  />
                ) : (
                  <Eye
                    size={20}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="cursor-pointer text-muted-foreground"
                  />
                )}
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 mt-3"
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
