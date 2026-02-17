"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "ytcurious-theme";

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const resolved = mode === "system" ? resolveSystemTheme() : mode;
  if (resolved === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system";
    setMode(stored);
    applyTheme(stored);
  }, []);

  useEffect(() => {
    if (mode === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => applyTheme("system");
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    return;
  }, [mode]);

  const setTheme = (next: ThemeMode) => {
    setMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-black/10 bg-white/80 p-1 text-xs shadow-sm dark:border-white/15 dark:bg-[#1b2128]">
      <button className={`rounded px-2 py-1 ${mode === "light" ? "bg-black text-white dark:bg-white dark:text-black" : ""}`} onClick={() => setTheme("light")}>
        Light
      </button>
      <button className={`rounded px-2 py-1 ${mode === "dark" ? "bg-black text-white dark:bg-white dark:text-black" : ""}`} onClick={() => setTheme("dark")}>
        Dark
      </button>
      <button className={`rounded px-2 py-1 ${mode === "system" ? "bg-black text-white dark:bg-white dark:text-black" : ""}`} onClick={() => setTheme("system")}>
        System
      </button>
    </div>
  );
}
