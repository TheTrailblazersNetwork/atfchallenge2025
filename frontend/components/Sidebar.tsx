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
import { Settings, CalendarClock, House, BellDot } from "lucide-react";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutPatient } from "@/store/features/patientReducer";
import { logout } from "@/lib/auth";
import { toast } from "sonner";
import clsx from "clsx";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard/patients",
    icon: House,
  },
  {
    title: "Appointments",
    url: "/dashboard/appointments",
    icon: CalendarClock,
  },
  {
    title: "Notifications",
    url: "/dashboard/notifications",
    icon: BellDot,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
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
            <Logo />
          </SidebarGroupLabel>
          <SidebarGroupContent className={"h-full"}>
            <SidebarMenu className={"relative h-full space-y-1"}>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      className={clsx("!text-base !py-5", {
                        "bg-sidebar-accent font-medium ":
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
                  className={"w-full cursor-pointer mt-2"}
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
