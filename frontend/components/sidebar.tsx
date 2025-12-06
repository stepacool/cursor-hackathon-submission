"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Wallet,
  ArrowLeftRight,
  Search,
} from "lucide-react";
import { Input } from "./ui/input";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

export function Sidebar() {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      items: [
        {
          label: "Overview",
          href: "/dashboard",
          icon: <LayoutDashboard className="size-4" />,
        },
      ],
    },
    {
      title: "BANKING",
      items: [
        {
          label: "Security",
          href: "/dashboard/security",
          icon: <Shield className="size-4" />,
        },
        {
          label: "Balance",
          href: "/dashboard/balance",
          icon: <Wallet className="size-4" />,
        },
        {
          label: "Transaction",
          href: "/dashboard/transaction",
          icon: <ArrowLeftRight className="size-4" />,
        },
      ],
    },
  ];

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          B
        </div>
        <span className="font-semibold text-lg">Digital Bank</span>
      </div>

      {/* Search */}
      <div className="border-b border-sidebar-border p-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="h-9 bg-sidebar-accent/50 border-sidebar-border pl-9 pr-12"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-4">
            {section.title && (
              <h3 className="mb-2 px-2 font-medium text-[11px] text-muted-foreground tracking-wider">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-medium text-[10px] text-emerald-500">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Secured by</span>
          <span className="font-medium text-foreground">Voice Auth™</span>
        </div>
      </div>
    </aside>
  );
}
