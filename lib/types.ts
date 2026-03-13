export interface Contact {
  id: string;
  company_name: string | null;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
}

export interface Project {
  id: string;
  name: string;
  state: "active" | "archived" | string;
  budget: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TimeEntry {
  id: string;
  administration_id: string;
  contact_id: string | null;
  project_id: string | null;
  user_id: string;
  started_at: string;
  ended_at: string;
  description: string;
  paused_duration: number;
  billable: boolean;
  contact?: {
    id: string;
    company_name: string | null;
    firstname?: string | null;
    lastname?: string | null;
  } | null;
  project?: {
    id: string;
    name: string;
    state: string;
    budget: number | null;
  } | null;
}

export interface TimeEntryPayload {
  started_at: string;
  ended_at: string;
  description: string;
  contact_id?: string;
  project_id?: string;
  user_id?: string;
  billable: boolean;
}

export interface Administration {
  id: string;
  name: string;
  currency: string;
  country: string;
  time_zone: string;
}
