"use client";

import { Project } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

let cache: Project[] | null = null;
let fetchPromise: Promise<Project[]> | null = null;

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (cache) {
      setProjects(cache);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch("/api/moneybird/projects")
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json() as Promise<Project[]>;
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
          setProjects(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setError("Kon projecten niet laden: " + err.message);
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
    fetch("/api/moneybird/projects")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Project[]>;
      })
      .then((data) => {
        cache = data;
        if (mounted.current) {
          setProjects(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted.current) {
          setError("Kon projecten niet laden: " + err.message);
          setLoading(false);
        }
      });
  }

  return { projects, loading, error, refresh };
}
