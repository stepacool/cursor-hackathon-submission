"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Wallet,
  ArrowLeftRight,
  Search,
} from "lucide-react";
import { Input } from "./ui/input";
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  description?: string;
};

type NavSection = {
  title?: string;
  items: NavItem[];
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sections: NavSection[] = [
    {
      items: [
        {
          label: "Overview",
          href: "/dashboard",
          icon: <LayoutDashboard className="size-4" />,
          description: "View your dashboard overview",
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
          description: "Manage your profile & voice authentication",
        },
        {
          label: "Balance",
          href: "/dashboard/balance",
          icon: <Wallet className="size-4" />,
          description: "Check your account balance",
        },
        {
          label: "Transaction",
          href: "/dashboard/transaction",
          icon: <ArrowLeftRight className="size-4" />,
          description: "Transfer funds securely",
        },
      ],
    },
  ];

  // Flatten all items for search
  const allItems = sections.flatMap((section) => section.items);

  // Filter items based on search query
  const filteredItems = searchQuery
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems;

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((href: string) => {
    router.push(href);
    setSearchOpen(false);
    setSearchQuery("");
  }, [router]);

  // Handle enter key in search dialog
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredItems.length > 0) {
      handleNavigate(filteredItems[0].href);
    }
  };

  return (
    <>
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
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="relative w-full"
          >
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="h-9 bg-sidebar-accent/50 border-sidebar-border pl-9 pr-12 cursor-pointer"
              readOnly
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar px-1.5 font-medium font-mono text-[10px] text-muted-foreground opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
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

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl p-0">
          <DialogHeader className="border-b border-border p-4 pb-3">
            <DialogTitle className="sr-only">Search Navigation</DialogTitle>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search navigation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="h-10 border-0 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredItems.length > 0 ? (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => handleNavigate(item.href)}
                    className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.label}</div>
                      {item.description && (
                        <div className="text-muted-foreground text-xs">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No results found for "{searchQuery}"
              </div>
            )}
          </div>

          <div className="border-t border-border bg-muted/50 px-4 py-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Press <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">Enter</kbd> to navigate</span>
              <span>Press <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">Esc</kbd> to close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

