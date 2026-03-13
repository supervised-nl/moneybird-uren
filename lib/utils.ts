import { Contact } from "./types";

/**
 * Converts a local date and time string (HH:MM) to a UTC ISO 8601 string.
 * Assumes Europe/Amsterdam timezone.
 */
export function localToUTC(date: string, time: string): string {
  // date: YYYY-MM-DD, time: HH:MM
  const localStr = `${date}T${time}:00`;
  // Use Intl to get the offset for Europe/Amsterdam at this moment
  const localDate = new Date(localStr);
  // Get the timezone offset in minutes for Amsterdam
  const amsterdam = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = amsterdam.formatToParts(localDate);
  const p: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    p[type] = value;
  });
  const amsterdamDate = new Date(
    `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`
  );
  const offset = localDate.getTime() - amsterdamDate.getTime();
  const utcDate = new Date(localDate.getTime() + offset);
  return utcDate.toISOString();
}

/**
 * Converts a UTC ISO string to local time string HH:MM in Europe/Amsterdam.
 */
export function utcToLocalTime(utcString: string): string {
  const date = new Date(utcString);
  return date.toLocaleTimeString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Converts a UTC ISO string to local date string YYYY-MM-DD in Europe/Amsterdam.
 */
export function utcToLocalDate(utcString: string): string {
  const date = new Date(utcString);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts; // en-CA gives YYYY-MM-DD format
}

/**
 * Formats duration in minutes to a human-readable string.
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}u`;
  return `${h}u ${m}m`;
}

/**
 * Calculates duration in minutes between two ISO strings.
 */
export function calcDurationMinutes(startedAt: string, endedAt: string): number {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  return Math.round((end - start) / 60000);
}

/**
 * Formats a contact's display name.
 */
export function contactDisplayName(contact: Contact): string {
  if (contact.company_name) return contact.company_name;
  const parts = [contact.firstname, contact.lastname].filter(Boolean);
  return parts.join(" ") || "Onbekende klant";
}

/**
 * Returns the Monday of the week containing the given date.
 */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns YYYY-MM-DD for a Date object.
 */
export function formatDateISO(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Amsterdam" });
}

/**
 * Formats a date for display (e.g. "ma 13 mrt").
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("nl-NL", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Parses a duration string like "2.5" or "2:30" to minutes.
 */
export function parseDurationToMinutes(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Handle HH:MM format
  if (trimmed.includes(":")) {
    const [h, m] = trimmed.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  // Handle decimal format (e.g., "2.5" = 2.5 hours)
  const num = parseFloat(trimmed);
  if (isNaN(num) || num <= 0) return null;
  return Math.round(num * 60);
}

/**
 * Normalizes a time input like "9" to "09:00", "930" to "09:30".
 */
export function normalizeTimeInput(input: string): string {
  const clean = input.replace(/[^\d:]/g, "");
  if (clean.includes(":")) {
    const [h, m] = clean.split(":");
    const hh = h.padStart(2, "0");
    const mm = (m || "00").padEnd(2, "0").slice(0, 2);
    return `${hh}:${mm}`;
  }
  if (clean.length <= 2) {
    return clean.padStart(2, "0") + ":00";
  }
  if (clean.length === 3) {
    return "0" + clean[0] + ":" + clean.slice(1);
  }
  if (clean.length >= 4) {
    return clean.slice(0, 2) + ":" + clean.slice(2, 4);
  }
  return clean;
}

/**
 * Gets today's date as YYYY-MM-DD in Amsterdam timezone.
 */
export function todayISO(): string {
  return formatDateISO(new Date());
}
