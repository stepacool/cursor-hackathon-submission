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
import {
  buildNamespacedKey,
  readNamespacedItem,
  STORAGE_KEYS,
  writeNamespacedItem,
} from "@/lib/local-storage";

const COUNTRY_CODES = [
  { code: "+60", country: "Malaysia", flag: "https://flagcdn.com/w40/my.png" },
  { code: "+86", country: "China", flag: "https://flagcdn.com/w40/cn.png" },
  { code: "+1", country: "United States", flag: "https://flagcdn.com/w40/us.png" },
  { code: "+44", country: "United Kingdom", flag: "https://flagcdn.com/w40/gb.png" },
  { code: "+65", country: "Singapore", flag: "https://flagcdn.com/w40/sg.png" },
];

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
    .min(8, "Please enter a valid phone number")
    .regex(/^[0-9+\-\s]+$/, "Only numbers, plus, dashes, or spaces are allowed"),
  balance: z.coerce
    .number({
      message: "Balance must be a number",
    })
    .min(0, "Balance must be at least 0"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export function OnboardingDialog() {
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();
  const userId = session.data?.user?.id;

  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      countryCode: "+60",
      phone: "",
      balance: 0,
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = readNamespacedItem(STORAGE_KEYS.onboarding, userId);
    if (!saved) {
      setOpen(true);
      return;
    }
    try {
      const parsed = JSON.parse(saved.value) as Partial<OnboardingFormValues>;
      form.reset({
        countryCode: parsed.countryCode || "+60",
        phone: parsed.phone || "",
        balance: parsed.balance ?? 0,
      });
      setOpen(false);

      const targetKey = buildNamespacedKey(STORAGE_KEYS.onboarding, userId);
      if (saved.key !== targetKey) {
        writeNamespacedItem(STORAGE_KEYS.onboarding, saved.value, userId);
      }
    } catch (error) {
      console.error("Failed to parse onboarding profile", error);
      setOpen(true);
    }
  }, [form, userId]);

  const onSubmit = (values: OnboardingFormValues) => {
    const combinedPhone = `${values.countryCode} ${values.phone}`.trim();
    const payload = {
      countryCode: values.countryCode,
      phone: combinedPhone,
      balance: values.balance,
      savedAt: new Date().toISOString(),
    };
    writeNamespacedItem(
      STORAGE_KEYS.onboarding,
      JSON.stringify(payload),
      userId
    );
    writeNamespacedItem(STORAGE_KEYS.securityPhone, combinedPhone, userId);
    writeNamespacedItem(
      STORAGE_KEYS.balanceAmount,
      String(values.balance),
      userId
    );
    toast.success("Saved. Security phone and balance updated locally.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome! Let&apos;s finish your setup</DialogTitle>
          <DialogDescription>
            Add a contact number and starting balance.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country code</FormLabel>
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
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="138 0000 0000" {...field} />
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
                  <FormLabel>Starting balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="1000"
                      {...field}
                      value={(field.value as number | string) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Remind me later
              </Button>
              <Button type="submit">Save info</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
