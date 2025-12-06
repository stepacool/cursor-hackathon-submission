"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { readNamespacedItem, STORAGE_KEYS } from "@/lib/local-storage";
import { cn } from "@/lib/utils";

export default function BalancePage() {
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(12458.32);
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  // Mock data - in real app this would come from API
  const monthlySpending = 2847.50;
  const monthlyIncome = 7500.00;

  const recentTransactions = [
    { id: 1, description: "Coffee Shop", amount: -4.50, date: "Today", type: "debit", icon: "☕" },
    { id: 2, description: "Salary Deposit", amount: 5000.00, date: "Yesterday", type: "credit", icon: "💰" },
    { id: 3, description: "Electric Bill", amount: -125.00, date: "Dec 4", type: "debit", icon: "⚡" },
    { id: 4, description: "Grocery Store", amount: -67.89, date: "Dec 3", type: "debit", icon: "🛒" },
    { id: 5, description: "Freelance Payment", amount: 850.00, date: "Dec 2", type: "credit", icon: "💼" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const balanceValue =
      readNamespacedItem(STORAGE_KEYS.balanceAmount, userId)?.value ||
      (() => {
        const profile = readNamespacedItem(STORAGE_KEYS.onboarding, userId);
        if (!profile) return null;
        try {
          const parsed = JSON.parse(profile.value) as { balance?: number };
          return parsed.balance != null ? String(parsed.balance) : null;
        } catch {
          return null;
        }
      })();
    if (balanceValue) {
      const parsed = Number(balanceValue);
      if (!Number.isNaN(parsed)) {
        setCheckingBalance(parsed);
      }
    }
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">My Balance</h1>
          <p className="text-muted-foreground text-sm">Manage your accounts and track spending</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded-xl"
        >
          <RefreshCw className={cn("size-4 mr-2", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <div className="mb-8">
        {/* Main Balance Card */}
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-800 via-slate-900 to-slate-950 p-8 text-white shadow-2xl">
            {/* Background decorations */}
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-linear-to-br from-violet-500/20 to-transparent blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-linear-to-tr from-teal-500/20 to-transparent blur-3xl" />
            
            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                    <Wallet className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Total Balance</p>
                    <p className="flex items-center gap-2 text-sm text-white/80">
                      <CreditCard className="size-3" />
                      Checking •••• 4532
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {showBalance ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>

              <div className="mb-8">
                <p className="text-5xl font-bold tracking-tight">
                  {showBalance ? formatCurrency(checkingBalance) : "••••••"}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                    <TrendingUp className="size-3" />
                    +12.5%
                  </span>
                  <span className="text-sm text-white/50">vs last month</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <ArrowDownLeft className="size-4 text-emerald-400" />
                    <span className="text-sm text-white/60">Income</span>
                  </div>
                  <p className="text-xl font-semibold text-emerald-400">
                    {showBalance ? formatCurrency(monthlyIncome) : "••••"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <ArrowUpRight className="size-4 text-rose-400" />
                    <span className="text-sm text-white/60">Spending</span>
                  </div>
                  <p className="text-xl font-semibold text-rose-400">
                    {showBalance ? formatCurrency(monthlySpending) : "••••"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mx-auto mt-8 w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View All
          </Button>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
          {recentTransactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={cn(
                "flex items-center justify-between p-4 transition-colors hover:bg-accent/50",
                index !== recentTransactions.length - 1 && "border-b border-border/30"
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl text-lg",
                    transaction.type === "credit"
                      ? "bg-emerald-500/10"
                      : "bg-muted/50"
                  )}
                >
                  {transaction.icon}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {transaction.type === "credit" ? (
                  <TrendingUp className="size-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="size-4 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "font-semibold",
                    transaction.type === "credit"
                      ? "text-emerald-500"
                      : "text-foreground"
                  )}
                >
                  {transaction.type === "credit" ? "+" : ""}
                  {formatCurrency(transaction.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
