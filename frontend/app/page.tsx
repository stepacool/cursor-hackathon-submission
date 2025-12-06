import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { ModeSwitcher } from "@/components/mode-switcher";

const highlights = [
  "Voice + device security to keep your balance protected",
  "Instant transfers with real-time alerts and limits",
  "Multi-currency wallets with clean, mobile-first design",
];

const featureCards = [
  {
    title: "Security first",
    description: "Biometric, voice, and PIN layers with session intelligence to stop takeovers.",
    icon: ShieldCheck,
  },
  {
    title: "Real-time controls",
    description: "Freeze cards, set spend limits, and get instant alerts from any device.",
    icon: Activity,
  },
  {
    title: "Wallets that flex",
    description: "Multi-currency support, savings goals, and shared workspaces for teams.",
    icon: Wallet,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/15 via-base-100 to-base-100" />

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

      <section className="mx-auto flex min-h-[80vh] w-full max-w-6xl flex-col justify-center gap-10 px-6 py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Smartphone className="h-4 w-4" />
              Banking built for mobile-first security
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
                The digital bank that protects every transaction.
              </h1>
              <p className="text-base text-base-content/70 sm:text-lg">
                Open an account in minutes, move money instantly, and control cards, limits, and alerts in real time. Your
                balance and identity stay safe with layered authentication.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/signup" className="btn btn-primary btn-wide">
                Get started
              </Link>
              <Link href="/login" className="btn btn-outline btn-wide">
                View dashboard
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-box bg-base-200/70 p-4"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                  <p className="text-sm sm:text-base">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="card bg-base-200 shadow-2xl">
              <div className="card-body gap-4">
                <div className="flex items-center justify-between">
                  <div className="badge badge-primary badge-outline gap-2">
                    <CreditCard className="h-4 w-4" />
                    Live balance
                  </div>
                  <div className="badge badge-ghost text-xs">Realtime alerts</div>
                </div>
                <div className="rounded-box bg-base-100 p-6 shadow-inner space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/60">Checking •••• 4532</p>
                      <p className="text-3xl font-semibold">$12,458.32</p>
                    </div>
                    <div className="rounded-xl bg-primary/10 px-3 py-2 text-primary text-sm font-medium">
                      +$420 today
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {featureCards.map((feature) => (
                      <div
                        key={feature.title}
                        className="flex items-start gap-3 rounded-box border border-base-200 bg-base-50 p-3"
                      >
                        <feature.icon className="mt-0.5 h-5 w-5 text-primary" />
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{feature.title}</p>
                          <p className="text-xs text-base-content/70">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-box bg-primary/10 px-4 py-3">
                    <div>
                      <p className="text-sm text-primary">Instant transfers</p>
                      <p className="text-lg font-semibold">Send up to $10k/day with approvals</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
