"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BankAccount } from "@/types/bank-account";

// Account interface for local state
interface Account {
  id: number;
  account_number: string;
  balance: number;
  currency: string;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  created_at: string;
}

export default function BalancePage() {
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/accounts');
      const result = await response.json();

      if (result.success && result.data) {
        const mappedAccounts: Account[] = (result.data as BankAccount[]).map(acc => ({
          id: acc.id,
          account_number: acc.account_number,
          balance: parseFloat(acc.balance),
          currency: acc.currency,
          status: acc.status,
          created_at: acc.created_at,
        }));
        setAllAccounts(mappedAccounts);
        
        // Set first active account as default
        const firstActive = mappedAccounts.find(a => a.status === "ACTIVE");
        if (firstActive) {
          setSelectedAccountId(firstActive.id.toString());
        } else if (mappedAccounts.length > 0) {
          setSelectedAccountId(mappedAccounts[0].id.toString());
        }
      } else {
        toast.error(result.error || 'Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to fetch accounts');
    } finally {
      setIsLoading(false);
    }
  };

  // Get active accounts only
  const activeAccounts = allAccounts.filter((a) => a.status === "ACTIVE");
  
  // Get selected account
  const selectedAccount =
    allAccounts.find((a) => a.id.toString() === selectedAccountId) || allAccounts[0];
  
  const checkingBalance = selectedAccount?.balance || 0;

  // Mock data - in real app this would come from API
  const monthlySpending = 2847.5;
  const monthlyIncome = 7500.0;

  // Extended transaction data for modal
  const allTransactions = [
    {
      id: 1,
      description: "Coffee Shop",
      amount: -4.5,
      date: "Today",
      fullDate: "Dec 6, 2025",
      time: "10:30 AM",
      type: "debit",
      icon: "☕",
      category: "Food & Dining",
    },
    {
      id: 2,
      description: "Salary Deposit",
      amount: 5000.0,
      date: "Yesterday",
      fullDate: "Dec 5, 2025",
      time: "09:00 AM",
      type: "credit",
      icon: "💰",
      category: "Income",
    },
    {
      id: 3,
      description: "Electric Bill",
      amount: -125.0,
      date: "Dec 4",
      fullDate: "Dec 4, 2025",
      time: "02:15 PM",
      type: "debit",
      icon: "⚡",
      category: "Utilities",
    },
    {
      id: 4,
      description: "Grocery Store",
      amount: -67.89,
      date: "Dec 3",
      fullDate: "Dec 3, 2025",
      time: "05:45 PM",
      type: "debit",
      icon: "🛒",
      category: "Food & Dining",
    },
    {
      id: 5,
      description: "Freelance Payment",
      amount: 850.0,
      date: "Dec 2",
      fullDate: "Dec 2, 2025",
      time: "11:20 AM",
      type: "credit",
      icon: "💼",
      category: "Income",
    },
    {
      id: 6,
      description: "Netflix Subscription",
      amount: -15.99,
      date: "Dec 1",
      fullDate: "Dec 1, 2025",
      time: "08:00 AM",
      type: "debit",
      icon: "🎬",
      category: "Entertainment",
    },
    {
      id: 7,
      description: "Gas Station",
      amount: -45.0,
      date: "Nov 30",
      fullDate: "Nov 30, 2025",
      time: "07:30 AM",
      type: "debit",
      icon: "⛽",
      category: "Transportation",
    },
    {
      id: 8,
      description: "Restaurant",
      amount: -89.5,
      date: "Nov 29",
      fullDate: "Nov 29, 2025",
      time: "07:30 PM",
      type: "debit",
      icon: "🍽️",
      category: "Food & Dining",
    },
    {
      id: 9,
      description: "Online Shopping",
      amount: -234.99,
      date: "Nov 28",
      fullDate: "Nov 28, 2025",
      time: "03:15 PM",
      type: "debit",
      icon: "🛍️",
      category: "Shopping",
    },
    {
      id: 10,
      description: "Client Payment",
      amount: 1500.0,
      date: "Nov 27",
      fullDate: "Nov 27, 2025",
      time: "10:00 AM",
      type: "credit",
      icon: "💼",
      category: "Income",
    },
    {
      id: 11,
      description: "Gym Membership",
      amount: -49.99,
      date: "Nov 26",
      fullDate: "Nov 26, 2025",
      time: "06:00 AM",
      type: "debit",
      icon: "💪",
      category: "Health & Fitness",
    },
    {
      id: 12,
      description: "Pharmacy",
      amount: -32.45,
      date: "Nov 25",
      fullDate: "Nov 25, 2025",
      time: "04:20 PM",
      type: "debit",
      icon: "💊",
      category: "Health & Fitness",
    },
    {
      id: 13,
      description: "Uber Ride",
      amount: -18.75,
      date: "Nov 24",
      fullDate: "Nov 24, 2025",
      time: "09:45 PM",
      type: "debit",
      icon: "🚗",
      category: "Transportation",
    },
    {
      id: 14,
      description: "Book Store",
      amount: -42.0,
      date: "Nov 23",
      fullDate: "Nov 23, 2025",
      time: "02:30 PM",
      type: "debit",
      icon: "📚",
      category: "Shopping",
    },
    {
      id: 15,
      description: "Refund",
      amount: 156.0,
      date: "Nov 22",
      fullDate: "Nov 22, 2025",
      time: "11:15 AM",
      type: "credit",
      icon: "↩️",
      category: "Refund",
    },
  ];

  const recentTransactions = allTransactions.slice(0, 5);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAccounts();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const maskAccountNumber = (number: string) => {
    return `•••• ${number.slice(-4)}`;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-4 border-muted border-t-foreground" />
          <p className="text-muted-foreground">Loading accounts...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no accounts
  if (!selectedAccount || allAccounts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <Wallet className="mx-auto mb-4 size-16 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">No Accounts Found</h2>
          <p className="text-muted-foreground">
            Create your first account to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">My Balance</h1>
          <p className="text-muted-foreground text-sm">
            Manage your accounts and track spending
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="rounded-xl"
        >
          <RefreshCw
            className={cn("size-4 mr-2", isRefreshing && "animate-spin")}
          />
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
              {/* Account Selector in Card */}
              <div className="mb-6 flex items-center justify-between rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3 flex-1">
                  <Select value={selectedAccountId} onValueChange={handleAccountChange}>
                    <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                      <SelectValue>
                        <div className="flex items-center gap-3">
                          <div className="flex size-12 items-center justify-center rounded-xl bg-white/10">
                            <Wallet className="size-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-white/60">
                              {selectedAccount.currency} Account
                            </p>
                            <p className="flex items-center gap-2 text-sm text-white/80">
                              <CreditCard className="size-3" />
                              {maskAccountNumber(selectedAccount.account_number)}
                            </p>
                          </div>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-slate-900 border-slate-700">
                      {activeAccounts.map((account) => {
                        return (
                          <SelectItem
                            key={account.id}
                            value={account.id.toString()}
                            className="rounded-lg text-white focus:bg-white/10 focus:text-white"
                          >
                            <div className="flex items-center gap-3 py-2">
                              <div className="flex size-10 items-center justify-center rounded-lg bg-white/10">
                                <Wallet className="size-5" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{account.currency} Account</p>
                                <p className="text-xs text-white/60">
                                  {maskAccountNumber(account.account_number)} •{" "}
                                  {formatCurrency(account.balance, account.currency)}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="ml-3 rounded-xl bg-white/10 p-2.5 backdrop-blur-sm transition-colors hover:bg-white/20 shrink-0"
                >
                  {showBalance ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>

              <div className="mb-8">
                <p className="text-5xl font-bold tracking-tight">
                  {showBalance ? formatCurrency(checkingBalance, selectedAccount.currency) : "••••••"}
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
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setIsModalOpen(true)}
          >
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

      {/* All Transactions Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-border/50">
            <DialogTitle className="text-2xl font-semibold">
              All Transactions
            </DialogTitle>
            <DialogDescription>
              Complete transaction history for {selectedAccount.currency} Account ({maskAccountNumber(selectedAccount.account_number)})
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto px-6 pb-6 max-h-[calc(85vh-120px)]">
            <div className="space-y-1">
              {allTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-accent/50",
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{transaction.fullDate}</span>
                        <span>•</span>
                        <span>{transaction.time}</span>
                        <span>•</span>
                        <span className="rounded-full bg-muted px-2 py-0.5">
                          {transaction.category}
                        </span>
                      </div>
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
                        "font-semibold text-base",
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
