"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Snowflake,
  Sun,
  Check,
  AlertTriangle,
  Shield,
  TrendingUp,
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

// Account types
type AccountStatus = "active" | "frozen" | "closed";

interface Account {
  id: string;
  name: string;
  number: string;
  balance: number;
  type: AccountType;
  status: AccountStatus;
  createdAt: string;
  frozenAt?: string;
  closedAt?: string;
}

// Mock accounts data
const initialAccounts: Account[] = [
  {
    id: "acc-1",
    name: "Main Checking",
    number: "4532-8761-7677-8545",
    balance: 12458.32,
    type: "checking",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "acc-2",
    name: "Emergency Savings",
    number: "4532-8761-2345-6789",
    balance: 45230.15,
    type: "savings",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "acc-3",
    name: "Business Account",
    number: "4532-8761-9876-5432",
    balance: 8750.0,
    type: "business",
    status: "frozen",
    createdAt: "2024-03-10",
    frozenAt: "2024-11-15",
  },
];

const statusConfig = {
  active: {
    label: "Active",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
  },
  frozen: {
    label: "Frozen",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    dotColor: "bg-sky-500",
  },
  closed: {
    label: "Closed",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dotColor: "bg-rose-500",
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const maskAccountNumber = (number: string) => {
  return `•••• ${number.slice(-4)}`;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Dialog states
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [closeAccountDialog, setCloseAccountDialog] = useState(false);
  const [freezeAccountDialog, setFreezeAccountDialog] = useState(false);
  const [unfreezeAccountDialog, setUnfreezeAccountDialog] = useState(false);

  // Form states
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Handle new account creation
  const handleAccountCreated = (newAccount: {
    name: string;
    type: AccountType;
    initialDeposit: number;
    accountNumber: string;
  }) => {
    const account: Account = {
      id: `acc-${Date.now()}`,
      name: newAccount.name,
      number: newAccount.accountNumber,
      balance: newAccount.initialDeposit,
      type: newAccount.type,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAccounts((prev) => [...prev, account]);
  };

  // Close Account Handler
  const handleCloseAccount = () => {
    if (!selectedAccount || confirmText !== "CLOSE") return;

    setIsProcessing(true);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedAccount.id
            ? {
                ...acc,
                status: "closed" as AccountStatus,
                closedAt: new Date().toISOString().split("T")[0],
              }
            : acc
        )
      );
      const updatedAccount = {
        ...selectedAccount,
        status: "closed" as AccountStatus,
      };
      setCloseAccountDialog(false);
      setConfirmText("");
      setIsProcessing(false);
      setSelectedAccount(null);
    }, 1500);
  };

  // Freeze Account Handler
  const handleFreezeAccount = () => {
    if (!selectedAccount) return;

    setIsProcessing(true);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedAccount.id
            ? {
                ...acc,
                status: "frozen" as AccountStatus,
                frozenAt: new Date().toISOString().split("T")[0],
              }
            : acc
        )
      );
      const updatedAccount = {
        ...selectedAccount,
        status: "frozen" as AccountStatus,
      };
      setFreezeAccountDialog(false);
      setIsProcessing(false);
      setSelectedAccount(null);
    }, 1500);
  };

  // Unfreeze Account Handler
  const handleUnfreezeAccount = () => {
    if (!selectedAccount) return;

    setIsProcessing(true);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === selectedAccount.id
            ? {
                ...acc,
                status: "active" as AccountStatus,
                frozenAt: undefined,
              }
            : acc
        )
      );
      const updatedAccount = {
        ...selectedAccount,
        status: "active" as AccountStatus,
      };
      setUnfreezeAccountDialog(false);
      setIsProcessing(false);
      setSelectedAccount(null);
    }, 1500);
  };

  const activeAccounts = accounts.filter((a) => a.status === "active");
  const frozenAccounts = accounts.filter((a) => a.status === "frozen");
  const closedAccounts = accounts.filter((a) => a.status === "closed");

  const totalBalance = accounts
    .filter((a) => a.status !== "closed")
    .reduce((sum, a) => sum + a.balance, 0);

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
          onClick={() => setOpenAccountDialog(true)}
          className="rounded-xl bg-linear-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700"
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
                <p className="font-semibold">{selectedAccount.name}</p>
                <p className="text-sm text-muted-foreground">
                  {maskAccountNumber(selectedAccount.number)}
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
                <p className="font-semibold">{selectedAccount.name}</p>
                <p className="text-sm text-muted-foreground">
                  {maskAccountNumber(selectedAccount.number)}
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
                      statusConfig.frozen.color
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        statusConfig.frozen.dotColor
                      )}
                    />
                    Frozen
                  </span>
                  {selectedAccount.frozenAt && (
                    <span className="text-xs text-muted-foreground">
                      since {selectedAccount.frozenAt}
                    </span>
                  )}
                </div>
                <p className="font-semibold">{selectedAccount.name}</p>
                <p className="text-sm text-muted-foreground">
                  {maskAccountNumber(selectedAccount.number)}
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
  const config = accountTypeConfig[account.type];
  const status = statusConfig[account.status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all",
        disabled ? "opacity-60" : "hover:border-foreground/20 hover:shadow-lg"
      )}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          "absolute -right-10 -top-10 size-32 rounded-full bg-linear-to-br opacity-10 blur-2xl transition-opacity",
          config.gradient,
          !disabled && "group-hover:opacity-20"
        )}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl bg-linear-to-br",
              config.gradient
            )}
          >
            <Icon className="size-6 text-white" />
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              status.color
            )}
          >
            <span className={cn("size-1.5 rounded-full", status.dotColor)} />
            {status.label}
          </span>
        </div>

        {/* Account Info */}
        <div className="mb-4">
          <p className="font-semibold">{account.name}</p>
          <p className="text-sm text-muted-foreground">
            {maskAccountNumber(account.number)}
          </p>
        </div>

        {/* Balance */}
        <div className="mb-4">
          <p className="text-2xl font-bold">
            {formatCurrency(account.balance)}
          </p>
          <p className="text-xs text-muted-foreground">
            Opened {account.createdAt}
          </p>
        </div>

        {/* Actions */}
        {!disabled && (
          <div className="flex gap-2">
            {account.status === "active" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFreeze}
                  className="flex-1 rounded-xl text-sky-600 hover:bg-sky-500/10 hover:text-sky-600"
                >
                  <Snowflake className="mr-1.5 size-3.5" />
                  Freeze
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="flex-1 rounded-xl text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                >
                  <X className="mr-1.5 size-3.5" />
                  Close
                </Button>
              </>
            )}
            {account.status === "frozen" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUnfreeze}
                  className="flex-1 rounded-xl text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
                >
                  <Sun className="mr-1.5 size-3.5" />
                  Unfreeze
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="flex-1 rounded-xl text-rose-600 hover:bg-rose-500/10 hover:text-rose-600"
                >
                  <X className="mr-1.5 size-3.5" />
                  Close
                </Button>
              </>
            )}
          </div>
        )}

        {/* Closed info */}
        {account.status === "closed" && account.closedAt && (
          <p className="text-xs text-muted-foreground">
            Closed on {account.closedAt}
          </p>
        )}
      </div>
    </div>
  );
}

