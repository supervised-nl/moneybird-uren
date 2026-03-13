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
        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => value && onApply(value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="bijv. 2.5 of 2:30"
          className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all disabled:opacity-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
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
            className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-200 transition-all cursor-pointer disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:hover:border-gray-600"
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}
