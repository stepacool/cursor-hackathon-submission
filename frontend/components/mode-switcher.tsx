"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function ModeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      className="size-9 rounded-xl px-0 text-muted-foreground hover:text-foreground"
      onClick={toggleTheme}
      variant="ghost"
    >
      <SunIcon className="hidden size-4 [html.dark_&]:block" />
      <MoonIcon className="hidden size-4 [html.light_&]:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
