"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Shield,
  Wallet,
  ArrowLeftRight,
  Search,
  CreditCard,
  Settings,
  HelpCircle,
  Building2,
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
          label: "Accounts",
          href: "/dashboard/accounts",
          icon: <Building2 className="size-4" />,
          description: "Open, close, freeze & unfreeze accounts",
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
    {
      title: "ACCOUNT",
      items: [
        {
          label: "Security",
          href: "/dashboard/security",
          icon: <Shield className="size-4" />,
          description: "Manage your profile & voice authentication",
        }
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
      <aside className="flex h-screen w-64 flex-col border-r border-border/50 bg-sidebar text-sidebar-foreground">
        {/* Logo */}
        <div className="flex items-center gap-3 p-5">
          <div className="relative size-10 rounded-xl overflow-hidden">
            <Image
              src="/icon.png"
              alt="NEX Digital Banking"
              width={40}
              height={40}
              className="object-cover"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-tight">Nex</span>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="relative w-full"
          >
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="h-10 bg-muted/30 border-transparent pl-9 pr-12 cursor-pointer rounded-xl hover:bg-muted/50 transition-colors"
              readOnly
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2 hidden h-6 -translate-y-1/2 select-none items-center gap-1 rounded-lg border border-border/50 bg-background px-2 font-medium font-mono text-[10px] text-muted-foreground opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-6">
              {section.title && (
                <h3 className="mb-2 px-3 font-semibold text-[10px] text-muted-foreground/70 tracking-widest">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                          isActive
                            ? "bg-foreground/10 text-foreground font-medium shadow-sm"
                            : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                        )}
                      >
                        <span className={cn(
                          "transition-colors",
                          isActive ? "text-teal-500" : ""
                        )}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-medium text-[10px] text-emerald-500">
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
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-linear-to-br from-violet-500/10 to-fuchsia-500/10 p-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-fuchsia-500">
              <Shield className="size-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">Voice Auth™</p>
              <p className="text-[10px] text-muted-foreground">Secured & Protected</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="border-b border-border/50 p-4 pb-3">
            <DialogTitle className="sr-only">Search Navigation</DialogTitle>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search navigation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="h-11 border-0 pl-10 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                autoFocus
              />
            </div>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto p-2">
            {filteredItems.length > 0 ? (
              <div className="space-y-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.href + item.label}
                    type="button"
                    onClick={() => handleNavigate(item.href)}
                    className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-accent"
                  >
                    <div className="mt-0.5 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

          <div className="border-t border-border/50 bg-muted/30 px-4 py-2.5">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Press <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono">Enter</kbd> to navigate</span>
              <span>Press <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono">Esc</kbd> to close</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
