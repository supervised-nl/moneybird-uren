import { Contact, Project, TimeEntry, TimeEntryPayload, User } from "./types";

const API_TOKEN = process.env.MONEYBIRD_API_TOKEN!;
const ADMINISTRATION_ID = process.env.MONEYBIRD_ADMINISTRATION_ID!;
const BASE_URL = `https://moneybird.com/api/v2/${ADMINISTRATION_ID}`;

async function moneybirdFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!API_TOKEN || !ADMINISTRATION_ID) {
    throw new Error(
      "MONEYBIRD_API_TOKEN en MONEYBIRD_ADMINISTRATION_ID moeten ingesteld zijn in .env.local"
    );
  }

  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "5", 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return moneybirdFetch(path, options);
  }

  return res;
}

export async function getTimeEntries(filter?: string): Promise<TimeEntry[]> {
  const query = filter ? `?filter=${encodeURIComponent(filter)}` : "";
  const res = await moneybirdFetch(`/time_entries.json${query}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fout bij ophalen time entries: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getTimeEntry(id: string): Promise<TimeEntry> {
  const res = await moneybirdFetch(`/time_entries/${id}.json`);
  if (!res.ok) {
    throw new Error(`Fout bij ophalen time entry: ${res.status}`);
  }
  return res.json();
}

export async function createTimeEntry(
  payload: TimeEntryPayload
): Promise<TimeEntry> {
  const res = await moneybirdFetch("/time_entries.json", {
    method: "POST",
    body: JSON.stringify({ time_entry: payload }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fout bij aanmaken time entry: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateTimeEntry(
  id: string,
  payload: Partial<TimeEntryPayload>
): Promise<TimeEntry> {
  const res = await moneybirdFetch(`/time_entries/${id}.json`, {
    method: "PATCH",
    body: JSON.stringify({ time_entry: payload }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fout bij bijwerken time entry: ${res.status} ${text}`);
  }
  return res.json();
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const res = await moneybirdFetch(`/time_entries/${id}.json`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Fout bij verwijderen time entry: ${res.status}`);
  }
}

export async function getContacts(): Promise<Contact[]> {
  const res = await moneybirdFetch("/contacts.json?per_page=100");
  if (!res.ok) {
    throw new Error(`Fout bij ophalen contacten: ${res.status}`);
  }
  return res.json();
}

export async function getProjects(): Promise<Project[]> {
  const res = await moneybirdFetch("/projects.json");
  if (!res.ok) {
    throw new Error(`Fout bij ophalen projecten: ${res.status}`);
  }
  return res.json();
}

export async function getUsers(): Promise<User[]> {
  const res = await moneybirdFetch("/users.json");
  if (!res.ok) {
    throw new Error(`Fout bij ophalen gebruikers: ${res.status}`);
  }
  return res.json();
}
