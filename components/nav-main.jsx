"use client"

import Link from "next/link";
import { IconCirclePlusFilled, IconMail, IconTransfer } from "@tabler/icons-react";

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
      <Link className="w-full" href="/dashboard/resupply">
      <SidebarMenuButton
              tooltip="Направи трансфер"
              className="bg-green-600 active:bg-green-600 active:text-white cursor-pointer text-white hover:bg-green-700 hover:text-primary-foreground min-w-8 duration-200 ease-linear">
                  <IconTransfer />
              <span className="text-sm">Направи трансфер</span>
            </SidebarMenuButton></Link>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.href ? (
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </>
                  </SidebarMenuButton>
                </Link>
              ) : (
                <SidebarMenuButton tooltip={item.title} disabled>
                  <>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu> */}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
