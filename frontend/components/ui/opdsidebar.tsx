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
import { 
  UserRound, 
  CalendarClock, 
  Home, 
  Bell,
  ClipboardList,
  Settings
} from "lucide-react";
import Logo from "../Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const opdMenuItems = [
  {
    title: "Queue Dashboard",
    url: "/opdDashboard",
    icon: Home,
  },
  {
    title: "Patient Records",
    url: "/opdDashboard/patients",
    icon: UserRound,
  },
  {
    title: "Medical Notes",
    url: "/opdDashboard/notes",
    icon: ClipboardList,
  },
  {
    title: "Notifications",
    url: "/opdDashboard/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/opdDashboard/settings",
    icon: Settings,
  },
];

export function OPDSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="select-none" variant={"floating"}>
      <SidebarContent>
        <SidebarGroup className={"h-full"}>
          <SidebarGroupLabel className={"flex items-center justify-center flex-col py-10 my-5"}>
            <Logo />
            <h2 className="text-lg font-semibold mt-2">Neurology OPD</h2>
          </SidebarGroupLabel>
          <SidebarGroupContent className={"h-full"}>
            <SidebarMenu className={"relative h-full space-y-1"}>
              {opdMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      className={clsx("!text-base !py-5", {
                        "bg-sidebar-accent font-medium": 
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
                <Button variant={"outline"} className={"w-full cursor-pointer mt-2"}>
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