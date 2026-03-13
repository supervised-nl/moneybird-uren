"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function NavBar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
    } else {
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
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-5 w-5" />
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Moneybird Uren
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/"
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-600 hover:text-gray-900 font-medium dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                Uren loggen
              </Link>
              <Link
                href="/week"
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/week"
                    ? "text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-600 hover:text-gray-900 font-medium dark:text-gray-400 dark:hover:text-gray-100"
                }`}
              >
                Weekoverzicht
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Uitloggen"
              title="Uitloggen"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
