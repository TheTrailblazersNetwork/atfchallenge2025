import { redirect } from "next/navigation";

export default function DashboardPage() {
  redirect("/dashboard/patient");
  return null;
}
