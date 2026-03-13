"use client";

import ContactPicker from "@/components/ContactPicker";
import DurationInput from "@/components/DurationInput";
import ProjectPicker from "@/components/ProjectPicker";
import Toast from "@/components/Toast";
import { localToUTC, normalizeTimeInput, parseDurationToMinutes, todayISO } from "@/lib/utils";
import { Clock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface FavoriteCombo {
  contactId: string;
  contactName: string;
  projectId: string;
  projectName: string;
}

const FAVORITES_KEY = "mb_favorites";
const MAX_FAVORITES = 5;

function loadFavorites(): FavoriteCombo[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorite(combo: FavoriteCombo) {
  if (typeof window === "undefined") return;
  const favs = loadFavorites().filter(
    (f) => !(f.contactId === combo.contactId && f.projectId === combo.projectId)
  );
  favs.unshift(combo);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs.slice(0, MAX_FAVORITES)));
}

export default function TimeEntryForm() {
  const [date, setDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [contactId, setContactId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteCombo[]>([]);
  const descRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  function applyDuration(durationStr: string) {
    const cleaned = durationStr.replace("u", "").trim();
    const minutes = parseDurationToMinutes(cleaned.includes(":") ? cleaned : cleaned);
    if (!minutes || !startTime) return;
    const [h, m] = startTime.split(":").map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const newEnd = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
    setEndTime(newEnd);
    setDuration(durationStr);
  }

  function handleStartTimeBlur(e: React.FocusEvent<HTMLInputElement>) {
    const normalized = normalizeTimeInput(e.target.value);
    setStartTime(normalized);
  }

  function handleEndTimeBlur(e: React.FocusEvent<HTMLInputElement>) {
    const normalized = normalizeTimeInput(e.target.value);
    setEndTime(normalized);
  }

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError(null);

      if (!startTime || !endTime) {
        setError("Vul een starttijd en eindtijd in.");
        return;
      }

      setSaving(true);
      try {
        const started_at = localToUTC(date, startTime);
        const ended_at = localToUTC(date, endTime);

        const res = await fetch("/api/moneybird/time-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            started_at,
            ended_at,
            description,
            contact_id: contactId || undefined,
            project_id: projectId || undefined,
            billable,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        // Save favorite combo
        if (contactId || projectId) {
          const favs = loadFavorites();
          const existing = favs.find(
            (f) => f.contactId === contactId && f.projectId === projectId
          );
          if (!existing) {
            // We'll save names from the DOM since we don't have them here
            // just save the IDs for now
            saveFavorite({
              contactId,
              contactName: "",
              projectId,
              projectName: "",
            });
            setFavorites(loadFavorites());
          }
        }

        setToast("Uren opgeslagen!");
        // Reset form maar bewaar datum, klant, project
        setDescription("");
        setEndTime("");
        setDuration("");
        setStartTime("09:00");
        descRef.current?.focus();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setSaving(false);
      }
    },
    [date, startTime, endTime, description, contactId, projectId, billable]
  );

  // Enter key handler for the form
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "Enter" &&
        e.ctrlKey &&
        document.activeElement?.tagName !== "BUTTON"
      ) {
        handleSubmit();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit]);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </div>
        )}

        {/* Datum */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Datum
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                setDate(d.toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" }));
              }}
              className="inline-flex items-center justify-center rounded-md bg-white border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Gisteren
            </button>
            <button
              type="button"
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() - 2);
                setDate(d.toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" }));
              }}
              className="inline-flex items-center justify-center rounded-md bg-white border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Eergisteren
            </button>
          </div>
        </div>

        {/* Tijden */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Clock className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
              Starttijd
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              onBlur={handleStartTimeBlur}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Clock className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
              Eindtijd
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onBlur={handleEndTimeBlur}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
              required
            />
          </div>
        </div>

        {/* Duur */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Of: Duur
          </label>
          <DurationInput
            value={duration}
            onChange={setDuration}
            onApply={applyDuration}
            disabled={saving}
          />
        </div>

        {/* Klant */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Klant
          </label>
          <ContactPicker value={contactId} onChange={setContactId} />
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Project
          </label>
          <ProjectPicker value={projectId} onChange={setProjectId} />
        </div>

        {/* Beschrijving */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Beschrijving
          </label>
          <input
            ref={descRef}
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Wat heb je gedaan?"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Billable toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={billable}
            onClick={() => setBillable((b) => !b)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              billable ? "bg-brand-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                billable ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <label className="text-sm font-medium text-slate-700">Factureerbaar</label>
        </div>

        {/* Favorieten */}
        {favorites.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Recente combinaties</p>
            <div className="flex flex-wrap gap-2">
              {favorites.map((fav, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setContactId(fav.contactId);
                    setProjectId(fav.projectId);
                  }}
                  className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors"
                >
                  {fav.contactName || fav.contactId || "—"} / {fav.projectName || fav.projectId || "—"}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 active:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Opslaan..." : "Uren opslaan"}
          </button>
          <p className="text-center text-xs text-slate-400 mt-2">
            Of druk Ctrl+Enter
          </p>
        </div>
      </form>

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
