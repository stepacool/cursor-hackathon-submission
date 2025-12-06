"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Eye,
  EyeOff,
  Copy,
  Check,
  Wifi,
} from "lucide-react";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import { CreateAccountDialog } from "@/components/create-account-dialog";
import { authClient } from "@/lib/auth-client";
import { readNamespacedItem, STORAGE_KEYS } from "@/lib/local-storage";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction, TransactionsResponse } from "@/types/transaction";
import type { BankAccount } from "@/types/bank-account";

// Display transaction type for UI
interface DisplayTransaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  btcAmount: string;
  time: string;
  date: string;
  icon: string;
  type: "debit" | "credit";
}

// Convert API transaction to display format
function convertToDisplayTransaction(
  txn: Transaction,
  currentUserId: string
): DisplayTransaction {
  const isCredit = txn.to_user_id === currentUserId;
  const amount = parseFloat(txn.amount);

  return {
    id: txn.id.toString(),
    merchant: txn.description || getTransactionLabel(txn.type),
    category: txn.type,
    amount: isCredit ? amount : -amount,
    btcAmount: "BTC 0.00", // Calculate if you have BTC conversion
    time: new Date(txn.created_at).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    date: formatTransactionDate(txn.created_at),
    icon: getTransactionIcon(txn.type),
    type: isCredit ? "credit" : "debit",
  };
}

function getTransactionLabel(type: string): string {
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
}

function getTransactionIcon(type: string): string {
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
}

function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today, ${date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    })}`;
  } else {
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long" });
  }
}

// Group transactions by date
function groupTransactionsByDate(txns: DisplayTransaction[]) {
  return txns.reduce((groups, txn) => {
    const date = txn.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(txn);
    return groups;
  }, {} as Record<string, DisplayTransaction[]>);
}

export default function Dashboard() {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(1456);
  const [primaryAccount, setPrimaryAccount] = useState<BankAccount | null>(
    null
  );
  const [allAccounts, setAllAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);

  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  // Function to fetch and update accounts
  const fetchAndUpdateAccounts = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await fetch("/api/accounts");
      const data = await response.json();

      if (data.success && data.data) {
        const accounts = (
          Array.isArray(data.data) ? data.data : [data.data]
        ) as BankAccount[];

        setAllAccounts(accounts);

        if (accounts.length > 0) {
          const activeAccount =
            accounts.find((account) => account.status === "ACTIVE") ??
            accounts[0];

          setPrimaryAccount(activeAccount);

          const parsedBalance = parseFloat(activeAccount.balance);
          if (!Number.isNaN(parsedBalance)) {
            setBalance(parsedBalance);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  }, [userId]);

  // Fetch transactions
  useEffect(() => {
    if (!userId) return;

    async function fetchTransactions() {
      try {
        setIsLoadingTransactions(true);
        const response = await fetch("/api/transactions");
        const data: TransactionsResponse = await response.json();

        if (data.success && data.data && userId) {
          const displayTransactions = data.data.map((txn) =>
            convertToDisplayTransaction(txn, userId)
          );
          setTransactions(displayTransactions);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoadingTransactions(false);
      }
    }

    fetchTransactions();
  }, [userId]);

  // Load balance from localStorage
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
        setBalance(parsed);
      }
    }
  }, [userId]);

  // Fetch accounts to display on the card
  useEffect(() => {
    fetchAndUpdateAccounts();
  }, [fetchAndUpdateAccounts]);

  // Handle account change
  const handleAccountChange = (accountId: string) => {
    const selectedAccount = allAccounts.find(
      (account) => account.id.toString() === accountId
    );
    if (selectedAccount) {
      setPrimaryAccount(selectedAccount);
      const parsedBalance = parseFloat(selectedAccount.balance);
      if (!Number.isNaN(parsedBalance)) {
        setBalance(parsedBalance);
      }
    }
  };

  // Helper function to mask account number
  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return "****";
    const last4 = accountNumber.slice(-4);
    return `**** ${last4}`;
  };

  // Format account number to card number format (XXXX XXXX XXXX XXXX)
  const formatCardNumber = (accountNumber: string | undefined): string => {
    if (!accountNumber) return "**** **** **** ****";
    
    // Extract digits from account number (e.g., "ACC-1234567890" -> "1234567890")
    const digits = accountNumber.replace(/\D/g, "");
    
    if (digits.length === 0) return "**** **** **** ****";
    
    // Pad or truncate to 16 digits for card format
    let cardDigits = digits;
    if (cardDigits.length < 16) {
      // Pad with zeros if too short
      cardDigits = cardDigits.padEnd(16, "0");
    } else if (cardDigits.length > 16) {
      // Take last 16 digits if too long
      cardDigits = cardDigits.slice(-16);
    }
    
    // Format as XXXX XXXX XXXX XXXX
    return cardDigits.match(/.{1,4}/g)?.join(" ") || "**** **** **** ****";
  };

  // Get card number from primary account
  const fullCardNumber = formatCardNumber(primaryAccount?.account_number);
  const cardNumber = fullCardNumber.split(" ").slice(-2).join(" "); // Last 8 digits

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCardNumber.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  const actionButtons = [
    {
      label: "Top Up Card",
      icon: ArrowDownLeft,
      href: "/dashboard/balance",
      gradient: "from-teal-600/90 to-teal-800/90",
      hoverGradient: "hover:from-teal-500/90 hover:to-teal-700/90",
    },
    {
      label: "Send Money",
      icon: ArrowUpRight,
      href: "/dashboard/transaction",
      gradient: "from-violet-600/90 to-violet-800/90",
      hoverGradient: "hover:from-violet-500/90 hover:to-violet-700/90",
    },
    {
      label: "Receive Money",
      icon: ArrowDownLeft,
      href: "/dashboard/balance",
      gradient: "from-indigo-600/90 to-indigo-800/90",
      hoverGradient: "hover:from-indigo-500/90 hover:to-indigo-700/90",
    },
    {
      label: "Withdraw Money",
      icon: Wallet,
      href: "/dashboard/transaction",
      gradient: "from-fuchsia-600/90 to-fuchsia-800/90",
      hoverGradient: "hover:from-fuchsia-500/90 hover:to-fuchsia-700/90",
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <OnboardingDialog />
      <CreateAccountDialog
        open={openAccountDialog}
        onOpenChange={setOpenAccountDialog}
        onSuccess={(account) => {
          console.log("Account created:", account);
          // Refresh accounts list
          fetchAndUpdateAccounts();
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - Cards */}
        <div className="flex w-full flex-col p-6 lg:w-3/5 xl:w-1/2 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-semibold text-2xl tracking-tight">
              My Virtual Cards
            </h1>
            <div className="flex items-center gap-2">
              {allAccounts.length > 1 && (
                <Select
                  value={primaryAccount?.id.toString()}
                  onValueChange={handleAccountChange}
                >
                  <SelectTrigger className="h-auto border-border/50 bg-card/50 px-4 py-2 text-sm font-medium hover:bg-card hover:border-border">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        Change Card
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {allAccounts.map((account) => (
                      <SelectItem
                        key={account.id}
                        value={account.id.toString()}
                      >
                        <div className="flex items-center gap-3 py-1">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
                            <Wallet className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {account.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {account.currency} • {maskAccountNumber(account.account_number)} •{" "}
                              {formatCurrency(parseFloat(account.balance))}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <button
                type="button"
                onClick={() => setOpenAccountDialog(true)}
                className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm font-medium transition-all hover:bg-card hover:border-border"
              >
                Add new Card
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Virtual Card */}
          <div className="relative mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 p-6 shadow-2xl">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute -right-20 -top-20 size-64 rounded-full bg-linear-to-br from-violet-500/40 to-transparent blur-3xl" />
                <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-linear-to-tr from-blue-500/30 to-transparent blur-3xl" />
              </div>

              {/* Card Content */}
              <div className="relative z-10">
                {/* Top Row */}
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm text-white/60">Account</p>
                    <p className="text-lg font-semibold text-white">
                      {primaryAccount?.title ?? "Primary Account"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white/80">
                      {primaryAccount?.currency ?? "USD"}
                    </span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl tracking-widest text-white/90">
                      {showCardNumber
                        ? fullCardNumber
                        : `**** **** ${cardNumber}`}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                    >
                      {copied ? (
                        <Check className="size-4 text-emerald-400" />
                      ) : (
                        <Copy className="size-4 text-white/60" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCardNumber(!showCardNumber)}
                      className="rounded-lg p-1.5 transition-colors hover:bg-white/10"
                    >
                      {showCardNumber ? (
                        <EyeOff className="size-4 text-white/60" />
                      ) : (
                        <Eye className="size-4 text-white/60" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-white/50">05/28</p>
                </div>

                {/* Bottom Row */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      ${balance.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wifi className="size-6 rotate-90 text-white/60" />
                    <svg viewBox="0 0 50 16" className="h-6 w-auto" fill="none">
                      <path
                        d="M46.5 8A8 8 0 1 1 30.5 8a8 8 0 0 1 16 0Z"
                        fill="#ED0006"
                        fillOpacity="0.8"
                      />
                      <path
                        d="M19.5 8A8 8 0 1 1 3.5 8a8 8 0 0 1 16 0Z"
                        fill="#F9A000"
                        fillOpacity="0.8"
                      />
                      <path
                        d="M25 13.856a7.97 7.97 0 0 0 2.5-5.856A7.97 7.97 0 0 0 25 2.144 7.97 7.97 0 0 0 22.5 8a7.97 7.97 0 0 0 2.5 5.856Z"
                        fill="#FF5F00"
                        fillOpacity="0.9"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-4">
            {actionButtons.map((button) => (
              <Link
                key={button.label}
                href={button.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl bg-linear-to-br p-4 transition-all duration-300",
                  button.gradient,
                  button.hoverGradient,
                  "hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5"
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <button.icon className="size-5 text-white" />
                </div>
                <span className="font-medium text-white">{button.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Section - Transactions */}
        <div className="hidden border-l border-border/50 bg-card/30 lg:flex lg:w-2/5 xl:w-1/2 flex-col overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="font-semibold text-xl tracking-tight">
              Transactions
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  Loading transactions...
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  No transactions yet
                </p>
              </div>
            ) : (
              Object.entries(groupedTransactions).map(([date, txns]) => (
                <div key={date} className="mb-6">
                  <p className="mb-3 text-sm text-muted-foreground">{date}</p>
                  <div className="space-y-1">
                    {txns.map((txn) => (
                      <div
                        key={txn.id}
                        className="group flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-10">
                            {txn.time}
                          </span>
                          <div className="flex size-10 items-center justify-center rounded-xl bg-muted/50 text-lg">
                            {txn.icon}
                          </div>
                          <div>
                            <p className="font-medium">{txn.merchant}</p>
                            <p className="text-sm text-muted-foreground">
                              {txn.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "font-semibold",
                              txn.type === "credit"
                                ? "text-emerald-500"
                                : "text-foreground"
                            )}
                          >
                            {txn.type === "credit" ? "+" : "-"}
                            {formatCurrency(txn.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {txn.btcAmount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
