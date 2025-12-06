"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Building2,
  Sparkles,
  ArrowUpRight,
  Clock,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Step = "amount" | "recipient" | "review" | "success";

interface Account {
  id: string;
  name: string;
  number: string;
  balance: number;
  type: "checking" | "savings";
  icon: typeof CreditCard;
}

const accounts: Account[] = [
  {
    id: "checking",
    name: "Main Account",
    number: "4532",
    balance: 12458.32,
    type: "checking",
    icon: CreditCard,
  },
  {
    id: "savings",
    name: "Savings",
    number: "7891",
    balance: 45230.15,
    type: "savings",
    icon: Building2,
  },
];

const formatCurrency = (amount: number, showDecimals = true) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
};

export default function TransactionPage() {
  const [step, setStep] = useState<Step>("amount");
  const [selectedAccount, setSelectedAccount] = useState<Account>(accounts[0]);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const transferAmount = parseFloat(amount) || 0;
  const fee = transferAmount > 0 ? Math.min(transferAmount * 0.001, 5) : 0;
  const totalAmount = transferAmount + fee;
  const isValidAmount = transferAmount > 0 && totalAmount <= selectedAccount.balance;

  const steps: { key: Step; label: string }[] = [
    { key: "amount", label: "Amount" },
    { key: "recipient", label: "Recipient" },
    { key: "review", label: "Review" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("success");
    }, 2000);
  };

  const handleReset = () => {
    setAmount("");
    setRecipientName("");
    setRecipientAccount("");
    setNote("");
    setStep("amount");
  };

  const canProceedToRecipient = isValidAmount;
  const canProceedToReview = recipientName.trim() && recipientAccount.trim();

  if (!mounted) return null;

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Step Indicator */}
        {step !== "success" && (
          <div className="mb-12">
            <div className="flex items-center justify-center gap-0">
              {steps.map((s, index) => {
                const isActive = s.key === step;
                const isCompleted = currentStepIndex > index;
                const isLast = index === steps.length - 1;

                return (
                  <div key={s.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500",
                          isCompleted
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                            : isActive
                              ? "bg-foreground text-background shadow-lg"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                      </div>
                      <span
                        className={cn(
                          "mt-2 text-xs font-medium transition-colors",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "mx-4 h-0.5 w-16 sm:w-24 transition-colors duration-500",
                          isCompleted ? "bg-emerald-500" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Amount Step */}
        <div
          className={cn(
            "transition-all duration-500 ease-out",
            step === "amount"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none absolute"
          )}
        >
          {step === "amount" && (
            <div className="space-y-8">
              {/* Account Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountPicker(!showAccountPicker)}
                  className="group flex w-full items-center justify-between rounded-2xl border border-border/50 bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/10">
                      <selectedAccount.icon className="h-6 w-6 text-foreground/70" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-muted-foreground">From</p>
                      <p className="font-semibold">{selectedAccount.name}</p>
                      <p className="text-sm text-muted-foreground">
                        •••• {selectedAccount.number} · {formatCurrency(selectedAccount.balance)}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      showAccountPicker && "rotate-180"
                    )}
                  />
                </button>

                {/* Account Dropdown */}
                {showAccountPicker && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
                    {accounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowAccountPicker(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-4 p-4 transition-colors hover:bg-muted/50",
                          selectedAccount.id === account.id && "bg-muted/50"
                        )}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/10">
                          <account.icon className="h-5 w-5 text-foreground/70" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            •••• {account.number} · {formatCurrency(account.balance)}
                          </p>
                        </div>
                        {selectedAccount.id === account.id && (
                          <Check className="h-5 w-5 text-emerald-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount Input */}
              <div className="rounded-2xl border border-border/50 bg-card p-8">
                <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
                  You send
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-semibold text-muted-foreground/50 sm:text-5xl">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, "");
                      if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                        setAmount(value);
                      }
                    }}
                    placeholder="0.00"
                    className="w-auto min-w-[100px] max-w-[300px] bg-transparent text-5xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/30 sm:text-6xl"
                  />
                </div>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Available: {formatCurrency(selectedAccount.balance)}
                </p>

                {/* Quick Amount Buttons */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[100, 250, 500, 1000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="rounded-full border border-border/50 px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/30 hover:bg-muted/50 hover:text-foreground"
                    >
                      ${quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown */}
              {transferAmount > 0 && (
                <div className="space-y-3 rounded-2xl border border-border/50 bg-card/50 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Transfer amount</span>
                    <span className="font-medium">{formatCurrency(transferAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Transfer fee</span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        Low fee
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(fee)}</span>
                  </div>
                  <div className="border-t border-border/50 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {amount && !isValidAmount && (
                <p className="text-center text-sm text-red-500">
                  Insufficient balance for this transfer
                </p>
              )}

              {/* Continue Button */}
              <Button
                onClick={() => setStep("recipient")}
                disabled={!canProceedToRecipient}
                className="h-14 w-full rounded-2xl bg-foreground text-lg font-semibold text-background transition-all hover:bg-foreground/90 hover:shadow-lg disabled:opacity-40"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Recipient Step */}
        <div
          className={cn(
            "transition-all duration-500 ease-out",
            step === "recipient"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none absolute"
          )}
        >
          {step === "recipient" && (
            <div className="space-y-6">
              {/* Transfer Preview */}
              <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-transparent to-emerald-500/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                  <selectedAccount.icon className="h-5 w-5 text-foreground/70" />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold">{formatCurrency(transferAmount)}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                </div>
              </div>

              {/* Recipient Form */}
              <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Recipient name
                  </label>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter full name"
                    className="h-12 rounded-xl border-border/50 bg-background/50 text-base placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Account number
                  </label>
                  <Input
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    placeholder="Enter account number"
                    className="h-12 rounded-xl border-border/50 bg-background/50 text-base placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:ring-0"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Note (optional)
                  </label>
                  <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What's this for?"
                    className="h-12 rounded-xl border-border/50 bg-background/50 text-base placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:ring-0"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Zap, label: "Instant", sublabel: "transfer" },
                  { icon: Shield, label: "Secure", sublabel: "encrypted" },
                  { icon: Clock, label: "24/7", sublabel: "available" },
                ].map(({ icon: Icon, label, sublabel }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center rounded-xl border border-border/30 bg-card/50 p-4"
                  >
                    <Icon className="mb-2 h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">{sublabel}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("amount")}
                  className="h-14 flex-1 rounded-2xl text-base font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep("review")}
                  disabled={!canProceedToReview}
                  className="h-14 flex-1 rounded-2xl bg-foreground text-base font-semibold text-background hover:bg-foreground/90 disabled:opacity-40"
                >
                  Review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Review Step */}
        <div
          className={cn(
            "transition-all duration-500 ease-out",
            step === "review"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none absolute"
          )}
        >
          {step === "review" && (
            <div className="space-y-6">
              {/* Amount Hero */}
              <div className="rounded-2xl bg-gradient-to-br from-foreground to-foreground/80 p-8 text-center text-background">
                <p className="mb-2 text-sm font-medium opacity-70">You're sending</p>
                <p className="text-5xl font-bold tracking-tight">
                  {formatCurrency(transferAmount)}
                </p>
                <p className="mt-2 text-sm opacity-70">to {recipientName}</p>
              </div>

              {/* Transfer Details */}
              <div className="space-y-1 rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-border/30 p-4">
                  <span className="text-muted-foreground">From</span>
                  <div className="flex items-center gap-2">
                    <selectedAccount.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {selectedAccount.name} (•••• {selectedAccount.number})
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b border-border/30 p-4">
                  <span className="text-muted-foreground">To</span>
                  <span className="font-medium">{recipientName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-border/30 p-4">
                  <span className="text-muted-foreground">Account</span>
                  <span className="font-medium font-mono">
                    •••• {recipientAccount.slice(-4).padStart(4, "•")}
                  </span>
                </div>
                {note && (
                  <div className="flex items-center justify-between border-b border-border/30 p-4">
                    <span className="text-muted-foreground">Note</span>
                    <span className="font-medium">{note}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-border/30 p-4">
                  <span className="text-muted-foreground">Transfer fee</span>
                  <span className="font-medium">{formatCurrency(fee)}</span>
                </div>
                <div className="flex items-center justify-between bg-muted/30 p-4">
                  <span className="font-semibold">Total amount</span>
                  <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="flex items-start gap-3 rounded-xl bg-emerald-500/5 p-4">
                <Shield className="mt-0.5 h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Secure transfer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your money is protected with bank-level encryption
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("recipient")}
                  className="h-14 flex-1 rounded-2xl text-base font-medium"
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing}
                  className="h-14 flex-1 rounded-2xl bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-600 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      Confirm & Send
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Success Step */}
        <div
          className={cn(
            "transition-all duration-700 ease-out",
            step === "success"
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 pointer-events-none absolute"
          )}
        >
          {step === "success" && (
            <div className="text-center">
              {/* Success Animation */}
              <div className="relative mx-auto mb-8 h-32 w-32">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
                <div className="absolute inset-2 animate-pulse rounded-full bg-emerald-500/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/30">
                    <Check className="h-12 w-12 text-white" strokeWidth={3} />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <h2 className="mb-2 text-3xl font-bold">Transfer sent!</h2>
              <p className="mb-1 text-lg text-muted-foreground">
                {formatCurrency(transferAmount)} is on its way to
              </p>
              <p className="mb-8 text-lg font-semibold">{recipientName}</p>

              {/* Transaction ID */}
              <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2">
                <span className="text-sm text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-sm font-medium">
                  TXN-{Date.now().toString().slice(-8)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  onClick={handleReset}
                  className="h-14 rounded-2xl bg-foreground px-8 text-base font-semibold text-background hover:bg-foreground/90"
                >
                  Send another transfer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="h-14 rounded-2xl px-8 text-base font-medium"
                >
                  Back to dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
