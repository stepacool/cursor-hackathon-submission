"use client";

import { useState, useEffect } from "react";
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

// Transaction type
interface Transaction {
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

// Mock transaction data
const transactions: Transaction[] = [
  {
    id: "1",
    merchant: "Amazon",
    category: "Products",
    amount: -1456,
    btcAmount: "BTC 0.067",
    time: "10:29",
    date: "Today, 4 March",
    icon: "🛒",
    type: "debit",
  },
  {
    id: "2",
    merchant: "Netflix",
    category: "Entertainment",
    amount: -20,
    btcAmount: "BTC 0.00092",
    time: "09:49",
    date: "Today, 4 March",
    icon: "🎬",
    type: "debit",
  },
  {
    id: "3",
    merchant: "Balance Top Up",
    category: "Metamask Wallet",
    amount: 1000,
    btcAmount: "BTC 0.046",
    time: "23:08",
    date: "Yesterday, 3 March",
    icon: "💳",
    type: "credit",
  },
  {
    id: "4",
    merchant: "Airbnb",
    category: "Hospitality",
    amount: -956,
    btcAmount: "BTC 0.044",
    time: "20:50",
    date: "Yesterday, 3 March",
    icon: "🏠",
    type: "debit",
  },
  {
    id: "5",
    merchant: "Money Transfer",
    category: "From Ann Gray",
    amount: 500,
    btcAmount: "BTC 0.023",
    time: "18:40",
    date: "Yesterday, 3 March",
    icon: "💸",
    type: "credit",
  },
  {
    id: "6",
    merchant: "Figma",
    category: "Software",
    amount: -300,
    btcAmount: "BTC 0.014",
    time: "19:50",
    date: "Yesterday, 3 March",
    icon: "🎨",
    type: "debit",
  },
  {
    id: "7",
    merchant: "App Store",
    category: "Products",
    amount: -45,
    btcAmount: "BTC 0.0021",
    time: "10:29",
    date: "Yesterday, 3 March",
    icon: "📱",
    type: "debit",
  },
];

// Group transactions by date
function groupTransactionsByDate(txns: Transaction[]) {
  return txns.reduce(
    (groups, txn) => {
      const date = txn.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(txn);
      return groups;
    },
    {} as Record<string, Transaction[]>
  );
}

export default function Dashboard() {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(1456);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

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

  const cardNumber = "7677 8545";
  const fullCardNumber = `4532 8761 ${cardNumber}`;

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
          // Here you can handle the created account, e.g., update state, make API call, etc.
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Section - Cards */}
        <div className="flex w-full flex-col p-6 lg:w-3/5 xl:w-1/2 overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="font-semibold text-2xl tracking-tight">My Virtual Cards</h1>
            <button
              type="button"
              onClick={() => setOpenAccountDialog(true)}
              className="flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 text-sm font-medium transition-all hover:bg-card hover:border-border"
            >
              Add new Card
              <Plus className="size-4" />
            </button>
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
                <div className="mb-12 flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                    <div className="size-8 rounded-lg bg-linear-to-br from-teal-400 to-teal-600" />
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                    <span className="text-sm font-medium text-white/80">USD</span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl tracking-widest text-white/90">
                      {showCardNumber ? fullCardNumber : `**** **** ${cardNumber}`}
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
                    <svg
                      viewBox="0 0 50 16"
                      className="h-6 w-auto"
                      fill="none"
                    >
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
            <h2 className="font-semibold text-xl tracking-tight">Transactions</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {Object.entries(groupedTransactions).map(([date, txns]) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
