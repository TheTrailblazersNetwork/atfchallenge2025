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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import system_data from "@/app/data/system";
import Link from "next/link";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import system_api from "@/app/data/api";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("male");
  const [date, setDate] = useState<Date>();
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [comms, setComms] = useState("email");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  // State for date picker
  const [open, setOpen] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const data = {
      first_name: firstName,
      last_name: lastName,
      gender,
      dob: date
        ? date.toISOString().slice(0, 10) // yyyy-mm-dd
        : undefined,
      phone_number: mobile,
      email,
      password,
      preferred_contact: comms,
    };

    // Basic validation
    if (password !== confirmPassword) {
      toast.warning("Passwords do not match!", { richColors: true });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Signing up...", { richColors: true });

    const userData = data;
    axios
      .post(system_api.patient.register, userData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error("Signup failed:", err);
        if (err.response && err.response.data) {
          toast.error(err.response.data.error, { richColors: true });
        } else
          toast.error("Couldn't Sign Up. Please try again", {
            richColors: true,
          });
      })
      .finally(() => {
        toast.dismiss(loadingToast);
        setIsLoading(false);
      });
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
                  <Label htmlFor="fname">First Name</Label>
                  <Input
                    type="text"
                    placeholder="John"
                    id="fname"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="lname">Last Name</Label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    id="lname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-3">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    required
                    disabled={isLoading}
                    defaultValue={gender}
                    onValueChange={setGender}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date"
                        className="w-full justify-between font-normal"
                      >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDate(date);
                          setOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    placeholder="johndoe@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="tel">Mobile Number</Label>
                  <Input
                    type="tel"
                    placeholder="0244123456"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="col-span-full flex items-center gap-2">
                  <Checkbox
                    id="prefer"
                    onCheckedChange={(checked) =>
                      setComms(checked ? "sms" : "email")
                    }
                  />{" "}
                  <Label
                    htmlFor="prefer"
                    className="text-xs text-muted-foreground gap-0"
                  >
                    Include SMS notifications
                    <br />
                  </Label>
                </div>
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
                    placeholder="Confirm password"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  {showPasswordConfirm ? (
                    <EyeOff
                      size={20}
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      className="cursor-pointer text-muted-foreground"
                    />
                  ) : (
                    <Eye
                      size={20}
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      className="cursor-pointer text-muted-foreground"
                    />
                  )}
                </Label>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    isLoading ||
                    !firstName ||
                    !lastName ||
                    !gender ||
                    !date ||
                    !email ||
                    !mobile ||
                    !password ||
                    !confirmPassword
                  }
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
                {/* <Button variant="outline" className="w-full" disabled={isLoading}>
                  Login with Google
                </Button> */}
              </div>
            </div>
            <div className="mt-2 text-center text-sm">
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
