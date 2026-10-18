import { useCallback, useEffect, useState } from 'react';
import type { Task, TaskInput, TaskStatus } from '../api/types';
import { logout } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchSummary, fetchTasks, removeTask, resetTasks, saveTask, setPage } from '../store/tasksSlice';
import Pagination from './Pagination';
import SummaryCards from './SummaryCards';
import TaskFilters from './TaskFilters';
import TaskForm from './TaskForm';
import TaskList from './TaskList';

type Editor = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; task: Task };

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const displayName = useAppSelector((state) => state.auth.displayName);
  const { items, filters, summary, status, error, totalPages } = useAppSelector((state) => state.tasks);
  const [editor, setEditor] = useState<Editor>({ mode: 'closed' });

  useEffect(() => {
    void dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    void dispatch(fetchSummary());
  }, [dispatch]);

  const refresh = useCallback(() => {
    void dispatch(fetchTasks(filters));
    void dispatch(fetchSummary());
  }, [dispatch, filters]);

  async function handleSave(input: TaskInput) {
    const id = editor.mode === 'edit' ? editor.task.id : undefined;
    const result = await dispatch(saveTask({ id, input }));
    if (saveTask.fulfilled.match(result)) {
      setEditor({ mode: 'closed' });
      refresh();
    }
  }

  async function handleStatusChange(task: Task, newStatus: TaskStatus) {
    const result = await dispatch(
      saveTask({
        id: task.id,
        input: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
          status: newStatus,
        },
      }),
    );
    if (saveTask.fulfilled.match(result)) refresh();
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    const result = await dispatch(removeTask(task.id));
    if (removeTask.fulfilled.match(result)) refresh();
  }

  function handleLogout() {
    dispatch(resetTasks());
    dispatch(logout());
  }

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1>Task Dashboard</h1>
        <div className="topbar-right">
          <span className="muted">{displayName}</span>
          <button type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <SummaryCards summary={summary} />

      <div className="toolbar">
        <TaskFilters />
        <button type="button" className="primary" onClick={() => setEditor({ mode: 'create' })}>
          New task
        </button>
      </div>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <TaskList
        tasks={items}
        loading={status === 'loading'}
        onStatusChange={handleStatusChange}
        onEdit={(task) => setEditor({ mode: 'edit', task })}
        onDelete={handleDelete}
      />
      <Pagination page={filters.page} totalPages={totalPages} onChange={(page) => dispatch(setPage(page))} />

      {editor.mode !== 'closed' && (
        <TaskForm
          task={editor.mode === 'edit' ? editor.task : undefined}
          onSubmit={handleSave}
          onCancel={() => setEditor({ mode: 'closed' })}
        />
      )}
    </div>
  );
}
