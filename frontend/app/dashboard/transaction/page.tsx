"use client";

import { useState } from "react";
import { ArrowLeftRight, Send, User, DollarSign, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionPage() {
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientAccount: "",
    amount: "",
    note: "",
    fromAccount: "checking",
  });

  const accountBalances = {
    checking: 12458.32,
    savings: 45230.15,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirm");
  };

  const handleConfirm = () => {
    // In real app, this would call an API
    setTimeout(() => {
      setStep("success");
    }, 1000);
  };

  const handleReset = () => {
    setFormData({
      recipientName: "",
      recipientAccount: "",
      amount: "",
      note: "",
      fromAccount: "checking",
    });
    setStep("form");
  };

  const selectedBalance = accountBalances[formData.fromAccount as keyof typeof accountBalances];
  const transferAmount = parseFloat(formData.amount) || 0;
  const isValidAmount = transferAmount > 0 && transferAmount <= selectedBalance;

  return (
    <div className="flex h-full flex-col">

      {/* Content */}
      <div className="border-t border-border bg-card/50 px-6 py-8">
        <div className="mx-auto max-w-xl">
          {step === "form" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="size-5" />
                  New Transfer
                </CardTitle>
                <CardDescription>Enter the transfer details below</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* From Account */}
                  <div className="space-y-2">
                    <Label>From Account</Label>
                    <Select
                      value={formData.fromAccount}
                      onValueChange={(value) => setFormData({ ...formData, fromAccount: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">
                          Checking (•••• 4532) - {formatCurrency(accountBalances.checking)}
                        </SelectItem>
                        <SelectItem value="savings">
                          Savings (•••• 7891) - {formatCurrency(accountBalances.savings)}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Recipient Name */}
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">
                      <span className="flex items-center gap-2">
                        <User className="size-4" />
                        Recipient Name
                      </span>
                    </Label>
                    <Input
                      id="recipientName"
                      placeholder="John Smith"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      required
                    />
                  </div>

                  {/* Recipient Account */}
                  <div className="space-y-2">
                    <Label htmlFor="recipientAccount">Account Number</Label>
                    <Input
                      id="recipientAccount"
                      placeholder="Enter account number"
                      value={formData.recipientAccount}
                      onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })}
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      <span className="flex items-center gap-2">
                        <DollarSign className="size-4" />
                        Amount
                      </span>
                    </Label>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={selectedBalance}
                        placeholder="0.00"
                        className="pl-7"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                    {formData.amount && !isValidAmount && (
                      <p className="flex items-center gap-1 text-sm text-red-500">
                        <AlertCircle className="size-4" />
                        Insufficient funds or invalid amount
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Available balance: {formatCurrency(selectedBalance)}
                    </p>
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <Label htmlFor="note">
                      <span className="flex items-center gap-2">
                        <FileText className="size-4" />
                        Note (Optional)
                      </span>
                    </Label>
                    <Input
                      id="note"
                      placeholder="Add a note for this transfer"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!formData.recipientName || !formData.recipientAccount || !isValidAmount}
                  >
                    Continue
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === "confirm" && (
            <Card>
              <CardHeader>
                <CardTitle>Confirm Transfer</CardTitle>
                <CardDescription>Please review the transfer details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium">
                      {formData.fromAccount === "checking" ? "Checking (•••• 4532)" : "Savings (•••• 7891)"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium">{formData.recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account</span>
                    <span className="font-medium">•••• {formData.recipientAccount.slice(-4)}</span>
                  </div>
                  {formData.note && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note</span>
                      <span className="font-medium">{formData.note}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="font-semibold">Amount</span>
                      <span className="font-bold text-xl">{formatCurrency(transferAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={handleConfirm}>
                    Confirm & Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "success" && (
            <Card>
              <CardContent className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="size-8 text-emerald-500" />
                </div>
                <h2 className="mb-2 font-semibold text-2xl">Transfer Successful!</h2>
                <p className="mb-2 text-muted-foreground">
                  {formatCurrency(transferAmount)} has been sent to {formData.recipientName}
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  Transaction ID: TXN-{Date.now().toString().slice(-8)}
                </p>
                <Button onClick={handleReset} className="gap-2">
                  <Send className="size-4" />
                  Make Another Transfer
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
