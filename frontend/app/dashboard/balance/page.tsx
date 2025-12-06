"use client";

import { useEffect, useState } from "react";
import { Wallet, Eye, EyeOff, RefreshCw, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BalancePage() {
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [checkingBalance, setCheckingBalance] = useState(12458.32);

  // Mock data - in real app this would come from API
  const savingsBalance = 45230.15;
  const pendingTransactions = 3;

  const recentTransactions = [
    { id: 1, description: "Coffee Shop", amount: -4.50, date: "Today", type: "debit" },
    { id: 2, description: "Salary Deposit", amount: 5000.00, date: "Yesterday", type: "credit" },
    { id: 3, description: "Electric Bill", amount: -125.00, date: "Dec 4", type: "debit" },
    { id: 4, description: "Grocery Store", amount: -67.89, date: "Dec 3", type: "debit" },
    { id: 5, description: "Freelance Payment", amount: 850.00, date: "Dec 2", type: "credit" },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored =
      window.localStorage.getItem("balance.amount") ||
      (() => {
        const profile = window.localStorage.getItem("onboarding-profile");
        if (!profile) return null;
        try {
          const parsed = JSON.parse(profile) as { balance?: number };
          return parsed.balance ? String(parsed.balance) : null;
        } catch {
          return null;
        }
      })();
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) {
        setCheckingBalance(parsed);
      }
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="flex h-full flex-col">

      {/* Content */}
      <div className="border-t border-border bg-card/50 px-6 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Balance Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Checking Account */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 translate-x-8 -translate-y-8 rounded-full bg-primary/5" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardDescription>Checking Account</CardDescription>
                  <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                    <CreditCard className="size-4" />
                    •••• 4532
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-3xl">
                  {showBalance ? formatCurrency(checkingBalance) : "••••••"}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {pendingTransactions} pending transactions
                </p>
              </CardContent>
            </Card>

            {/* Savings Account */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 translate-x-8 -translate-y-8 rounded-full bg-emerald-500/5" />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardDescription>Savings Account</CardDescription>
                  <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                    <CreditCard className="size-4" />
                    •••• 7891
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="font-bold text-3xl text-emerald-600 dark:text-emerald-400">
                  {showBalance ? formatCurrency(savingsBalance) : "••••••"}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  +2.5% APY
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest account activity</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`size-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-10 items-center justify-center rounded-full ${
                          transaction.type === "credit"
                            ? "bg-emerald-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {transaction.type === "credit" ? (
                          <TrendingUp className="size-5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="size-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        transaction.type === "credit"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
