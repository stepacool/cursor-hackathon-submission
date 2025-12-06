import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import { ModeSwitcher } from "@/components/mode-switcher";
import { Hero } from "@/components/hero";
import { MinimalFooter } from "@/components/ui/minimal-footer";
import { Feature } from "@/components/ui/feature";
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-primary/15 via-base-100 to-base-100" />

      <header className="sticky top-0 z-20 bg-base-100/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 md:px-0 py-4">
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
      <Feature />
      <section className="py-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 md:px-0">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
              Testimonials
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
              Customers rave about their experience with Digital Bank
            </h2>
            <p className="mt-2 text-base text-base-content/70">
              Tap on a card or use the controls to browse more stories.
            </p>
          </div>
          <div className="rounded-3xl border border-base-300 bg-base-100/80 p-4 shadow-lg shadow-base-300/30">
            <StaggerTestimonials />
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-primary/10 bg-base-100/80 p-8 text-center shadow-xl">
          <p className="text-sm uppercase tracking-[0.4em] text-primary/70">
            Trusted Banking
          </p>
          <TypewriterEffect
            words={[
              { text: "Move" },
              { text: "money" },
              { text: "securely" },
              { text: "with" },
              { text: "Banster", className: "text-primary" },
            ]}
          />
          <p className="text-base text-base-content/70 sm:text-lg">
            Real-time transfers, intelligent automations, and support teams that
            respond in seconds.
          </p>
          <Link href="/signup">
            <Button size="lg" className="mt-2 gap-2">
              Try it out
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
      <MinimalFooter />
    </main>
  );
}
