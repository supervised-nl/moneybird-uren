"use client";

import { Contact } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

let cache: Contact[] | null = null;
let fetchPromise: Promise<Contact[]> | null = null;

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cache) {
      setContacts(cache);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch("/api/moneybird/contacts")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<Contact[]>;
        })
        .then((data) => {
          cache = data;
          return data;
        })
        .catch((err) => {
          fetchPromise = null;
          throw err;
        });
    }

    fetchPromise
      .then((data) => {
        if (mounted.current) {
          setContacts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setError("Kon contacten niet laden: " + err.message);
          setLoading(false);
        }
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  function refresh() {
    cache = null;
    fetchPromise = null;
    setLoading(true);
    setError(null);
    fetch("/api/moneybird/contacts")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Contact[]>;
      })
      .then((data) => {
        cache = data;
        if (mounted.current) {
          setContacts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setError("Kon contacten niet laden: " + err.message);
          setLoading(false);
        }
      });
  }

  return { contacts, loading, error, refresh };
}
