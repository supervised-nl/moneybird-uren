"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="h-5 w-5" />
              <span className="font-semibold text-gray-100 text-sm">
                Supervised Admin
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/"
                    ? "text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-gray-100 font-medium"
                }`}
              >
                Uren loggen
              </Link>
              <Link
                href="/week"
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/week"
                    ? "text-blue-400 font-semibold"
                    : "text-gray-400 hover:text-gray-100 font-medium"
                }`}
              >
                Weekoverzicht
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-md text-gray-400 hover:text-gray-100 hover:bg-gray-800 transition-colors"
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
