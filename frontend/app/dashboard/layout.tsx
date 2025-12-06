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
        <header className="flex h-14 items-center justify-end border-b border-border px-6">
          <div className="flex items-center gap-2">
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
