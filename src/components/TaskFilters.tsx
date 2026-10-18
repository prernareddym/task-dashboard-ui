import { useEffect, useState } from 'react';
import type { TaskPriority, TaskStatus } from '../api/types';
import { setFilters } from '../store/tasksSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export const STATUS_LABELS: Record<TaskStatus, string> = { TODO: 'To do', IN_PROGRESS: 'In progress', DONE: 'Done' };
export const PRIORITY_LABELS: Record<TaskPriority, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

export default function TaskFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.tasks.filters);
  const [text, setText] = useState(filters.q);

  // Debounce the search box so we do not call the API on every keystroke.
  useEffect(() => {
    if (text === filters.q) return;
    const handle = setTimeout(() => dispatch(setFilters({ q: text })), 300);
    return () => clearTimeout(handle);
  }, [text, filters.q, dispatch]);

  return (
    <section aria-label="Filters" className="filters">
      <input
        type="search"
        placeholder="Search titles…"
        aria-label="Search tasks"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select
        aria-label="Filter by status"
        value={filters.status}
        onChange={(e) => dispatch(setFilters({ status: e.target.value as TaskStatus | '' }))}
      >
        <option value="">All statuses</option>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        aria-label="Filter by priority"
        value={filters.priority}
        onChange={(e) => dispatch(setFilters({ priority: e.target.value as TaskPriority | '' }))}
      >
        <option value="">All priorities</option>
        {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </section>
  );
}
