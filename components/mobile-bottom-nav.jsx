"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bus, Home, ListChecks, Store, Users, PersonStanding } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Начало", icon: Home },
  { href: "/dashboard/stands", label: "Щендери", icon: ListChecks },
  { href: "/dashboard/products", label: "БУС", icon: Bus },
  { href: "/dashboard/stores", label: "Магазини", icon: Store },
  { href: "/dashboard/partners", label: "Партньори", icon: PersonStanding },
  { href: "/dashboard/revisions", label: "Ревизии", icon: Store },
  { href: "/dashboard/users", label: "Потребители", icon: Users },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t overflow-auto flex justify-around items-center h-16 md:hidden shadow-sm">
      {navItems.map(({ href, label, icon: Icon }) => {
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
    </nav>
  );
} 