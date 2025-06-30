"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconInvoice,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Box, BoxIcon, Bus, CircleDollarSignIcon, HomeIcon, PackageOpenIcon, PersonStanding, SearchCheckIcon, Store, Undo2Icon, User } from "lucide-react"

const allDocuments = [
    { name: "Начало", url: "/dashboard", icon: HomeIcon },
    { name: "Щендери", url: "/dashboard/stands", icon: IconFileWord },
    { name: "Продажби", url: "/dashboard/revisions", icon: CircleDollarSignIcon },
    { name: "Връщания и рекламации", url: "/dashboard/refunds", icon: Undo2Icon },
    { name: "Кредитни известия", url: "/dashboard/credit-notes", icon: Undo2Icon, adminOnly: true },
    { name: "Фактури", url: "/dashboard/invoices", icon: IconInvoice },
    { name: "Складове", url: "/dashboard/storages", icon: PackageOpenIcon },
    { name: "Трансфери", url: "/dashboard/transfers", icon: Bus, adminOnly: true },
    { name: "Партньори", url: "/dashboard/partners", icon: PersonStanding },
    { name: "Магазини", url: "/dashboard/stores", icon: Store, adminOnly: true },
    { name: "Продукти", url: "/dashboard/products", icon: BoxIcon, adminOnly: true },
    { name: "Потребители", url: "/dashboard/users", icon: User, adminOnly: true },
];

const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
];

export function AppSidebar({
  ...props
}) {
  const { data: session } = useSession()
  const userRole = session?.user?.role;

  const visibleDocuments = React.useMemo(() => {
    return allDocuments
      .filter(doc => userRole === 'ADMIN' || !doc.adminOnly)
      .map(doc => ({ ...doc, url: doc.url.trim() }));
  }, [userRole]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Stendo</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavDocuments items={visibleDocuments} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}


  