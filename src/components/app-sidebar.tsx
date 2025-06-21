"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Search,
  FileText,
  Users,
  Settings2,
  BarChart2,
  FileDown,
  BookOpen,
} from "lucide-react"

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { NavUser } from "@/components/nav-user"

const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Investigations",
    url: "/investigations",
    icon: Search,
  },
  {
    title: "Templates",
    url: "/dashboard/templates",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart2,
  },
  {
    title: "Export",
    url: "/dashboard/export",
    icon: FileDown,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="font-bold text-lg px-4 py-2">IntelliScope</div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="flex flex-col gap-1 px-2">
          {navMain.map((item) => (
            <a
              key={item.title}
              href={item.url}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm font-medium"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.title}</span>
            </a>
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: "User", email: "user@example.com", avatar: "/avatars/default.jpg" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
