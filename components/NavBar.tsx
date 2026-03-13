"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-brand-500">
              <Clock className="h-5 w-5" />
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Moneybird Uren
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/"
                    ? "text-brand-600 bg-brand-50 dark:bg-brand-900/30"
                    : "text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                }`}
              >
                Uren loggen
              </Link>
              <Link
                href="/week"
                className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/week"
                    ? "text-brand-600 bg-brand-50 dark:bg-brand-900/30"
                    : "text-slate-600 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
                }`}
              >
                Weekoverzicht
              </Link>
            </div>
          </div>
          <button
            onClick={toggleDark}
            className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
}
