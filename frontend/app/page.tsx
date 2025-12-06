import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ModeSwitcher } from "@/components/mode-switcher";

const highlights = [
  "Prewired Better Auth flows for login, signup, and password resets",
  "Drizzle ORM + Neon-ready schema with migrations",
  "Tailwind + DaisyUI styling that respects dark mode",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-base-100 text-base-content">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-base-100 to-base-100" />

      <header className="sticky top-0 z-20 bg-base-100/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            {/* <div className="badge badge-primary badge-lg font-semibold">Hackathon</div> */}
            <span className="hidden text-sm text-base-content/60 sm:inline">
              cursor
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ModeSwitcher />
            <Link href="/login" className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm gap-1">
              Sign up
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col justify-center gap-8 px-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Launch polished auth experiences with one starter.
          </h1>
          <p className="text-base text-base-content/70 sm:text-lg">
            A Next.js 16 + DaisyUI kit that ships login, signup, password reset flows, and a Drizzle schema ready for Neon or
            your favorite Postgres.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {highlights.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-box bg-base-200/70 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
              <p className="text-sm sm:text-base">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
