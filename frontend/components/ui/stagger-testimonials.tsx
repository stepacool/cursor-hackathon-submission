"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const SQRT_5000 = Math.sqrt(5000);

const testimonials = [
  {
    tempId: 0,
    testimonial: "Finally, a bank that doesn't feel like a bank. The app is so smooth I actually enjoy checking my balance!",
    by: "Sarah, Freelance Designer",
    imgSrc: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 1,
    testimonial: "Setting up my business account took 5 minutes. 5 MINUTES! My old bank needed 3 in-person visits.",
    by: "Michael, Startup Founder",
    imgSrc: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 2,
    testimonial: "The virtual cards feature is a lifesaver for online subscriptions. I feel so much safer shopping online now.",
    by: "Elena, Digital Nomad",
    imgSrc: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 3,
    testimonial: "I love how easy it is to split bills with friends. No more awkward math at the dinner table!",
    by: "David, Software Engineer",
    imgSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 4,
    testimonial: "Customer support that actually responds? In seconds? I thought this was a myth until I joined.",
    by: "Jessica, Small Business Owner",
    imgSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 5,
    testimonial: "The international transfer fees are basically non-existent. I'm saving hundreds every month on vendor payments.",
    by: "Tom, E-commerce Manager",
    imgSrc: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 6,
    testimonial: "Instant notifications for every transaction give me such peace of mind. I know exactly what's happening with my money.",
    by: "Rachel, Marketing Director",
    imgSrc: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 7,
    testimonial: "The budgeting tools are incredible. I actually saved enough for a vacation just by following the auto-suggestions.",
    by: "Chris, Teacher",
    imgSrc: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 8,
    testimonial: "Switched my entire team to this platform. Payroll used to take me hours, now it's just a few clicks.",
    by: "Amanda, Operations Lead",
    imgSrc: "https://images.unsplash.com/photo-1521579971123-1192931a1452?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 9,
    testimonial: "Simple, transparent, and fast. Exactly what banking should be in 2024. Love it.",
    by: "James, Architect",
    imgSrc: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 10,
    testimonial: "I was skeptical about a digital-only bank, but the security features are better than my traditional bank.",
    by: "Robert, Cyber Security Analyst",
    imgSrc: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=150&q=80"
  },
  {
    tempId: 11,
    testimonial: "The rewards program is actually useful. Cash back on things I actually buy? Yes please!",
    by: "Linda, Nurse",
    imgSrc: "https://images.unsplash.com/photo-1445053023192-8d45cb66099d?auto=format&fit=crop&w=150&q=80"
  },
] as const;

interface TestimonialCardProps {
  position: number;
  testimonial: (typeof testimonials)[number];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  position,
  testimonial,
  handleMove,
  cardSize
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter
          ? "z-10 bg-secondary text-secondary-foreground border-primary shadow-xl"
          : "z-0 bg-muted/80 text-muted-foreground border-transparent hover:border-primary/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: "polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)",
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px hsl(var(--border))" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />
      <img
        src={testimonial.imgSrc}
        alt={`${testimonial.by.split(",")[0]}`}
        className="mb-4 h-14 w-12 bg-muted object-cover object-top"
        style={{
          boxShadow: "3px 3px 0px hsl(var(--background))"
        }}
      />
      <h3
        className={cn(
          "text-base font-medium sm:text-xl",
          isCenter ? "text-secondary-foreground" : "text-muted-foreground"
        )}
      >
        "{testimonial.testimonial}"
      </h3>
      <p
        className={cn(
          "absolute bottom-8 left-8 right-8 mt-2 text-sm italic",
          isCenter ? "text-secondary-foreground/80" : "text-muted-foreground/80"
        )}
      >
        - {testimonial.by}
      </p>
    </div>
  );
};

const StaggerTestimonialsComponent: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState<(typeof testimonials)[number][]>([...testimonials]);

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i -= 1) {
        const item = newList.shift();
        if (!item) return;
        newList.push(item);
      }
    } else {
      for (let i = steps; i < 0; i += 1) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift(item);
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-muted/30">
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export const StaggerTestimonials = React.memo(StaggerTestimonialsComponent);
