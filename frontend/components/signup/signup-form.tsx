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

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Show loading state
    setIsLoading(true);

    // For now: log the data to the console
    const userData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    };

    console.log("User signed up with:", userData);

    try {
      // Later you'll replace this with an actual API call
      // await fetch('/api/signup', { method: 'POST', body: JSON.stringify(userData) });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Navigate to login now
      router.push("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{system_data.name} Sign Up</CardTitle>
          <CardDescription>Create your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-3">
                  <Label htmlFor="email">First Name</Label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Last Name</Label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  placeholder="eg. johndoe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
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
              <div className="space-y-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Re-Enter Password</Label>
                </div>
                <Label
                  htmlFor="password2"
                  className="flex border pr-2 rounded-md shadow"
                >
                  <Input
                    id="password2"
                    type={showPasswordConfirm ? "text" : "password"}
                    value={confirmPassword}
                    className="border-0 shadow-none"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-Enter confirm password"
                    required
                    disabled={isLoading}
                  />
                  {showPasswordConfirm ? (
                    <EyeOff
                      size={20}
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="cursor-pointer text-muted-foreground"
                    />
                  ) : (
                    <Eye
                      size={20}
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                      className="cursor-pointer text-muted-foreground"
                    />
                  )}
                </Label>
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
                {/* <Button variant="outline" className="w-full" disabled={isLoading}>
                  Login with Google
                </Button> */}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}