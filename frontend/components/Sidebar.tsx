"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CalendarClock, House } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutPatient } from "@/store/features/patientReducer";
import { clearAppointmentsData } from "@/store/features/appointmentsReducer";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import clsx from "clsx";
import TextLogo from "./TextLogo";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard/patient",
    icon: House,
  },
  {
    title: "Appointments",
    url: "/dashboard/appointments",
    icon: CalendarClock,
  },
  // {
  //   title: "Profile",
  //   url: "/dashboard/profile",
  //   icon: CircleUserRound,
  // },
  // {
  //   title: "Settings",
  //   url: "/dashboard/settings",
  //   icon: Settings,
  // },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Clear auth data from localStorage
    logout();
    
    // Clear Redux store
    dispatch(logoutPatient());
    dispatch(clearAppointmentsData());
    
    // Show success message
    toast.success("Logged out successfully", { richColors: true });
    
    // Redirect to login
    router.push("/login");
  };

  return (
    <Sidebar className="select-none" variant={"floating"}>
      <SidebarContent>
        <SidebarGroup className={"h-full"}>
          <SidebarGroupLabel
            className={
              "flex items-center justify-center flex-col py-10 my-5"
            }
          >
            <Logo width={100} height={100} />
            <TextLogo size="text-2xl" classname="my-1" />
          </SidebarGroupLabel>
          <SidebarGroupContent className={"h-full mt-5"}>
            <SidebarMenu className={"relative h-full space-y-1"}>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="hover:bg-blue-900/70 hover:text-white transition-all" asChild>
                    <Link
                      className={clsx("!text-base !py-5", {
                        "bg-zinc-200 font-medium ":
                          pathname === item.url ||
                          pathname.startsWith(item.url),
                      })}
                      href={item.url}
                    >
                      <item.icon
                        strokeWidth={clsx({
                          "2px":
                            pathname === item.url ||
                            pathname.startsWith(item.url),
                        })}
                      />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="mt-auto">
                <Button
                  variant={"outline"}
                  className={"w-full cursor-pointer"}
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
