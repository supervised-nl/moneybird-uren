"use client";

import { useProjects } from "@/hooks/useProjects";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export default function ProjectPicker({ value, onChange, disabled }: Props) {
  const { projects, loading } = useProjects();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const activeProjects = projects.filter((p) => p.state === "active");
  const selected = projects.find((p) => p.id === value);

  const filtered = query
    ? activeProjects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
    : activeProjects;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-950 text-left flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-gray-950 dark:text-gray-100" : "text-gray-400"}>
          {loading ? "Laden..." : selected ? selected.name : "Selecteer project..."}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white rounded-xl border border-gray-200 shadow-lg max-h-60 overflow-auto dark:bg-gray-900 dark:border-gray-700">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-3 py-2">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek project..."
                className="w-full text-sm outline-none text-gray-950 placeholder:text-gray-400 dark:text-gray-100 dark:bg-gray-900"
              />
            </div>
          </div>
          {value && (
            <div
              className="px-3.5 py-2.5 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer border-b border-gray-100 dark:hover:bg-gray-800 dark:border-gray-800"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
            >
              — Geen project —
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="px-3.5 py-4 text-sm text-gray-400 text-center">
              Geen actieve projecten
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                role="option"
                aria-selected={p.id === value}
                className={`px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                  p.id === value
                    ? "bg-sky-50 text-sky-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {p.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
