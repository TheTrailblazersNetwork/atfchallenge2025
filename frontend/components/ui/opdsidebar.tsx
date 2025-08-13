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
  ListStart,
  UsersRound
} from "lucide-react";
import Logo from "../Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import TextLogo from "../TextLogo";
import { opdAuthService } from "@/services/opdService";

const opdMenuItems = [
  {
    title: "Queue Dashboard",
    url: "/opd/dashboard",
    icon: ListStart,
  },
  {
    title: "Patient Records",
    url: "/opd/dashboard/patients",
    icon: UsersRound,
  },
];

export function OPDSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await opdAuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem("opdAuth");
    }
    // Redirect to OPD login
    router.push("/opd/login");
  };

  return (
    <Sidebar className="select-none" variant={"floating"}>
      <SidebarContent>
        <SidebarGroup className={"h-full"}>
          <SidebarGroupLabel
            className={"flex items-center justify-center flex-col h-max"}
          >
            <Logo width={100} height={100} />
            <TextLogo extra="OPD" size="text-2xl" classname="my-1" />
            <p>OPD Dashboard</p>
          </SidebarGroupLabel>
          <SidebarGroupContent className={"h-full mt-5"}>
            <SidebarMenu className={"relative h-full space-y-1"}>
              {opdMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="hover:bg-zinc-200 transition-all" asChild>
                    <Link
                      className={clsx("!text-base border !py-5", {
                        "!bg-blue-100 !text-blue-600 font-medium":
                          pathname === item.url,
                      })}
                      href={item.url}
                    >
                      <item.icon
                        strokeWidth={clsx({
                          "2px":
                            pathname === item.url ,
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