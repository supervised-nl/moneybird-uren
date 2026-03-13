"use client";

import ContactPicker from "@/components/ContactPicker";
import ProjectPicker from "@/components/ProjectPicker";
import { TimeEntry } from "@/lib/types";
import { calcDurationMinutes, formatDuration, localToUTC, normalizeTimeInput, utcToLocalDate, utcToLocalTime } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  entry: TimeEntry;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export default function TimeEntryModal({ entry, onClose, onSaved, onDeleted }: Props) {
  const [date, setDate] = useState(utcToLocalDate(entry.started_at));
  const [startTime, setStartTime] = useState(utcToLocalTime(entry.started_at));
  const [endTime, setEndTime] = useState(utcToLocalTime(entry.ended_at));
  const [description, setDescription] = useState(entry.description);
  const [contactId, setContactId] = useState(entry.contact_id ?? "");
  const [projectId, setProjectId] = useState(entry.project_id ?? "");
  const [billable, setBillable] = useState(entry.billable);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const durationMinutes = calcDurationMinutes(
    `${date}T${startTime}:00`,
    `${date}T${endTime}:00`
  );

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const started_at = localToUTC(date, startTime);
      const ended_at = localToUTC(date, endTime);
      const res = await fetch(`/api/moneybird/time-entries/${entry.id}`, {
        method: "PATCH",
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
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/moneybird/time-entries/${entry.id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(`HTTP ${res.status}`);
      }
      onDeleted();
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm z-50 animate-fade-in flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-lg animate-slide-up dark:bg-gray-900 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Uren bewerken</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Sluiten"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="px-6 py-5 space-y-4">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Datum
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Starttijd
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  onBlur={(e) => setStartTime(normalizeTimeInput(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Eindtijd
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  onBlur={(e) => setEndTime(normalizeTimeInput(e.target.value))}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {durationMinutes > 0 && (
              <p className="text-xs text-gray-500">
                Duur: {formatDuration(durationMinutes)}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Klant
              </label>
              <ContactPicker value={contactId} onChange={setContactId} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Project
              </label>
              <ProjectPicker value={projectId} onChange={setProjectId} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Beschrijving
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Wat heb je gedaan?"
                className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={billable}
                onClick={() => setBillable((b) => !b)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  billable ? "bg-gray-950" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    billable ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <label className="text-sm font-medium text-gray-700">Factureerbaar</label>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center gap-3">
            <div>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Verwijderen
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Zeker?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    {deleting ? "Verwijderen..." : "Ja, verwijder"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Annuleer
                  </button>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
              >
                Annuleer
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 active:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
