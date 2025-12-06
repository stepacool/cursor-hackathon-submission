"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

const COUNTRY_CODES = [
  { code: "+60", country: "Malaysia", flag: "https://flagcdn.com/w40/my.png" },
  { code: "+86", country: "China", flag: "https://flagcdn.com/w40/cn.png" },
  { code: "+1", country: "United States", flag: "https://flagcdn.com/w40/us.png" },
  { code: "+44", country: "United Kingdom", flag: "https://flagcdn.com/w40/gb.png" },
  { code: "+65", country: "Singapore", flag: "https://flagcdn.com/w40/sg.png" },
];

const PHONE_REGEX: Record<string, RegExp> = {
  "+60": /^1\d{8,9}$/, // Malaysia: 9-10 digits, starts with 1
  "+86": /^1[3-9]\d{9}$/, // China: 11 digits, starts with 1
  "+1": /^[2-9]\d{9}$/, // US: 10 digits
  "+44": /^7\d{9}$/, // UK: 10 digits, starts with 7 (mobile)
  "+65": /^[89]\d{7}$/, // Singapore: 8 digits, starts with 8 or 9
};

const onboardingSchema = z.object({
  countryCode: z.enum(
    COUNTRY_CODES.map((c) => c.code) as [string, ...string[]],
    {
      message: "Select a country code",
    }
  ),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^[0-9+\-\s]+$/, "Only numbers, plus, dashes, or spaces are allowed"),
  accountTitle: z
    .string()
    .trim()
    .min(1, "Account title is required")
    .max(100, "Account title must be less than 100 characters"),
  balance: z
    .string()
    .min(1, "Starting balance is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Starting balance must be a valid number",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Balance must be at least 0",
    }),
}).superRefine((data, ctx) => {
  const { countryCode, phone } = data;
  const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digits

  if (!phone) return;

  const regex = PHONE_REGEX[countryCode];
  if (regex && !regex.test(cleanPhone)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid phone number format for the selected country",
      path: ["phone"],
    });
  }
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      countryCode: "+60",
      phone: "",
      accountTitle: "",
      balance: "",
    },
  });

  // Fetch onboarding status from the server
  useEffect(() => {
    if (!userId) return;

    const checkOnboardingStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/onboarding");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const isCompleted = result.data?.isOnboardingCompleted ?? false;
            setOpen(!isCompleted);
          } else {
            // If there's an error, assume onboarding is not completed
            setOpen(true);
          }
        } else {
          setOpen(true);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        setOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [userId]);

  const onSubmit = async (values: OnboardingFormValues) => {
    try {
      setIsSubmitting(true);
      // Format phone number: remove all non-digits, combine country code and phone
      const cleanCountryCode = values.countryCode.replace(/\D/g, ""); // Remove + and other non-digits
      const cleanPhone = values.phone.replace(/\D/g, ""); // Remove all non-digits
      const formattedPhone = `${cleanCountryCode}${cleanPhone}`;

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          accountTitle: values.accountTitle,
          initialBalance: Number(values.balance),
          currency: "MYR",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.error || "Failed to complete onboarding");
        return;
      }

      toast.success("Welcome! Your account has been set up successfully.");
      setOpen(false);
      
      // Refresh the page to update the session
      window.location.reload();
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render the dialog until we've checked the onboarding status
  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => {
      // Prevent closing the dialog
    }}>
    <DialogContent
      className="sm:max-w-[500px] p-6"
        onInteractOutside={(e) => {
          // Prevent closing on outside click
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing on escape key
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Welcome! Let&apos;s finish your setup</DialogTitle>
          <DialogDescription>
            Please provide your account details to complete your setup. All fields are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="accountTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Account title <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., My Main Account"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Country code <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_CODES.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            <div className="flex items-center gap-2">
                              <img
                                alt={item.country}
                                src={item.flag}
                                className="h-4 w-6 rounded object-cover"
                              />
                              <span>{item.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Phone number <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1890000000"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Starting balance (MYR) <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="1000"
                      disabled={isSubmitting}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Setting up..." : "Complete setup"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
