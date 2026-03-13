"use client";

import TimeEntryModal from "@/components/TimeEntryModal";
import Toast from "@/components/Toast";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { TimeEntry } from "@/lib/types";
import {
  calcDurationMinutes,
  formatDateDisplay,
  formatDateISO,
  formatDuration,
  getWeekStart,
  utcToLocalDate,
} from "@/lib/utils";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useState } from "react";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

interface DayEntry {
  date: Date;
  dateStr: string;
  isToday: boolean;
  isWeekend: boolean;
}

export default function WeekGrid() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const weekEnd = addDays(weekStart, 6);
  const filter = `period:${formatDateISO(weekStart)},${formatDateISO(weekEnd)}`;

  const { entries, loading, error, refresh } = useTimeEntries(
    `date_from:${formatDateISO(weekStart)},date_to:${formatDateISO(weekEnd)}`
  );

  const todayStr = formatDateISO(new Date());

  const days: DayEntry[] = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      date: d,
      dateStr: formatDateISO(d),
      isToday: formatDateISO(d) === todayStr,
      isWeekend: i >= 5,
    };
  });

  // Group entries by project and day
  const projectKeys = new Set<string>();
  const grouped: Record<string, Record<string, TimeEntry[]>> = {};

  for (const entry of entries) {
    const projectLabel = entry.project?.name ?? (entry.project_id ? `Project ${entry.project_id}` : "Geen project");
    const dateStr = utcToLocalDate(entry.started_at);
    if (!grouped[projectLabel]) grouped[projectLabel] = {};
    if (!grouped[projectLabel][dateStr]) grouped[projectLabel][dateStr] = [];
    grouped[projectLabel][dateStr].push(entry);
    projectKeys.add(projectLabel);
  }

  const projects = Array.from(projectKeys).sort();

  const dayTotals: Record<string, number> = {};
  for (const day of days) {
    dayTotals[day.dateStr] = 0;
  }
  let weekTotal = 0;

  for (const entry of entries) {
    const minutes = calcDurationMinutes(entry.started_at, entry.ended_at);
    const dateStr = utcToLocalDate(entry.started_at);
    if (dayTotals[dateStr] !== undefined) {
      dayTotals[dateStr] += minutes;
    }
    weekTotal += minutes;
  }

  function prevWeek() {
    setWeekStart((w) => addDays(w, -7));
  }

  function nextWeek() {
    setWeekStart((w) => addDays(w, 7));
  }

  function goToCurrentWeek() {
    setWeekStart(getWeekStart(new Date()));
  }

  const isCurrentWeek = formatDateISO(weekStart) === formatDateISO(getWeekStart(new Date()));

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevWeek}
            className="inline-flex items-center justify-center rounded-md bg-white border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Vorige week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextWeek}
            className="inline-flex items-center justify-center rounded-md bg-white border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label="Volgende week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isCurrentWeek && (
            <button
              onClick={goToCurrentWeek}
              className="inline-flex items-center justify-center rounded-md bg-white border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Deze week
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">
            {weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
            {" — "}
            {weekEnd.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-white border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            aria-label="Vernieuwen"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-x-auto overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 w-40">
                Project
              </th>
              {days.map((day) => (
                <th
                  key={day.dateStr}
                  className={`text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3 ${
                    day.isToday ? "bg-brand-50/60 text-brand-600" : ""
                  } ${day.isWeekend ? "opacity-60" : ""}`}
                >
                  <div>{day.date.toLocaleDateString("nl-NL", { weekday: "short" })}</div>
                  <div className={`font-bold text-sm mt-0.5 ${day.isToday ? "text-brand-600" : "text-slate-700"}`}>
                    {day.date.getDate()}
                  </div>
                </th>
              ))}
              <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-3">
                Totaal
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && projects.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-brand-500" />
                    Laden...
                  </div>
                </td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-slate-400">
                  Geen uren geregistreerd deze week.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const projectEntries = grouped[project];
                const projectTotal = Object.values(projectEntries)
                  .flat()
                  .reduce((sum, e) => sum + calcDurationMinutes(e.started_at, e.ended_at), 0);

                return (
                  <tr key={project} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-700 font-medium max-w-[160px] truncate">
                      {project}
                    </td>
                    {days.map((day) => {
                      const dayEntries = projectEntries[day.dateStr] ?? [];
                      const dayMinutes = dayEntries.reduce(
                        (sum, e) => sum + calcDurationMinutes(e.started_at, e.ended_at),
                        0
                      );
                      return (
                        <td
                          key={day.dateStr}
                          className={`px-4 py-3 text-sm text-slate-700 ${
                            day.isToday ? "bg-brand-50/30" : ""
                          } ${day.isWeekend ? "opacity-60" : ""}`}
                        >
                          {dayEntries.length > 0 ? (
                            <div className="space-y-1">
                              {dayEntries.map((entry) => (
                                <button
                                  key={entry.id}
                                  onClick={() => setSelectedEntry(entry)}
                                  className="block w-full text-left text-xs bg-brand-50 text-brand-700 rounded px-1.5 py-1 hover:bg-brand-100 transition-colors truncate"
                                  title={entry.description || formatDuration(calcDurationMinutes(entry.started_at, entry.ended_at))}
                                >
                                  {formatDuration(calcDurationMinutes(entry.started_at, entry.ended_at))}
                                  {entry.description && (
                                    <span className="text-brand-500 ml-1">· {entry.description}</span>
                                  )}
                                </button>
                              ))}
                              {dayEntries.length > 1 && (
                                <div className="text-xs font-semibold text-slate-600 pt-0.5">
                                  {formatDuration(dayMinutes)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                      {formatDuration(projectTotal)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="px-4 py-3 text-sm font-semibold text-slate-900">Totaal</td>
              {days.map((day) => (
                <td
                  key={day.dateStr}
                  className={`px-4 py-3 text-sm font-semibold text-slate-900 ${
                    day.isToday ? "bg-brand-50/30" : ""
                  } ${day.isWeekend ? "opacity-60" : ""}`}
                >
                  {dayTotals[day.dateStr] > 0
                    ? formatDuration(dayTotals[day.dateStr])
                    : <span className="text-slate-300 font-normal">—</span>}
                </td>
              ))}
              <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                {weekTotal > 0 ? formatDuration(weekTotal) : "—"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Weekoverzicht mobiel (gestapeld) */}
      <div className="md:hidden space-y-3 mt-4">
        {days.map((day) => {
          const dayEntries = entries.filter(
            (e) => utcToLocalDate(e.started_at) === day.dateStr
          );
          if (dayEntries.length === 0 && !day.isToday) return null;
          return (
            <div key={day.dateStr} className={`bg-white rounded-lg shadow-card border border-slate-200 overflow-hidden ${day.isToday ? "border-brand-200" : ""}`}>
              <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${day.isToday ? "bg-brand-50 text-brand-600" : "bg-slate-50 text-slate-500"}`}>
                {formatDateDisplay(day.date)}
                {dayTotals[day.dateStr] > 0 && (
                  <span className="ml-2 font-bold">{formatDuration(dayTotals[day.dateStr])}</span>
                )}
              </div>
              {dayEntries.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400">Geen uren</div>
              ) : (
                dayEntries.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="w-full text-left px-4 py-3 border-t border-slate-100 first:border-t-0 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {formatDuration(calcDurationMinutes(entry.started_at, entry.ended_at))}
                        </div>
                        {entry.description && (
                          <div className="text-xs text-slate-500 mt-0.5 truncate max-w-[220px]">
                            {entry.description}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        {entry.project && (
                          <div className="text-xs text-brand-600 font-medium">{entry.project.name}</div>
                        )}
                        {entry.contact && (
                          <div className="text-xs text-slate-500">
                            {entry.contact.company_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>

      {selectedEntry && (
        <TimeEntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onSaved={() => {
            setSelectedEntry(null);
            setToast("Wijzigingen opgeslagen!");
            refresh();
          }}
          onDeleted={() => {
            setSelectedEntry(null);
            setToast("Uren verwijderd.");
            refresh();
          }}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}
