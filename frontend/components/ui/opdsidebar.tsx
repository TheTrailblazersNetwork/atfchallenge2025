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
  Home
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
    icon: Home,
  },
  {
    title: "Patient Records",
    url: "/opd/patients",
    icon: UserRound,
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
          {/* <SidebarGroupLabel
            className={"flex items-center justify-center flex-col py-10 my-5"}
          >
            <Logo />
            <h2 className="text-lg font-semibold mt-2">Neurology OPD</h2>
          </SidebarGroupLabel> */}
          <SidebarGroupLabel
            className={"flex items-center justify-center flex-col py-10 my-5"}
          >
            <Logo width={100} height={100} />
            <TextLogo extra="OPD" size="text-2xl" classname="my-1" />
          </SidebarGroupLabel>
          <SidebarGroupContent className={"h-full mt-5"}>
            <SidebarMenu className={"relative h-full space-y-1"}>
              {opdMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="hover:bg-blue-900/70 hover:text-white transition-all" asChild>
                    <Link
                      className={clsx("!text-base !py-5", {
                        "bg-zinc-200 font-medium":
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