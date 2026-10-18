import { useState, type FormEvent } from 'react';
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../api/types';
import { PRIORITY_LABELS, STATUS_LABELS } from './TaskFilters';

interface Props {
  task?: Task;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [titleError, setTitleError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (title.trim() === '') {
      setTitleError('Title is required');
      return;
    }
    onSubmit({
      title: title.trim(),
      description: description.trim() === '' ? null : description.trim(),
      status,
      priority,
      dueDate: dueDate === '' ? null : dueDate,
    });
  }

  return (
    <div className="modal-backdrop">
      <form className="card modal" role="dialog" aria-modal="true" aria-label={task ? 'Edit task' : 'New task'} onSubmit={handleSubmit} noValidate>
        <h2>{task ? 'Edit task' : 'New task'}</h2>
        <label>
          Title
          <input
            value={title}
            maxLength={200}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError(null);
            }}
            aria-invalid={titleError !== null}
            autoFocus
          />
        </label>
        {titleError && (
          <p role="alert" className="error">
            {titleError}
          </p>
        )}
        <label>
          Description
          <textarea value={description} maxLength={2000} rows={3} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="row">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Due date
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </label>
        </div>
        <div className="actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="primary">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
