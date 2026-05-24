/**
 * Axios-based API client for the TimeStudy YPII backend.
 *
 * All request functions automatically inject the `Authorization: Bearer` header
 * from the active NextAuth session. Requests are sent to `/api/v1` (relative
 * path) and proxied by the Next.js server to the backend via the `BACKEND_URL`
 * rewrite rule defined in `next.config.ts`.
 *
 * @module api
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import type {
  DailyLog,
  DashboardStats,
  OAuthClient,
  OAuthClientCreate,
  OAuthClientUpdate,
  PagedResponse,
  Respondent,
  RespondentCreate,
  RespondentUpdate,
} from "@/types";

export const apiClient = axios.create({
  baseURL: `/api/v1`,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Authenticate an admin user against the backend and return a JWT token pair.
 * @param username - Admin username.
 * @param password - Plaintext password.
 */
export async function loginAdmin(username: string, password: string) {
  const { data } = await apiClient.post<{
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  }>("/auth/login", { username, password });
  return data;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

/**
 * Fetch aggregated KPI statistics for the dashboard by combining multiple API calls.
 * @returns A {@link DashboardStats} object with totals across respondents and logs.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [respondents, logs, unsyncedLogs] = await Promise.all([
    apiClient.get<PagedResponse<Respondent>>("/respondents?size=1"),
    apiClient.get<PagedResponse<DailyLog>>("/daily-logs?size=1"),
    apiClient.get<PagedResponse<DailyLog>>("/daily-logs?size=1&is_synced=false"),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = await apiClient.get<PagedResponse<DailyLog>>(
    `/daily-logs?size=1&tanggal_from=${today}&tanggal_to=${today}`
  );
  const activeResp = await apiClient.get<PagedResponse<Respondent>>(
    "/respondents?size=1&search="
  );

  return {
    total_respondents: respondents.data.total,
    active_respondents: activeResp.data.total,
    total_logs: logs.data.total,
    unsynced_logs: unsyncedLogs.data.total,
    logs_today: todayLogs.data.total,
  };
}

// ── Respondents ───────────────────────────────────────────────────────────────

/**
 * List respondents with optional search and pagination.
 * @param params - Query parameters: page, size, search.
 */
export async function getRespondents(params: {
  page?: number;
  size?: number;
  search?: string;
}): Promise<PagedResponse<Respondent>> {
  const { data } = await apiClient.get<PagedResponse<Respondent>>("/respondents", { params });
  return data;
}

/**
 * Fetch a single respondent by their unique code.
 * @param respId - Respondent code (e.g. `"R-001"`).
 */
export async function getRespondent(respId: string): Promise<Respondent> {
  const { data } = await apiClient.get<Respondent>(`/respondents/${respId}`);
  return data;
}

/**
 * Create a new respondent.
 * @param payload - Respondent data including optional PIN.
 */
export async function createRespondent(payload: RespondentCreate): Promise<Respondent> {
  const { data } = await apiClient.post<Respondent>("/respondents", payload);
  return data;
}

/**
 * Partially update a respondent.
 * @param respId - Respondent code to update.
 * @param payload - Fields to update (all optional).
 */
export async function updateRespondent(respId: string, payload: RespondentUpdate): Promise<Respondent> {
  const { data } = await apiClient.patch<Respondent>(`/respondents/${respId}`, payload);
  return data;
}

/**
 * Permanently delete a respondent and all their associated daily logs.
 * @param respId - Respondent code to delete.
 */
export async function deleteRespondent(respId: string): Promise<void> {
  await apiClient.delete(`/respondents/${respId}`);
}

// ── Daily Logs ────────────────────────────────────────────────────────────────

/**
 * List daily logs with optional filters and pagination.
 * @param params - Query parameters: page, size, resp_id, tanggal_from, tanggal_to, is_synced.
 */
export async function getDailyLogs(params: {
  page?: number;
  size?: number;
  resp_id?: string;
  tanggal_from?: string;
  tanggal_to?: string;
  is_synced?: boolean;
}): Promise<PagedResponse<DailyLog>> {
  const { data } = await apiClient.get<PagedResponse<DailyLog>>("/daily-logs", { params });
  return data;
}

/**
 * Permanently delete a daily log entry.
 * @param logId - Numeric primary key of the log to delete.
 */
export async function deleteDailyLog(logId: number): Promise<void> {
  await apiClient.delete(`/daily-logs/${logId}`);
}

// ── OAuth2 Clients ────────────────────────────────────────────────────────────

/**
 * List registered OAuth2 clients with pagination.
 * @param params - Query parameters: page, size.
 */
export async function getOAuthClients(params: {
  page?: number;
  size?: number;
}): Promise<PagedResponse<OAuthClient>> {
  const { data } = await apiClient.get<PagedResponse<OAuthClient>>("/oauth/clients", { params });
  return data;
}

/**
 * Register a new OAuth2 client application.
 * @param payload - Client registration data.
 */
export async function createOAuthClient(payload: OAuthClientCreate): Promise<OAuthClient> {
  const { data } = await apiClient.post<OAuthClient>("/oauth/clients", payload);
  return data;
}

/**
 * Update an existing OAuth2 client.
 * @param clientId - The `client_id` of the client to update.
 * @param payload - Fields to update (all optional).
 */
export async function updateOAuthClient(
  clientId: string,
  payload: OAuthClientUpdate
): Promise<OAuthClient> {
  const { data } = await apiClient.patch<OAuthClient>(`/oauth/clients/${clientId}`, payload);
  return data;
}

/**
 * Delete an OAuth2 client registration.
 * @param clientId - The `client_id` of the client to delete.
 */
export async function deleteOAuthClient(clientId: string): Promise<void> {
  await apiClient.delete(`/oauth/clients/${clientId}`);
}
