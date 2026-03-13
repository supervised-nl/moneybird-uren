"use client";

import { CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-950 text-white text-sm font-medium px-5 py-3 shadow-md flex items-center gap-2.5 animate-slide-up">
      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 text-gray-400 hover:text-white transition-colors"
        aria-label="Sluiten"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
