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
import { Button } from "./ui/button"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"

export function NavDocuments({ navGroups, className, ...props }) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState(new Set())

  if (!navGroups?.length) {
    return null
  }

  const toggleExpanded = (itemName) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemName)) {
        newSet.delete(itemName)
      } else {
        newSet.add(itemName)
      }
      return newSet
    })
  }

  const isSubmenuActive = (submenus) => {
    return submenus?.some(submenu => pathname === submenu.link)
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
              const isExpanded = expandedItems.has(item.name)
              const hasSubmenus = item.hasSubmenus && item.hasSubmenus.length > 0
              const isActive = pathname === item.url || (hasSubmenus && isSubmenuActive(item.hasSubmenus))

              if (hasSubmenus) {
                return (
                  <div key={item.name}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        variant={isActive ? "secondary" : "ghost"}
                        className="py-1 h-auto text-xs w-full justify-between"
                        onClick={() => toggleExpanded(item.name)}
                      >
                        <div className="flex items-center">
                          <Icon className="size-4 mr-4" />
                          {item.name}
                        </div>
                        {isExpanded ? (
                          <ChevronDownIcon className="size-3" />
                        ) : (
                          <ChevronRightIcon className="size-3" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {isExpanded && (
                      <div className="ml-4 border-l w-full border-gray-200">
                        {item.hasSubmenus.map((submenu, subIndex) => {
                          const SubmenuIcon = submenu.icon
                          const isSubmenuActive = pathname === submenu.link
                          
                          return (
                            <SidebarMenuItem key={`${item.name}-${subIndex}`}>
                              <SidebarMenuButton
                                asChild
                                variant={isSubmenuActive ? "secondary" : "ghost"}
                                className="py-1 h-auto text-xs ml-2"
                              >
                                <Link className="w-full" href={submenu.link}>
                                  <SubmenuIcon className="size-4 mr-2" />
                                  {submenu.title}
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }

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
