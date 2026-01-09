"use client";

import { useCallback } from "react";
import {
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { usePolling } from "@/lib/use-polling";
import { cn } from "@/lib/utils";
import type { OTP, OTPsResponse } from "@/types/otp";

function getStatusIcon(status: OTP["status"]) {
  switch (status) {
    case "PENDING":
      return <Clock className="size-4 text-amber-500" />;
    case "USED":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "EXPIRED":
      return <XCircle className="size-4 text-red-500" />;
    default:
      return <AlertCircle className="size-4 text-muted-foreground" />;
  }
}

function getStatusBadgeClass(status: OTP["status"]) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "USED":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    case "EXPIRED":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffMs = expiry.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const remainingSecs = diffSecs % 60;

  if (diffMins > 0) {
    return `${diffMins}m ${remainingSecs}s`;
  }
  return `${remainingSecs}s`;
}

function OTPCard({ otp }: { otp: OTP }) {
  const isPending = otp.status === "PENDING" && !isExpired(otp.expires_at);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        isPending
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border/50 bg-card/50"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              isPending ? "bg-amber-500/10" : "bg-muted/50"
            )}
          >
            <Shield
              className={cn(
                "size-5",
                isPending ? "text-amber-500" : "text-muted-foreground"
              )}
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "font-mono text-lg font-bold tracking-widest",
                  isPending ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {otp.token}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                  getStatusBadgeClass(otp.status)
                )}
              >
                {getStatusIcon(otp.status)}
                {otp.status}
              </span>
            </div>
            {otp.transaction_description && (
              <p className="text-sm text-muted-foreground">
                {otp.transaction_description}
              </p>
            )}
            {otp.transaction_amount && (
              <div className="flex items-center gap-2 text-sm">
                <ArrowRightLeft className="size-3 text-muted-foreground" />
                <span className="font-medium">
                  RM {Number.parseFloat(otp.transaction_amount).toLocaleString()}
                </span>
                {otp.from_account_title && otp.to_account_title && (
                  <span className="text-muted-foreground">
                    {otp.from_account_title} → {otp.to_account_title}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">
            {formatDate(otp.created_at)}
          </p>
          {isPending && (
            <p className="mt-1 text-xs font-medium text-amber-500">
              Expires in {getTimeRemaining(otp.expires_at)}
            </p>
          )}
          {otp.used_at && (
            <p className="mt-1 text-xs text-emerald-500">
              Used {formatDate(otp.used_at)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OTPsPage() {
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  const fetchOTPs = useCallback(async (): Promise<OTP[]> => {
    const response = await fetch("/api/otps");
    const data: OTPsResponse = await response.json();

    if (data.success && data.data) {
      return data.data;
    }
    return [];
  }, []);

  const { data: otps, error } = usePolling<OTP[]>({
    fetchFn: fetchOTPs,
    interval: 3000,
    enabled: Boolean(userId),
  });

  const pendingOTPs = otps?.filter(
    (otp) => otp.status === "PENDING" && !isExpired(otp.expires_at)
  );
  const historyOTPs = otps?.filter(
    (otp) => otp.status !== "PENDING" || isExpired(otp.expires_at)
  );

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">One-Time Passwords</h1>
        <p className="text-muted-foreground">
          View and manage your transaction OTPs
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-500">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5" />
            <span>Failed to load OTPs. Please try again.</span>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-6 overflow-y-auto">
        {/* Active OTPs */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="size-4 text-amber-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Active OTPs
            </h2>
            {pendingOTPs && pendingOTPs.length > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-500">
                {pendingOTPs.length}
              </span>
            )}
          </div>
          {!otps ? (
            <div className="flex items-center justify-center rounded-xl border border-border/50 bg-card/50 p-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingOTPs && pendingOTPs.length > 0 ? (
            <div className="space-y-3">
              {pendingOTPs.map((otp) => (
                <OTPCard key={otp.id} otp={otp} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
              <Shield className="mx-auto mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No active OTPs at the moment
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                OTPs are generated when you request a money transfer
              </p>
            </div>
          )}
        </section>

        {/* OTP History */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              History
            </h2>
          </div>
          {historyOTPs && historyOTPs.length > 0 ? (
            <div className="space-y-3">
              {historyOTPs.map((otp) => (
                <OTPCard key={otp.id} otp={otp} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">No OTP history yet</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
