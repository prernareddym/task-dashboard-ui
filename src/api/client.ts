import type { Task, TaskInput, TaskPage, TaskQuery, TaskSummary, TokenResponse } from './types';

/** Error carrying the HTTP status and the `detail` message from the API's RFC 7807 problem body. */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

let tokenProvider: () => string | null = () => null;
let unauthorizedHandler: () => void = () => undefined;

/** Wired up once in main.tsx so the client never imports the store (avoids a circular dependency). */
export function configureClient(options: { getToken: () => string | null; onUnauthorized: () => void }): void {
  tokenProvider = options.getToken;
  unauthorizedHandler = options.onUnauthorized;
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  const token = tokenProvider();
  if (authenticated && token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(path, { ...init, headers });

  if (!response.ok) {
    if (response.status === 401 && authenticated) unauthorizedHandler();
    let message = response.statusText || 'Request failed';
    let fieldErrors: Record<string, string> | undefined;
    try {
      const problem = await response.json();
      if (problem?.detail) message = problem.detail;
      if (problem?.errors) fieldErrors = problem.errors;
    } catch {
      // body was empty or not JSON; keep the status text
    }
    throw new ApiError(response.status, message, fieldErrors);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<TokenResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false),

  register: (email: string, password: string, displayName: string) =>
    request<TokenResponse>(
      '/api/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password, displayName }) },
      false,
    ),

  listTasks: (query: TaskQuery = {}) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const qs = params.toString();
    return request<TaskPage>(`/api/tasks${qs ? `?${qs}` : ''}`);
  },

  summary: () => request<TaskSummary>('/api/tasks/summary'),

  createTask: (input: TaskInput) => request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(input) }),

  updateTask: (id: number, input: TaskInput) =>
    request<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),

  deleteTask: (id: number) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
};
