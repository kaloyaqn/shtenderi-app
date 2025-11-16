"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bus, 
  Home, 
  ListChecks, 
  Store, 
  Users, 
  PersonStanding, 
  BoxIcon, 
  User, 
  MoreHorizontal, 
  Plus, 
  CheckCheckIcon,
  FileText,
  CreditCard,
  Package,
  Truck,
  Calendar,
  Settings,
  BarChart3,
  Receipt,
  Archive
} from "lucide-react";
import { signOut, useSession } from "@/lib/session-context";
import { useState } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { IconTransfer } from "@tabler/icons-react";

const navItems = [
  { href: "/dashboard", label: "Начало", icon: Home },
  { href: "/dashboard/stands", label: "Щендери", icon: ListChecks },
  { href: "/dashboard/storages", label: "Складове", icon: BoxIcon },
  // { href: "/dashboard/products", label: "БУС", icon: Bus },
  // { href: "/dashboard/stores", label: "Магазини", icon: Store },
  // { href: "/dashboard/partners", label: "Партньори", icon: PersonStanding },
  // { href: "/dashboard/revisions", label: "Ревизии", icon: Store },
  // { href: "/dashboard/users", label: "Потребители", icon: Users },
];

const extraNavItems = [
  { href: "/dashboard/partners", label: "Партньори", icon: PersonStanding },
  { href: "/dashboard/checks", label: "Проверки", icon: CheckCheckIcon },
];

// All pages for admin users
const adminNavItems = [
  { href: "/dashboard/partners", label: "Партньори", icon: PersonStanding },
  { href: "/dashboard/checks", label: "Проверки", icon: CheckCheckIcon },
  { href: "/dashboard/revisions", label: "Продажби", icon: FileText },
  { href: "/dashboard/products", label: "Продукти", icon: Package },
  { href: "/dashboard/stores", label: "Магазини", icon: Store },
  { href: "/dashboard/users", label: "Потребители", icon: Users },
  { href: "/dashboard/payments", label: "Плащания", icon: CreditCard },
  { href: "/dashboard/cash-registers", label: "Каси", icon: BarChart3 },
  { href: "/dashboard/imports", label: "Импорти", icon: Archive },
  { href: "/dashboard/transfers", label: "Трансфери", icon: Truck },
  { href: "/dashboard/credit-notes", label: "Кредитни бележки", icon: Receipt },
  { href: "/dashboard/refunds", label: "Рекламации", icon: Archive },
  { href: "/dashboard/invoices", label: "Фактури", icon: FileText },
  { href: "/dashboard/calendar", label: "Календар", icon: Calendar },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  
  // Use admin items if admin, otherwise use regular extra items
  const menuItems = isAdmin ? adminNavItems : extraNavItems;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around items-center h-16 md:hidden shadow-sm">
      {navItems.slice(0, 2).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 text-xs px-2 py-1 transition-colors ${active ? "text-blue-600" : "text-muted-foreground hover:text-blue-500"}`}
          >
            <Icon className="w-6 h-6 mb-0.5" />
            <span>{label}</span>
          </Link>
        );
      })}
      {/* FAB in the center */}
      <Link href={'/dashboard/resupply'}>
        <button
          className="relative z-50 -mt-8 bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white"
          aria-label="Основно действие"
        >
          <IconTransfer className="w-8 h-8" />
        </button>
      </Link>
      {navItems.slice(2).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center gap-1 text-xs px-2 py-1 transition-colors ${active ? "text-blue-600" : "text-muted-foreground hover:text-blue-500"}`}
          >
            <Icon className="w-6 h-6 mb-0.5" />
            <span>{label}</span>
          </Link>
        );
      })}
      {/* Dots menu for extra items */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="flex flex-col items-center justify-center gap-1 text-xs px-2 py-1 transition-colors text-muted-foreground hover:text-blue-500 focus:outline-none"
            aria-label="Още"
          >
            <MoreHorizontal className="w-6 h-6 mb-0.5" />
            <span>Още</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center" className="max-h-96 overflow-y-auto">
          {isAdmin && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Админ достъп
              </div>
              {menuItems.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} asChild>
                  <Link href={href} className="flex items-center gap-2">
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          {!isAdmin && menuItems.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href} className="flex items-center gap-2">
                <Icon className="w-4 h-4" /> {label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
            Изход
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
} 