import { LayoutDashboard, Shield, Wallet, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import Link from "next/link";

export default function Dashboard() {
  const features = [
    {
      label: "Security",
      description: "Manage your profile & voice authentication",
      icon: Shield,
      href: "/dashboard/security",
    },
    {
      label: "Balance",
      description: "Check your account balance",
      icon: Wallet,
      href: "/dashboard/balance",
    },
    {
      label: "Transaction",
      description: "Transfer funds securely",
      icon: ArrowLeftRight,
      href: "/dashboard/transaction",
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <OnboardingDialog />
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        {/* Icon */}
        <div className="mb-6 flex size-24 items-center justify-center rounded-2xl border border-border bg-card">
          <LayoutDashboard className="size-12 text-muted-foreground" />
        </div>

        {/* Title */}
        <h1 className="mb-3 font-semibold text-3xl">Welcome to Digital Bank</h1>

        {/* Description */}
        <p className="mb-8 max-w-md text-center text-muted-foreground">
          Manage your finances securely with voice authentication. Check your balance, make transfers, and keep your account safe.
        </p>
      </div>

      {/* Features Grid */}
      <div className="border-t border-border bg-card/50 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 font-semibold text-lg">Quick Access</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.label} href={feature.href}>
                <Card className="h-full border-border transition hover:-translate-y-1 hover:shadow-md cursor-pointer">
                  <CardHeader className="flex flex-col items-center text-center pb-2">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="size-6 text-primary" />
                    </div>
                    <CardTitle className="font-medium text-lg">{feature.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
