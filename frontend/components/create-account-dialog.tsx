"use client";

import { useState } from "react";
import { Plus, Check, Wallet, PiggyBank, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BankAccount } from "@/types/bank-account";

// Account types
export type AccountType = "checking" | "savings" | "business";

export interface NewAccount {
  name: string;
  type: AccountType;
  initialDeposit: number;
  accountNumber: string;
}

export const accountTypeConfig = {
  checking: {
    icon: Wallet,
    label: "Checking Account",
    gradient: "from-teal-500 to-cyan-600",
    description: "For everyday transactions and bill payments",
  },
  savings: {
    icon: PiggyBank,
    label: "Savings Account",
    gradient: "from-violet-500 to-purple-600",
    description: "High-yield savings with interest",
  },
  business: {
    icon: Briefcase,
    label: "Business Account",
    gradient: "from-amber-500 to-orange-600",
    description: "For business transactions and payroll",
  },
};

interface CreateAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (account: BankAccount) => void;
}

export function CreateAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAccountDialogProps) {
  const [newAccountType, setNewAccountType] = useState<AccountType>("checking");
  const [title, setTitle] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<BankAccount | null>(null);

  const handleOpenAccount = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          currency: currency.toUpperCase(),
          initialBalance: parseFloat(initialDeposit) || 0,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create account');
      }

      setCreatedAccount(result.data);
      onOpenChange(false);
      setTitle("");
      setCurrency("USD");
      setInitialDeposit("");
      setNewAccountType("checking");
      setSuccessDialog(true);

      // Call onSuccess callback if provided
      onSuccess?.(result.data);
      
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialog(false);
    setCreatedAccount(null);
  };

  return (
    <>
      {/* Create Account Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-cyan-600">
                <Plus className="size-5 text-white" />
              </div>
              Open New Account
            </DialogTitle>
            <DialogDescription>
              Choose an account type and set up your new account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Account Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Account Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Main Checking, Savings, Business Account"
                className="h-12 rounded-xl"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Give your account a descriptive name
              </p>
            </div>

            {/* Currency Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Currency
              </label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
                className="h-12 rounded-xl uppercase"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Enter 3-letter currency code (e.g., USD, EUR, GBP)
              </p>
            </div>

            {/* Initial Deposit */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Initial Balance (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {currency}
                </span>
                <Input
                  type="number"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="h-12 rounded-xl pl-16"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleOpenAccount}
              disabled={!title.trim() || !currency.trim() || isProcessing}
              className="rounded-xl bg-linear-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent
          className="max-w-sm rounded-2xl text-center"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="sr-only">Account Created</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            {/* Success Animation */}
            <div className="relative mx-auto mb-6 size-20">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-20" />
              <div className="flex size-20 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600">
                <Check className="size-10 text-white" strokeWidth={3} />
              </div>
            </div>

            <h3 className="mb-2 text-xl font-bold">Account Created!</h3>

            <p className="mb-6 text-muted-foreground">
              Your new bank account has been created successfully.
            </p>

            {createdAccount && (
              <div className="mb-6 space-y-3">
                <div className="rounded-xl bg-muted/30 p-4 text-left">
                  <p className="text-sm text-muted-foreground">Account Title</p>
                  <p className="font-medium">
                    {createdAccount.title}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-4 text-left">
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-mono font-medium">
                    {createdAccount.account_number}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-4 text-left">
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="font-mono font-medium">
                    {createdAccount.currency} {parseFloat(createdAccount.balance).toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-4 text-left">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-emerald-600">{createdAccount.status}</p>
                </div>
              </div>
            )}

            <Button onClick={handleSuccessClose} className="w-full rounded-xl">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

