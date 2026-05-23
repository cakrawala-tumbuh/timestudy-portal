/** Type definitions for the TimeStudy YPII admin portal. */

/** Admin portal user account. */
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

/** Survey respondent — one record per Android device user. */
export interface Respondent {
  id: number;
  resp_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Day colour code: G = Normal, Y = Sibuk (Busy), R = Puncak (Peak). */
export type DayColor = "G" | "Y" | "R";

/** Daily work-time log entry submitted by the Android app. */
export interface DailyLog {
  id: number;
  resp_id: string;
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  menit_istirahat: number;
  total_jam_hitung: number | null;
  day_color: DayColor;
  pct_core: number;
  pct_copilot: number;
  pct_character: number;
  pct_improve: number;
  pct_strategic: number;
  pct_admin: number;
  pct_recovery: number;
  total_pct: number;
  notes: string | null;
  is_synced: boolean;
  created_at: string;
  updated_at: string;
}

/** Registered OAuth2 PKCE client application (e.g., the Android app). */
export interface OAuthClient {
  id: string;
  client_id: string;
  client_name: string;
  redirect_uris: string;
  scope: string;
  grant_types: string;
  response_types: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Generic paginated response wrapper returned by list endpoints. */
export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/** Aggregated dashboard statistics from multiple backend endpoints. */
export interface DashboardStats {
  total_respondents: number;
  active_respondents: number;
  total_logs: number;
  unsynced_logs: number;
  logs_today: number;
}

/** Payload for creating a new respondent. */
export interface RespondentCreate {
  resp_id: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  pin?: string;
  is_active?: boolean;
}

/** Payload for partially updating a respondent. All fields optional. */
export interface RespondentUpdate {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  pin?: string;
  is_active?: boolean;
}

/** Payload for registering a new OAuth2 client. */
export interface OAuthClientCreate {
  client_name: string;
  redirect_uris: string;
  scope?: string;
  grant_types?: string;
  response_types?: string;
  description?: string;
  is_active?: boolean;
}

/** Payload for partially updating an OAuth2 client. All fields optional. */
export interface OAuthClientUpdate {
  client_name?: string;
  redirect_uris?: string;
  scope?: string;
  description?: string;
  is_active?: boolean;
}
