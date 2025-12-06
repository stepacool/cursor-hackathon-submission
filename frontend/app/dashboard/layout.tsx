import { Sidebar } from "@/components/sidebar";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Logout } from "@/components/logout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border/50 px-6 backdrop-blur-sm">
          {/* Left: Navigation Tabs */}
          <nav className="flex items-center gap-1">
            <a
              href="/dashboard"
              className="rounded-full bg-foreground/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/15"
            >
              MyCards
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Crypto Price */}
            <div className="hidden items-center gap-2 rounded-full bg-card/50 px-3 py-1.5 text-sm md:flex">
              <span className="text-muted-foreground">BTC/USD</span>
              <span className="font-mono font-medium text-emerald-500">$43,521.84</span>
            </div>
            <div className="h-6 w-px bg-border/50" />
            <Logout />
            <ModeSwitcher />
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
