import { Phone, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PhoneNumbersPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6">
      {/* Icon */}
      <div className="mb-6 flex size-24 items-center justify-center rounded-2xl border border-border bg-card">
        <Phone className="size-12 text-muted-foreground" />
      </div>

      {/* Title */}
      <h1 className="mb-3 font-semibold text-3xl">Phone Numbers</h1>

      {/* Description */}
      <p className="mb-2 max-w-md text-center text-muted-foreground">
        Assistants are able to be connected to phone numbers for calls.
      </p>
      <p className="mb-8 max-w-lg text-center text-muted-foreground text-sm">
        You can import from Twilio, Vonage, or create a free number directly from Vapi for use with your assistants.
      </p>

      {/* CTA Button */}
      <Button size="lg" className="mb-6 gap-2">
        <Plus className="size-4" />
        Create Phone Number
      </Button>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search Phone Numbers" className="h-11 pl-10" />
      </div>
    </div>
  );
}
