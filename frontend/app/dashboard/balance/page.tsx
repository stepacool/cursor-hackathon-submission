"use client";

import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  TrendingDown,
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
import type { Transaction, TransactionsResponse } from "@/types/transaction";

// Account interface for local state
interface Account {
  id: number;
  account_number: string;
  title: string;
  balance: number;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  created_at: string;
}

interface DisplayTransaction {
  id: number;
  description: string;
  amount: number;
  dateLabel: string;
  fullDate: string;
  time: string;
  type: "credit" | "debit";
  icon: string;
  category: string;
}

const getTransactionLabel = (type: Transaction["type"]) => {
  switch (type) {
    case "TRANSFER":
      return "Money Transfer";
    case "DEPOSIT":
      return "Balance Top Up";
    case "WITHDRAWAL":
      return "Withdrawal";
    default:
      return type;
  }
};

const getTransactionIcon = (type: Transaction["type"]) => {
  switch (type) {
    case "TRANSFER":
      return "💸";
    case "DEPOSIT":
      return "💳";
    case "WITHDRAWAL":
      return "💰";
    default:
      return "💵";
  }
};

const formatRelativeDate = (dateInput: string | Date) => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const mapTransactionToDisplay = (
  txn: Transaction,
  accountId: number,
  formatFullDate: (dateString: string) => string
): DisplayTransaction => {
  const parsedAmount = parseFloat(txn.amount);
  const createdAt = new Date(txn.created_at);
  const isCredit = txn.to_account_id === accountId;
  const safeAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
  const isValidDate = !Number.isNaN(createdAt.getTime());
  const dateLabel = isValidDate ? formatRelativeDate(createdAt) : "";
  const fullDate = isValidDate ? formatFullDate(txn.created_at) : "";
  const time = isValidDate
    ? createdAt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return {
    id: txn.id,
    description: txn.description || getTransactionLabel(txn.type),
    amount: isCredit ? safeAmount : -safeAmount,
    dateLabel,
    fullDate,
    time,
    type: isCredit ? "credit" : "debit",
    icon: getTransactionIcon(txn.type),
    category: getTransactionLabel(txn.type),
  };
};

export default function BalancePage() {
  const [showBalance, setShowBalance] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  // Fetch accounts and transactions on mount
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/accounts");
      const result = await response.json();

      if (result.success && result.data) {
        const mappedAccounts: Account[] = (result.data as BankAccount[]).map(
          (acc) => ({
            id: acc.id,
            account_number: acc.account_number,
            title: acc.title,
            balance: parseFloat(acc.balance),
            status: acc.status,
            created_at: acc.created_at,
          })
        );
        setAllAccounts(mappedAccounts);

        // Set first active account as default
        const firstActive = mappedAccounts.find((a) => a.status === "ACTIVE");
        if (firstActive) {
          setSelectedAccountId(firstActive.id.toString());
        } else if (mappedAccounts.length > 0) {
          setSelectedAccountId(mappedAccounts[0].id.toString());
        }
      } else {
        toast.error(result.error || "Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to fetch accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const response = await fetch("/api/transactions");
      const result: TransactionsResponse = await response.json();

      if (result.success && result.data) {
        const transactionData = Array.isArray(result.data)
          ? result.data
          : [result.data];

        setTransactions(transactionData as Transaction[]);
      } else {
        toast.error(result.error || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const maskAccountNumber = (number: string) => {
    return `•••• ${number.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get active accounts only
  const activeAccounts = allAccounts.filter((a) => a.status === "ACTIVE");

  // Get selected account
  const selectedAccount =
    allAccounts.find((a) => a.id.toString() === selectedAccountId) ||
    allAccounts[0];

  const checkingBalance = selectedAccount?.balance || 0;

  const accountTransactions: DisplayTransaction[] = selectedAccount
    ? transactions
        .filter(
          (txn) =>
            txn.from_account_id === selectedAccount.id ||
            txn.to_account_id === selectedAccount.id
        )
        .map((txn) =>
          mapTransactionToDisplay(txn, selectedAccount.id, formatDate)
        )
    : [];

  const recentTransactions = accountTransactions.slice(0, 5);

  // Placeholder monthly stats until backend aggregates are available
  const monthlySpending = 2847.5;
  const monthlyIncome = 7500.0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchAccounts(), fetchTransactions()]);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
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
                  <Select
                    value={selectedAccountId}
                    onValueChange={handleAccountChange}
                  >
                    <SelectTrigger className="h-auto w-full border-0 bg-transparent p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                      <SelectValue>
                        <div className="flex items-center gap-3">
                          <div className="flex size-12 items-center justify-center rounded-xl bg-white/10">
                            <Wallet className="size-6" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white">
                              {selectedAccount.title}
                            </p>
                            <p className="flex items-center gap-2 text-xs text-white/60">
                              RM •{" "}
                              {maskAccountNumber(
                                selectedAccount.account_number
                              )}
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
                                <p className="font-semibold text-sm">
                                  {account.title}
                                </p>
                                <p className="text-xs text-white/60">
                                  RM •{" "}
                                  {maskAccountNumber(account.account_number)} •{" "}
                                  {formatCurrency(account.balance)}
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
          {isLoadingTransactions ? (
            <div className="p-6 text-center text-muted-foreground">
              Loading transactions...
            </div>
          ) : recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No transactions for this account yet
            </div>
          ) : (
            recentTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={cn(
                  "flex items-center justify-between p-4 transition-colors hover:bg-accent/50",
                  index !== recentTransactions.length - 1 &&
                    "border-b border-border/30"
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
                    <p className="text-sm text-muted-foreground">
                      {transaction.dateLabel || transaction.fullDate}
                    </p>
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
            ))
          )}
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
              Complete transaction history for {selectedAccount.title} (
              {maskAccountNumber(selectedAccount.account_number)})
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-6 pb-6 max-h-[calc(85vh-120px)]">
            <div className="space-y-1">
              {isLoadingTransactions ? (
                <div className="p-6 text-center text-muted-foreground">
                  Loading transactions...
                </div>
              ) : accountTransactions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No transactions for this account yet
                </div>
              ) : (
                accountTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl transition-colors hover:bg-accent/50"
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
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
