export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface TaskPage {
  content: Task[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface TaskSummary {
  todo: number;
  inProgress: number;
  done: number;
  total: number;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  email: string;
  displayName: string;
}

export interface TaskQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  page?: number;
  size?: number;
}
