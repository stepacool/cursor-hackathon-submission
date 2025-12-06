"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Snowflake,
  Sun,
  Check,
  AlertTriangle,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";
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
import {
  CreateAccountDialog,
  accountTypeConfig,
  type AccountType,
} from "@/components/create-account-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BankAccount } from "@/types/bank-account";

// Account types
type AccountStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";

interface Account {
  id: number;
  account_number: string;
  title: string;
  balance: number;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

// Mock accounts data
const initialAccounts: Account[] = [];

const statusConfig = {
  ACTIVE: {
    label: "Active",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  SUSPENDED: {
    label: "Frozen",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    dotColor: "bg-sky-500",
  },
  CLOSED: {
    label: "Closed",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dotColor: "bg-rose-500",
  },
};

const cardVisualConfig: Record<
  AccountStatus,
  {
    gradient: string;
    gradientDark: string;
    glow: string;
    textColor: string;
    textColorDark: string;
  }
> = {
  ACTIVE: {
    gradient: "from-slate-100 via-slate-50 to-white",
    gradientDark: "dark:from-slate-800 dark:via-slate-900 dark:to-slate-950",
    glow: "from-white/30 via-transparent to-transparent",
    textColor: "text-slate-900",
    textColorDark: "dark:text-white",
  },
  SUSPENDED: {
    gradient: "from-slate-200 via-slate-100 to-slate-50",
    gradientDark: "dark:from-slate-600 dark:via-slate-700 dark:to-slate-900",
    glow: "from-white/20 via-transparent to-transparent",
    textColor: "text-slate-800",
    textColorDark: "dark:text-white",
  },
  CLOSED: {
    gradient: "from-zinc-200 via-zinc-100 to-zinc-50",
    gradientDark: "dark:from-zinc-700 dark:via-zinc-800 dark:to-slate-900",
    glow: "from-white/10 via-transparent to-transparent",
    textColor: "text-zinc-800",
    textColorDark: "dark:text-white",
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const maskAccountNumber = (number: string) => {
  // Handle ACC-XXXXXXXXXX format
  return `•••• ${number.slice(-4)}`;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [closeAccountDialog, setCloseAccountDialog] = useState(false);
  const [freezeAccountDialog, setFreezeAccountDialog] = useState(false);
  const [unfreezeAccountDialog, setUnfreezeAccountDialog] = useState(false);

  // Form states
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmText, setConfirmText] = useState("");

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
          title: acc.title,
          balance: parseFloat(acc.balance),
          status: acc.status,
          created_at: acc.created_at,
          updated_at: acc.updated_at,
          closed_at: acc.closed_at,
        }));
        setAccounts(mappedAccounts);
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

  // Handle new account creation
  const handleAccountCreated = (newAccount: BankAccount) => {
    const account: Account = {
      id: newAccount.id,
      account_number: newAccount.account_number,
      title: newAccount.title,
      balance: parseFloat(newAccount.balance),
      status: newAccount.status,
      created_at: newAccount.created_at,
      updated_at: newAccount.updated_at,
      closed_at: newAccount.closed_at,
    };
    setAccounts((prev) => [account, ...prev]);
  };

  // Close Account Handler
  const handleCloseAccount = async () => {
    if (!selectedAccount || confirmText !== "CLOSE") return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'close' }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to close account');
      }

      // Update local state
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedAccount.id
            ? {
                ...acc,
                status: "CLOSED" as AccountStatus,
                closed_at: result.data.closed_at,
              }
            : acc
        )
      );
      
      toast.success('Account closed successfully');
      setCloseAccountDialog(false);
      setConfirmText("");
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error closing account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to close account');
    } finally {
      setIsProcessing(false);
    }
  };

  // Freeze Account Handler
  const handleFreezeAccount = async () => {
    if (!selectedAccount) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'freeze' }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to freeze account');
      }

      // Update local state
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedAccount.id
            ? {
                ...acc,
                status: "SUSPENDED" as AccountStatus,
                updated_at: result.data.updated_at,
              }
            : acc
        )
      );
      
      toast.success('Account frozen successfully');
      setFreezeAccountDialog(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error freezing account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to freeze account');
    } finally {
      setIsProcessing(false);
    }
  };

  // Unfreeze Account Handler
  const handleUnfreezeAccount = async () => {
    if (!selectedAccount) return;

    setIsProcessing(true);
    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'unfreeze' }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to unfreeze account');
      }

      // Update local state
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedAccount.id
            ? {
                ...acc,
                status: "ACTIVE" as AccountStatus,
                updated_at: result.data.updated_at,
              }
            : acc
        )
      );
      
      toast.success('Account unfrozen successfully');
      setUnfreezeAccountDialog(false);
      setSelectedAccount(null);
    } catch (error) {
      console.error('Error unfreezing account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unfreeze account');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeAccounts = accounts.filter((a) => a.status === "ACTIVE");
  const frozenAccounts = accounts.filter((a) => a.status === "SUSPENDED");
  const closedAccounts = accounts.filter((a) => a.status === "CLOSED");

  const totalBalance = accounts
    .filter((a) => a.status !== "CLOSED")
    .reduce((sum, a) => sum + a.balance, 0);

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

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">
            Account Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Open, close, freeze, or unfreeze your accounts
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenAccountDialog(true)}
          className="rounded-xl"
        >
          <Plus className="mr-2 size-4" />
          Open New Account
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="size-5 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Total Balance
            </span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-teal-500/10">
              <Check className="size-5 text-teal-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Active Accounts
            </span>
          </div>
          <p className="text-2xl font-bold">{activeAccounts.length}</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10">
              <Snowflake className="size-5 text-sky-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Frozen Accounts
            </span>
          </div>
          <p className="text-2xl font-bold">{frozenAccounts.length}</p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/50 p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10">
              <X className="size-5 text-rose-500" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Closed Accounts
            </span>
          </div>
          <p className="text-2xl font-bold">{closedAccounts.length}</p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="space-y-6">
        {/* Active Accounts */}
        {activeAccounts.length > 0 && (
          <div>
            <h2 className="mb-4 font-semibold text-lg">Active Accounts</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onFreeze={() => {
                    setSelectedAccount(account);
                    setFreezeAccountDialog(true);
                  }}
                  onClose={() => {
                    setSelectedAccount(account);
                    setCloseAccountDialog(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Frozen Accounts */}
        {frozenAccounts.length > 0 && (
          <div>
            <h2 className="mb-4 font-semibold text-lg">Frozen Accounts</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {frozenAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onUnfreeze={() => {
                    setSelectedAccount(account);
                    setUnfreezeAccountDialog(true);
                  }}
                  onClose={() => {
                    setSelectedAccount(account);
                    setCloseAccountDialog(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Closed Accounts */}
        {closedAccounts.length > 0 && (
          <div>
            <h2 className="mb-4 font-semibold text-lg text-muted-foreground">
              Closed Accounts
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {closedAccounts.map((account) => (
                <AccountCard key={account.id} account={account} disabled />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Account Dialog */}
      <CreateAccountDialog
        open={openAccountDialog}
        onOpenChange={setOpenAccountDialog}
        onSuccess={handleAccountCreated}
      />

      {/* Close Account Dialog */}
      <Dialog open={closeAccountDialog} onOpenChange={setCloseAccountDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500/10">
                <X className="size-5 text-rose-500" />
              </div>
              Close Account
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. The account will be permanently
              closed.
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4 py-4">
              {/* Account Info */}
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="font-semibold">Account {selectedAccount.account_number}</p>
                <p className="text-sm text-muted-foreground">
                  {maskAccountNumber(selectedAccount.account_number)}
                </p>
                <p className="mt-2 text-lg font-bold">
                  {formatCurrency(selectedAccount.balance)}
                </p>
              </div>

              {/* Warning */}
              {selectedAccount.balance > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-4">
                  <AlertTriangle className="mt-0.5 size-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Balance will be transferred
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Remaining balance of{" "}
                      {formatCurrency(selectedAccount.balance)} will be
                      transferred to your primary account.
                    </p>
                  </div>
                </div>
              )}

              {/* Confirmation Input */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Type <span className="font-mono text-rose-500">CLOSE</span> to
                  confirm
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="CLOSE"
                  className="h-12 rounded-xl font-mono"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCloseAccountDialog(false);
                setConfirmText("");
              }}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCloseAccount}
              disabled={confirmText !== "CLOSE" || isProcessing}
              variant="destructive"
              className="rounded-xl"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Closing...
                </div>
              ) : (
                "Close Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Freeze Account Dialog */}
      <Dialog open={freezeAccountDialog} onOpenChange={setFreezeAccountDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500/10">
                <Snowflake className="size-5 text-sky-500" />
              </div>
              Freeze Account
            </DialogTitle>
            <DialogDescription>
              Temporarily suspend all transactions on this account
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4 py-4">
              {/* Account Info */}
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="font-semibold">Account {selectedAccount.account_number}</p>
                <p className="text-sm text-muted-foreground">
                  {maskAccountNumber(selectedAccount.account_number)}
                </p>
                <p className="mt-2 text-lg font-bold">
                  {formatCurrency(selectedAccount.balance)}
                </p>
              </div>

              {/* What happens */}
              <div className="space-y-3">
                <p className="text-sm font-medium">What happens when frozen:</p>
                <div className="space-y-2">
                  {[
                    "All debit transactions blocked",
                    "All incoming deposits blocked",
                    "Card payments disabled",
                    "Account balance preserved",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="size-1.5 rounded-full bg-sky-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 rounded-xl bg-sky-500/10 p-4">
                <Shield className="mt-0.5 size-5 text-sky-500" />
                <div>
                  <p className="text-sm font-medium text-sky-700 dark:text-sky-400">
                    Reversible action
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can unfreeze this account at any time to restore full
                    functionality.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFreezeAccountDialog(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFreezeAccount}
              disabled={isProcessing}
              className="rounded-xl bg-sky-500 text-white hover:bg-sky-600"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Freezing...
                </div>
              ) : (
                <>
                  <Snowflake className="mr-2 size-4" />
                  Freeze Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unfreeze Account Dialog */}
      <Dialog
        open={unfreezeAccountDialog}
        onOpenChange={setUnfreezeAccountDialog}
      >
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Sun className="size-5 text-amber-500" />
              </div>
              Unfreeze Account
            </DialogTitle>
            <DialogDescription>
              Restore full functionality to this account
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4 py-4">
              {/* Account Info */}
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                      statusConfig.SUSPENDED.color
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        statusConfig.SUSPENDED.dotColor
                      )}
                    />
                    Frozen
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDate(selectedAccount.updated_at)}
                  </span>
                </div>
                <p className="font-semibold">Account {selectedAccount.account_number}</p>
                <p className="text-sm text-muted-foreground">
                  {maskAccountNumber(selectedAccount.account_number)}
                </p>
                <p className="mt-2 text-lg font-bold">
                  {formatCurrency(selectedAccount.balance)}
                </p>
              </div>

              {/* What happens */}
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  What happens when unfrozen:
                </p>
                <div className="space-y-2">
                  {[
                    "All transactions enabled",
                    "Deposits can be received",
                    "Card payments restored",
                    "Full account access",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="size-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnfreezeAccountDialog(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnfreezeAccount}
              disabled={isProcessing}
              className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Unfreezing...
                </div>
              ) : (
                <>
                  <Sun className="mr-2 size-4" />
                  Unfreeze Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Account Card Component
function AccountCard({
  account,
  onFreeze,
  onUnfreeze,
  onClose,
  disabled,
}: {
  account: Account;
  onFreeze?: () => void;
  onUnfreeze?: () => void;
  onClose?: () => void;
  disabled?: boolean;
}) {
  const status = statusConfig[account.status];
  const visuals = cardVisualConfig[account.status];
  // Use Wallet as default icon
  const Icon = Wallet;

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl p-6 shadow-[0_8px_20px_rgba(15,23,42,0.15)] transition-all",
        visuals.textColor,
        visuals.textColorDark,
        !disabled && "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.25)]"
      )}
    >
      {/* Background layers */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-linear-to-br",
          visuals.gradient,
          visuals.gradientDark
        )}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.2), transparent 35%)",
        }}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-linear-to-t",
          visuals.glow
        )}
      />

      <div className="relative flex h-full flex-col gap-6">
        <div>
          {/* Header */}
          <div className={cn(
            "mb-6 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.35em]",
            "text-slate-600 dark:text-white/70"
          )}>
            <span>{status.label} Account</span>
            <div className="flex items-center gap-2 tracking-normal">
              <Icon className={cn("size-4", "text-slate-500 dark:text-white/80")} />
              <span className={cn("text-xs font-medium", "text-slate-500 dark:text-white/80")}>Vault</span>
            </div>
          </div>

          {/* Chip + Account holder */}
          <div className="mb-6 flex items-center gap-4">
            <div className={cn(
              "flex h-12 w-16 items-center justify-center rounded-xl border backdrop-blur",
              "border-slate-300 bg-slate-100/50 dark:border-white/40 dark:bg-white/20"
            )}>
              <div className="flex gap-1">
                <span className={cn(
                  "block h-8 w-3 rounded",
                  "bg-slate-400 dark:bg-white/70"
                )} />
                <span className={cn(
                  "block h-8 w-3 rounded",
                  "bg-slate-300 dark:bg-white/40"
                )} />
              </div>
            </div>
            <div>
              <p className={cn(
                "text-[11px] uppercase tracking-[0.3em]",
                "text-slate-600 dark:text-white/70"
              )}>
                Account
              </p>
              <p className={cn(
                "text-lg font-semibold",
                visuals.textColor,
                visuals.textColorDark
              )}>
                {account.title}
              </p>
            </div>
          </div>

          {/* Account number */}
          <p className={cn(
            "mb-2 font-mono text-lg tracking-[0.4em]",
            "text-slate-700 dark:text-white/90"
          )}>
            {maskAccountNumber(account.account_number)}
          </p>

          {/* Balance */}
          <div>
            <p className={cn(
              "text-[11px] uppercase tracking-[0.4em]",
              "text-slate-600 dark:text-white/60"
            )}>
              Available Balance
            </p>
            <p className={cn(
              "text-3xl font-semibold",
              visuals.textColor,
              visuals.textColorDark
            )}>
              {formatCurrency(account.balance)}
            </p>
          </div>
        </div>

        <div className={cn(
          "mt-auto flex flex-wrap items-end justify-between gap-4 border-t pt-4",
          "border-slate-200 text-slate-700 dark:border-white/20 dark:text-white/80"
        )}>
          <div>
            <p className={cn(
              "text-[11px] uppercase tracking-[0.3em]",
              "text-slate-600 dark:text-white/60"
            )}>
              Opened
            </p>
            <p className={cn(
              "text-sm font-medium",
              visuals.textColor,
              visuals.textColorDark
            )}>
              {formatDate(account.created_at)}
            </p>
          </div>

          {!disabled && (
            <div className="flex flex-1 min-w-[220px] gap-2">
              {account.status === "ACTIVE" && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onFreeze}
                    className="flex-1 rounded-2xl border border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
                  >
                    <Snowflake className="mr-1.5 size-3.5" />
                    Freeze
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClose}
                    className="flex-1 rounded-2xl border border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/15"
                  >
                    <X className="mr-1.5 size-3.5" />
                    Close
                  </Button>
                </>
              )}
              {account.status === "SUSPENDED" && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onUnfreeze}
                    className="flex-1 rounded-2xl border border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/20"
                  >
                    <Sun className="mr-1.5 size-3.5" />
                    Unfreeze
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClose}
                    className="flex-1 rounded-2xl border border-white/20 bg-white/5 text-white hover:border-white/40 hover:bg-white/15"
                  >
                    <X className="mr-1.5 size-3.5" />
                    Close
                  </Button>
                </>
              )}
            </div>
          )}

          {account.status === "CLOSED" && account.closed_at && (
            <p className="text-xs text-white/80">
              Closed on {formatDate(account.closed_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
