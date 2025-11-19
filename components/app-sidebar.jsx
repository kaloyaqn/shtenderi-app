"use client"

import * as React from "react"
import {
  IconFileWord,
  IconInvoice,
  IconSettings,
  IconHelp,
  IconSearch,
  IconInnerShadowTop,
  IconTransfer,
  IconCashRegister,
  IconCash,
  IconPaywall,
  IconCashMove,
  IconReport
} from "@tabler/icons-react"
import {
    BoxIcon,
    CheckCheckIcon,
    CircleDollarSignIcon,
    FileMinus,
    GroupIcon,
    HomeIcon,
    ImportIcon,
    PackageOpenIcon,
    PersonStanding,
    SearchCheckIcon,
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
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import LogoStendo from "@/public/svg/LogoStendo";

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}

const groupedDocuments = {
  Начало: [
    { name: "Начало", url: "/dashboard", icon: HomeIcon },
  ],
  "Търговска мрежа": [
    { name: "Щендери", url: "/dashboard/stands", icon: IconFileWord },
    { name: "Магазини", url: "/dashboard/stores", icon: Store, adminOnly: true },
    { name: "Партньори", url: "/dashboard/partners", icon: PersonStanding },
    { name: "Складове", url: "/dashboard/storages", icon: PackageOpenIcon },
    { name: "Каси", url: "/dashboard/cash-registers", icon: IconCashRegister },
    { name: "Движение каси", url: "/dashboard/payments", icon: IconCashMove , adminOnly: true },
    { name: "Доставчици", url: "/dashboard/delivery-partners", icon: PersonStanding, adminOnly: true },
  ],
  "Справки и счетоводни документи": [
    { name: "Импорти", url: "/dashboard/imports", icon: ImportIcon, adminOnly: true },
    { name: "Проверки", url: "/dashboard/checks", icon: CheckCheckIcon, adminOnly: false },
    { name: "Продажби", url: "/dashboard/revisions", icon: CircleDollarSignIcon },
    { name: "Връщания и рекламации", url: "/dashboard/refunds", icon: Undo2Icon },
    { name: "Трансфер на стока", url: "/dashboard/transfers", icon: IconTransfer },
    { name: "Ревизии склад", url: "/dashboard/storage-revisions", icon: SearchCheckIcon, adminOnly: true },
    { name: "Фактури", url: "/dashboard/invoices", icon: IconInvoice },
    { name: "Кредитни известия", url: "/dashboard/credit-notes", icon: FileMinus, adminOnly: true },
    { name: "Доставки", url: "/dashboard/deliveries", icon: PackageOpenIcon, adminOnly: true },
    { 
      name: "Справки", 
      icon: IconReport, 
      hasSubmenus: [
        { title: "Продажби", link: "/dashboard/reports/sale" },
        { title: "Партньор", icon: IconSearch, link: "/dashboard/reports/partner" },
        { title: "Подменю 3", icon: IconCash, link: "/dashboard/example3" }
      ]
    },
  ],
  "Основни": [
    { name: "Номенклатура", url: "/dashboard/products", icon: BoxIcon, adminOnly: true },
    { name: "Ценови групи", url: "/dashboard/price-groups", icon: GroupIcon, adminOnly: true },
    { name: "Потребители", url: "/dashboard/users", icon: User, adminOnly: true },
  ],
};

const navSecondary = [
    {
      title: "Настройки",
      url: "#",
      icon: IconSettings,
    },
    // {
    //   title: "Get Help",
    //   url: "#",
    //   icon: IconHelp,
    // },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: IconSearch,
    // },
];

export function AppSidebar({
  session,
  ...props
}) {
  const userRole = session?.user?.role;
  const hasMounted = useHasMounted();

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
                <LogoStendo />
                <span className="text-base font-semibold">Stendo</span>
                {hasMounted && process.env.NEXT_PUBLIC_SUSTOQNIE === 'development' && (
                  <span className="ml-2 font-bold text-red-500 text-xs align-middle">
                    DEV ВЕРСИЯ
                  </span>
                )}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={'overflow-x-hidden'}>
        <NavMain items={groupedDocuments["Начало"]}/>
        <NavDocuments navGroups={visibleNavGroups} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <p className="text-sm text-gray-600">1.5.0</p>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  );
}