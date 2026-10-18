import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../api/client';
import type { Task, TaskInput, TaskPriority, TaskStatus, TaskSummary } from '../api/types';

export interface TaskFilters {
  status: TaskStatus | '';
  priority: TaskPriority | '';
  q: string;
  page: number;
}

export interface TasksState {
  items: Task[];
  totalElements: number;
  totalPages: number;
  filters: TaskFilters;
  summary: TaskSummary | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

export const PAGE_SIZE = 8;

export const initialFilters: TaskFilters = { status: '', priority: '', q: '', page: 0 };

const initialState: TasksState = {
  items: [],
  totalElements: 0,
  totalPages: 0,
  filters: initialFilters,
  summary: null,
  status: 'idle',
  error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetch', async (filters: TaskFilters) =>
  api.listTasks({
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    q: filters.q.trim() || undefined,
    page: filters.page,
    size: PAGE_SIZE,
  }),
);

export const fetchSummary = createAsyncThunk('tasks/summary', () => api.summary());

export const saveTask = createAsyncThunk('tasks/save', async (args: { id?: number; input: TaskInput }) =>
  args.id === undefined ? api.createTask(args.input) : api.updateTask(args.id, args.input),
);

export const removeTask = createAsyncThunk('tasks/remove', async (id: number) => {
  await api.deleteTask(id);
  return id;
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<Omit<TaskFilters, 'page'>>>) {
      state.filters = { ...state.filters, ...action.payload, page: 0 };
    },
    setPage(state, action: PayloadAction<number>) {
      state.filters.page = action.payload;
    },
    resetTasks() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'idle';
        state.items = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Could not load tasks';
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(saveTask.rejected, (state, action) => {
        state.error = action.error.message ?? 'Could not save task';
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.error = action.error.message ?? 'Could not delete task';
      });
  },
});

export const { setFilters, setPage, resetTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
