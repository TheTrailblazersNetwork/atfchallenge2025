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
import { Label } from "@/components/ui/label";
import system_data from "@/app/data/system";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import system_api from "@/app/data/api";
import { useDispatch } from "react-redux";
import { setPatientData } from "@/store/features/patientReducer";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...", { richColors: true });

    try {
      const response = await axios.post(system_api.patient.login, {
        email,
        password
      });

      if (response.status === 200) {
        if (response.data.user.status === "approved") {
          toast.success("Login successful!", { richColors: true });
          dispatch(setPatientData(response.data.user));
          router.push("/opdDashboard");
        } else {
          router.push("/opd-pending-approval");
        }
      }
    } catch (err) {
      if (err.response?.data?.error === "Account pending approval") {
        router.push("/opd-pending-approval");
      } else {
        console.error("Login failed:", err);
        if (err.response && err.response.data) {
          toast.error(err.response.data.error, { richColors: true });
        } else
          toast.error("Couldn't Login. Please try again", {
            richColors: true,
          });
      }
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{system_data.name} OPD Login</CardTitle>
          <CardDescription>Connect to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    className="text-sm underline-offset-4 hover:underline"
                    href={"/forgot-password"}
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div>
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
                      placeholder="Your password"
                      required
                      minLength={6}
                      disabled={isLoading}
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
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isLoading || !email || !password}
                >
                  {isLoading ? "Logging In..." : "Login"}
                </Button>
                {/* <Button variant="outline" className="w-full" disabled={isLoading}>
                  Login with Google
                </Button> */}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
