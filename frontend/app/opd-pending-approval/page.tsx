// app/opd-pending-approval/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PendingApproval() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Account Pending Approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Thank you for registering! Your account is currently pending
              approval by our administration team.
            </p>
            <p>
              You&apos;ll receive an email notification once your account has been
              approved. This process typically takes 24-48 hours.
            </p>
            <div className="flex justify-between pt-4">
              <Button asChild variant="outline">
                <Link href="/">Return Home</Link>
              </Button>
              <Button asChild>
                <Link href="/opd-login">Check Approval Status</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}