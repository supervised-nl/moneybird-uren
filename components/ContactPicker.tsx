"use client";

import { useContacts } from "@/hooks/useContacts";
import { contactDisplayName } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

export default function ContactPicker({ value, onChange, disabled }: Props) {
  const { contacts, loading } = useContacts();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = contacts.find((c) => c.id === value);
  const label = selected ? contactDisplayName(selected) : "";

  const filtered = query
    ? contacts.filter((c) =>
        contactDisplayName(c).toLowerCase().includes(query.toLowerCase())
      )
    : contacts;

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
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={label ? "text-slate-900" : "text-slate-400"}>
          {loading ? "Laden..." : label || "Selecteer klant..."}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-md border border-slate-200 shadow-lg max-h-60 overflow-auto">
          <div className="sticky top-0 bg-white border-b border-slate-100 px-3 py-2">
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek klant..."
                className="w-full text-sm outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
          {value && (
            <div
              className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
            >
              — Geen klant —
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-sm text-slate-400 text-center">
              Geen resultaten
            </div>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                role="option"
                aria-selected={c.id === value}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  c.id === value
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                }`}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {contactDisplayName(c)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
