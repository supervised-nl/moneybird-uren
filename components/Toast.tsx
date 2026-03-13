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
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-slide-up flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 text-slate-400 hover:text-white transition-colors"
        aria-label="Sluiten"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
