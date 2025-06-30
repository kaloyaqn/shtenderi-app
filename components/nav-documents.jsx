"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDocuments({ navGroups, className, ...props }) {
  const pathname = usePathname()

  if (!navGroups?.length) {
    return null
  }

  return (
    <nav
      className={cn("flex flex-col", className)}
      {...props}
    >
      {navGroups.map((group, index) => (
        <div key={index} className="mb-2">
          {group.title && (
            <h4 className="px-3 py-2 text-xs font-light text-gray-500">
              {group.title}
            </h4>
          )}
          <SidebarMenu>
            {group.items.map((item) => {
              const Icon = item.icon
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    variant={pathname === item.url ? "secondary" : "ghost"}
                    className="py-1 h-auto text-xs"
                  >
                    <Link href={item.url}>
                      <Icon className="size-4 mr-2" />
                      {item.name}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </div>
      ))}
    </nav>
  )
}
