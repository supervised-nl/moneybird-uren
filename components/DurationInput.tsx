"use client";

import { Clock } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onApply: (durationStr: string) => void;
  disabled?: boolean;
}

const QUICK_DURATIONS = ["1u", "2u", "4u", "8u"];

export default function DurationInput({ value, onChange, onApply, disabled }: Props) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value) onApply(value);
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => value && onApply(value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="bijv. 2.5 of 2:30"
          className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:opacity-50"
        />
      </div>
      <div className="flex gap-2 flex-wrap">
        {QUICK_DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(d);
              onApply(d);
            }}
            className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
