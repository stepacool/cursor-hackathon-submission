"use client";

import { StaggerTestimonials } from "@/components/ui/stagger-testimonials";
import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";

const DemoOne = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <StaggerTestimonials />
    </div>
  );
};

const TypewriterEffectSmoothDemo = () => {
  const words = [
    { text: "Build" },
    { text: "awesome" },
    { text: "apps" },
    { text: "with" },
    { text: "Banster", className: "text-primary" }
  ];

  return (
    <div className="flex h-[40rem] flex-col items-center justify-center space-y-6">
      <p className="text-xs text-neutral-600 dark:text-neutral-200 sm:text-base">
        The road to financial freedom starts here
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <button className="h-10 w-40 rounded-xl border border-transparent bg-black text-sm text-white dark:border-white">
          Join now
        </button>
        <button className="h-10 w-40 rounded-xl border border-black bg-white text-sm text-black">
          Signup
        </button>
      </div>
    </div>
  );
};

export { DemoOne, TypewriterEffectSmoothDemo };
