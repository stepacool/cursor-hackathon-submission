import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Hero } from "@/components/hero";
import { MinimalFooter } from "@/components/ui/minimal-footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/15 via-base-100 to-base-100" />

      <header className="sticky top-0 z-20 bg-base-100/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 items-center gap-2 rounded-full bg-primary/10 px-3 text-sm font-semibold text-primary">
              <CreditCard className="h-4 w-4" />
              Digital Bank
            </div>
            <span className="hidden text-sm text-base-content/60 sm:inline">
              Secure, simple, and instant banking.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ModeSwitcher />
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm gap-1">
              Open account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <Hero />
      <MinimalFooter />
    </main>
  );
}
