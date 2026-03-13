"use client";

import { TimeEntry } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useTimeEntries(filter?: string) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = filter ? `?filter=${encodeURIComponent(filter)}` : "";
      const res = await fetch(`/api/moneybird/time-entries${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as TimeEntry[];
      if (mounted.current) {
        setEntries(data);
      }
    } catch (err) {
      if (mounted.current) {
        setError("Kon urenregistraties niet laden: " + (err as Error).message);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    mounted.current = true;
    fetchEntries();
    return () => {
      mounted.current = false;
    };
  }, [fetchEntries]);

  return { entries, loading, error, refresh: fetchEntries };
}
