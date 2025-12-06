import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Feature() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="grid border rounded-lg container p-8 grid-cols-1 gap-8 items-center lg:grid-cols-2">
          <div className="flex gap-10 flex-col">
            <div className="flex gap-4 flex-col">
              <div>
                <Badge variant="outline">Platform</Badge>
              </div>
              <div className="flex gap-2 flex-col">
                <h2 className="text-3xl lg:text-5xl tracking-tighter max-w-xl text-left font-regular">
                  Banking Made Simple
                </h2>
                <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left">
                  Experience modern digital banking with secure, instant transactions and real-time account management.
                </p>
              </div>
            </div>
            <div className="grid lg:pl-6 grid-cols-1 sm:grid-cols-3 items-start lg:grid-cols-1 gap-6">
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Easy to use</p>
                  <p className="text-muted-foreground text-sm">
                    Intuitive interface designed for seamless banking experience.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Fast and reliable</p>
                  <p className="text-muted-foreground text-sm">
                    Instant transactions with 99.9% uptime guarantee.
                  </p>
                </div>
              </div>
              <div className="flex flex-row gap-6 items-start">
                <Check className="w-4 h-4 mt-2 text-primary" />
                <div className="flex flex-col gap-1">
                  <p>Secure by design</p>
                  <p className="text-muted-foreground text-sm">
                    Bank-grade security with multi-factor authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-muted rounded-md aspect-square overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=800&fit=crop&crop=center"
              alt="Modern banking interface"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };

