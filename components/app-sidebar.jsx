"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconFileWord,
  IconInvoice,
  IconSettings,
  IconHelp,
  IconSearch,
  IconInnerShadowTop,
  IconTransfer
} from "@tabler/icons-react"
import {
    BoxIcon,
    CircleDollarSignIcon,
    HomeIcon,
    PackageOpenIcon,
    PersonStanding,
    Store,
    Undo2Icon,
    User
} from "lucide-react";

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

const groupedDocuments = {
  Начало: [
    { name: "Начало", url: "/dashboard", icon: HomeIcon },
  ],
  Счетоводство: [
    { name: "Продажби", url: "/dashboard/revisions", icon: CircleDollarSignIcon },
    { name: "Връщания и рекламации", url: "/dashboard/refunds", icon: Undo2Icon },
    { name: "Кредитни известия", url: "/dashboard/credit-notes", icon: Undo2Icon, adminOnly: true },
    { name: "Фактури", url: "/dashboard/invoices", icon: IconInvoice },
  ],
  Склад: [
    { name: "Щендери", url: "/dashboard/stands", icon: IconFileWord },
    { name: "Складове", url: "/dashboard/storages", icon: PackageOpenIcon },
    { name: "Продукти", url: "/dashboard/products", icon: BoxIcon, adminOnly: true },
    { name: "Премествания", url: "/dashboard/transfers", icon: IconTransfer, adminOnly: true },
  ],
  Контрагенти: [
    { name: "Партньори", url: "/dashboard/partners", icon: PersonStanding },
    { name: "Магазини", url: "/dashboard/stores", icon: Store, adminOnly: true },
  ],
  Потребители: [
    { name: "Потребители", url: "/dashboard/users", icon: User, adminOnly: true },
  ],
};


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

  const visibleNavGroups = React.useMemo(() => {
    return Object.entries(groupedDocuments)
      .map(([title, items]) => ({
        title,
        items: items.filter(item => userRole === 'ADMIN' || !item.adminOnly),
      }))
      .filter(group => group.items.length > 0);
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
        <NavDocuments navGroups={visibleNavGroups} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}


  