"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";
import TextLogo from "@/components/TextLogo";
import { opdAuthService } from "@/services/opdService";
import { toast } from "sonner";
import PageMain from "@/components/PageMain";
import TLHeader from "@/components/TLHeader";

export default function OPDSignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Special handling for phone number - only allow digits and enforce 10 digits starting with 0
    if (e.target.name === "phoneNumber") {
      // Remove all non-digit characters
      value = value.replace(/\D/g, "");
      
      // Limit to 10 digits
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name", { richColors: true });
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email", { richColors: true });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address", { richColors: true });
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter your phone number", { richColors: true });
      return false;
    }

    // Validate phone number format (10 digits starting with 0)
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Phone number must be 10 digits starting with 0", { richColors: true });
      return false;
    }

    if (!formData.password) {
      toast.error("Please enter a password", { richColors: true });
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long", { richColors: true });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match", { richColors: true });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Creating your account...", { richColors: true });

    try {
      const response = await opdAuthService.signup({
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phoneNumber,
        password: formData.password,
      });
      
      if (response.success) {
        toast.success("Account created successfully! Please login.", {
          richColors: true,
        });
        
        router.push("/opd/login");
      } else {
        toast.error(response.error || "Signup failed", { richColors: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create account. Please try again.", { richColors: true });
    } finally {
      toast.dismiss(loadingToast);
      setIsLoading(false);
    }
  };

  return (
    <PageMain>
      <Card className="nf-glass-bg text-center">
        <TLHeader title="Create OPD Account" desc="Create a new OPD account" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phoneNumber}
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      const sanitized = input.value.replace(/[^0-9]/g, "");
                      setFormData(prev => ({
                        ...prev,
                        phoneNumber: sanitized
                      }));
                    }}
                    onChange={handleChange}
                    placeholder="0244123456"
                    pattern="[0-9]{10}"
                    inputMode="numeric"
                    className="mt-1"
                    disabled={isLoading}
                    maxLength={10}
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="mt-1 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="mt-1 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/opd/login"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
    </PageMain>
  );
}
