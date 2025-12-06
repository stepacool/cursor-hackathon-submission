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
  onSuccess?: (account: NewAccount) => void;
}

// Generate random account number
const generateAccountNumber = () => {
  const segments = Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000)
  );
  return segments.join("-");
};

export function CreateAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAccountDialogProps) {
  const [newAccountType, setNewAccountType] = useState<AccountType>("checking");
  const [newAccountName, setNewAccountName] = useState("");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [createdAccount, setCreatedAccount] = useState<NewAccount | null>(null);

  const handleOpenAccount = () => {
    if (!newAccountName.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const newAccount: NewAccount = {
        name: newAccountName.trim(),
        type: newAccountType,
        initialDeposit: parseFloat(initialDeposit) || 0,
        accountNumber: generateAccountNumber(),
      };

      setCreatedAccount(newAccount);
      onOpenChange(false);
      setNewAccountName("");
      setInitialDeposit("");
      setNewAccountType("checking");
      setIsProcessing(false);
      setSuccessDialog(true);

      // Call onSuccess callback if provided
      onSuccess?.(newAccount);
    }, 1500);
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
            {/* Account Type Selection */}
            <div>
              <label className="mb-3 block text-sm font-medium">
                Account Type
              </label>
              <div className="grid gap-3">
                {(Object.keys(accountTypeConfig) as AccountType[]).map(
                  (type) => {
                    const config = accountTypeConfig[type];
                    const Icon = config.icon;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewAccountType(type)}
                        className={cn(
                          "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                          newAccountType === type
                            ? "border-foreground/30 bg-foreground/5"
                            : "border-border/50 hover:border-foreground/20 hover:bg-foreground/[0.02]"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-12 items-center justify-center rounded-xl bg-linear-to-br",
                            config.gradient
                          )}
                        >
                          <Icon className="size-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{config.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>
                        </div>
                        {newAccountType === type && (
                          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500">
                            <Check className="size-4 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Account Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Account Name
              </label>
              <Input
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="e.g., Personal Savings"
                className="h-12 rounded-xl"
              />
            </div>

            {/* Initial Deposit */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Initial Deposit (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  placeholder="0.00"
                  className="h-12 rounded-xl pl-8"
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
              disabled={!newAccountName.trim() || isProcessing}
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
              Your new{" "}
              {createdAccount &&
                accountTypeConfig[createdAccount.type].label.toLowerCase()}{" "}
              has been created successfully.
            </p>

            {createdAccount && (
              <div className="mb-6 rounded-xl bg-muted/30 p-4 text-left">
                <p className="text-sm text-muted-foreground">Account Number</p>
                <p className="font-mono font-medium">
                  {createdAccount.accountNumber}
                </p>
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

