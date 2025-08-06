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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import system_data from "@/app/data/system";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import system_api from "@/app/data/api";

export function PreferenceForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [selection, setSelection] = useState("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading("Logging in...", { richColors: true });

    const userData = {
      email,
    };

    axios
      .post(system_api.patient.login, userData)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Login successful!", {
            richColors: true,
          });
          router.push("/dashboard");
        } else {
          toast.error(" Login failed. Please try again.", { richColors: true });
        }
      })
      .catch((err) => {
        console.error("Login failed:", err);
        if (err.response && err.response.data) {
          toast.error(err.response.data.error, { richColors: true });
        } else
          toast.error("Couldn't Login. Please try again", {
            richColors: true,
          });
      })
      .finally(() => {
        toast.dismiss(loadingToast);
        setIsLoading(false);
      });
  };

  return (
    <div className={cn("flex flex-col gap-6 select-none", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{system_data.name} Password Recovery</CardTitle>
          <CardDescription>Choose your recovery method</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue={selection} onValueChange={setSelection} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="mobile">Mobile Number</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                />
              </TabsContent>
              <TabsContent value="mobile">
                <Input
                  id="tel"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter your mobile number"
                  required
                  disabled={isLoading}
                />
              </TabsContent>
            </Tabs>
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 mt-3"
              disabled={isLoading || (selection === "email" && email === "") || (selection === "mobile" && mobile === "")}
            >
              {isLoading ? "Sending..." : "Send Recovery Link"}
            </Button>
            <p className="text-muted-foreground text-xs mt-3">
              If an account exists with your email or mobile number, a recovery link will be sent
              to change your password. Click{" "}
              <Link href="/login" className="underline underline-offset-4">
                here
              </Link>{" "}
              if you remember your password.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
